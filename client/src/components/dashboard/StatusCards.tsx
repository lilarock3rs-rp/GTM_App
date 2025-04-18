import { useQuery } from "@tanstack/react-query";

export default function StatusCards() {
  const { data: rules } = useQuery({
    queryKey: ['/api/attribution-rules'],
    refetchInterval: false
  });
  
  const { data: activities } = useQuery({
    queryKey: ['/api/webhook-activities?limit=100'],
    refetchInterval: 10000 // Refresh every 10 seconds
  });
  
  const { data: settings } = useQuery({
    queryKey: ['/api/settings'],
    refetchInterval: false
  });
  
  const ruleCount = rules?.length || 0;
  const recentUpdates = activities?.length || 0;
  const webhookStatus = settings?.webhook_status === 'active' ? 'Active' : 'Inactive';
  const statusColor = webhookStatus === 'Active' ? 'bg-success-500' : 'bg-neutral-500';
  
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className={`flex-shrink-0 ${statusColor} rounded-md p-3`}>
              <i className="ri-pulse-line text-white text-xl" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-neutral-500 truncate">Webhook Status</dt>
                <dd>
                  <div className="text-lg font-semibold text-neutral-900">{webhookStatus}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-neutral-100 px-5 py-3">
          <div className="text-sm">
            <a href="/webhook-logs" className="font-medium text-primary-500 hover:text-primary-700">View details</a>
          </div>
        </div>
      </div>
      
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-primary-500 rounded-md p-3">
              <i className="ri-database-2-line text-white text-xl" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-neutral-500 truncate">Attribution Rules</dt>
                <dd>
                  <div className="text-lg font-semibold text-neutral-900">{ruleCount}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-neutral-100 px-5 py-3">
          <div className="text-sm">
            <a href="/attribution-rules" className="font-medium text-primary-500 hover:text-primary-700">Manage Rules</a>
          </div>
        </div>
      </div>
      
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-primary-500 rounded-md p-3">
              <i className="ri-history-line text-white text-xl" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-neutral-500 truncate">Recent Updates</dt>
                <dd>
                  <div className="text-lg font-semibold text-neutral-900">{recentUpdates}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-neutral-100 px-5 py-3">
          <div className="text-sm">
            <a href="/webhook-logs" className="font-medium text-primary-500 hover:text-primary-700">View logs</a>
          </div>
        </div>
      </div>
    </div>
  );
}
