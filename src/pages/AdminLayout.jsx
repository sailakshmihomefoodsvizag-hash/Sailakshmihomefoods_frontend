import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Ticket, LogOut } from 'lucide-react';
import { adminAPI } from '../services/adminAPI';

const AdminLayout = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verify = async () => {
      if (!adminAPI.isLoggedIn()) { navigate('/admin/login'); return; }
      try { await adminAPI.verify(); setLoading(false); }
      catch { adminAPI.logout(); navigate('/admin/login'); }
    };
    verify();
  }, [navigate]);

  const handleLogout = () => { adminAPI.logout(); navigate('/admin/login'); };

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/orders',    label: 'Orders',    icon: ShoppingCart },
    { path: '/admin/products',  label: 'Products',  icon: Package },
    { path: '/admin/coupons',   label: 'Coupons',   icon: Ticket },
  ];

  const isActive = (path) => location.pathname === path;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center">
        <div className="w-7 h-7 rounded-full bg-[#7B0D1E] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9fafb]">

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex md:flex-col md:fixed md:left-0 md:top-0 md:h-screen md:w-60 bg-[#1a1a1a]">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 bg-[#111111] border-b border-[#2a2a2a] flex-shrink-0">
          <img
            src="/sailakshmi.webp"
            alt="Sai Lakshmi Home Foods"
            className="w-9 h-9 rounded-full border-2 border-[#FFD700]"
          />
        </div>
        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link key={path} to={path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(path)
                  ? 'bg-[#7B0D1E] text-[#FFD700]'
                  : 'text-[#9ca3af] hover:bg-[#2a2a2a] hover:text-white'
              }`}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        {/* Logout */}
        <div className="p-3 border-t border-[#2a2a2a] flex-shrink-0">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#9ca3af] hover:bg-[#2a2a2a] hover:text-[#FFD700] transition-colors">
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Mobile Top Header (with logo) ── */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-center justify-between px-4 z-40">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <img
            src="/sailakshmi.webp"
            alt="Sai Lakshmi Home Foods"
            className="w-8 h-8 rounded-full border-2 border-[#FFD700]"
          />
          <span className="text-[#FFD700] text-sm font-semibold tracking-wide">Sai Lakshmi</span>
        </div>
        {/* Logout on mobile */}
        <button onClick={handleLogout}
          className="flex items-center gap-1.5 text-[#9ca3af] text-xs hover:text-[#FFD700] transition-colors py-2 px-2">
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </header>

      {/* ── Desktop Top Header ── */}
      <header className="hidden md:flex bg-white border-b border-[#e5e7eb] px-8 h-14 items-center justify-end sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <span className="text-sm text-gray-500">Admin</span>
          <div className="w-8 h-8 bg-[#7B0D1E] rounded-full flex items-center justify-center text-white text-xs font-semibold">A</div>
        </div>
      </header>

      {/* ── Mobile Bottom Tab Bar ── */}
      <nav className="fixed md:hidden bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-[#2a2a2a] flex items-center justify-around z-40 h-16">
        {navItems.map(({ path, label, icon: Icon }) => (
          <Link key={path} to={path}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
              isActive(path) ? 'text-[#FFD700]' : 'text-[#9ca3af]'
            }`}>
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        ))}
      </nav>

      {/* ── Main Content ── */}
      <div className="md:ml-60 min-h-screen flex flex-col">
        <main className="flex-1 p-4 md:p-8 pt-[72px] md:pt-0 pb-24 md:pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;