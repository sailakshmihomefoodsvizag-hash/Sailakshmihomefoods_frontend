import { useState, useEffect, useMemo } from 'react';
import {
  X, Package, Truck, CheckCircle, Search, Filter, ChevronLeft, ChevronRight,
  Store, MapPin, Globe, Clock, IndianRupee, Phone, User, Calendar,
  ArrowUpDown, ChevronDown,
} from 'lucide-react';
import { adminAPI } from '../services/adminAPI';
import { ORDER_STATUS_LABELS } from '../data/orderStatus';

// ── Helpers ──────────────────────────────────────────────────────────────────

const formatINR = (amount) => {
  if (amount === null || amount === undefined) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const formatTime = (date) =>
  new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

const formatDateTime = (date) => `${formatDate(date)} ${formatTime(date)}`;

const getStatusColor = (status) => ({
  pending:          'bg-yellow-50 text-yellow-700 border-yellow-200',
  confirmed:        'bg-blue-50 text-blue-700 border-blue-200',
  processing:       'bg-purple-50 text-purple-700 border-purple-200',
  out_for_delivery: 'bg-orange-50 text-orange-700 border-orange-200',
  delivered:        'bg-green-50 text-green-700 border-green-200',
  cancelled:        'bg-red-50 text-red-700 border-red-200',
}[status] || 'bg-gray-50 text-gray-700 border-gray-200');

const getPaymentColor = (status) => ({
  pending: 'bg-yellow-50 text-yellow-700',
  paid:    'bg-green-50 text-green-700',
  failed:  'bg-red-50 text-red-700',
}[status] || 'bg-gray-50 text-gray-700');

// Determine delivery type from order data — uses stored field, falls back to inference
const getDeliveryType = (order) => {
  // Use the stored delivery method if available (new orders will have this)
  if (order.deliveryMethod && ['in_store', 'local', 'outside'].includes(order.deliveryMethod)) {
    return order.deliveryMethod;
  }
  // Fallback for legacy orders without deliveryMethod stored
  const charge = Number(order.deliveryCharge || 0);
  if (charge === 0) return 'local'; // default to local rather than incorrectly assuming in_store
  if (charge <= 50) return 'local';
  return 'outside';
};

const DELIVERY_TYPE_CONFIG = {
  in_store: { label: 'In-Store Pickup', shortLabel: 'Pickup', bgColor: 'bg-amber-50', textColor: 'text-amber-700', borderColor: 'border-amber-200' },
  local:    { label: 'Local Delivery (Vizag)', shortLabel: 'Local', bgColor: 'bg-blue-50', textColor: 'text-blue-700', borderColor: 'border-blue-200' },
  outside:  { label: 'Outside Visakhapatnam', shortLabel: 'Outside', bgColor: 'bg-purple-50', textColor: 'text-purple-700', borderColor: 'border-purple-200' },
};

// Strict 3-step progression
const STEPS = [
  { value: 'processing', label: 'Processing', icon: Package },
  { value: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { value: 'delivered', label: 'Delivered', icon: CheckCircle },
];

const getStepIndex = (status) => STEPS.findIndex((s) => s.value === status);

// ── Section Summary Card ─────────────────────────────────────────────────────

const SectionSummary = ({ orders, title, icon: Icon, color }) => {
  const total = orders.length;
  const revenue = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const pending = orders.filter(o => ['pending', 'confirmed', 'processing'].includes(o.orderStatus)).length;
  const completed = orders.filter(o => o.orderStatus === 'delivered').length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
        <p className="text-xs text-gray-500">Total Orders</p>
        <p className="text-lg font-bold text-gray-900">{total}</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
        <p className="text-xs text-gray-500">Revenue</p>
        <p className="text-lg font-bold text-emerald-700">{formatINR(revenue)}</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
        <p className="text-xs text-gray-500">Pending</p>
        <p className="text-lg font-bold text-amber-600">{pending}</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
        <p className="text-xs text-gray-500">Completed</p>
        <p className="text-lg font-bold text-green-600">{completed}</p>
      </div>
    </div>
  );
};

// ── Main Component ───────────────────────────────────────────────────────────

const AdminOrders = () => {
  const [orders, setOrders]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating]           = useState(false);

  // Filters
  const [searchQuery, setSearchQuery]       = useState('');
  const [statusFilter, setStatusFilter]     = useState('all');
  const [deliveryFilter, setDeliveryFilter] = useState('all');
  const [paymentFilter, setPaymentFilter]   = useState('all');
  const [sortBy, setSortBy]                 = useState('date_desc');
  const [activeTab, setActiveTab]           = useState('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getOrders({ limit: 200 });
      if (data.success) setOrders(data.orders);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const updateStatus = async (orderId, status) => {
    try {
      setUpdating(true);
      const result = await adminAPI.updateOrderStatus(orderId, status);
      if (!result.success) { alert('Failed: ' + result.message); return; }
      await fetchOrders();
      if (selectedOrder?.orderId === orderId) {
        const d = await adminAPI.getOrder(orderId);
        if (d.success) setSelectedOrder(d.order);
      }
    } catch (e) { alert('Failed: ' + e.message); }
    finally { setUpdating(false); }
  };

  // ── Categorized Orders ─────────────────────────────────────────────────

  const categorizedOrders = useMemo(() => {
    const inStore = orders.filter(o => getDeliveryType(o) === 'in_store');
    const local   = orders.filter(o => getDeliveryType(o) === 'local');
    const outside = orders.filter(o => getDeliveryType(o) === 'outside');
    return { inStore, local, outside };
  }, [orders]);

  // ── Filtered + Sorted Orders ───────────────────────────────────────────

  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // Tab filter (delivery type)
    if (activeTab === 'in_store') result = categorizedOrders.inStore;
    else if (activeTab === 'local') result = categorizedOrders.local;
    else if (activeTab === 'outside') result = categorizedOrders.outside;

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(o => o.orderStatus === statusFilter);
    }

    // Payment filter
    if (paymentFilter !== 'all') {
      result = result.filter(o => o.payment?.status === paymentFilter);
    }

    // Delivery method filter
    if (deliveryFilter !== 'all') {
      result = result.filter(o => getDeliveryType(o) === deliveryFilter);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o =>
        o.orderId?.toLowerCase().includes(q) ||
        o.customer?.name?.toLowerCase().includes(q) ||
        o.customer?.mobile?.includes(q) ||
        o.customer?.address?.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date_asc':    return new Date(a.createdAt) - new Date(b.createdAt);
        case 'date_desc':   return new Date(b.createdAt) - new Date(a.createdAt);
        case 'amount_asc':  return (a.totalAmount || 0) - (b.totalAmount || 0);
        case 'amount_desc': return (b.totalAmount || 0) - (a.totalAmount || 0);
        case 'status':      return (a.orderStatus || '').localeCompare(b.orderStatus || '');
        default:            return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    return result;
  }, [orders, activeTab, statusFilter, paymentFilter, deliveryFilter, searchQuery, sortBy, categorizedOrders]);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter, deliveryFilter, paymentFilter, activeTab]);

  // ── Tab Configuration ──────────────────────────────────────────────────

  const tabs = [
    { id: 'all',      label: 'All Orders',        icon: Package, count: orders.length },
    { id: 'in_store', label: 'In-Store Pickup',   icon: Store,   count: categorizedOrders.inStore.length },
    { id: 'local',    label: 'Local Delivery',    icon: MapPin,  count: categorizedOrders.local.length },
    { id: 'outside',  label: 'Outside Delivery',  icon: Globe,   count: categorizedOrders.outside.length },
  ];

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">{orders.length} total orders</p>
        </div>
      </div>

      {/* Delivery Type Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all min-h-[40px] ${
                activeTab === tab.id
                  ? 'bg-[#7B0D1E] text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.id ? 'bg-white/20' : 'bg-gray-100'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Section Summary (shown for specific tabs) */}
      {activeTab === 'in_store' && <SectionSummary orders={categorizedOrders.inStore} title="In-Store Pickup" icon={Store} color="amber" />}
      {activeTab === 'local' && <SectionSummary orders={categorizedOrders.local} title="Local Delivery" icon={MapPin} color="blue" />}
      {activeTab === 'outside' && <SectionSummary orders={categorizedOrders.outside} title="Outside Delivery" icon={Globe} color="purple" />}

      {/* Search + Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID, Customer, Phone, Address..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7B0D1E]/20 focus:border-[#7B0D1E]"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#7B0D1E]/20"
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="amount_desc">Amount: High to Low</option>
            <option value="amount_asc">Amount: Low to High</option>
            <option value="status">By Status</option>
          </select>
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#7B0D1E]/20"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#7B0D1E]/20"
          >
            <option value="all">All Payments</option>
            <option value="paid">Paid</option>
            <option value="pending">Payment Pending</option>
            <option value="failed">Failed</option>
          </select>

          {activeTab === 'all' && (
            <select
              value={deliveryFilter}
              onChange={(e) => setDeliveryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#7B0D1E]/20"
            >
              <option value="all">All Delivery Types</option>
              <option value="in_store">In-Store Pickup</option>
              <option value="local">Local Delivery</option>
              <option value="outside">Outside Delivery</option>
            </select>
          )}

          {(statusFilter !== 'all' || paymentFilter !== 'all' || deliveryFilter !== 'all' || searchQuery) && (
            <button
              onClick={() => { setStatusFilter('all'); setPaymentFilter('all'); setDeliveryFilter('all'); setSearchQuery(''); }}
              className="px-3 py-2 text-xs text-[#7B0D1E] border border-[#7B0D1E]/30 rounded-lg hover:bg-[#7B0D1E]/5"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Showing {paginatedOrders.length} of {filteredOrders.length} orders</span>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />)}
          </div>
        ) : paginatedOrders.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">No orders match your filters</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {['Order ID','Customer','Phone','Delivery','Payment','Amount','Status','Date','Action'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedOrders.map((order) => (
                  <tr key={order.orderId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-mono bg-amber-50 text-amber-700 px-2 py-1 rounded-md">{order.orderId}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">{order.customer?.name}</p>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{order.customer?.mobile}</td>
                    <td className="px-4 py-3.5">
                      {(() => {
                        const dtype = getDeliveryType(order);
                        const config = DELIVERY_TYPE_CONFIG[dtype] || DELIVERY_TYPE_CONFIG.local;
                        return (
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md font-medium ${config.bgColor} ${config.textColor}`}>
                            <span>{config.shortLabel}</span>
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs px-2 py-1 rounded-md font-medium ${getPaymentColor(order.payment?.status)}`}>
                        {order.payment?.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-gray-900">{formatINR(order.totalAmount)}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-medium border ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-500">{formatDateTime(order.createdAt)}</td>
                    <td className="px-4 py-3.5">
                      <button onClick={() => setSelectedOrder(order)}
                        className="text-xs font-medium bg-[#7B0D1E] text-white px-3 py-2 rounded-lg hover:bg-[#5a0010] transition-colors">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />)
        ) : paginatedOrders.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">No orders match your filters</div>
        ) : paginatedOrders.map((order) => (
          <div key={order.orderId} className="bg-white rounded-xl border border-gray-100 p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono bg-amber-50 text-amber-700 px-2 py-1 rounded-md">{order.orderId}</span>
              <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${getStatusColor(order.orderStatus)}`}>
                {order.orderStatus?.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{order.customer?.name}</p>
                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {order.customer?.mobile}
                </p>
              </div>
              <p className="text-sm font-bold text-[#7B0D1E]">{formatINR(order.totalAmount)}</p>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {formatDateTime(order.createdAt)}
              </span>
              <span className={`px-2 py-0.5 rounded-md ${getPaymentColor(order.payment?.status)}`}>
                {order.payment?.status || 'pending'}
              </span>
            </div>
            <button onClick={() => setSelectedOrder(order)}
              className="w-full bg-[#7B0D1E] text-white text-sm font-medium py-2.5 rounded-lg hover:bg-[#5a0010] transition-colors min-h-[44px]">
              View Details
            </button>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let page;
            if (totalPages <= 5) {
              page = i + 1;
            } else if (currentPage <= 3) {
              page = i + 1;
            } else if (currentPage >= totalPages - 2) {
              page = totalPages - 4 + i;
            } else {
              page = currentPage - 2 + i;
            }
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-[#7B0D1E] text-white'
                    : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            );
          })}

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 p-0 md:p-4" onClick={(e) => e.target === e.currentTarget && setSelectedOrder(null)}>
          <div className="bg-white rounded-t-2xl md:rounded-2xl w-full md:max-w-lg max-h-[92vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between rounded-t-2xl md:rounded-t-2xl z-10">
              <div>
                <h2 className="text-base font-bold text-gray-900">Order Details</h2>
                <p className="text-xs text-gray-400 font-mono mt-0.5">{selectedOrder.orderId}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-5 space-y-5">

              {/* Customer Info */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Customer</p>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <p className="text-sm font-medium text-gray-900">{selectedOrder.customer?.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <p className="text-sm text-gray-600">{selectedOrder.customer?.mobile}</p>
                </div>
                {selectedOrder.customer?.email && (
                  <p className="text-sm text-gray-500 pl-6">{selectedOrder.customer?.email}</p>
                )}
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  <p className="text-sm text-gray-600">
                    {selectedOrder.customer?.address}
                    {selectedOrder.customer?.state && `, ${selectedOrder.customer.state}`}
                    {selectedOrder.customer?.pincode && ` – ${selectedOrder.customer.pincode}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  {(() => {
                    const dtype = getDeliveryType(selectedOrder);
                    const config = DELIVERY_TYPE_CONFIG[dtype] || DELIVERY_TYPE_CONFIG.local;
                    return (
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg font-medium ${config.bgColor} ${config.textColor} border ${config.borderColor}`}>
                        <span>{config.label}</span>
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* Delivery Information */}
              <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Delivery Information</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[11px] text-gray-400 font-medium">Delivery Type</p>
                    {(() => {
                      const dtype = getDeliveryType(selectedOrder);
                      const config = DELIVERY_TYPE_CONFIG[dtype] || DELIVERY_TYPE_CONFIG.local;
                      return <p className="text-sm font-medium text-gray-900 mt-0.5">{config.label}</p>;
                    })()}
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 font-medium">Delivery Charge</p>
                    <p className={`text-sm font-medium mt-0.5 ${selectedOrder.deliveryCharge === 0 ? 'text-emerald-600' : 'text-gray-900'}`}>
                      {selectedOrder.deliveryCharge === 0 ? 'FREE' : formatINR(selectedOrder.deliveryCharge)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 font-medium">Free Delivery</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">
                      {getDeliveryType(selectedOrder) === 'local' && selectedOrder.deliveryCharge === 0 ? 'Yes' : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400 font-medium">Pickup Order</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">
                      {getDeliveryType(selectedOrder) === 'in_store' ? 'Yes' : 'No'}
                    </p>
                  </div>
                  {getDeliveryType(selectedOrder) !== 'in_store' && (
                    <>
                      <div className="col-span-2">
                        <p className="text-[11px] text-gray-400 font-medium">Delivery Address</p>
                        <p className="text-sm text-gray-700 mt-0.5">
                          {selectedOrder.customer?.address}
                          {selectedOrder.customer?.state && `, ${selectedOrder.customer.state}`}
                          {selectedOrder.customer?.pincode && ` – ${selectedOrder.customer.pincode}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-400 font-medium">Delivery Zone</p>
                        <p className="text-sm font-medium text-gray-900 mt-0.5">
                          {getDeliveryType(selectedOrder) === 'local' ? 'Visakhapatnam (Local)' : 'Outstation'}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Items */}
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Items Ordered</p>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-gray-50 rounded-xl p-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-400">{item.weight} × {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{formatINR(item.total)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Total */}
              <div className="border border-gray-100 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span>{formatINR(selectedOrder.subtotal)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Coupon ({selectedOrder.couponCode})</span>
                    <span className="text-green-600">−{formatINR(selectedOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Delivery Charge</span>
                  <span>{selectedOrder.deliveryCharge === 0 ? 'Free' : formatINR(selectedOrder.deliveryCharge)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Payment</span>
                  <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${getPaymentColor(selectedOrder.payment?.status)}`}>
                    {selectedOrder.payment?.status || 'pending'}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-100">
                  <span className="text-gray-900">Total</span>
                  <span className="text-[#7B0D1E]">{formatINR(selectedOrder.totalAmount)}</span>
                </div>
              </div>

              {/* Status Timeline */}
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">Update Status</p>

                {/* Progress tracker */}
                <div className="flex items-center mb-5">
                  {STEPS.map(({ value, label }, idx) => {
                    const currentIdx = getStepIndex(selectedOrder.orderStatus);
                    const isPending  = selectedOrder.orderStatus === 'pending' || selectedOrder.orderStatus === 'confirmed';
                    const isDone     = !isPending && idx < currentIdx;
                    const isCurrent  = !isPending && idx === currentIdx;
                    return (
                      <div key={value} className="flex items-center flex-1">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                            isDone    ? 'bg-[#7B0D1E] border-[#7B0D1E] text-white' :
                            isCurrent ? 'bg-[#7B0D1E] border-[#7B0D1E] text-white' :
                                        'bg-white border-gray-200 text-gray-300'
                          }`}>
                            {isDone ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                          </div>
                          <span className={`text-[10px] mt-1 text-center leading-tight max-w-[52px] ${
                            isCurrent ? 'text-[#7B0D1E] font-semibold' :
                            isDone    ? 'text-gray-400' : 'text-gray-300'
                          }`}>{label}</span>
                        </div>
                        {idx < STEPS.length - 1 && (
                          <div className={`flex-1 h-0.5 mx-1 mb-4 ${
                            !isPending && idx < currentIdx ? 'bg-[#7B0D1E]' : 'bg-gray-200'
                          }`} />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Action buttons */}
                <div className="space-y-2">
                  {(selectedOrder.orderStatus === 'pending' || selectedOrder.orderStatus === 'confirmed') && (
                    <button
                      onClick={() => updateStatus(selectedOrder.orderId, 'processing')}
                      disabled={updating}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-white border border-[#7B0D1E] text-[#7B0D1E] hover:bg-[#7B0D1E] hover:text-white transition-colors min-h-[48px] disabled:opacity-50">
                      <Package className="w-4 h-4" />
                      <span className="flex-1 text-left">Start Processing</span>
                      <span className="text-xs opacity-60">→</span>
                    </button>
                  )}

                  {STEPS.map(({ value, label, icon: Icon }, idx) => {
                    const currentIdx = getStepIndex(selectedOrder.orderStatus);
                    const isPending  = selectedOrder.orderStatus === 'pending' || selectedOrder.orderStatus === 'confirmed';
                    if (isPending) return null;

                    const isDone     = idx < currentIdx;
                    const isCurrent  = idx === currentIdx;
                    const isNext     = idx === currentIdx + 1;

                    return (
                      <button
                        key={value}
                        onClick={() => isNext && !updating && updateStatus(selectedOrder.orderId, value)}
                        disabled={!isNext || updating}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors min-h-[48px] ${
                          isDone    ? 'bg-gray-50 border border-gray-100 text-gray-300 cursor-not-allowed' :
                          isCurrent ? 'bg-[#7B0D1E] border-[#7B0D1E] text-white cursor-default' :
                          isNext    ? 'bg-white border border-[#7B0D1E] text-[#7B0D1E] hover:bg-[#7B0D1E] hover:text-white cursor-pointer' :
                                      'bg-gray-50 border border-gray-100 text-gray-300 cursor-not-allowed'
                        }`}>
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="flex-1 text-left">{label}</span>
                        {isDone    && <span className="text-xs">✓ Done</span>}
                        {isCurrent && <span className="text-xs opacity-70">Current</span>}
                        {isNext    && <span className="text-xs opacity-60">Mark →</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Order Meta */}
              <div className="text-xs text-gray-400 text-center pt-2 border-t border-gray-100">
                Ordered: {formatDateTime(selectedOrder.createdAt)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
