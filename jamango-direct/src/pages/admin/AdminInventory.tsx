import { useState, useEffect, useCallback } from "react";
import { AlertTriangle, RefreshCw, Save, History, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import client from "@/api/client";

interface Product {
  _id: string;
  name: string;
  variety: string;
  weight: number;
  price: number;
  stock: number;
  active: boolean;
}

interface InventoryLog {
  _id: string;
  productName: string;
  previousStock: number;
  newStock: number;
  adjustmentAmount: number;
  reason: string;
  adjustedBy: string;
  createdAt: string;
}

const AdminInventory = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  // Local stock adjustments before saving
  const [adjustments, setAdjustments] = useState<Record<string, number>>({});
  const [reasons, setReasons] = useState<Record<string, string>>({});

  // Logs Modal
  const [logsModalOpen, setLogsModalOpen] = useState(false);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await client.get("/products/admin");
      setProducts(data);
      // Reset adjustments on fresh fetch
      setAdjustments({});
      setReasons({});
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const saveStock = async (product: Product) => {
    const newStock = adjustments[product._id] ?? product.stock;
    if (newStock === product.stock) return;

    const reason = reasons[product._id]?.trim();
    if (!reason) {
      alert("Please provide a reason for the adjustment.");
      return;
    }

    setSaving(product._id);
    try {
      const { data } = await client.put(`/products/admin/${product._id}`, {
        stock: newStock,
        reason: reason
      });
      setProducts((prev) => prev.map((p) => (p._id === data._id ? data : p)));
      setAdjustments((prev) => {
        const next = { ...prev };
        delete next[product._id];
        return next;
      });
      setReasons((prev) => {
        const next = { ...prev };
        delete next[product._id];
        return next;
      });
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update stock");
    } finally {
      setSaving(null);
    }
  };

  const fetchLogs = async () => {
    setLoadingLogs(true);
    setLogsModalOpen(true);
    try {
      const { data } = await client.get("/products/admin/inventory-logs");
      setLogs(data);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to load logs");
    } finally {
      setLoadingLogs(false);
    }
  };

  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStockCount = products.filter((p) => p.stock < 15).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Inventory</h1>
          <p className="font-body text-muted-foreground mt-1">
            {loading ? "Loading..." : `${products.length} products · ${totalStock} total units`}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={fetchLogs} className="flex items-center gap-2">
            <History className="h-4 w-4" />
            View Logs
          </Button>
          <Button variant="default" size="sm" onClick={fetchProducts} disabled={loading} className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 font-body text-sm">{error}</div>
      )}

      {/* Summary Cards */}
      {!loading && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <p className="font-display text-2xl font-semibold text-foreground">{totalStock}</p>
            <p className="font-body text-xs text-muted-foreground mt-1">Total Units</p>
          </div>
          <div className={`bg-card rounded-xl border p-4 text-center ${lowStockCount > 0 ? "border-yellow-300 bg-yellow-50" : "border-border"}`}>
            <p className={`font-display text-2xl font-semibold ${lowStockCount > 0 ? "text-yellow-700" : "text-foreground"}`}>{lowStockCount}</p>
            <p className="font-body text-xs text-muted-foreground mt-1">Low Stock (&lt;15)</p>
          </div>
          <div className={`bg-card rounded-xl border p-4 text-center ${outOfStockCount > 0 ? "border-red-300 bg-red-50" : "border-border"}`}>
            <p className={`font-display text-2xl font-semibold ${outOfStockCount > 0 ? "text-red-700" : "text-foreground"}`}>{outOfStockCount}</p>
            <p className="font-body text-xs text-muted-foreground mt-1">Out of Stock</p>
          </div>
        </div>
      )}

      {/* Product Stock Cards */}
      <div className="space-y-4">
        {loading && (
          <div className="p-12 text-center font-body text-muted-foreground animate-pulse">Loading inventory...</div>
        )}
        {!loading && products.length === 0 && (
          <div className="p-12 text-center font-body text-muted-foreground">
            No products found. Add products in the Products section first.
          </div>
        )}
        {products.map((product) => {
          const displayStock = adjustments[product._id] ?? product.stock;
          const isLow = displayStock < 15;
          const isOut = displayStock === 0;
          const isDirty = adjustments[product._id] !== undefined && adjustments[product._id] !== product.stock;

          return (
            <div key={product._id} className={`bg-card rounded-xl border p-6 transition-colors ${isOut ? "border-red-200" : isLow ? "border-yellow-200" : "border-border"}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display text-lg font-semibold text-foreground">{product.name}</h3>
                    {!product.active && (
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Inactive</span>
                    )}
                  </div>
                  <p className="font-body text-sm text-muted-foreground">
                    {product.variety} · {product.weight}KG · ₹{product.price.toLocaleString("en-IN")}
                  </p>
                </div>
                {(isLow || isOut) && (
                  <div className={`flex items-center gap-2 ${isOut ? "text-red-600" : "text-yellow-600"}`}>
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-body text-sm font-medium">{isOut ? "Out of Stock" : "Low Stock"}</span>
                  </div>
                )}
              </div>

              {/* Stock bar */}
              <div className="w-full h-2 bg-secondary rounded-full mb-4 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${isOut ? "bg-red-500" : isLow ? "bg-yellow-500" : "bg-primary"}`}
                  style={{ width: `${Math.min((displayStock / Math.max(displayStock + 20, 50)) * 100, 100)}%` }}
                />
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <p className="font-display text-lg font-semibold text-foreground">
                    Stock
                    {isDirty && (
                      <span className="ml-2 text-xs text-primary font-body">(unsaved)</span>
                    )}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-0.5">
                      <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium flex justify-between">
                        <span>Units</span>
                        {isDirty && <span className="text-primary font-bold">{displayStock > product.stock ? `+${displayStock - product.stock}` : displayStock - product.stock}</span>}
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={displayStock}
                        onChange={(e) => {
                          const val = Math.max(0, Number(e.target.value));
                          setAdjustments((prev) => ({ ...prev, [product._id]: val }));
                        }}
                        className="w-24 text-center text-xl font-display font-semibold border border-border rounded-xl px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Reason Input only shows when editing */}
                {isDirty && (
                  <div className="flex items-end gap-3 mt-2 animate-in slide-in-from-top-2 opacity-0 fade-in duration-300 fill-mode-forwards">
                    <div className="flex-1 flex flex-col gap-1">
                      <label className="text-[10px] uppercase tracking-wider text-red-600 font-bold">Reason for Change *</label>
                      <input
                        type="text"
                        placeholder="e.g. Warehouse recount, damaged stock..."
                        value={reasons[product._id] || ""}
                        onChange={(e) => setReasons(prev => ({ ...prev, [product._id]: e.target.value }))}
                        className="w-full text-sm font-body border border-red-200 focus:border-red-400 bg-red-50/30 rounded-lg px-3 py-2 text-foreground focus:outline-none transition-all placeholder:text-muted-foreground/60"
                      />
                    </div>
                    <Button
                      size="sm"
                      onClick={() => saveStock(product)}
                      disabled={saving === product._id || !reasons[product._id]?.trim()}
                      className="flex items-center gap-1 h-9 px-4 shrink-0"
                    >
                      <Save className="h-4 w-4" />
                      {saving === product._id ? "Saving..." : "Save Stock"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual Logs Modal */}
      {logsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm sm:p-6 sm:justify-end sm:items-stretch overflow-y-auto">
          <div className="bg-background rounded-2xl w-full max-w-2xl sm:max-w-md sm:w-[500px] sm:h-full sm:rounded-none sm:rounded-l-2xl shadow-2xl overflow-hidden flex flex-col relative animate-in slide-in-from-bottom-4 sm:slide-in-from-right-full duration-300">
            {/* Header */}
            <div className="p-6 border-b border-border bg-secondary/30 flex items-center justify-between sticky top-0 z-10 w-full">
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">
                  Inventory Logs
                </h2>
                <p className="text-xs text-muted-foreground mt-1 font-body">Recent manual adjustments</p>
              </div>
              <button
                onClick={() => setLogsModalOpen(false)}
                className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto w-full flex-1 bg-secondary/10">
              {loadingLogs ? (
                <div className="p-12 text-center text-sm font-body text-muted-foreground animate-pulse">Loading logs...</div>
              ) : logs.length === 0 ? (
                <div className="p-12 text-center text-sm font-body text-muted-foreground">No adjustment logs found.</div>
              ) : (
                <div className="divide-y divide-border">
                  {logs.map((log) => (
                    <div key={log._id} className="p-5 hover:bg-background transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-display font-semibold text-foreground">{log.productName}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${log.adjustmentAmount > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {log.adjustmentAmount > 0 ? "+" : ""}{log.adjustmentAmount}
                        </span>
                      </div>
                      <div className="text-sm font-body text-muted-foreground mb-3 bg-secondary/30 p-3 rounded-lg border border-border">
                        <span className="font-medium text-foreground">Reason:</span> {log.reason}
                      </div>
                      <div className="flex justify-between items-center text-xs text-muted-foreground font-body">
                        <div className="flex items-center gap-1.5">
                          <span>{log.previousStock}</span>
                          <span>→</span>
                          <span className="font-bold text-foreground">{log.newStock}</span>
                        </div>
                        <div className="text-right">
                          {new Date(log.createdAt).toLocaleString("en-IN", {
                            day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventory;
