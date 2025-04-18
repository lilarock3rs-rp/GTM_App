import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import { registerRoutes } from "../server/routes";
import { storage } from "../server/storage";
import { AttributionService } from "../server/services/attributionService";

// Create an instance of the Express app
const app = express();
const attributionService = new AttributionService(storage);

// Use JSON middleware 
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files in production - Vercel specific
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the 'dist' directory
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
}

// Initialize HubSpot client if API key is available
const initHubSpotClient = async () => {
  try {
    // Try from environment variable first (most reliable in serverless)
    let apiKey = process.env.HUBSPOT_API_KEY;
    
    if (apiKey) {
      attributionService.initializeHubSpotClient(apiKey);
      console.log("HubSpot client initialized with API key");
      return true;
    } else {
      console.log("No HubSpot API key found in environment. Checking settings...");
      
      // Try to get from settings
      const settings = await storage.getSettings();
      const settingsApiKey = settings?.hubspot_api_key;
      
      if (settingsApiKey) {
        attributionService.initializeHubSpotClient(settingsApiKey);
        console.log("HubSpot client initialized from settings");
        return true;
      } else {
        console.log("No HubSpot API key found. Please configure in settings.");
        return false;
      }
    }
  } catch (error) {
    console.error("Error initializing HubSpot client:", error);
    return false;
  }
};

// Call register routes but don't start the server (Vercel will handle that)
async function setupServerless() {
  // Register all our routes
  const httpServer = await registerRoutes(app);
  
  // Initialize HubSpot client
  await initHubSpotClient();
  
  return app;
}

// Do the async setup
let serverPromise = setupServerless();

// Export the handler function for Vercel
export default async function handler(req: Request, res: Response) {
  try {
    console.log(`Vercel handler called: ${req.method} ${req.url}`);
    
    // Ensure we have an Express app ready
    const server = await serverPromise;
    
    // Process this request with our Express app
    return server(req, res);
  } catch (error) {
    // Make sure we log any errors in the Vercel function handler
    console.error("Error in Vercel serverless function:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "The application encountered an unexpected error.",
      path: req.url
    });
  }
}