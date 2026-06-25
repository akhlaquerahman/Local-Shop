import React from 'react';
import { useRiderKyc } from '../services/rider.queries';
import { ShieldCheck, ShieldAlert, Loader2, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const KycPage: React.FC = () => {
  const { data, isLoading } = useRiderKyc();
  
  const status = data?.status || 'pending';
  const documents = data?.documents || [];

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto pb-20">
      <div>
        <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">KYC Verification</h1>
        <p className="text-sm text-text-secondary">Complete your identity and background checks</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40"><Loader2 className="animate-spin text-accent" size={32}/></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`md:col-span-1 rounded-xl p-6 shadow-enterprise-md text-white flex flex-col items-center justify-center text-center
            ${status === 'verified' ? 'bg-success' : status === 'rejected' ? 'bg-error' : 'bg-amber-500'}`}
          >
            {status === 'verified' ? <ShieldCheck size={64} className="mb-4 text-white/90" /> : <ShieldAlert size={64} className="mb-4 text-white/90" />}
            <h3 className="text-sm font-bold uppercase tracking-wider text-white/80">Overall Status</h3>
            <h2 className="text-3xl font-black mt-1 uppercase">{status}</h2>
            <p className="text-xs mt-4 text-white/90 px-4">
              {status === 'verified' ? 'Your profile is fully compliant and ready for deliveries.' : 'Your profile requires attention before you can accept deliveries.'}
            </p>
          </div>

          <div className="md:col-span-2 bg-surface border border-border rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-text-primary mb-4 border-b border-border pb-3">Verification Modules</h3>
            <div className="space-y-4">
              {documents.length === 0 ? (
                 <div className="text-text-secondary text-sm flex items-center gap-2"><AlertTriangle size={16}/> No KYC modules initiated. Please upload your documents.</div>
              ) : documents.map((doc: any) => (
                <div key={doc._id} className="flex justify-between items-center bg-background border border-border p-4 rounded-lg">
                  <div>
                    <h4 className="font-bold text-sm text-text-primary">{doc.documentType}</h4>
                    <p className="text-xs text-text-secondary mt-1">Submitted on {new Date(doc.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase flex items-center gap-1
                      ${doc.status === 'verified' ? 'bg-success/10 text-success' : 
                        doc.status === 'rejected' ? 'bg-error/10 text-error' : 
                        'bg-amber-500/10 text-amber-500'}`}
                    >
                      {doc.status === 'verified' && <CheckCircle size={12}/>}
                      {doc.status === 'pending' && <Clock size={12}/>}
                      {doc.status === 'rejected' && <AlertTriangle size={12}/>}
                      {doc.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {status !== 'verified' && (
              <div className="mt-6">
                <Button className="w-full justify-center">Start Next Verification Step</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default KycPage;
