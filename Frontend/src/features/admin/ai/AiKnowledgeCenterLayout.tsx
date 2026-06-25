import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { BrainCircuit, BookOpen, BarChart3 } from 'lucide-react';

export const AiKnowledgeCenterLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Knowledge Base', path: '/admin/ai/knowledge', icon: BookOpen },
    { label: 'AI Analytics', path: '/admin/ai/analytics', icon: BarChart3 }
  ];

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-surface flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-bold text-text flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-primary" />
            AI Control Panel
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                    isActive
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
