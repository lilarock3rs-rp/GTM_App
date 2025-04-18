import { useState } from "react";

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

export default function Header({ setSidebarOpen }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  return (
    <header className="relative z-10 flex flex-shrink-0 h-16 bg-white shadow">
      <button 
        type="button" 
        className="px-4 border-r border-neutral-300 text-neutral-600 md:hidden" 
        onClick={() => setSidebarOpen(true)}
      >
        <i className="ri-menu-line text-xl" />
      </button>
      <div className="flex justify-between flex-1 px-4">
        <div className="flex flex-1">
          <div className="flex w-full md:ml-0">
            <div className="relative w-full text-neutral-500 focus-within:text-neutral-800">
              <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none pl-3">
                <i className="ri-search-line" />
              </div>
              <input 
                id="search" 
                name="search" 
                className="block w-full h-full py-2 pl-10 pr-3 text-neutral-800 placeholder-neutral-500 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" 
                placeholder="Search rules or logs..." 
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="flex items-center ml-4 md:ml-6">
          <button 
            type="button" 
            className="p-1 text-neutral-500 rounded-full hover:text-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <i className="ri-notification-3-line text-xl" />
          </button>
          <button 
            type="button" 
            className="p-1 ml-3 text-neutral-500 rounded-full hover:text-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <i className="ri-question-line text-xl" />
          </button>
        </div>
      </div>
    </header>
  );
}
