import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService } from '../services/admin.service';
import { Button } from '@/components/ui/Button';

export const UserDetailPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      adminService.getUserDetails(userId)
        .then(res => {
          setUser(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [userId]);

  const handleApproveKyc = async () => {
    try {
      await adminService.updateUserKyc(userId!, 'APPROVED');
      setUser((prev: any) => ({ ...prev, kycStatus: 'VERIFIED' }));
      alert('KYC Approved Successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to approve KYC');
    }
  };

  if (loading) return <div className="p-6 text-center text-text-secondary">Loading details...</div>;
  if (!user) return <div className="p-6 text-center text-text-secondary">User not found</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-surface p-6 rounded-xl shadow-sm border border-border">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-primary">{user.name?.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-text-secondary">{user.email} | {user.phone || 'No Phone'}</p>
            <div className="mt-2 flex gap-2">
              <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">{user.role}</span>
              <span className={`px-2 py-1 text-xs font-bold rounded-full ${user.status === 'ACTIVE' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>{user.status}</span>
            </div>
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface p-6 rounded-xl shadow-sm border border-border">
          <h2 className="text-lg font-bold mb-4">Account Details</h2>
          <div className="space-y-4">
            <div className="flex justify-between"><span className="text-text-secondary">Gender</span> <span className="font-medium capitalize">{user.gender || 'N/A'}</span></div>
            <div className="flex justify-between"><span className="text-text-secondary">Joined</span> <span className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</span></div>
            {user.role === 'CUSTOMER' && (
              <>
                <div className="flex justify-between"><span className="text-text-secondary">City</span> <span className="font-medium">{user.address?.city || 'N/A'}</span></div>
                <div className="flex justify-between"><span className="text-text-secondary">Orders Made</span> <span className="font-medium">{user.ordersCount || 0}</span></div>
              </>
            )}
            {user.role === 'DELIVERY_PARTNER' && (
              <>
                <div className="flex justify-between"><span className="text-text-secondary">Vehicle</span> <span className="font-medium">{user.vehicleType || 'N/A'}</span></div>
                <div className="flex justify-between"><span className="text-text-secondary">Active Deliveries</span> <span className="font-medium">{user.activeDeliveries || 0}</span></div>
                <div className="flex justify-between"><span className="text-text-secondary">Completed Deliveries</span> <span className="font-medium">{user.completedDeliveries || 0}</span></div>
                <div className="flex justify-between"><span className="text-text-secondary">KYC Status</span> 
                  <span className={`font-bold ${user.kycStatus === 'VERIFIED' ? 'text-success' : 'text-warning'}`}>{user.kycStatus || 'PENDING'}</span>
                </div>
              </>
            )}
            {user.role === 'SELLER' && (
              <>
                <div className="flex justify-between"><span className="text-text-secondary">Shop Name</span> <span className="font-medium">{user.shop?.name || 'N/A'}</span></div>
                <div className="flex justify-between"><span className="text-text-secondary">Orders Received</span> <span className="font-medium">{user.ordersCount || 0}</span></div>
                <div className="flex justify-between"><span className="text-text-secondary">Revenue</span> <span className="font-medium">₹{user.revenue?.toLocaleString() || 0}</span></div>
                <div className="flex justify-between"><span className="text-text-secondary">KYC Status</span> 
                  <span className={`font-bold ${user.kycStatus === 'VERIFIED' ? 'text-success' : 'text-warning'}`}>{user.kycStatus || 'PENDING'}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {(user.role === 'DELIVERY_PARTNER' || user.role === 'SELLER') && (
          <div className="bg-surface p-6 rounded-xl shadow-sm border border-border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">KYC Documents</h2>
              {user.kycStatus !== 'VERIFIED' && (
                <Button size="sm" onClick={handleApproveKyc} variant="primary">Approve KYC</Button>
              )}
            </div>
            
            {user.kycDocuments && user.kycDocuments.length > 0 ? (
              <div className="space-y-4">
                {user.kycDocuments.map((doc: any, idx: number) => (
                  <div key={idx} className="border border-border rounded-lg p-4 bg-background/50">
                    <p className="font-semibold text-text-primary mb-1">{doc.documentType} <span className="text-xs text-text-secondary ml-2 px-2 py-0.5 bg-surface rounded-full border border-border">{doc.status}</span></p>
                    <p className="text-sm text-text-secondary mb-3">Doc #: {doc.documentNumber || 'N/A'}</p>
                    <div className="flex flex-wrap gap-3">
                      {doc.frontImageUrl && <a href={doc.frontImageUrl} target="_blank" rel="noreferrer" className="text-primary text-sm hover:underline shrink-0 bg-primary/5 px-3 py-1.5 rounded-md">Front Image</a>}
                      {doc.backImageUrl && <a href={doc.backImageUrl} target="_blank" rel="noreferrer" className="text-primary text-sm hover:underline shrink-0 bg-primary/5 px-3 py-1.5 rounded-md">Back Image</a>}
                      {doc.pdfUrl && <a href={doc.pdfUrl} target="_blank" rel="noreferrer" className="text-primary text-sm hover:underline shrink-0 bg-primary/5 px-3 py-1.5 rounded-md">PDF Document</a>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 border border-dashed border-border text-center rounded-lg">
                <p className="text-text-secondary text-sm">No KYC documents uploaded yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default UserDetailPage;
