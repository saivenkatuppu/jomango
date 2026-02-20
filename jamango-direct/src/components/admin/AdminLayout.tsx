import { Navigate, Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Clock,
  Boxes,
  LogOut,
  Leaf,
  Users
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Products", to: "/admin/products", icon: Package },
  { label: "Orders", to: "/admin/orders", icon: ShoppingCart },
  { label: "Inventory", to: "/admin/inventory", icon: Boxes },
  { label: "Delivery Slots", to: "/admin/slots", icon: Clock },
  { label: "Analytics", to: "/admin/analytics", icon: BarChart3 },
  { label: "User Contacts", to: "/admin/contacts", icon: Users },
];

const AdminLayout = () => {
  // Use state to force re-render if needed, but localStorage check is fine
  const isAdmin = localStorage.getItem("jamango_admin") === "true";
  const location = useLocation();

  if (!isAdmin) return <Navigate to="/admin" replace />;

  const handleLogout = () => {
    localStorage.removeItem("jamango_admin");
    window.location.href = "/admin";
  };

  return (
    <div className="min-h-screen bg-heritage-pattern flex font-sans">
      {/* Sidebar - Dark Olive Theme */}
      <aside className="w-72 bg-[hsl(80,45%,15%)] text-[#F8F4EC] flex flex-col shadow-2xl relative z-20">
        <div className="p-8 border-b border-white/10 flex items-center gap-3">
          <Link to="/" className="shrink-0">
            <img
              src="/logo.jpeg"
              alt="JAMANGO"
              className="w-12 h-12 rounded-full border-2 border-[hsl(44,80%,46%)] object-cover shadow-sm bg-white"
            />
          </Link>
          <div>
            <Link to="/" className="font-display text-2xl font-bold tracking-tight">JAMANGO</Link>
            <p className="text-[10px] uppercase tracking-[0.2em] opacity-60 font-medium">Orchard Admin</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to; // Strict match or startsWith for subpages
            // const isActive = location.pathname.startsWith(item.to); // Better for sub-routes

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-4 px-4 py-4 rounded-xl font-medium text-sm transition-all duration-300 group relative overflow-hidden ${isActive
                  ? "bg-[hsl(44,80%,46%)] text-white shadow-lg shadow-[hsl(44,80%,46%)]/20 translate-x-2"
                  : "text-[#F8F4EC]/70 hover:bg-white/5 hover:text-white hover:translate-x-1"
                  }`}
              >
                {/* Active Indicator Line */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/30" />
                )}

                <item.icon className={`h-5 w-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className="tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/10 bg-[hsl(80,42%,13%)]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-[#F8F4EC]/60 hover:bg-red-500/10 hover:text-red-400 transition-colors w-full group"
          >
            <LogOut className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto relative z-10 h-screen">
        <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
