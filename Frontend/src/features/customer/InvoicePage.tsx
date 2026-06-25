import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useNotificationStore } from '@/store/notificationStore';
import { api } from '@/lib/axios';
import { Order } from '@/domain/order';

export const InvoicePage: React.FC = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useNotificationStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/v1/orders/${orderId}`);
        setOrder(res.data.data);
      } catch (err) {
        addToast({ title: 'Error', message: 'Failed to load invoice data', type: 'danger' });
      } finally {
        setLoading(false);
      }
    };
    if (orderId) fetchOrder();
  }, [orderId]);

  const handleDownloadPDF = () => {
    const element = document.getElementById('invoice-content');
    if (!element) return;
    
    // Check if html2pdf is available globally
    if (typeof (window as any).html2pdf === 'undefined') {
      // Fallback if CDN failed
      window.print();
      return;
    }

    addToast({ title: 'Generating PDF', message: 'Please wait...', type: 'info' });
    const opt = {
      margin: 10,
      filename: `Invoice_${order?.orderId || order?.id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    (window as any).html2pdf().set(opt).from(element).save().then(() => {
      addToast({ title: 'Success', message: 'Invoice downloaded successfully', type: 'success' });
    });
  };

  if (loading) return <div className="p-10 text-center animate-pulse">Loading Invoice...</div>;
  if (!order) return <div className="p-10 text-center text-danger">Order not found.</div>;

  return (
    <div className="max-w-4xl mx-auto w-full pb-16 space-y-4">
      {/* Action Bar (Not part of PDF) */}
      <div className="flex items-center justify-between no-print bg-surface p-4 rounded-xl border border-border shadow-sm">
        <Button variant="ghost" onClick={() => navigate(-1)} className="text-text-secondary">
          <ArrowLeft size={16} className="mr-2" /> Back
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer size={16} className="mr-2" /> Print
          </Button>
          <Button onClick={handleDownloadPDF} className="bg-accent text-white">
            <Download size={16} className="mr-2" /> Download PDF
          </Button>
        </div>
      </div>

      {/* A4 Printable Area */}
      <div 
        id="invoice-content" 
        className="bg-white text-black p-10 shadow-enterprise-lg rounded-xl border border-border mx-auto print:shadow-none print:border-none print:p-0"
        style={{ minHeight: '297mm', maxWidth: '210mm' }}
      >
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-gray-200 pb-8">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter">INVOICE</h1>
            <p className="text-gray-500 mt-1 font-medium">Order #{order.orderId || order.id}</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-black text-accent tracking-tighter">LOCAL SHOP</h2>
            <p className="text-sm text-gray-500 mt-1">support@localshop.com</p>
            <p className="text-sm text-gray-500">+91 1800-123-4567</p>
            <p className="text-sm text-gray-500 font-bold mt-2">GSTIN: 27AADCB2230M1Z2</p>
          </div>
        </div>

        {/* Addresses */}
        <div className="grid grid-cols-2 gap-10 mt-8">
          <div>
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Billed To</h3>
            <p className="font-bold text-gray-900 text-lg">{order.customerName}</p>
            <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap leading-relaxed max-w-[250px]">
              {order.deliveryDetails?.deliveryAddress || 'Home Address Not Provided'}
            </p>
          </div>
          <div>
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Sold By</h3>
            <p className="font-bold text-gray-900 text-lg">{order.shopName}</p>
            <p className="text-sm text-gray-600 mt-1">Shop ID: {order.shopId}</p>
            <div className="mt-4 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Invoice Date:</span>
                <span className="font-semibold text-gray-900">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Payment Method:</span>
                <span className="font-semibold text-gray-900 uppercase">{order.paymentMethod}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="mt-12">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-900">
                <th className="py-3 text-xs font-black text-gray-900 uppercase tracking-widest">Item Description</th>
                <th className="py-3 text-xs font-black text-gray-900 uppercase tracking-widest text-center">Qty</th>
                <th className="py-3 text-xs font-black text-gray-900 uppercase tracking-widest text-right">Unit Price</th>
                <th className="py-3 text-xs font-black text-gray-900 uppercase tracking-widest text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {order.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-4">
                    <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">SKU: {item.productId ? item.productId.slice(-8).toUpperCase() : 'N/A'}</p>
                  </td>
                  <td className="py-4 text-center text-gray-900 text-sm font-semibold">{item.quantity}</td>
                  <td className="py-4 text-right text-gray-900 text-sm font-semibold">₹{item.price.toFixed(2)}</td>
                  <td className="py-4 text-right text-gray-900 text-sm font-black">₹{(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mt-8 flex justify-end">
          <div className="w-64 space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900">₹{order.subtotal || order.total}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Delivery Fee</span>
              <span className="font-semibold text-gray-900">₹{order.deliveryFee || 0}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Tax (GST)</span>
              <span className="font-semibold text-gray-900">₹{(order.tax || 0).toFixed(2)}</span>
            </div>
            {(order.discount || 0) > 0 && (
              <div className="flex justify-between text-sm text-green-600 font-semibold">
                <span>Discount</span>
                <span>-₹{order.discount}</span>
              </div>
            )}
            <div className="border-t-2 border-gray-900 pt-3 flex justify-between items-center">
              <span className="font-black text-gray-900">Total Paid</span>
              <span className="font-black text-2xl text-accent">₹{order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-24 pt-8 border-t border-gray-200 text-center space-y-2 text-xs text-gray-500">
          <p className="font-bold text-gray-900">Thank you for shopping with Local Shop!</p>
          <p>This is a computer generated invoice and does not require a physical signature.</p>
          <p>For returns and support, visit www.localshop.com/support</p>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #invoice-content, #invoice-content * { visibility: visible; }
          #invoice-content { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none; border: none; padding: 0; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default InvoicePage;
