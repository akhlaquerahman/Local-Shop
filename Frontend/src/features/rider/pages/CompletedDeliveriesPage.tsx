import React, { useState } from 'react';
import { useCompletedDeliveries } from '../services/rider.queries';
import { Search, Filter, Download, Star, MapPin, Loader2, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const CompletedDeliveriesPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const { data: deliveries, isLoading } = useCompletedDeliveries({ search });

  const list = deliveries || [];

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Completed Deliveries</h1>
          <p className="text-sm text-text-secondary">Your historical delivery ledger and earnings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon={<Download size={14}/>}>Export CSV</Button>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-border flex flex-col md:flex-row justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
            <input 
              type="text" 
              placeholder="Search by Delivery ID or Customer..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" icon={<Filter size={14}/>}>Filters</Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-background text-text-secondary uppercase text-[10px] font-bold border-b border-border tracking-wider">
              <tr>
                <th className="px-6 py-4">Delivery ID</th>
                <th className="px-6 py-4">Completed At</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Route Details</th>
                <th className="px-6 py-4 text-center">Rating</th>
                <th className="px-6 py-4 text-right">Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center"><Loader2 className="animate-spin text-accent mx-auto" size={32}/></td></tr>
              ) : list.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-text-secondary">No completed deliveries found matching your criteria.</td></tr>
              ) : (
                list.map((job: any) => (
                  <tr key={job._id} className="hover:bg-background/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-primary">{job._id.substring(0,8)}</td>
                    <td className="px-6 py-4 text-text-secondary">{new Date(job.deliveredAt || job.updatedAt).toLocaleString()}</td>
                    <td className="px-6 py-4 font-medium">{job.orderId?.customerName || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-text-secondary">
                        <Navigation size={12} className="text-accent" /> {job.distanceKm || 0} km
                        <span className="text-border mx-1">•</span>
                        {job.etaMinutes || 0} mins
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center items-center gap-1 text-amber-500 font-bold text-xs">
                        {job.rating ? <><Star size={12} fill="currentColor"/> {job.rating}</> : <span className="text-text-secondary font-normal">Unrated</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-text-primary text-base">₹{job.deliveryFee || 0}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder */}
        <div className="p-4 border-t border-border flex justify-between items-center text-xs text-text-secondary">
          <span>Showing 1 to {list.length} of {list.length} entries</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-border rounded hover:bg-background disabled:opacity-50" disabled>Prev</button>
            <button className="px-3 py-1 border border-border rounded bg-primary text-white">1</button>
            <button className="px-3 py-1 border border-border rounded hover:bg-background disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CompletedDeliveriesPage;
