import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService } from '../services/admin.service';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, CreditCard, User, ShoppingBag } from 'lucide-react';

export const PaymentDetailPage: React.FC = () => {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (paymentId) {
      adminService.getPaymentById(paymentId)
        .then(res => {
          setPayment(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [paymentId]);

  if (loading) {
    return <div className="p-8 text-center text-text-secondary">Loading payment details...</div>;
  }

  if (!payment) {
    return <div className="p-8 text-center text-danger font-semibold">Payment not found</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/admin/payments')} className="p-2">
          <ArrowLeft size={18} />
        </Button>
        <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Payment Details</h1>
      </div>

      <div className="bg-surface p-6 rounded-xl shadow-sm border border-border space-y-6">
        <div className="flex items-center justify-between pb-6 border-b border-border">
          <div>
            <h2 className="text-sm text-text-secondary uppercase tracking-wider font-bold mb-1">Transaction ID</h2>
            <p className="text-xl font-mono font-bold text-text-primary">{payment.transactionId}</p>
          </div>
          <div className="text-right">
            <h2 className="text-sm text-text-secondary uppercase tracking-wider font-bold mb-1">Amount</h2>
            <p className="text-2xl font-extrabold text-text-primary">₹{payment.amount?.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2"><CreditCard size={18} /> Transaction Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-text-secondary">Status</span> 
                <span className={`font-bold ${payment.settlementStatus === 'SETTLED' ? 'text-success' : 'text-warning'}`}>
                  {payment.settlementStatus}
                </span>
              </div>
              <div className="flex justify-between"><span className="text-text-secondary">Method</span> <span className="font-medium">{payment.paymentMethod}</span></div>
              <div className="flex justify-between"><span className="text-text-secondary">Gateway</span> <span className="font-medium">{payment.gateway}</span></div>
              <div className="flex justify-between"><span className="text-text-secondary">Type</span> <span className="font-medium uppercase">{payment.type}</span></div>
              <div className="flex justify-between"><span className="text-text-secondary">Date</span> <span className="font-medium">{new Date(payment.createdAt).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-text-secondary">Description</span> <span className="font-medium">{payment.description}</span></div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2"><User size={18} /> Customer Info</h3>
              <div className="space-y-2 text-sm bg-accent/5 p-4 rounded-lg">
                <div className="flex justify-between"><span className="text-text-secondary">Name</span> <span className="font-medium">{payment.customerName || 'Unknown'}</span></div>
                <div className="flex justify-between"><span className="text-text-secondary">User ID</span> <span className="font-mono text-xs">{payment.customer}</span></div>
                {payment.customer && payment.customer !== 'Unknown' && (
                  <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => navigate(`/admin/users/${payment.customer}`)}>View Customer</Button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2"><ShoppingBag size={18} /> Order Info</h3>
              <div className="space-y-2 text-sm bg-accent/5 p-4 rounded-lg">
                <div className="flex justify-between"><span className="text-text-secondary">Order ID</span> <span className="font-mono text-xs">{payment.orderId}</span></div>
                {payment.orderTotal && <div className="flex justify-between"><span className="text-text-secondary">Order Total</span> <span className="font-medium">₹{payment.orderTotal?.toLocaleString()}</span></div>}
                {payment.orderStatus && <div className="flex justify-between"><span className="text-text-secondary">Order Status</span> <span className="font-medium uppercase">{payment.orderStatus}</span></div>}
                {payment.orderId && payment.orderId !== 'N/A' && (
                  <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => navigate(`/admin/orders/${payment.orderId}`)}>View Order</Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default PaymentDetailPage;
