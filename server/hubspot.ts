import axios from 'axios';
import { AttributionRule, HubSpotProperty, defaultAttributionProperties } from '@shared/schema';

// Base URLs for HubSpot API
const BASE_URL = 'https://api.hubapi.com';
const CONTACTS_API = `${BASE_URL}/crm/v3/objects/contacts`;
const PROPERTIES_API = `${BASE_URL}/properties/v1/contacts/properties`;

export class HubSpotClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Create HTTP headers with API key
  private getHeaders() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  // Test the connection to HubSpot
  async testConnection(): Promise<boolean> {
    try {
      // Try to get a single contact to verify connection
      const response = await axios.get(`${CONTACTS_API}?limit=1`, {
        headers: this.getHeaders()
      });
      return response.status === 200;
    } catch (error) {
      console.error('Error testing HubSpot connection:', error);
      return false;
    }
  }

  // Get contact by ID
  async getContactById(contactId: string): Promise<any> {
    try {
      const response = await axios.get(`${CONTACTS_API}/${contactId}?properties=email,lifecyclestage,hs_analytics_last_url,hs_analytics_last_url_click_time,hs_analytics_source,hs_analytics_source_data_2`, {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching contact ${contactId}:`, error);
      throw error;
    }
  }

  // Update contact properties
  async updateContact(contactId: string, properties: Record<string, any>): Promise<any> {
    try {
      const response = await axios.patch(
        `${CONTACTS_API}/${contactId}`,
        { properties },
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating contact ${contactId}:`, error);
      throw error;
    }
  }

  // Get all contact properties
  async getAllContactProperties(): Promise<HubSpotProperty[]> {
    try {
      const response = await axios.get(PROPERTIES_API, {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching contact properties:', error);
      throw error;
    }
  }

  // Create a new contact property
  async createContactProperty(property: HubSpotProperty): Promise<HubSpotProperty> {
    try {
      const response = await axios.post(
        PROPERTIES_API,
        property,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error(`Error creating property ${property.name}:`, error);
      throw error;
    }
  }

  // Check if a property exists, if not create it
  async ensurePropertyExists(propertyName: string): Promise<boolean> {
    try {
      // First check if property exists
      const properties = await this.getAllContactProperties();
      const exists = properties.some(p => p.name === propertyName);
      
      if (!exists) {
        // Get default property definition
        const defaultProperty = defaultAttributionProperties[propertyName as keyof typeof defaultAttributionProperties];
        if (defaultProperty) {
          await this.createContactProperty(defaultProperty);
          console.log(`Created missing property: ${propertyName}`);
        } else {
          console.error(`No default definition found for property: ${propertyName}`);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error(`Error ensuring property ${propertyName} exists:`, error);
      return false;
    }
  }

  // Update contact with attribution data
  async updateContactAttribution(contactId: string, attribution: AttributionRule): Promise<{ success: boolean; error?: string }> {
    try {
      // Ensure all required properties exist
      const propertiesToCheck = [
        'gtm_summary', 'gtm_motion', 'gtm_medium', 'gtm_web_source', 'gtm_term'
      ];
      
      // Check each property
      for (const prop of propertiesToCheck) {
        await this.ensurePropertyExists(prop);
      }
      
      // Update the contact
      const properties = {
        gtm_summary: attribution.gtm_summary,
        gtm_motion: attribution.gtm_motion,
        gtm_medium: attribution.gtm_medium,
        gtm_web_source: attribution.gtm_web_source,
        gtm_term: attribution.gtm_term
      };
      
      await this.updateContact(contactId, properties);
      return { success: true };
    } catch (error: any) {
      // Extract more specific error information if available
      let errorMessage = "Unknown error updating contact attribution";
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const status = error.response.status;
        
        if (status === 401) {
          errorMessage = "Authentication error - invalid HubSpot API key";
        } else if (status === 403) {
          // Check if it's a permissions issue
          if (error.response.data && error.response.data.category === 'MISSING_SCOPES') {
            errorMessage = "HubSpot API key does not have sufficient permissions: " + 
                        (error.response.data.message || "Missing required scopes");
          } else {
            errorMessage = "Access forbidden - check HubSpot permissions";
          }
        } else if (status === 404) {
          errorMessage = `Contact ID ${contactId} not found in HubSpot`;
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else {
          errorMessage = `HubSpot API error: ${status}`;
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = "No response from HubSpot API - check network connection";
      } else if (error.message) {
        // Something happened in setting up the request
        errorMessage = error.message;
      }

      console.error(`Error updating attribution for contact ${contactId}:`, errorMessage);
      return { success: false, error: errorMessage };
    }
  }
}
