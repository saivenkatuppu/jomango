import { useState, useEffect, useCallback } from "react";
import { ShoppingCart, IndianRupee, Clock, CheckCircle, AlertTriangle, RefreshCw, TrendingUp, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import client from "@/api/client";
import { useAuth } from "@/context/AuthContext";
import StallOwnerDashboard from "./StallOwnerDashboard";

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
    boxesToday: number;
    codBoxesToday: number;
    paidBoxesToday: number;
    cancelledToday: number;
  };
  recentOrders: Order[];
  lowStockProducts: LowStockProduct[];
  weeklyOrders: { _id: string; orders: number; revenue: number }[];
  productBreakdown: { _id: string; count: number; revenue: number }[];
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

  const { user } = useAuth();
  const isStaff = user?.role === "staff";
  const isStall = user?.role === "stall_owner";

  if (isStall) return <StallOwnerDashboard />;

  const downloadReport = async () => {
    try {
      const { data } = await client.get("/analytics/report");
      if (!data || data.length === 0) {
        alert("No data available for today's report.");
        return;
      }
      const headers = Object.keys(data[0]);
      const csvRows = [headers.join(",")];
      data.forEach((row: any) => {
        const values = headers.map(header => {
          const val = row[header] === undefined || row[header] === null ? "" : row[header];
          return `"${String(val).replace(/"/g, '""')}"`;
        });
        csvRows.push(values.join(","));
      });
      const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `jamango_sales_inventory_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert("Failed to download report.");
      console.error(err);
    }
  };

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data: res } = await client.get("/analytics/stats");
      setData(res);
    } catch (err: any) {
      console.error("Fetch Stats Error:", err.response?.data || err.message);
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
      ...(!isStaff ? [{
        label: "Revenue Today",
        value: fmt(data.stats.todayRevenue),
        icon: IndianRupee,
        sub: `Avg order: ${fmt(data.stats.avgOrderValue)}`,
      }] : []),
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
        sub: !isStaff ? `Total revenue: ${fmt(data.stats.totalRevenue)}` : "Successfully delivered",
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
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={downloadReport} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download Report
          </Button>
          <Button variant="outline" size="sm" onClick={fetchStats} disabled={loading} className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
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

      {/* Today's Deep Dive Grid */}
      {data && (
        <div className="mb-8">
          <h2 className="font-display text-lg font-semibold text-foreground mb-4">Today's Performance Overview</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card rounded-xl border border-border p-4 bg-secondary/10">
              <p className="font-body text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Boxes Ordered Today</p>
              <p className="font-display text-2xl font-bold text-foreground">{data.stats.boxesToday}</p>
              <p className="font-body text-xs text-muted-foreground mt-1">Total physical units moved</p>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 bg-blue-50/50">
              <p className="font-body text-xs text-blue-700/70 mb-1 uppercase tracking-wider font-semibold">Pre-Paid Boxes</p>
              <p className="font-display text-2xl font-bold text-blue-700">{data.stats.paidBoxesToday}</p>
              <p className="font-body text-xs text-blue-700/70 mt-1">No collection required</p>
            </div>
          </div>
        </div>
      )}

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

      {/* Analytics Grid: Top Products & Sales Trend */}
      {data && (
        <div className="grid lg:grid-cols-2 gap-8 mb-8">

          {/* Top Selling Items */}
          <div className="bg-card rounded-xl border border-border">
            <div className="p-5 border-b border-border">
              <h2 className="font-display text-lg font-semibold text-foreground">Top Performing Items</h2>
            </div>
            <div className="p-5 space-y-4">
              {data.productBreakdown.length > 0 ? (
                data.productBreakdown.slice(0, 5).map((product) => {
                  const maxCount = Math.max(...data.productBreakdown.map((p) => p.count));
                  const percentage = Math.max((product.count / maxCount) * 100, 5);

                  return (
                    <div key={product._id} className="relative">
                      <div className="flex justify-between font-body text-sm mb-1">
                        <span className="font-medium text-foreground">{product._id}</span>
                        <span className="text-muted-foreground">{product.count} boxes sold </span>
                      </div>
                      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      {!isStaff && (
                        <p className="text-xs text-muted-foreground mt-1 text-right">
                          ₹{product.revenue?.toLocaleString("en-IN")}
                        </p>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-muted-foreground font-body py-8 text-sm">
                  No product data available yet.
                </div>
              )}
            </div>
          </div>

          {/* Weekly Trend */}
          <div className="bg-card rounded-xl border border-border">
            <div className="p-5 border-b border-border">
              <h2 className="font-display text-lg font-semibold text-foreground">7-Day Sales Trend</h2>
            </div>
            <div className="p-5">
              {data.weeklyOrders.length > 0 ? (
                <div className="space-y-4 flex flex-col justify-end h-[280px]">
                  {data.weeklyOrders.map((day) => {
                    // For staff, revenue is undefined, fallback to plotting orders
                    const maxVal = Math.max(...data.weeklyOrders.map((d) => (isStaff ? d.orders : (d.revenue || 0))));
                    const currentVal = isStaff ? day.orders : (day.revenue || 0);
                    const percentage = Math.max((currentVal / (maxVal || 1)) * 100, 5);
                    const dateFormatted = new Date(day._id).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' });

                    return (
                      <div key={day._id} className="flex items-center gap-4 group">
                        <div className="w-24 text-right text-xs text-muted-foreground font-body whitespace-nowrap">
                          {dateFormatted}
                        </div>
                        <div className="flex-1 relative h-6 flex items-center">
                          <div
                            className="absolute left-0 h-6 bg-blue-100 border border-blue-200 rounded transition-all duration-500 group-hover:bg-blue-200"
                            style={{ width: `${percentage}%` }}
                          />
                          {!isStaff && (
                            <span className="relative z-10 pl-3 text-xs font-semibold text-blue-900 font-body">
                              ₹{day.revenue?.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                        <div className="w-16 text-xs text-muted-foreground font-body text-right">
                          {day.orders} ord.
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-muted-foreground font-body py-20 text-sm">
                  No sales data available for the last 7 days.
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* Total Revenue Banner */}
      {data && !isStaff && (
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
                {["Order ID", "Customer", "Items", "Payment", "Status", !isStaff ? "Amount" : null, "Date"].filter(Boolean).map((h) => (
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
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700`}>
                        {order.paymentMode.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || "bg-gray-100 text-gray-600"}`}>
                        {order.status}
                      </span>
                    </td>
                    {!isStaff && (
                      <td className="p-4 font-body text-sm font-medium text-foreground whitespace-nowrap">
                        ₹{order.totalAmount?.toLocaleString("en-IN")}
                      </td>
                    )}
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
