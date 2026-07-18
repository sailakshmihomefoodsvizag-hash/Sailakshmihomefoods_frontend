import { useState, useEffect } from 'react';
import {
  IndianRupee, ShoppingBag, Clock, CheckCircle2, XCircle,
  TrendingUp, Package, BarChart3, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { adminAPI } from '../services/adminAPI';

// ── Helpers ──────────────────────────────────────────────────────────────────

const formatINR = (amount) => {
  if (amount === null || amount === undefined) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const CHART_COLORS = ['#7B0D1E', '#FFD700', '#2563eb', '#16a34a', '#f59e0b', '#ef4444'];
const PIE_COLORS   = ['#fbbf24', '#3b82f6', '#8b5cf6', '#f97316', '#10b981', '#ef4444'];

// ── Dashboard Component ──────────────────────────────────────────────────────

const AdminDashboard = () => {
  const [stats, setStats]     = useState(null);
  const [charts, setCharts]   = useState(null);
  const [recent, setRecent]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    try {
      const data = await adminAPI.getDashboard();
      if (data.success) {
        setStats(data.stats);
        setCharts(data.charts);
        setRecent(data.recentOrders || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // ── Loading Skeleton ─────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div className="h-8 w-40 bg-gray-200 rounded-lg" />
          <div className="h-5 w-56 bg-gray-200 rounded-lg mt-2 md:mt-0" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="h-28 bg-gray-200 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-72 bg-gray-200 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  // ── Stat Cards Data ──────────────────────────────────────────────────────

  const statCards = [
    {
      label: 'Total Revenue',
      value: formatINR(stats?.totalRevenue || 0),
      icon: IndianRupee,
      gradient: 'from-emerald-500 to-emerald-600',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
    {
      label: "Today's Revenue",
      value: formatINR(stats?.todayRevenue || 0),
      icon: TrendingUp,
      gradient: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: ShoppingBag,
      gradient: 'from-violet-500 to-violet-600',
      iconBg: 'bg-violet-100',
      iconColor: 'text-violet-600',
    },
    {
      label: "Today's Orders",
      value: stats?.todayOrders || 0,
      icon: Package,
      gradient: 'from-amber-500 to-amber-600',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
    },
    {
      label: 'Pending Orders',
      value: stats?.pendingOrders || 0,
      icon: Clock,
      gradient: 'from-orange-500 to-orange-600',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
    {
      label: 'Completed',
      value: stats?.completedOrders || 0,
      icon: CheckCircle2,
      gradient: 'from-green-500 to-green-600',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      label: 'Cancelled',
      value: stats?.cancelledOrders || 0,
      icon: XCircle,
      gradient: 'from-red-500 to-red-600',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
    },
    {
      label: 'Avg Order Value',
      value: formatINR(stats?.avgOrderValue || 0),
      icon: BarChart3,
      gradient: 'from-indigo-500 to-indigo-600',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
    },
  ];

  // ── Chart Data Preparation ───────────────────────────────────────────────

  const statusData = (charts?.statusDistribution || [])
    .filter(s => s.count > 0)
    .map(s => ({
      name: s.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: s.count,
    }));

  const deliveryData = (charts?.deliveryDistribution || []).filter(d => d.value > 0);

  const dailyRevData = (charts?.dailyRevenue || []).map(d => ({
    ...d,
    date: new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
  }));

  const topProductsData = charts?.topProducts || [];
  const monthlyRevData  = charts?.monthlyRevenue || [];

  // ── Custom Tooltip ───────────────────────────────────────────────────────

  const RevenueTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-lg">
          <p className="text-xs text-gray-500 mb-1">{label}</p>
          <p className="text-sm font-semibold text-gray-900">
            {formatINR(payload[0].value)}
          </p>
          {payload[1] && (
            <p className="text-xs text-gray-500 mt-1">
              {payload[1].value} orders
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back, Admin</p>
        </div>
        <p className="text-sm text-gray-500 mt-2 md:mt-0 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
          {today}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-gray-100 p-4 md:p-5 shadow-sm hover:shadow-md transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
              </div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                {card.label}
              </p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Revenue Trend (7 Days)</h3>
            <span className="text-xs text-gray-400">Daily</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyRevData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<RevenueTooltip />} />
                <Line type="monotone" dataKey="revenue" stroke="#7B0D1E" strokeWidth={2.5} dot={{ fill: '#7B0D1E', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders Overview */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Orders Overview (7 Days)</h3>
            <span className="text-xs text-gray-400">Daily</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyRevData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="orders" fill="#7B0D1E" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Distribution */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Order Status Distribution</h3>
          <div className="h-64 flex items-center justify-center">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {statusData.map((_, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-400">No order data yet</p>
            )}
          </div>
        </div>

        {/* Delivery Distribution */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Delivery Distribution</h3>
          <div className="h-64 flex items-center justify-center">
            {deliveryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deliveryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {deliveryData.map((_, idx) => (
                      <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-400">No delivery data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Selling Products */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Best Selling Products</h3>
          <div className="h-64">
            {topProductsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProductsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#374151' }} axisLine={false} tickLine={false} width={100} />
                  <Tooltip />
                  <Bar dataKey="quantity" fill="#FFD700" radius={[0, 6, 6, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-gray-400">No product data yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Monthly Revenue ({new Date().getFullYear()})</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7B0D1E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7B0D1E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => [formatINR(value), 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#7B0D1E" strokeWidth={2} fill="url(#revenueGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Recent Orders</h3>
        {recent.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3 pr-4">Order ID</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3 pr-4">Customer</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3 pr-4">Amount</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3 pr-4">Status</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recent.map((order) => (
                  <tr key={order.orderId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 pr-4">
                      <span className="text-xs font-mono bg-amber-50 text-amber-700 px-2 py-1 rounded-md">
                        {order.orderId}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-sm text-gray-700">{order.customerName}</td>
                    <td className="py-3 pr-4 text-sm font-semibold text-gray-900">{formatINR(order.totalAmount)}</td>
                    <td className="py-3 pr-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(order.orderStatus)}`}>
                        {order.orderStatus?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-8">No recent orders</p>
        )}
      </div>
    </div>
  );
};

const getStatusBadgeColor = (status) => ({
  pending:          'bg-yellow-50 text-yellow-700',
  confirmed:        'bg-blue-50 text-blue-700',
  processing:       'bg-purple-50 text-purple-700',
  out_for_delivery: 'bg-orange-50 text-orange-700',
  delivered:        'bg-green-50 text-green-700',
  cancelled:        'bg-red-50 text-red-700',
}[status] || 'bg-gray-50 text-gray-700');

export default AdminDashboard;
