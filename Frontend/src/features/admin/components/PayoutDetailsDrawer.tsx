import React from 'react';
import { X, User as UserIcon, Building, CreditCard, ShieldAlert, Loader } from 'lucide-react';
import { useAdminPayoutAccount } from '../services/admin.queries';
import { Button } from '@/components/ui/Button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  accountId?: string;
}

export const PayoutDetailsDrawer: React.FC<Props> = ({ isOpen, onClose, accountId }) => {
  const { data, isLoading } = useAdminPayoutAccount(accountId || '');

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300">
        <div className="flex justify-between items-center p-6 border-b border-border bg-surface">
          <div>
            <h2 className="text-lg font-bold text-text-primary">Financial Profile</h2>
            <p className="text-xs text-text-secondary font-mono mt-1">{accountId}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full text-text-secondary transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader size={32} className="text-primary animate-spin" />
            </div>
          ) : data?.data ? (
            <>
              {/* Profile Section */}
              <section className="space-y-4">
                <h3 className="text-sm font-extrabold text-text-secondary uppercase tracking-wider flex items-center gap-2">
                  <UserIcon size={16} /> Basic Information
                </h3>
                <div className="bg-surface rounded-xl p-4 border border-border space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                      {data.data.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-text-primary">{data.data.name}</h4>
                      <p className="text-xs text-text-secondary">{data.data.email} • {data.data.phone}</p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-border grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-text-secondary uppercase">Account Type</p>
                      <p className="font-semibold text-sm">{data.data.role}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-text-secondary uppercase">Joined Date</p>
                      <p className="font-semibold text-sm">{new Date(data.data.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Financial Summary */}
              <section className="space-y-4">
                <h3 className="text-sm font-extrabold text-text-secondary uppercase tracking-wider flex items-center gap-2">
                  <Building size={16} /> Financial Summary
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-surface p-4 rounded-xl border border-border">
                    <p className="text-xs text-text-secondary">Lifetime Revenue</p>
                    <p className="text-lg font-bold text-text-primary mt-1">₹{(data.data.financials?.totalRevenue || 0).toLocaleString()}</p>
                  </div>
                  <div className="bg-surface p-4 rounded-xl border border-border">
                    <p className="text-xs text-text-secondary">Platform Fees</p>
                    <p className="text-lg font-bold text-danger mt-1">-₹{(data.data.financials?.platformCommission || 0).toLocaleString()}</p>
                  </div>
                  <div className="bg-surface p-4 rounded-xl border border-border">
                    <p className="text-xs text-text-secondary">Net Earnings</p>
                    <p className="text-lg font-bold text-success mt-1">₹{(data.data.financials?.netEarnings || 0).toLocaleString()}</p>
                  </div>
                  <div className="bg-warning/10 p-4 rounded-xl border border-warning/20">
                    <p className="text-xs text-warning">Pending Settlement</p>
                    <p className="text-lg font-bold text-warning mt-1">₹{(data.data.financials?.pendingPayout || 0).toLocaleString()}</p>
                  </div>
                </div>
              </section>

              {/* Verification & Bank */}
              <section className="space-y-4">
                <h3 className="text-sm font-extrabold text-text-secondary uppercase tracking-wider flex items-center gap-2">
                  <CreditCard size={16} /> Verification & Bank
                </h3>
                <div className="bg-surface rounded-xl p-4 border border-border space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-border">
                    <div>
                      <p className="text-sm font-bold text-text-primary">KYC Status</p>
                      <p className="text-xs text-text-secondary mt-0.5">PAN & Aadhaar Verification</p>
                    </div>
                    <span className={`px-2 py-1 text-[10px] font-bold rounded ${data.data.kycStatus === 'VERIFIED' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
                      {data.data.kycStatus || 'PENDING'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold text-text-primary">Bank Verification</p>
                      <p className="text-xs text-text-secondary mt-0.5">Account & IFSC Checking</p>
                    </div>
                    <span className={`px-2 py-1 text-[10px] font-bold rounded ${data.data.bankStatus === 'VERIFIED' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
                      {data.data.bankStatus || 'PENDING'}
                    </span>
                  </div>
                </div>
              </section>

            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-text-secondary">
              <ShieldAlert size={32} className="mb-2 opacity-50" />
              <p>Failed to load profile details</p>
            </div>
          )}
        </div>
        
        {/* Footer Actions */}
        <div className="p-6 border-t border-border bg-surface flex gap-3">
          <Button variant="outline" className="flex-1 bg-white border-border" onClick={onClose}>Close</Button>
          <Button className="flex-1 bg-primary text-white">View Full Ledger</Button>
        </div>
      </div>
    </>
  );
};
