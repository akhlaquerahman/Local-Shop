import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { DownloadCloud, Activity, User, Package, Wallet, MapPin, Tag, Store, ShoppingBag, AlertCircle } from 'lucide-react';

export const AiVisualizer = ({ payload }: { payload: any }) => {
  const navigate = useNavigate();

  if (!payload || !payload._type) return null;

  if (payload._type === 'CHART') {
    return (
      <div className="w-full h-64 mt-4 bg-background border border-border p-4 rounded-xl">
        <h4 className="text-sm font-semibold text-text mb-4">{payload.title}</h4>
        <ResponsiveContainer width="100%" height="100%">
          {payload.chartType === 'bar' ? (
            <BarChart data={payload.data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: 'var(--surface-hover)' }} contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }} />
              <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <LineChart data={payload.data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }} />
              <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    );
  }

  if (payload._type === 'ACTION_CONFIRMATION') {
    return (
      <div className="mt-4 p-4 bg-warning/10 border border-warning/20 rounded-xl">
        <p className="text-sm text-text font-medium mb-3">{payload.message}</p>
        <div className="flex items-center gap-2">
          <button 
            className="px-4 py-2 bg-warning text-white text-sm font-medium rounded-lg hover:bg-warning-hover transition-colors"
            onClick={() => {
              alert(`Action ${payload.actionType} confirmed! \nPayload: ${JSON.stringify(payload.payload)}`);
            }}
          >
            Confirm Action
          </button>
          <button className="px-4 py-2 bg-surface text-text text-sm font-medium rounded-lg border border-border hover:bg-surface-hover transition-colors">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (payload._type === 'NAVIGATION') {
    return (
      <div className="mt-2">
        <button 
          onClick={() => navigate(payload.route)}
          className="text-primary hover:underline text-sm font-medium"
        >
          Click here to open {payload.route}
        </button>
      </div>
    );
  }

  if (payload._type === 'FILE_DOWNLOAD') {
    return (
      <div className="mt-4 p-4 bg-surface border border-border rounded-xl flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-text">{payload.title}</h4>
          <p className="text-xs text-text-secondary">Your report is ready to download.</p>
        </div>
        <a 
          href={payload.url}
          download
          className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <DownloadCloud className="w-4 h-4" /> Download
        </a>
      </div>
    );
  }

  if (payload._type === 'PROFILE_CARD') {
    const { profile } = payload;
    return (
      <div className="mt-4 p-4 bg-surface border border-border rounded-xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-text">{profile?.name || 'User'}</h4>
            <p className="text-xs text-text-secondary">{profile?.email}</p>
          </div>
        </div>
        <div className="text-xs text-text-secondary">
          <p>Role: {profile?.role}</p>
          <p>Phone: {profile?.phone || 'N/A'}</p>
        </div>
      </div>
    );
  }

  if (payload._type === 'ORDER_CARD') {
    return (
      <div className="mt-4 p-4 bg-surface border border-border rounded-xl">
        <h4 className="text-sm font-medium text-text flex items-center gap-2 mb-3">
          <Package className="w-4 h-4 text-primary" /> {payload.title || 'Orders'}
        </h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {payload.orders && payload.orders.map((o: any) => (
            <div key={o._id} className="p-3 bg-background rounded-lg border border-border text-sm flex justify-between items-center">
              <div>
                <span className="font-medium">#{o.orderNumber || o._id?.slice(-6)}</span>
                <p className="text-xs text-text-secondary mt-1">{o.status}</p>
              </div>
              <div className="text-right">
                <span className="font-medium">${o.totalAmount}</span>
              </div>
            </div>
          ))}
          {(!payload.orders || payload.orders.length === 0) && (
            <p className="text-xs text-text-secondary text-center py-2">No orders found.</p>
          )}
        </div>
      </div>
    );
  }

  if (payload._type === 'DELIVERY_CARD') {
    return (
      <div className="mt-4 p-4 bg-surface border border-border rounded-xl">
        <h4 className="text-sm font-medium text-text flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-primary" /> Delivery Info
        </h4>
        <div className="p-3 bg-background border border-border rounded-lg text-sm">
          {payload.order ? (
            <>
              <p><strong>Order:</strong> #{payload.order.orderNumber || payload.order._id?.slice(-6)}</p>
              <p><strong>Status:</strong> {payload.order.status}</p>
              {payload.order.deliveryPartner && (
                 <p className="mt-2 text-xs text-text-secondary">Assigned to: {payload.order.deliveryPartner.name || 'Rider'}</p>
              )}
            </>
          ) : payload.deliveries ? (
             <div className="space-y-2">
                {payload.deliveries.map((d: any) => (
                  <div key={d._id} className="text-xs flex justify-between border-b border-border pb-1">
                    <span>Task {d._id?.slice(-4)}</span>
                    <span className="font-medium">{d.status}</span>
                  </div>
                ))}
             </div>
          ) : (
            <p className="text-xs text-text-secondary text-center">No delivery info.</p>
          )}
        </div>
      </div>
    );
  }

  if (payload._type === 'WALLET_CARD') {
    return (
      <div className="mt-4 p-4 bg-surface border border-border rounded-xl bg-gradient-to-r from-primary/10 to-transparent">
        <h4 className="text-sm font-medium text-text flex items-center gap-2 mb-2">
          <Wallet className="w-4 h-4 text-primary" /> {payload.title || 'Wallet Balance'}
        </h4>
        <p className="text-2xl font-bold text-text">
          {payload.balance !== undefined ? `${payload.balance} ${payload.currency || 'USD'}` : 'N/A'}
        </p>
        {payload.status && (
           <p className="text-xs text-text-secondary mt-1">Status: {payload.status}</p>
        )}
      </div>
    );
  }

  if (payload._type === 'COUPON_CARD') {
    return (
      <div className="mt-4 p-4 bg-surface border border-border rounded-xl">
        <h4 className="text-sm font-medium text-text flex items-center gap-2 mb-3">
          <Tag className="w-4 h-4 text-primary" /> Available Coupons
        </h4>
        <div className="flex flex-col gap-2">
          {payload.coupons && payload.coupons.map((c: any) => (
            <div key={c._id} className="p-2 border border-dashed border-primary rounded bg-primary/5 flex justify-between items-center text-sm">
              <span className="font-bold text-primary">{c.code}</span>
              <span className="text-xs text-text-secondary">{c.discountPercentage ? `${c.discountPercentage}% OFF` : `$${c.discountAmount} OFF`}</span>
            </div>
          ))}
          {(!payload.coupons || payload.coupons.length === 0) && (
            <p className="text-xs text-text-secondary text-center py-2">No coupons available.</p>
          )}
        </div>
      </div>
    );
  }

  if (payload._type === 'SHOP_CARD') {
    return (
      <div className="mt-4 p-4 bg-surface border border-border rounded-xl">
        <h4 className="text-sm font-medium text-text flex items-center gap-2 mb-3">
          <Store className="w-4 h-4 text-primary" /> Nearest Shops
        </h4>
        <div className="grid grid-cols-1 gap-2">
           {payload.shops && payload.shops.map((s: any) => (
             <div key={s._id} className="p-2 border border-border rounded-lg bg-background text-sm">
               <p className="font-medium text-text">{s.name}</p>
               <p className="text-xs text-text-secondary flex items-center gap-1 mt-1">
                 <MapPin className="w-3 h-3" /> {s.address?.city || 'Local area'}
               </p>
             </div>
           ))}
        </div>
      </div>
    );
  }

  if (payload._type === 'PRODUCT_CARD') {
    return (
      <div className="mt-4 p-4 bg-surface border border-border rounded-xl">
        <h4 className="text-sm font-medium text-text flex items-center gap-2 mb-3">
          <ShoppingBag className="w-4 h-4 text-primary" /> Products
        </h4>
        <div className="flex flex-col gap-2">
          {payload.products && payload.products.map((p: any) => (
            <div key={p._id} className="flex items-center justify-between p-2 border border-border rounded bg-background text-sm">
              <div className="truncate w-32">
                <span className="font-medium text-text">{p.name}</span>
              </div>
              <div className="text-right text-xs">
                <span className="block font-bold">${p.price}</span>
                <span className={`block ${p.stock < 10 ? 'text-error' : 'text-success'}`}>{p.stock} in stock</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (payload._type === 'TICKET_CARD') {
    return (
      <div className="mt-4 p-4 bg-surface border border-border rounded-xl">
        <h4 className="text-sm font-medium text-text flex items-center gap-2 mb-3">
          <MessageSquare className="w-4 h-4 text-primary" /> Support Tickets
        </h4>
        <div className="flex flex-col gap-2">
          {payload.tickets && payload.tickets.map((t: any) => (
            <div key={t._id} className="p-3 bg-background border border-border rounded-lg text-sm">
              <div className="flex justify-between items-start mb-1">
                <span className="font-medium text-text">{t.subject || 'Ticket'}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${t.status === 'OPEN' ? 'bg-error/10 text-error' : 'bg-success/10 text-success'}`}>
                  {t.status}
                </span>
              </div>
              <p className="text-xs text-text-secondary line-clamp-2">{t.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (payload._type === 'ACTION_CARD') {
    return (
       <div className="mt-4 p-4 bg-surface border border-border rounded-xl flex items-start gap-3">
         <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
         <div>
           <h4 className="text-sm font-medium text-text">{payload.title}</h4>
           <p className="text-xs text-text-secondary mt-1">{payload.message}</p>
         </div>
       </div>
    );
  }

  if (payload.score !== undefined && payload.status) {
    // Health Score Render
    return (
      <div className="mt-4 p-4 bg-surface border border-border rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <h4 className="text-sm font-medium text-text">Marketplace Health</h4>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            payload.score > 80 ? 'bg-success/10 text-success' : 
            payload.score > 60 ? 'bg-warning/10 text-warning' : 'bg-error/10 text-error'
          }`}>
            {payload.status}
          </span>
        </div>
        <div className="flex items-end gap-2 mb-4">
          <span className="text-4xl font-bold text-text">{payload.score}</span>
          <span className="text-sm text-text-secondary mb-1">/ 100</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-background rounded border border-border">
            <span className="text-text-secondary block mb-1">GMV Score</span>
            <span className="font-medium text-text">{payload.breakdown?.gmvScore || 'N/A'}</span>
          </div>
          <div className="p-2 bg-background rounded border border-border">
            <span className="text-text-secondary block mb-1">SLA Compliance</span>
            <span className="font-medium text-text">{payload.breakdown?.slaCompliance || 'N/A'}%</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
