import React, { useState, useEffect } from 'react';
import { KPICard } from '@/components/ui/KPI';
import { DataTable } from '@/components/table';
import { ColumnDef } from '@/types/table.types';
import { useNotificationStore } from '@/store/notificationStore';
import { useAuthStore } from '@/store/authStore';
import { logAuditEvent } from '@/utils/audit';
import apiClient from '@/lib/apiClient';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, Label
} from 'recharts';
import { 
  IndianRupee, Store, Users, FileCheck, Check, X
} from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ffc658'];

export const AdminDashboard: React.FC = () => {
  const { addToast } = useNotificationStore();
  const { user } = useAuthStore();
  
  const [shops, setShops] = useState<any[]>([]);
  const [kpis, setKpis] = useState({ gmv: '₹0', sellers: 0, orders: 0, customers: 0 });
  const [chartData, setChartData] = useState([]);
  const [pieData, setPieData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, sellersRes] = await Promise.all([
          apiClient.get('/admin/analytics'),
          apiClient.get('/admin/sellers?limit=10')
        ]);
        
        if (analyticsRes.data.success) {
          setKpis(analyticsRes.data.kpis);
          setChartData(analyticsRes.data.charts?.revenueTrend || []);
        }
        
        if (sellersRes.data.success) {
          const fetchedShops = sellersRes.data.data;
          setShops(fetchedShops);
          
          const categoryCounts = fetchedShops.reduce((acc: any, shop: any) => {
             const cat = shop.category || 'Other';
             acc[cat] = (acc[cat] || 0) + 1;
             return acc;
          }, {});
          
          const pieArray = Object.keys(categoryCounts).map(cat => ({
            name: cat,
            value: categoryCounts[cat]
          }));
          setPieData(pieArray);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    };
    fetchData();
  }, []);

  const handleApproveShop = (shopId: string, shopName: string) => {
    setShops((prev) => 
      prev.map((s) => s.id === shopId ? { ...s, status: 'ACTIVE' } : s)
    );

    if (user) {
      logAuditEvent({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: 'SHOP_APPROVE',
        details: `Approved shop registration and activated commissions rules for ${shopName} (${shopId})`,
      });
    }

    addToast({
      title: 'Shop Approved ✅',
      message: `${shopName} is now active on the marketplace index.`,
      type: 'success',
    });
  };

  const handleSuspendShop = (shopId: string, shopName: string) => {
    setShops((prev) => 
      prev.map((s) => s.id === shopId ? { ...s, status: 'SUSPENDED' } : s)
    );

    if (user) {
      logAuditEvent({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: 'SHOP_SUSPEND',
        details: `Suspended shop operations for ${shopName} (${shopId})`,
      });
    }

    addToast({
      title: 'Shop Suspended ⚠️',
      message: `${shopName} operations are suspended.`,
      type: 'warning',
    });
  };

  const pendingApprovalsCount = shops.filter((s) => s.status === 'PENDING').length;

  const columns: ColumnDef<any>[] = [
    {
      id: 'id',
      header: 'Store ID',
      cell: (row) => <span className="font-bold font-mono">{row.id?.substring(0,8) || row.id}</span>,
      sortable: true,
      accessorKey: 'id',
    },
    {
      id: 'name',
      header: 'Shop Details',
      cell: (row) => (
        <div>
          <div className="font-bold text-text-primary">{row.name}</div>
          <div className="text-[10px] text-text-secondary">{row.city}</div>
        </div>
      ),
      sortable: true,
      accessorKey: 'name',
    },
    {
      id: 'category',
      header: 'Category',
      cell: (row) => <span className="capitalize">{row.category}</span>,
      sortable: true,
      accessorKey: 'category',
    },
    {
      id: 'revenue',
      header: 'Revenue',
      cell: (row) => <span className="font-semibold">₹{row.revenue || 0}</span>,
      sortable: true,
      accessorKey: 'revenue',
    },
    {
      id: 'status',
      header: 'Verification Status',
      cell: (row) => {
        const status = row.status || 'PENDING';
        const colors: any = {
          ACTIVE: 'bg-success/10 border-success/20 text-success',
          PENDING: 'bg-warning/10 border-warning/20 text-warning',
          SUSPENDED: 'bg-danger/10 border-danger/20 text-danger',
          INACTIVE: 'bg-border/30 border-border text-text-secondary',
        };
        return (
          <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase ${colors[status] || ''}`}>
            {status.replace(/_/g, ' ')}
          </span>
        );
      },
      sortable: true,
      accessorKey: 'status',
    },
    {
      id: 'actions',
      header: 'Approve Actions',
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          {row.status === 'PENDING' && (
            <>
              <button 
                onClick={() => handleApproveShop(row.id, row.name)}
                className="p-1 hover:bg-success/15 text-success rounded border border-success/30 flex items-center justify-center"
                title="Approve Registration"
              >
                <Check size={12} />
              </button>
              <button 
                onClick={() => handleSuspendShop(row.id, row.name)}
                className="p-1 hover:bg-danger/15 text-danger rounded border border-danger/30 flex items-center justify-center"
                title="Reject / Suspend"
              >
                <X size={12} />
              </button>
            </>
          )}
          {row.status === 'ACTIVE' && (
            <button 
              onClick={() => handleSuspendShop(row.id, row.name)}
              className="px-2 py-1 text-[10px] bg-danger/5 hover:bg-danger/10 text-danger border border-danger/20 rounded font-semibold"
            >
              Suspend Store
            </button>
          )}
          {row.status === 'SUSPENDED' && (
            <button 
              onClick={() => handleApproveShop(row.id, row.name)}
              className="px-2 py-1 text-[10px] bg-success/5 hover:bg-success/10 text-success border border-success/20 rounded font-semibold"
            >
              Re-Activate
            </button>
          )}
        </div>
      ),
    },
  ];

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* 1. KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Gross Merchandise Value (GMV)"
          value={kpis.gmv || '₹0'}
          change="+12.4%"
          changeType="increase"
          icon="IndianRupee"
          helperText="this week totals"
        />
        <KPICard
          title="Verified Merchants"
          value={kpis.sellers || 0}
          change="+1 new request"
          changeType="neutral"
          icon="Store"
          helperText="active stores online"
        />
        <KPICard
          title="Total Orders"
          value={kpis.orders || 0}
          change="All assigned"
          changeType="increase"
          icon="Users"
          helperText="total deliveries made"
        />
        <KPICard
          title="Total Customers"
          value={kpis.customers || 0}
          change={pendingApprovalsCount > 0 ? 'Urgent Action' : 'Stable'}
          changeType={pendingApprovalsCount > 0 ? 'decrease' : 'neutral'}
          icon="FileCheck"
          helperText="active users"
        />
      </div>

      {/* 2. Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GMV Recharts curve */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-lg p-5 shadow-enterprise space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">Platform Revenue Trend</h3>
              <p className="text-[10px] text-text-secondary">Platform revenue shares tracking</p>
            </div>
          </div>
          <div className="h-60 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={10} />
                <YAxis stroke="var(--text-secondary)" fontSize={10} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--surface)', 
                    borderColor: 'var(--border)',
                    fontSize: '11px',
                    borderRadius: '6px'
                  }} 
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Line 
                  name="Platform Revenue Share (₹)" 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="var(--primary)" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Real data circle graph (replacing Financial Overrides) */}
        <div className="bg-surface border border-border rounded-lg p-5 shadow-enterprise space-y-4 animate-in fade-in duration-200 flex flex-col">
          <div className="flex items-center gap-2 border-b border-border pb-2 text-text-primary">
            <Store size={14} className="text-accent" />
            <span className="text-xs font-bold uppercase tracking-wider">Category Distribution</span>
          </div>
          <div className="flex-1 w-full text-xs relative flex items-center justify-center min-h-[220px]">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    labelLine={false}
                    label={renderCustomizedLabel}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    <Label 
                      value={shops.length.toString()} 
                      position="center"
                      className="text-2xl font-bold fill-text-primary"
                    />
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--surface)', 
                      borderColor: 'var(--border)',
                      fontSize: '11px',
                      borderRadius: '6px'
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-text-secondary text-[10px]">No category data available</div>
            )}
          </div>
        </div>

      </div>

      {/* 4. Shops Approval Directory */}
      <div className="space-y-3">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">Shop Registration & KYC review</h3>
          <p className="text-[10px] text-text-secondary">Approve or suspend merchant shops based on KYC compliance standards</p>
        </div>

        <DataTable
          data={shops}
          columns={columns}
          searchKey="name"
          searchPlaceholder="Search store name..."
          exportFileName="admin-merchant-directory"
        />
      </div>

    </div>
  );
};

export default AdminDashboard;
