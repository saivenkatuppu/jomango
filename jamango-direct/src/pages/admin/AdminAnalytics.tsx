import { useState, useEffect, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import client from "@/api/client";

interface WeeklyOrder {
  _id: string; // date string YYYY-MM-DD
  orders: number;
  revenue: number;
}

interface ProductBreakdown {
  _id: string;
  count: number;
  revenue: number;
}

interface AnalyticsData {
  stats: {
    totalOrders: number;
    totalRevenue: number;
    avgOrderValue: number;
    todayOrders: number;
    todayRevenue: number;
  };
  weeklyOrders: WeeklyOrder[];
  productBreakdown: ProductBreakdown[];
}

const COLORS = [
  "hsl(43, 96%, 56%)",
  "hsl(38, 80%, 42%)",
  "hsl(25, 80%, 55%)",
  "hsl(15, 70%, 50%)",
  "hsl(55, 80%, 50%)",
];

const AdminAnalytics = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data: res } = await client.get("/analytics/stats");
      setData(res);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Format weekly data for chart — show last 7 days with day labels
  const chartData = data?.weeklyOrders.map((d) => ({
    day: new Date(d._id).toLocaleDateString("en-IN", { weekday: "short" }),
    orders: d.orders,
    revenue: d.revenue,
  })) ?? [];

  // Product breakdown for pie chart
  const totalItems = data?.productBreakdown.reduce((s, p) => s + p.count, 0) || 1;
  const pieData = data?.productBreakdown.slice(0, 5).map((p, i) => ({
    name: p._id,
    value: Math.round((p.count / totalItems) * 100),
    revenue: p.revenue,
    color: COLORS[i % COLORS.length],
  })) ?? [];

  const tooltipStyle = {
    fontFamily: "var(--font-body)",
    fontSize: "0.875rem",
    borderRadius: "0.75rem",
    border: "1px solid hsl(40, 20%, 88%)",
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Analytics</h1>
          <p className="font-body text-muted-foreground mt-1">
            {loading ? "Loading..." : "Real data from your store"}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={loading} className="flex items-center gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 font-body text-sm">{error}</div>
      )}

      {loading && (
        <div className="p-16 text-center font-body text-muted-foreground animate-pulse">Loading analytics...</div>
      )}

      {!loading && data && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Daily Orders Bar Chart */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-display text-lg font-semibold text-foreground mb-1">Orders — Last 7 Days</h3>
            <p className="font-body text-sm text-muted-foreground mb-6">Daily order count</p>
            {chartData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground font-body text-sm">
                No orders in the last 7 days yet.
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} className="font-body text-xs" />
                    <YAxis axisLine={false} tickLine={false} className="font-body text-xs" allowDecimals={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="orders" fill="hsl(43, 96%, 56%)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Product Breakdown Pie */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-display text-lg font-semibold text-foreground mb-1">Product Breakdown</h3>
            <p className="font-body text-sm text-muted-foreground mb-6">% of total items ordered</p>
            {pieData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground font-body text-sm">
                No order data yet.
              </div>
            ) : (
              <>
                <div className="h-48 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" stroke="none">
                        {pieData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} formatter={(val) => `${val}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-2 mt-2">
                  {pieData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="font-body text-sm text-muted-foreground truncate max-w-[180px]">{item.name}</span>
                      </div>
                      <span className="font-body text-sm font-medium text-foreground">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Revenue Summary */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-display text-lg font-semibold text-foreground mb-1">Revenue Summary</h3>
            <p className="font-body text-sm text-muted-foreground mb-6">All time</p>
            <div className="space-y-4">
              {[
                { label: "Total Revenue", value: `₹${data.stats.totalRevenue.toLocaleString("en-IN")}` },
                { label: "Average Order Value", value: `₹${data.stats.avgOrderValue.toLocaleString("en-IN")}` },
                { label: "Total Orders", value: String(data.stats.totalOrders) },
                { label: "Today's Orders", value: String(data.stats.todayOrders) },
                { label: "Today's Revenue", value: `₹${data.stats.todayRevenue.toLocaleString("en-IN")}` },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                  <span className="font-body text-sm text-muted-foreground">{item.label}</span>
                  <span className="font-display text-lg font-semibold text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Bar Chart */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-display text-lg font-semibold text-foreground mb-1">Revenue — Last 7 Days</h3>
            <p className="font-body text-sm text-muted-foreground mb-6">Daily revenue (₹)</p>
            {chartData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground font-body text-sm">
                No revenue data yet.
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} className="font-body text-xs" />
                    <YAxis axisLine={false} tickLine={false} className="font-body text-xs" tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}`} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(val: number) => [`₹${val.toLocaleString("en-IN")}`, "Revenue"]} />
                    <Bar dataKey="revenue" fill="hsl(38, 80%, 42%)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}

      {!loading && !data && !error && (
        <div className="p-16 text-center font-body text-muted-foreground">No data available yet.</div>
      )}
    </div>
  );
};

export default AdminAnalytics;
