import { useState, useEffect, useCallback } from "react";
import { AlertTriangle, RefreshCw, Save } from "lucide-react";
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

const AdminInventory = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  // Local stock adjustments before saving
  const [adjustments, setAdjustments] = useState<Record<string, number>>({});

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await client.get("/products/admin");
      setProducts(data);
      // Reset adjustments on fresh fetch
      setAdjustments({});
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
    setSaving(product._id);
    try {
      const { data } = await client.put(`/products/admin/${product._id}`, { stock: newStock });
      setProducts((prev) => prev.map((p) => (p._id === data._id ? data : p)));
      setAdjustments((prev) => {
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
        <Button variant="outline" size="sm" onClick={fetchProducts} disabled={loading} className="flex items-center gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
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

              <div className="flex items-center justify-between">
                <p className="font-display text-lg font-semibold text-foreground">
                  Stock
                  {isDirty && (
                    <span className="ml-2 text-xs text-primary font-body">(unsaved)</span>
                  )}
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Units</label>
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
                  {isDirty && (
                    <Button
                      size="sm"
                      onClick={() => saveStock(product)}
                      disabled={saving === product._id}
                      className="flex items-center gap-1 h-10"
                    >
                      <Save className="h-3 w-3" />
                      {saving === product._id ? "Saving..." : "Save"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminInventory;
