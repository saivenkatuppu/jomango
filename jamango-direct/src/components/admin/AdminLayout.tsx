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
  Users,
  ShieldAlert,
  UserCog,
  Store
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

const allNavItems = [
  { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Products", to: "/admin/products", icon: Package, adminOnly: true },
  { label: "Orders", to: "/admin/orders", icon: ShoppingCart },
  { label: "Inventory", to: "/admin/inventory", icon: Boxes },
  { label: "Delivery Slots", to: "/admin/slots", icon: Clock, adminOnly: true },
  { label: "Analytics", to: "/admin/analytics", icon: BarChart3, adminOnly: true },
  { label: "User Contacts", to: "/admin/contacts", icon: Users, adminOnly: true },
  { label: "Stall Management", to: "/admin/stalls", icon: LayoutDashboard, adminOnly: true },
  { label: "Stall Inventory", to: "/admin/stall-inventory", icon: Store, adminOnly: false },
  { label: "Stall CRM", to: "/admin/crm", icon: Users },
  { label: "Staff Management", to: "/admin/staff", icon: UserCog, adminOnly: true },
];

const AdminLayout = () => {
  const { user, logout, isImpersonating, stopImpersonating, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <div className="min-h-screen bg-heritage-pattern flex items-center justify-center font-sans text-charcoal">Loading...</div>;

  const isAdminOrStaff = user?.isAdmin || user?.role === "admin" || user?.role === "staff";
  const isStaff = user?.role === "staff";
  const isStall = user?.role === "stall_owner";

  if (!isAdminOrStaff && !isStall) return <Navigate to="/admin" replace />;

  const navItems = allNavItems.filter((item) => {
    if (isStall && item.label !== "Dashboard") return false;
    if (isStaff && item.adminOnly) return false;
    return true;
  });

  const handleLogout = () => {
    logout();
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
      <main className="flex-1 overflow-y-auto relative z-10 h-screen flex flex-col bg-[#FBF7F0]">

        {isImpersonating && (
          <div className="bg-yellow-100 border-b border-yellow-300 px-6 py-3 flex items-center justify-between shadow-sm sticky top-0 z-50">
            <div className="flex items-center gap-2 text-yellow-800 font-medium">
              <ShieldAlert className="h-5 w-5" />
              <span>You are viewing as {user?.role === 'stall_owner' ? 'Stall Owner' : 'Staff'} ({user?.name})</span>
            </div>
            <button
              onClick={stopImpersonating}
              className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              Exit to Admin
            </button>
          </div>
        )}

        <div className="flex-1 p-8 lg:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto w-full">
          {(!isStaff || !allNavItems.find(item => location.pathname.startsWith(item.to))?.adminOnly) && (!isStall || location.pathname === '/admin/dashboard') ? (
            <Outlet />
          ) : (
            <div className="flex flex-col items-center justify-center p-20 text-center animate-in fade-in duration-500">
              <ShieldAlert className="h-20 w-20 text-red-500 mb-6 drop-shadow-md" />
              <h1 className="text-4xl font-display font-bold text-charcoal mb-3">403 Access Denied</h1>
              <p className="text-lg text-muted-foreground font-body max-w-md">Your account does not have permission to access the <strong>{allNavItems.find(item => location.pathname.startsWith(item.to))?.label || 'requested'}</strong> module.</p>
              <Link to="/admin/dashboard" className="mt-8 px-6 py-3 bg-[hsl(44,80%,46%)] text-white hover:bg-[hsl(44,90%,40%)] rounded-xl font-bold transition-colors shadow-lg shadow-[hsl(44,80%,46%)]/20">
                Return to Dashboard
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
