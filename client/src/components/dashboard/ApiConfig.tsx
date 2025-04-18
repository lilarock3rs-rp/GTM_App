import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ApiConfig() {
  const [apiKey, setApiKey] = useState("");
  const { toast } = useToast();
  
  const { data: settings, refetch: refetchSettings } = useQuery({
    queryKey: ['/api/settings'],
  });
  
  const updateSettingsMutation = useMutation({
    mutationFn: async (newApiKey: string) => {
      const response = await apiRequest('POST', '/api/settings', {
        hubspot_api_key: newApiKey
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "API Key Updated",
        description: "Your HubSpot API key has been updated successfully.",
        variant: "default",
      });
      refetchSettings();
      setApiKey(""); // Clear the input
    },
    onError: (error) => {
      toast({
        title: "Error Updating API Key",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });
  
  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/test-hubspot-connection', {});
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Connection Successful",
          description: "Successfully connected to HubSpot API.",
          variant: "default",
        });
      } else {
        toast({
          title: "Connection Failed",
          description: data.error || "Failed to connect to HubSpot API.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Connection Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });
  
  const handleUpdateToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey) {
      updateSettingsMutation.mutate(apiKey);
    } else {
      toast({
        title: "No API Key Provided",
        description: "Please enter an API key.",
        variant: "destructive",
      });
    }
  };
  
  const handleTestConnection = () => {
    testConnectionMutation.mutate();
  };
  
  return (
    <div className="mt-8 bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-neutral-900">HubSpot API Configuration</h3>
        <div className="mt-2 max-w-xl text-sm text-neutral-600">
          <p>Configure your HubSpot API credentials to enable webhook listening and property updates.</p>
        </div>
        <form className="mt-5 sm:flex sm:items-end" onSubmit={handleUpdateToken}>
          <div className="w-full sm:max-w-xs">
            <label htmlFor="api-key" className="block text-sm font-medium text-neutral-700">
              API Key / Private App Token
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input 
                type="password" 
                name="api-key" 
                id="api-key" 
                className="flex-1 block w-full min-w-0 rounded-md sm:text-sm border-neutral-300 focus:ring-primary-500 focus:border-primary-500" 
                placeholder="pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
          </div>
          <button 
            type="submit" 
            className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            disabled={updateSettingsMutation.isPending}
          >
            {updateSettingsMutation.isPending ? 'Updating...' : 'Update Token'}
          </button>
          <button 
            type="button" 
            className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            onClick={handleTestConnection}
            disabled={testConnectionMutation.isPending}
          >
            {testConnectionMutation.isPending ? 'Testing...' : 'Test Connection'}
          </button>
        </form>
      </div>
    </div>
  );
}
