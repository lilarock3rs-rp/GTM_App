import { useQuery } from "@tanstack/react-query";
import { WebhookActivity } from "@shared/schema";
import { format } from "date-fns";

export default function RecentActivityTable() {
  const { data: activities, isLoading } = useQuery<WebhookActivity[]>({
    queryKey: ['/api/webhook-activities?limit=5'],
    refetchInterval: 5000 // Refresh every 5 seconds
  });
  
  if (isLoading) {
    return (
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-neutral-900">Recent Activity</h2>
          <a href="/webhook-logs" className="text-sm font-medium text-primary-500 hover:text-primary-700">View all</a>
        </div>
        <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
            <div className="h-4 bg-neutral-200 rounded"></div>
            <div className="h-4 bg-neutral-200 rounded"></div>
            <div className="h-4 bg-neutral-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-neutral-900">Recent Activity</h2>
        <a href="/webhook-logs" className="text-sm font-medium text-primary-500 hover:text-primary-700">View all</a>
      </div>
      <div className="mt-4 flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-neutral-300 sm:rounded-lg">
              <table className="min-w-full divide-y divide-neutral-300">
                <thead className="bg-neutral-100">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                      Contact
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                      Traffic Source
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                      Attribution
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-300">
                  {activities && activities.length > 0 ? (
                    activities.map((activity) => (
                      <tr key={activity.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-neutral-800">{activity.contact_email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-neutral-600">
                            {activity.latest_traffic_source} 
                            {activity.drill_down_2 && `/ ${activity.drill_down_2}`}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-neutral-600">
                            {activity.applied_attribution ? 
                              (activity.applied_attribution as any).gtm_summary : 
                              'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            activity.status === 'success' ? 'bg-success-500 text-white' : 'bg-error-500 text-white'
                          }`}>
                            {activity.status === 'success' ? 'Success' : 'Failed'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                          {format(new Date(activity.created_at), 'yyyy-MM-dd HH:mm:ss')}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-sm text-center text-neutral-500">
                        No recent activity found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
