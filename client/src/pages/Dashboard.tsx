import StatusCards from "@/components/dashboard/StatusCards";
import ApiConfig from "@/components/dashboard/ApiConfig";
import WebhookConfig from "@/components/dashboard/WebhookConfig";
import RecentActivityTable from "@/components/dashboard/RecentActivityTable";

export default function Dashboard() {
  return (
    <div className="py-6">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-neutral-900">Dashboard</h1>
      </div>
      
      <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
        <div className="py-4">
          {/* Status Cards */}
          <StatusCards />
          
          {/* API Configuration */}
          <ApiConfig />
          
          {/* Webhook Configuration */}
          <WebhookConfig />
          
          {/* Recent Activity Table */}
          <RecentActivityTable />
        </div>
      </div>
    </div>
  );
}
