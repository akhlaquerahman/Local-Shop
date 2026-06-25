import React, { useState } from 'react';
import { Activity, Search, ListFilter, CreditCard, Shield, ShoppingBag, User, Star } from 'lucide-react';
import { useActivityLogs } from '@/hooks/queries';
import { Button } from '@/components/ui/Button';

export const ActivityPage: React.FC = () => {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const { data: logs, isLoading } = useActivityLogs(filter);

  const filteredLogs = logs?.filter((log: any) => 
    log.description.toLowerCase().includes(search.toLowerCase()) || 
    log.event.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Orders': return <ShoppingBag size={14} className="text-accent" />;
      case 'Payments': return <CreditCard size={14} className="text-success" />;
      case 'Security': return <Shield size={14} className="text-warning" />;
      case 'Profile': return <User size={14} className="text-text-primary" />;
      case 'Reviews': return <Star size={14} className="text-yellow-500" />;
      default: return <Activity size={14} className="text-text-secondary" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Orders': return 'bg-accent/10 border-accent/20 text-accent';
      case 'Payments': return 'bg-success/10 border-success/20 text-success';
      case 'Security': return 'bg-warning/10 border-warning/20 text-warning';
      case 'Profile': return 'bg-text-primary/10 border-border text-text-primary';
      case 'Reviews': return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600';
      default: return 'bg-background border-border text-text-secondary';
    }
  };

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight flex items-center gap-3">
            <Activity size={28} className="text-accent" /> Activity Log
          </h1>
          <p className="text-sm text-text-secondary mt-1">Track all account changes, orders, and security events</p>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-background">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input 
              type="text" 
              placeholder="Search activity events..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-lg text-sm focus:border-accent focus:outline-none transition-colors"
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <div className="flex bg-surface border border-border rounded-lg p-1">
              {['All', 'Orders', 'Payments', 'Security', 'Profile', 'Reviews'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    filter === f ? 'bg-text-primary text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background border-b border-border text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                <th className="p-4 whitespace-nowrap w-48">Date & Time</th>
                <th className="p-4 whitespace-nowrap w-40">Category</th>
                <th className="p-4 whitespace-nowrap">Event Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4"><div className="h-4 w-24 bg-border rounded" /></td>
                    <td className="p-4"><div className="h-6 w-20 bg-border rounded-full" /></td>
                    <td className="p-4"><div className="h-4 w-64 bg-border rounded" /></td>
                  </tr>
                ))
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log: any) => (
                  <tr key={log._id} className="hover:bg-background/50 transition-colors group">
                    <td className="p-4 text-xs font-medium text-text-secondary whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getCategoryColor(log.category)}`}>
                        {getCategoryIcon(log.category)}
                        {log.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-bold text-text-primary mb-0.5">{log.event}</p>
                      <p className="text-xs text-text-secondary">{log.description}</p>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="p-12 text-center">
                    <Activity size={32} className="mx-auto text-text-secondary/30 mb-3" />
                    <p className="text-sm font-bold text-text-primary">No activity found</p>
                    <p className="text-xs text-text-secondary mt-1">Try adjusting your filters or search query.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Dummy */}
        {!isLoading && filteredLogs.length > 0 && (
          <div className="p-4 border-t border-border flex items-center justify-between text-xs text-text-secondary bg-background">
            <span>Showing 1 to {filteredLogs.length} of {filteredLogs.length} events</span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled>Prev</Button>
              <Button variant="outline" size="sm" disabled>Next</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityPage;
