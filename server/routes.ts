import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { 
  insertAttributionRuleSchema, 
  updateSettingsSchema, 
  defaultAttributionProperties 
} from "@shared/schema";
import { AttributionService } from "./services/attributionService";

// Create the attribution service with storage
const attributionService = new AttributionService(storage);

// Initialize webhook validation schema based on HubSpot's format with more lenient validation
const hubspotWebhookSchema = z.object({
  appId: z.any(),
  eventId: z.any(),
  subscriptionId: z.any(),
  portalId: z.any(),
  occurredAt: z.any(),
  subscriptionType: z.string(),
  attemptNumber: z.any(),
  objectId: z.any(),
  changeSource: z.string().optional(),
  propertyName: z.string(),
  propertyValue: z.any().optional(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Initialize API routes
  // Make sure all client API routes are prefixed with /api

  // ======== Attribution Rules API ========
  
  // Get all attribution rules
  app.get("/api/attribution-rules", async (_req: Request, res: Response) => {
    try {
      const rules = await storage.getAllAttributionRules();
      res.json(rules);
    } catch (error) {
      console.error("Error fetching attribution rules:", error);
      res.status(500).json({ error: "Failed to fetch attribution rules" });
    }
  });

  // Get a single attribution rule
  app.get("/api/attribution-rules/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid rule ID" });
      }
      
      const rule = await storage.getAttributionRule(id);
      if (!rule) {
        return res.status(404).json({ error: "Rule not found" });
      }
      
      res.json(rule);
    } catch (error) {
      console.error(`Error fetching attribution rule ${req.params.id}:`, error);
      res.status(500).json({ error: "Failed to fetch attribution rule" });
    }
  });

  // Create a new attribution rule
  app.post("/api/attribution-rules", async (req: Request, res: Response) => {
    try {
      const validationResult = insertAttributionRuleSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid attribution rule data",
          details: validationResult.error.format()
        });
      }
      
      const newRule = await storage.createAttributionRule(validationResult.data);
      res.status(201).json(newRule);
    } catch (error) {
      console.error("Error creating attribution rule:", error);
      res.status(500).json({ error: "Failed to create attribution rule" });
    }
  });

  // Update an attribution rule
  app.put("/api/attribution-rules/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid rule ID" });
      }
      
      const validationResult = insertAttributionRuleSchema.partial().safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid attribution rule data",
          details: validationResult.error.format()
        });
      }
      
      const updatedRule = await storage.updateAttributionRule(id, validationResult.data);
      if (!updatedRule) {
        return res.status(404).json({ error: "Rule not found" });
      }
      
      res.json(updatedRule);
    } catch (error) {
      console.error(`Error updating attribution rule ${req.params.id}:`, error);
      res.status(500).json({ error: "Failed to update attribution rule" });
    }
  });

  // Delete an attribution rule
  app.delete("/api/attribution-rules/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid rule ID" });
      }
      
      const success = await storage.deleteAttributionRule(id);
      if (!success) {
        return res.status(404).json({ error: "Rule not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error(`Error deleting attribution rule ${req.params.id}:`, error);
      res.status(500).json({ error: "Failed to delete attribution rule" });
    }
  });

  // ======== Webhook Activities API ========
  
  // Get webhook activities
  app.get("/api/webhook-activities", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const activities = await storage.getAllWebhookActivities(limit);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching webhook activities:", error);
      res.status(500).json({ error: "Failed to fetch webhook activities" });
    }
  });

  // ======== Settings API ========
  
  // Get application settings
  app.get("/api/settings", async (_req: Request, res: Response) => {
    try {
      let settings = await storage.getSettings();
      
      // Create default settings if none exist
      if (!settings) {
        const defaultSettings = {
          webhook_url: `${_req.protocol}://${_req.get('host')}/api/webhook`,
          webhook_status: 'inactive',
          webhook_secret: '',
          hubspot_api_key: process.env.HUBSPOT_API_KEY || ''
        };
        
        settings = await storage.createOrUpdateSettings(defaultSettings);
        
        // Initialize HubSpot client if API key is provided
        if (settings.hubspot_api_key) {
          attributionService.initializeHubSpotClient(settings.hubspot_api_key);
        }
      }
      
      // Don't expose API key in response
      const settingsResponse = {
        ...settings,
        hubspot_api_key: settings.hubspot_api_key ? '••••••••••••••••••••••••••••••••' : ''
      };
      
      res.json(settingsResponse);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  // Update settings
  app.post("/api/settings", async (req: Request, res: Response) => {
    try {
      const validationResult = updateSettingsSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid settings data",
          details: validationResult.error.format()
        });
      }
      
      // Update settings in storage
      const updatedSettings = await storage.createOrUpdateSettings(validationResult.data);

      // Re-initialize HubSpot client if API key was updated
      if (validationResult.data.hubspot_api_key) {
        attributionService.initializeHubSpotClient(validationResult.data.hubspot_api_key);
      }
      
      // Don't expose API key in response
      const settingsResponse = {
        ...updatedSettings,
        hubspot_api_key: updatedSettings.hubspot_api_key ? '••••••••••••••••••••••••••••••••' : ''
      };
      
      res.json(settingsResponse);
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // Test HubSpot connection
  app.post("/api/test-hubspot-connection", async (req: Request, res: Response) => {
    try {
      const apiKey = req.body.apiKey || (await storage.getSettings())?.hubspot_api_key;
      
      if (!apiKey) {
        return res.status(400).json({ error: "No HubSpot API key provided" });
      }
      
      const hubspotClient = attributionService.getHubSpotClient() || 
                            attributionService.initializeHubSpotClient(apiKey);
      
      const isConnected = await hubspotClient.testConnection();
      
      if (isConnected) {
        res.json({ success: true, message: "Successfully connected to HubSpot" });
      } else {
        res.status(400).json({ success: false, error: "Failed to connect to HubSpot" });
      }
    } catch (error) {
      console.error("Error testing HubSpot connection:", error);
      res.status(500).json({ 
        success: false, 
        error: "Error testing connection",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get default HubSpot property definitions
  app.get("/api/hubspot-property-definitions", (_req: Request, res: Response) => {
    res.json(defaultAttributionProperties);
  });

  // ======== HubSpot Webhook Handler ========
  
  // Handle HubSpot Lifecycle Stage change webhook with robust approach for serverless
  app.post("/api/webhook", async (req: Request, res: Response) => {
    try {
      console.log("Received webhook payload:", JSON.stringify(req.body));
      
      // Always accept the webhook and respond with a 200 status code immediately
      // This is critical for HubSpot, which needs a quick 200 response
      // to consider the webhook delivered
      
      // Ensure HubSpot client is initialized before processing
      const hubspotClient = attributionService.getHubSpotClient();
      if (!hubspotClient) {
        // Try to initialize on demand if not available
        await initHubSpotClient();
      }
      
      // Process each event
      const results = [];
      
      // Try to extract events from the payload
      try {
        // Normalize to array (HubSpot may send a single object or an array)
        const events = Array.isArray(req.body) ? req.body : [req.body];
        
        // Debug logging
        events.forEach((event, index) => {
          console.log(`Event ${index} fields:`, Object.keys(event));
          console.log(`Event ${index} objectId:`, event.objectId);
          console.log(`Event ${index} propertyName:`, event.propertyName);
        });
        
        console.log(`Processing ${events.length} webhook events`);
        
        // Process each event
        for (const event of events) {
          if (!event || !event.objectId || !event.propertyName) {
            results.push({
              status: "error",
              message: "Missing required fields in event"
            });
            continue;
          }
          
          const { objectId, propertyName, propertyValue } = event;
          
          // Check if this is a Lifecycle Stage change
          if (propertyName !== "lifecyclestage") {
            console.log(`Ignored webhook - not a Lifecycle Stage change. Property: ${propertyName}`);
            results.push({
              status: "ignored",
              reason: "Not a Lifecycle Stage change",
              property: propertyName
            });
            continue;
          }
          
          // Only process events where lifecycle stage is being set to a value (not cleared)
          if (!propertyValue) {
            console.log(`Ignored webhook - lifecycle stage being cleared for contact ${objectId}`);
            results.push({
              status: "ignored",
              reason: "Lifecycle stage being cleared",
              contactId: objectId
            });
            continue;
          }
          
          // Process webhook event asynchronously
          const contactId = String(objectId);
          console.log(`Processing webhook for contact ID: ${contactId}, new lifecycle stage: ${propertyValue}`);
          
          // Don't await this to respond to HubSpot quickly
          attributionService.processWebhookEvent(contactId)
            .then(success => {
              console.log(`Webhook processing ${success ? 'succeeded' : 'failed'} for contact ${contactId}`);
            })
            .catch(error => {
              console.error(`Error in async webhook processing for contact ${contactId}:`, error);
            });
          
          results.push({
            status: "processing",
            contactId: contactId,
            lifecycleStage: propertyValue
          });
        }
      } catch (parseError) {
        console.error("Error parsing webhook payload:", parseError);
        results.push({
          status: "error",
          message: parseError instanceof Error ? parseError.message : "Error parsing payload"
        });
      }
      
      // Send response immediately
      if (results.length > 0) {
        return res.status(200).json({
          message: "Webhook received and processing started",
          events: results
        });
      } else {
        return res.status(200).json({
          message: "Webhook received, but no valid events found",
          processed: false
        });
      }
    } catch (error) {
      // Even in case of error, return 200 to HubSpot to prevent retries
      // but log the error
      console.error("Error processing webhook:", error);
      return res.status(200).json({
        message: "Webhook received with errors",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Initialize HubSpot client with API key from env or storage
  // In serverless environments, this needs to be more robust
  const initHubSpotClient = async () => {
    try {
      // Try from environment variable first (most reliable in serverless)
      let apiKey = process.env.HUBSPOT_API_KEY;
      
      // Fallback to database if not in environment
      if (!apiKey) {
        const settings = await storage.getSettings();
        apiKey = settings?.hubspot_api_key || '';
      }
      
      if (apiKey) {
        attributionService.initializeHubSpotClient(apiKey);
        console.log("HubSpot client initialized with API key");
        return true;
      } else {
        console.log("No HubSpot API key found. Please configure in settings.");
        return false;
      }
    } catch (error) {
      console.error("Error initializing HubSpot client:", error);
      return false;
    }
  };
  
  // Initialize on startup only if we're not in a Vercel environment
  // In Vercel, we'll initialize in the api/server.ts file
  if (process.env.VERCEL !== '1') {
    initHubSpotClient();
  }

  return httpServer;
}
