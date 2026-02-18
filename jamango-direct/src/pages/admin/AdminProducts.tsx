import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Pencil, Plus, X, RefreshCw, Check } from "lucide-react";
import client from "@/api/client";

interface Product {
  _id: string;
  name: string;
  variety: string;
  weight: number;
  price: number;
  stock: number;
  active: boolean;
  description: string;
  badge: string;
}

const emptyForm = { name: "", variety: "", weight: "", price: "", stock: "", description: "", badge: "", active: true };

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await client.get("/products/admin");
      setProducts(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p._id);
    setForm({
      name: p.name,
      variety: p.variety,
      weight: String(p.weight),
      price: String(p.price),
      stock: String(p.stock),
      description: p.description,
      badge: p.badge,
      active: p.active,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.variety || !form.weight || !form.price) {
      alert("Name, variety, weight, and price are required.");
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name,
      variety: form.variety,
      weight: Number(form.weight),
      price: Number(form.price),
      stock: Number(form.stock) || 0,
      description: form.description,
      badge: form.badge,
      active: form.active,
    };
    try {
      if (editingId) {
        const { data } = await client.put(`/products/admin/${editingId}`, payload);
        setProducts((prev) => prev.map((p) => (p._id === data._id ? data : p)));
      } else {
        const { data } = await client.post("/products/admin", payload);
        setProducts((prev) => [data, ...prev]);
      }
      setShowForm(false);
    } catch (err: any) {
      alert(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (p: Product) => {
    try {
      const { data } = await client.put(`/products/admin/${p._id}`, { active: !p.active });
      setProducts((prev) => prev.map((x) => (x._id === data._id ? data : x)));
    } catch {
      alert("Toggle failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await client.delete(`/products/admin/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Products</h1>
          <p className="font-body text-muted-foreground mt-1">
            {loading ? "Loading..." : `${products.length} products`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchProducts} disabled={loading} className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button size="sm" onClick={openCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 font-body text-sm">{error}</div>
      )}

      {/* Create / Edit Form */}
      {showForm && (
        <div className="mb-8 bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold">{editingId ? "Edit Product" : "New Product"}</h2>
            <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Product Name", key: "name", placeholder: "e.g. 3 KG Mango Box" },
              { label: "Variety", key: "variety", placeholder: "e.g. Banganapalli" },
              { label: "Weight (KG)", key: "weight", placeholder: "3", type: "number" },
              { label: "Price (₹)", key: "price", placeholder: "899", type: "number" },
              { label: "Stock (units)", key: "stock", placeholder: "50", type: "number" },
              { label: "Badge (optional)", key: "badge", placeholder: "e.g. Best Seller" },
            ].map(({ label, key, placeholder, type }) => (
              <div key={key} className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</label>
                <Input
                  type={type || "text"}
                  placeholder={placeholder}
                  value={(form as any)[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="h-10 rounded-xl"
                />
              </div>
            ))}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</label>
              <Input
                placeholder="Short description..."
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="h-10 rounded-xl"
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.active} onCheckedChange={(v) => setForm((f) => ({ ...f, active: v }))} />
              <span className="text-sm font-body text-foreground">{form.active ? "Active (visible to customers)" : "Inactive (hidden)"}</span>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              {saving ? "Saving..." : editingId ? "Save Changes" : "Create Product"}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Products List */}
      <div className="space-y-4">
        {loading && (
          <div className="p-12 text-center font-body text-muted-foreground animate-pulse">Loading products...</div>
        )}
        {!loading && products.length === 0 && (
          <div className="p-12 text-center font-body text-muted-foreground">
            No products yet. Click "Add Product" to create your first one.
          </div>
        )}
        {products.map((product) => (
          <div key={product._id} className="bg-card rounded-xl border border-border p-6 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <h3 className="font-display text-lg font-semibold text-foreground">{product.name}</h3>
                {product.badge && (
                  <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-body">{product.badge}</span>
                )}
                {!product.active && (
                  <span className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full font-body">Inactive</span>
                )}
              </div>
              <p className="font-body text-sm text-muted-foreground">{product.variety} · {product.weight}KG{product.description ? ` · ${product.description}` : ""}</p>
              <div className="flex items-center gap-6 mt-2 font-body text-sm">
                <span className="text-foreground font-medium">₹{product.price.toLocaleString()}</span>
                <span className={`${product.stock < 10 ? "text-red-600 font-semibold" : "text-muted-foreground"}`}>
                  {product.stock} in stock{product.stock < 10 && product.stock > 0 ? " ⚠️ Low" : product.stock === 0 ? " — Out of stock" : ""}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Switch checked={product.active} onCheckedChange={() => handleToggleActive(product)} />
              <Button variant="outline" size="icon" onClick={() => openEdit(product)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="text-red-500 hover:text-red-700 hover:border-red-300" onClick={() => handleDelete(product._id)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminProducts;
