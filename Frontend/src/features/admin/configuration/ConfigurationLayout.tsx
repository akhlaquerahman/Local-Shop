import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Settings2, Key, Link as LinkIcon, ToggleLeft, Mail, Database, Box } from 'lucide-react';

export const ConfigurationLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/admin/configuration' && location.pathname === '/admin/configuration') return true;
    if (path !== '/admin/configuration' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { label: 'General Settings', path: '/admin/configuration', icon: Settings2 },
    { label: 'Secrets Vault', path: '/admin/configuration/secrets', icon: Key },
    { label: 'API Management', path: '/admin/configuration/apis', icon: Database }
  ]

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-surface flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-bold text-text flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-primary" />
            Config Center
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-text-secondary hover:bg-surface-hover hover:text-text'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-background/50">
        <Outlet />
      </div>
    </div>
  );
};
