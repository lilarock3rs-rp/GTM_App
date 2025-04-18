import { useQuery } from "@tanstack/react-query";
import { WebhookActivity } from "@shared/schema";
import { format } from "date-fns";
import { format as formatJsonSyntax } from 'json-string-formatter';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";

export default function WebhookLogs() {
  const { data: activities, isLoading } = useQuery<WebhookActivity[]>({
    queryKey: ['/api/webhook-activities'],
    refetchInterval: 10000 // Refresh every 10 seconds
  });
  
  if (isLoading) {
    return (
      <div className="py-6">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-neutral-900">Webhook Logs</h1>
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
        <h1 className="text-2xl font-semibold text-neutral-900">Webhook Logs</h1>
        
        <div className="py-4">
          {activities && activities.length > 0 ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <Accordion type="single" collapsible className="w-full">
                {activities.map((activity) => (
                  <AccordionItem key={activity.id} value={`activity-${activity.id}`}>
                    <AccordionTrigger className="px-4 py-4 hover:bg-neutral-50">
                      <div className="flex w-full justify-between items-center">
                        <div className="flex items-center">
                          <Badge 
                            className={activity.status === 'success' ? 
                              'bg-success-500 hover:bg-success-600' : 
                              'bg-error-500 hover:bg-error-600'
                            }
                          >
                            {activity.status}
                          </Badge>
                          <span className="ml-3 text-sm font-medium text-neutral-900">
                            {activity.contact_email}
                          </span>
                        </div>
                        <div className="text-xs text-neutral-500">
                          {format(new Date(activity.created_at), 'yyyy-MM-dd HH:mm:ss')}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 py-3 bg-neutral-50 border-t border-neutral-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-neutral-900">Contact Information</h3>
                          <dl className="mt-2 text-sm">
                            <div className="mt-1">
                              <dt className="inline font-medium text-neutral-700">Contact ID: </dt>
                              <dd className="inline text-neutral-600">{activity.contact_id}</dd>
                            </div>
                            <div className="mt-1">
                              <dt className="inline font-medium text-neutral-700">Email: </dt>
                              <dd className="inline text-neutral-600">{activity.contact_email}</dd>
                            </div>
                            <div className="mt-1">
                              <dt className="inline font-medium text-neutral-700">Latest Traffic Source: </dt>
                              <dd className="inline text-neutral-600">{activity.latest_traffic_source || 'N/A'}</dd>
                            </div>
                            <div className="mt-1">
                              <dt className="inline font-medium text-neutral-700">Drill Down 2: </dt>
                              <dd className="inline text-neutral-600">{activity.drill_down_2 || 'N/A'}</dd>
                            </div>
                          </dl>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-neutral-900">Attribution Details</h3>
                          {activity.applied_attribution ? (
                            <div className="mt-2 text-xs bg-white p-3 rounded-md border border-neutral-300 font-mono overflow-auto max-h-48">
                              <pre>{formatJsonSyntax(JSON.stringify(activity.applied_attribution, null, 2))}</pre>
                            </div>
                          ) : (
                            <div className="mt-2 flex items-center text-sm text-neutral-600">
                              <AlertCircle className="h-4 w-4 text-error-500 mr-1" />
                              No attribution applied
                            </div>
                          )}
                          
                          {activity.error_message && (
                            <div className="mt-3">
                              <h3 className="text-sm font-medium text-error-500">Error</h3>
                              <div className="mt-1 text-sm bg-error-50 text-error-700 p-2 rounded-md border border-error-200">
                                {activity.error_message}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-md shadow text-center">
              <AlertCircle className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900">No webhook logs found</h3>
              <p className="mt-2 text-neutral-600">
                Webhook logs will appear here once HubSpot sends Lifecycle Stage change events.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
