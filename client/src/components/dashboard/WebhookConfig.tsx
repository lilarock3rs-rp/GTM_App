import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function WebhookConfig() {
  const { toast } = useToast();
  const [baseUrl, setBaseUrl] = useState("");
  
  // Get current hostname and construct webhook URL
  useEffect(() => {
    // Get current host/origin for the webhook URL
    const origin = window.location.origin; // e.g., https://example.vercel.app or http://localhost:5000
    setBaseUrl(`${origin}/api/webhook`);
  }, []);
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(baseUrl);
      toast({
        title: "Copied to clipboard",
        description: "Webhook URL has been copied to clipboard.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy webhook URL to clipboard.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="mt-8 bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-neutral-900">Webhook Configuration</h3>
        <div className="mt-2 max-w-xl text-sm text-neutral-600">
          <p>Use this webhook URL in your HubSpot portal settings to receive Lifecycle Stage change events.</p>
        </div>
        <div className="mt-5">
          <div className="rounded-md bg-neutral-100 p-4">
            <div className="flex">
              <pre className="text-sm text-neutral-800 font-mono flex-1 overflow-x-auto">
                {baseUrl || "Loading webhook URL..."}
              </pre>
              <button 
                type="button" 
                onClick={copyToClipboard}
                className="flex-shrink-0 ml-4 text-primary-500 hover:text-primary-700 focus:outline-none"
                disabled={!baseUrl}
              >
                <i className="ri-clipboard-line text-xl" />
              </button>
            </div>
          </div>
          <div className="mt-3 text-sm">
            <p className="text-neutral-600">
              Configure HubSpot to send webhook events when the 
              <span className="font-medium"> Lifecycle Stage</span> property changes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
