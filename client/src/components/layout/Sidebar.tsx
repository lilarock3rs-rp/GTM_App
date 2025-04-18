import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const [location] = useLocation();
  
  const navigation = [
    { name: "Dashboard", href: "/", icon: "ri-dashboard-line" },
    { name: "Attribution Rules", href: "/attribution-rules", icon: "ri-database-2-line" },
    { name: "Webhook Logs", href: "/webhook-logs", icon: "ri-history-line" },
    { name: "Settings", href: "/settings", icon: "ri-settings-line" },
  ];
  
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div 
          className="fixed inset-0 z-40 md:hidden bg-black bg-opacity-30"
          onClick={() => setOpen(false)}
        />
      )}
      
      {/* Mobile sidebar */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white transition duration-300 ease-in-out transform md:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-center h-16 px-4 border-b border-neutral-300">
          <h1 className="text-lg font-semibold text-primary-500">HubSpot Attribution</h1>
        </div>
        
        <div className="flex flex-col flex-grow px-4 pt-5 pb-4 overflow-y-auto">
          <nav className="flex-1 space-y-1">
            {navigation.map((item) => (
              <Link 
                key={item.name}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center px-2 py-2 text-sm font-medium rounded-md group",
                  location === item.href
                    ? "bg-primary-50 text-primary-500"
                    : "text-neutral-700 hover:bg-neutral-100 hover:text-primary-500"
                )}
              >
                <i className={cn(item.icon, "mr-3 text-lg")} />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="flex flex-shrink-0 p-4 border-t border-neutral-300">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="inline-flex p-1 text-white bg-primary-500 rounded-full h-8 w-8 items-center justify-center">
                <i className="ri-user-line" />
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-neutral-800">Admin User</p>
              <p className="text-xs font-medium text-neutral-500">admin@example.com</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Desktop sidebar - always visible on md+ screens */}
      <aside className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 bg-white border-r border-neutral-300">
          <div className="flex items-center justify-center h-16 px-4 border-b border-neutral-300">
            <h1 className="text-lg font-semibold text-primary-500">HubSpot Attribution</h1>
          </div>
          
          <div className="flex flex-col flex-grow px-4 pt-5 pb-4 overflow-y-auto">
            <nav className="flex-1 space-y-1">
              {navigation.map((item) => (
                <Link 
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-2 py-2 text-sm font-medium rounded-md group",
                    location === item.href
                      ? "bg-primary-50 text-primary-500"
                      : "text-neutral-700 hover:bg-neutral-100 hover:text-primary-500"
                  )}
                >
                  <i className={cn(item.icon, "mr-3 text-lg")} />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="flex flex-shrink-0 p-4 border-t border-neutral-300">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="inline-flex p-1 text-white bg-primary-500 rounded-full h-8 w-8 items-center justify-center">
                  <i className="ri-user-line" />
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-neutral-800">Admin User</p>
                <p className="text-xs font-medium text-neutral-500">admin@example.com</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
