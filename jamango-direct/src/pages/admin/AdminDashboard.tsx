import { useState, useEffect, useCallback } from "react";
import { ShoppingCart, IndianRupee, Clock, CheckCircle, AlertTriangle, RefreshCw, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import client from "@/api/client";

interface Order {
  _id: string;
  customerName: string;
  items: { name: string; quantity: number }[];
  totalAmount: number;
  status: string;
  paymentMode: string;
  createdAt: string;
}

interface LowStockProduct {
  _id: string;
  name: string;
  stock: number;
}

interface StatsData {
  stats: {
    totalOrders: number;
    todayOrders: number;
    pendingOrders: number;
    deliveredToday: number;
    totalRevenue: number;
    todayRevenue: number;
    avgOrderValue: number;
  };
  recentOrders: Order[];
  lowStockProducts: LowStockProduct[];
}

const statusColors: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-700",
  Confirmed: "bg-blue-100 text-blue-700",
  "Out for delivery": "bg-orange-100 text-orange-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

const AdminDashboard = () => {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data: res } = await client.get("/analytics/stats");
      setData(res);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const fmt = (n: number) =>
    n >= 100000
      ? `₹${(n / 100000).toFixed(1)}L`
      : n >= 1000
        ? `₹${(n / 1000).toFixed(1)}K`
        : `₹${n}`;

  const statCards = data
    ? [
      {
        label: "Today's Orders",
        value: String(data.stats.todayOrders),
        icon: ShoppingCart,
        sub: `${data.stats.totalOrders} total all time`,
      },
      {
        label: "Revenue Today",
        value: fmt(data.stats.todayRevenue),
        icon: IndianRupee,
        sub: `Avg order: ${fmt(data.stats.avgOrderValue)}`,
      },
      {
        label: "Pending Orders",
        value: String(data.stats.pendingOrders),
        icon: Clock,
        sub: "Awaiting confirmation",
      },
      {
        label: "Delivered Today",
        value: String(data.stats.deliveredToday),
        icon: CheckCircle,
        sub: `Total revenue: ${fmt(data.stats.totalRevenue)}`,
      },
    ]
    : [];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Dashboard</h1>
          <p className="font-body text-muted-foreground mt-1">
            {loading ? "Loading..." : "Live data from your store"}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchStats} disabled={loading} className="flex items-center gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 font-body text-sm">{error}</div>
      )}

      {/* Stat Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading
          ? Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-5 animate-pulse">
              <div className="h-4 bg-muted rounded w-2/3 mb-3" />
              <div className="h-8 bg-muted rounded w-1/2 mb-2" />
              <div className="h-3 bg-muted rounded w-3/4" />
            </div>
          ))
          : statCards.map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-body text-sm text-muted-foreground">{stat.label}</span>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="font-display text-2xl font-semibold text-foreground">{stat.value}</p>
              <p className="font-body text-xs text-muted-foreground mt-1">{stat.sub}</p>
            </div>
          ))}
      </div>

      {/* Low Stock Alert */}
      {data && data.lowStockProducts.length > 0 && (
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-8 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-mango-deep flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-body text-sm font-medium text-foreground">Low Stock Alert</p>
            {data.lowStockProducts.map((p) => (
              <p key={p._id} className="font-body text-xs text-muted-foreground">
                {p.name} — Only <strong>{p.stock}</strong> units remaining
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Total Revenue Banner */}
      {data && (
        <div className="bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/20 rounded-xl p-5 mb-8 flex items-center gap-4">
          <TrendingUp className="h-6 w-6 text-mango-deep" />
          <div>
            <p className="font-body text-sm text-muted-foreground">Total Revenue (All Time)</p>
            <p className="font-display text-2xl font-semibold text-foreground">
              ₹{data.stats.totalRevenue.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="font-body text-sm text-muted-foreground">Avg Order Value</p>
            <p className="font-display text-xl font-semibold text-foreground">
              ₹{data.stats.avgOrderValue.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-card rounded-xl border border-border">
        <div className="p-5 border-b border-border">
          <h2 className="font-display text-lg font-semibold text-foreground">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["Order ID", "Customer", "Items", "Payment", "Status", "Amount", "Date"].map((h) => (
                  <th key={h} className="text-left p-4 font-body text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center font-body text-muted-foreground animate-pulse">
                    Loading orders...
                  </td>
                </tr>
              ) : data && data.recentOrders.length > 0 ? (
                data.recentOrders.map((order) => (
                  <tr key={order._id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="p-4 font-mono text-xs text-muted-foreground">{order._id.slice(-8).toUpperCase()}</td>
                    <td className="p-4 font-body text-sm font-medium text-foreground whitespace-nowrap">{order.customerName}</td>
                    <td className="p-4 font-body text-xs text-muted-foreground max-w-[160px] truncate">
                      {order.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${order.paymentMode === "cod" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}`}>
                        {order.paymentMode.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || "bg-gray-100 text-gray-600"}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 font-body text-sm font-medium text-foreground whitespace-nowrap">
                      ₹{order.totalAmount.toLocaleString("en-IN")}
                    </td>
                    <td className="p-4 font-body text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center font-body text-muted-foreground">
                    No orders yet. Orders will appear here once customers place them.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
