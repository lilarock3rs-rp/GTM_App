import { useQuery } from "@tanstack/react-query";
import { Separator } from "@/components/ui/separator";
import { AlertCircle } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

export default function Settings() {
  // Query for loading property definitions
  const { data: propertyDefinitions, isLoading: isLoadingDefinitions } = useQuery({
    queryKey: ['/api/hubspot-property-definitions'],
  });
  
  // Loader state
  if (isLoadingDefinitions) {
    return (
      <div className="py-6">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-neutral-900">Settings</h1>
          <div className="py-4">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
              <div className="h-4 bg-neutral-200 rounded"></div>
              <div className="h-4 bg-neutral-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-6">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-neutral-900">Settings</h1>
        
        <div className="py-4 space-y-8">
          {/* HubSpot Property Definitions */}
          <Card>
            <CardHeader>
              <CardTitle>HubSpot Property Definitions</CardTitle>
              <CardDescription>
                These properties will be created in your HubSpot portal if they don't exist.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {propertyDefinitions ? (
                <div className="space-y-4">
                  {Object.entries(propertyDefinitions).map(([key, prop]: [string, any]) => (
                    <div key={key} className="rounded-md border border-neutral-200 p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-sm font-medium text-neutral-900">{prop.label}</h3>
                          <p className="text-xs text-neutral-500 mt-1">API Name: {prop.name}</p>
                        </div>
                        <div className="flex items-center">
                          <span className="px-2 py-1 text-xs rounded-full bg-primary-100 text-primary-800">
                            {prop.fieldType}
                          </span>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-neutral-600">{prop.description}</p>
                      <div className="mt-2 text-xs text-neutral-500">Group: {prop.groupName}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center p-6 text-neutral-500">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Unable to load property definitions
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* HubSpot Integration Guide */}
          <Card>
            <CardHeader>
              <CardTitle>Integration Guide</CardTitle>
              <CardDescription>
                Follow these steps to set up HubSpot integration with this application.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex">
                  <span className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-primary-100 text-primary-800 font-bold">1</span>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-neutral-900">Create a Private App in HubSpot</h3>
                    <p className="mt-1 text-sm text-neutral-600">
                      Go to HubSpot &gt; Settings &gt; Integrations &gt; Private Apps &gt; Create private app.
                      Give it a name and set scopes for contacts (read/write) and properties (read/write).
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex">
                  <span className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-primary-100 text-primary-800 font-bold">2</span>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-neutral-900">Add API Key to This Application</h3>
                    <p className="mt-1 text-sm text-neutral-600">
                      Copy the Private App Access Token from HubSpot and add it to the "HubSpot API Configuration" 
                      section on the Dashboard page.
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex">
                  <span className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-primary-100 text-primary-800 font-bold">3</span>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-neutral-900">Create a Webhook Subscription in HubSpot</h3>
                    <p className="mt-1 text-sm text-neutral-600">
                      Go to HubSpot &gt; Settings &gt; Integrations &gt; Webhooks &gt; Create webhook.
                      Use the webhook URL from the Dashboard and select the "Contact property value specified" event type.
                      Choose "lifecyclestage" as the property to monitor.
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex">
                  <span className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-primary-100 text-primary-800 font-bold">4</span>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-neutral-900">Test the Integration</h3>
                    <p className="mt-1 text-sm text-neutral-600">
                      Change the Lifecycle Stage property of a contact in HubSpot to trigger the webhook.
                      Check the Webhook Logs page to confirm the event was received and processed.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
