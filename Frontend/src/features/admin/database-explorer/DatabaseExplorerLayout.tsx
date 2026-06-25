import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Database, LayoutDashboard, Settings, Activity } from 'lucide-react';
import { api as axios } from '@/lib/axios';
import { Skeleton } from '@/components/ui/Skeleton';

// Base API URL for DB Explorer
const API_BASE = '/admin/database';

export const DatabaseExplorerLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await axios.get(`${API_BASE}/collections`);
        if (res.data.success) {
          setCollections(res.data.data);
        }
      } catch (error) {
        console.error('Failed to load collections', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCollections();
  }, []);

  const isActive = (path: string) => location.pathname.includes(path);

  return (
    <div className="flex h-[calc(100vh-4rem)] -mt-6 -mx-6 bg-surface">
      {/* Sidebar */}
      <div className="w-64 border-r border-border flex flex-col bg-surface/50">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            DB Explorer
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-3 space-y-1 mb-6">
            <button
              onClick={() => navigate('/admin/database-explorer')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                location.pathname === '/admin/database-explorer' 
                  ? 'bg-primary/10 text-primary font-medium' 
                  : 'text-text-secondary hover:bg-surface-hover hover:text-text'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>
            <button
              onClick={() => navigate('/admin/database-explorer/health')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                isActive('/health') 
                  ? 'bg-primary/10 text-primary font-medium' 
                  : 'text-text-secondary hover:bg-surface-hover hover:text-text'
              }`}
            >
              <Activity className="w-4 h-4" />
              Data Integrity Center
            </button>
          </div>

          <div className="px-4 mb-2 text-xs font-semibold text-text-tertiary uppercase tracking-wider">
            Collections
          </div>
          
          {loading ? (
            <div className="px-3 space-y-2">
              <Skeleton className="h-8 w-full rounded-md" />
              <Skeleton className="h-8 w-full rounded-md" />
              <Skeleton className="h-8 w-full rounded-md" />
              <Skeleton className="h-8 w-full rounded-md" />
            </div>
          ) : (
            <div className="px-3 space-y-1">
              {collections.map(col => (
                <button
                  key={col.modelName}
                  onClick={() => navigate(`/admin/database-explorer/collection/${col.modelName}`)}
                  className={`w-full flex flex-col items-start px-3 py-2 text-sm rounded-lg transition-colors ${
                    isActive(`/collection/${col.modelName}`) 
                      ? 'bg-primary/10 text-primary font-medium' 
                      : 'text-text-secondary hover:bg-surface-hover hover:text-text'
                  }`}
                >
                  <span className="truncate w-full text-left">{col.name}</span>
                  <span className="text-[10px] text-text-tertiary">{col.count} docs</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto bg-background">
        <Outlet context={{ collections }} />
      </div>
    </div>
  );
};

export default DatabaseExplorerLayout;
