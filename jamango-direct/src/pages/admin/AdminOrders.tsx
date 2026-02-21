import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import client from "@/api/client";
import { RefreshCw, X, MapPin, Download, CheckCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface OrderItem {
  name: string;
  variant: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    address: string;
    landmark?: string;
    city: string;
    state?: string;
    zip?: string;
    zipCode?: string;
    country?: string
  };
  orderNotes?: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMode: "online" | "cod";
  paymentStatus: "pending" | "paid" | "failed";
  status: string;
  createdAt: string;
}

const statuses = ["All", "Pending", "Confirmed", "Out for delivery", "Delivered", "Cancelled"];

const statusColors: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-700",
  Confirmed: "bg-blue-100 text-blue-700",
  "Out for delivery": "bg-orange-100 text-orange-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { user } = useAuth();
  const isStaff = user?.role === "staff";

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await client.get("/orders/admin");
      setOrders(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const { data } = await client.put(`/orders/admin/${orderId}/status`, { status: newStatus });
      setOrders((prev) => prev.map((o) => (o._id === data._id ? data : o)));
    } catch (err: any) {
      alert(err.response?.data?.message || "Status update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = orders.filter((o) => {
    if (filter !== "All" && o.status !== filter) return false;
    if (
      search &&
      !o.customerName.toLowerCase().includes(search.toLowerCase()) &&
      !o._id.toLowerCase().includes(search.toLowerCase()) &&
      !o.customerPhone.includes(search)
    )
      return false;
    return true;
  });

  const downloadCSV = () => {
    const headers = [
      "Full Name", "Email", "Phone", "Address", "City",
      "State", "Zip Code", "Country", "Order Notes", "Products", "Date"
    ];

    const rows = orders.map((order) => {
      const itemsStr = order.items.map(i => `${i.quantity}x ${i.name}`).join(" | ");
      return [
        `"${order.customerName || ''}"`,
        `"${order.customerEmail || ''}"`,
        `"${order.customerPhone || ''}"`,
        `"${order.shippingAddress?.address || ''}"`,
        `"${order.shippingAddress?.city || ''}"`,
        `"${order.shippingAddress?.state || ''}"`,
        `"${order.shippingAddress?.zipCode || order.shippingAddress?.zip || ''}"`,
        `"${order.shippingAddress?.country || 'India'}"`,
        `"${order.orderNotes || ''}"`,
        `"${itemsStr}"`,
        `"${new Date(order.createdAt).toLocaleDateString("en-IN")}"`
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `jamango_users_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Orders</h1>
          <p className="font-body text-muted-foreground mt-1">
            {loading ? "Loading..." : `${orders.length} total orders`}
          </p>
        </div>
        <div className="flex gap-3">
          {!isStaff && (
            <Button variant="outline" size="sm" onClick={downloadCSV} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download User Data
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={fetchOrders} disabled={loading} className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 font-body text-sm">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Input
          placeholder="Search by name, phone, or order ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2 flex-wrap">
          {statuses.map((s) => (
            <Button
              key={s}
              variant={filter === s ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(s)}
              className="font-body text-xs"
            >
              {s}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {["Order ID", "Customer", "Items", "Payment", "Status", !isStaff ? "Amount" : null, "Date", "Actions"].filter(Boolean).map((h) => (
                <th key={h} className="text-left p-4 font-body text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => {
              const totalItems = new Set(order.items.map(i => i.name)).size || order.items.length;
              const totalBoxes = order.items.reduce((sum, item) => sum + item.quantity, 0);

              return (
                <tr key={order._id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="p-4 font-body text-xs font-mono text-muted-foreground">{order._id.slice(-8).toUpperCase()}</td>
                  <td className="p-4 font-body text-sm font-medium text-foreground whitespace-nowrap">
                    {order.customerName}
                    <div className="text-xs text-muted-foreground mt-0.5">{order.customerPhone}</div>
                  </td>
                  <td className="p-4 font-body text-xs text-muted-foreground whitespace-nowrap">
                    {totalItems} items • {totalBoxes} boxes
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
                  {!isStaff && (
                    <td className="p-4 font-body text-sm font-medium text-foreground whitespace-nowrap">₹{order.totalAmount?.toLocaleString()}</td>
                  )}
                  <td className="p-4 font-body text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        View Details
                      </Button>
                      <select
                        value={order.status}
                        disabled={updatingId === order._id}
                        onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                        className="text-xs border border-border rounded-lg px-2 py-1.5 bg-background text-foreground font-body focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 cursor-pointer"
                      >
                        {["Pending", "Confirmed", "Out for delivery", "Delivered", "Cancelled"].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {!loading && filtered.length === 0 && (
          <div className="p-12 text-center font-body text-muted-foreground">
            {orders.length === 0 ? "No orders yet. Orders will appear here once customers place them." : "No orders match your filter."}
          </div>
        )}

        {loading && (
          <div className="p-12 text-center font-body text-muted-foreground animate-pulse">
            Loading orders...
          </div>
        )}
      </div>



      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm p-4 sm:p-6 sm:justify-end sm:items-stretch overflow-y-auto">
          <div className="bg-background rounded-2xl w-full max-w-2xl sm:max-w-md sm:w-[450px] sm:h-full sm:rounded-none sm:rounded-l-2xl shadow-2xl overflow-hidden flex flex-col relative animate-in slide-in-from-bottom-4 sm:slide-in-from-right-full duration-300">
            {/* Header */}
            <div className="p-6 border-b border-border bg-secondary/30 flex items-center justify-between sticky top-0 z-10 w-full">
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">
                  Order {selectedOrder._id.slice(-8).toUpperCase()}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${selectedOrder.paymentMode === "cod" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}`}>
                    {selectedOrder.paymentMode.toUpperCase()}
                  </span>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] whitespace-nowrap font-medium ${statusColors[selectedOrder.status] || "bg-gray-100 text-gray-600"}`}>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto w-full flex-1">

              {/* Customer Info */}
              <div className="mb-8">
                <h3 className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 border-b border-border pb-2">Customer Details</h3>
                <div className="space-y-2 font-body text-sm">
                  <p className="font-medium text-foreground">{selectedOrder.customerName}</p>
                  <p className="text-muted-foreground">{selectedOrder.customerPhone}</p>
                  {selectedOrder.customerEmail && <p className="text-muted-foreground">{selectedOrder.customerEmail}</p>}
                </div>
              </div>

              {/* Delivery Info */}
              <div className="mb-8">
                <h3 className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 border-b border-border pb-2">Delivery Address</h3>
                <div className="flex gap-3 text-sm font-body bg-secondary/30 p-4 rounded-xl border border-secondary">
                  <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-foreground">{selectedOrder.shippingAddress.address}</p>
                    <p className="text-muted-foreground mt-1">
                      {selectedOrder.shippingAddress.city} - {selectedOrder.shippingAddress.zip}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h3 className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 border-b border-border pb-2">Order Items</h3>
                <div className="border border-border rounded-xl overflow-hidden mb-4">
                  <table className="w-full text-sm font-body">
                    <thead className="bg-secondary/30 text-xs text-muted-foreground text-left">
                      <tr>
                        <th className="p-3 font-medium">Item</th>
                        <th className="p-3 font-medium text-center">Qty</th>
                        {!isStaff && <th className="p-3 font-medium text-right">Price</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {selectedOrder.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-secondary/10">
                          <td className="p-3">
                            <p className="font-medium text-foreground">{item.name}</p>
                            {item.variant && <p className="text-xs text-muted-foreground mt-0.5">{item.variant}</p>}
                          </td>
                          <td className="p-3 text-center text-foreground font-medium">{item.quantity}</td>
                          {!isStaff && <td className="p-3 text-right text-foreground font-medium">₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Subtotal */}
                <div className="space-y-2 text-sm font-body bg-secondary/30 p-4 rounded-xl border border-secondary mt-4">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Total Boxes</span>
                    <span>{selectedOrder.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                  </div>
                  {!isStaff && (
                    <>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Subtotal</span>
                        <span>₹{selectedOrder.items.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-foreground text-base pt-2 border-t border-border mt-2">
                        <span>Order Total</span>
                        <span>₹{selectedOrder.totalAmount?.toLocaleString('en-IN')}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
