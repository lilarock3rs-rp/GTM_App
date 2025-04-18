import { IStorage } from '../storage';
import { HubSpotClient } from '../hubspot';
import { InsertWebhookActivity } from '@shared/schema';

export class AttributionService {
  private storage: IStorage;
  private hubspotClient: HubSpotClient | null = null;

  constructor(storage: IStorage) {
    this.storage = storage;
  }

  // Initialize the HubSpot client with API key
  initializeHubSpotClient(apiKey: string) {
    this.hubspotClient = new HubSpotClient(apiKey);
    return this.hubspotClient;
  }

  // Get the HubSpot client
  getHubSpotClient(): HubSpotClient | null {
    return this.hubspotClient;
  }

  // Process a webhook event
  async processWebhookEvent(contactId: string): Promise<boolean> {
    try {
      // Validate we have API key and client
      const settings = await this.storage.getSettings();
      if (!settings?.hubspot_api_key || !this.hubspotClient) {
        throw new Error('HubSpot API key not configured');
      }

      // Fetch contact data from HubSpot
      const contact = await this.hubspotClient.getContactById(contactId);
      const contactEmail = contact.properties.email || 'unknown@example.com';
      
      // Get traffic source values
      const latestTrafficSource = contact.properties.hs_analytics_source || '';
      const drillDown2 = contact.properties.hs_analytics_source_data_2 || '';

      // Log activity with initial info
      const activity: InsertWebhookActivity = {
        contact_email: contactEmail,
        contact_id: contactId,
        latest_traffic_source: latestTrafficSource,
        hs_latest_source_data_2: drillDown2,
        status: 'pending',
        applied_attribution: null,
        error_message: null
      };

      // Find matching attribution rule
      const matchingRule = await this.storage.findMatchingRule(latestTrafficSource, drillDown2);
      
      if (!matchingRule) {
        activity.status = 'failed';
        activity.error_message = `No matching rule found for source: ${latestTrafficSource} and drill-down: ${drillDown2}`;
        await this.storage.createWebhookActivity(activity);
        return false;
      }

      // Update contact with attribution values
      const result = await this.hubspotClient.updateContactAttribution(contactId, matchingRule);
      
      if (result.success) {
        activity.status = 'success';
        activity.applied_attribution = matchingRule;
      } else {
        activity.status = 'failed';
        activity.error_message = result.error || 'Failed to update contact properties in HubSpot';
      }

      // Log the completed activity
      await this.storage.createWebhookActivity(activity);
      return result.success;
    } catch (error: any) {
      // Attempt to extract a detailed error message
      let errorMessage = 'Unknown error';
      let contactEmail = 'unknown@example.com';
      let latestTrafficSource = '';
      let drillDown2 = '';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        // Try to extract a more descriptive error
        if (error.message) {
          errorMessage = error.message;
        } else if (error.response && error.response.data) {
          const data = error.response.data;
          errorMessage = data.message || `API Error (${error.response.status})`;
          
          // Add more details if available
          if (data.category) {
            errorMessage += ` - ${data.category}`;
          }
        }
      }
      
      // Try to extract contact info even in error case
      try {
        if (this.hubspotClient) {
          const contact = await this.hubspotClient.getContactById(contactId).catch(() => null);
          if (contact) {
            contactEmail = contact.properties.email || contactEmail;
            latestTrafficSource = contact.properties.hs_analytics_source || '';
            drillDown2 = contact.properties.hs_analytics_source_data_2 || '';
          }
        }
      } catch {
        // Ignore any errors in error handling
      }
      
      // Log error activity
      const activity: InsertWebhookActivity = {
        contact_email: contactEmail,
        contact_id: contactId,
        latest_traffic_source: latestTrafficSource,
        hs_latest_source_data_2: drillDown2,
        status: 'failed',
        applied_attribution: null,
        error_message: errorMessage
      };
      
      await this.storage.createWebhookActivity(activity);
      console.error('Error processing webhook event:', errorMessage);
      return false;
    }
  }
}
