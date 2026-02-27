import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Pencil, Plus, X, RefreshCw, Check, Bell } from "lucide-react";
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
  mrp?: number;
  showDiscount?: boolean;
  discountLabel?: string;
  showBadge?: boolean;
  badgeType?: string;
  image?: string;
}

const badgeOptions = [
  "Best Seller",
  "Most Popular",
  "Recommended",
  "Premium Quality",
  "Limited Stock",
  "Hot Deal",
  "Trending",
  "Seasonal Pick",
  "Editor's Choice"
];

const emptyForm = {
  name: "",
  variety: "",
  weight: "",
  price: "",
  stock: "",
  description: "",
  badge: "",
  active: true,
  mrp: "",
  showDiscount: false,
  discountLabel: "",
  showBadge: false,
  badgeType: "custom",
  image: ""
};

const AdminProducts = () => {
  // ...
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // ... fetchProducts ...
  // copy fetchProducts logic just to be safe if context requires large chunks, but here I can skip if I use precise Targeting
  // For safety I will just replace the top block of the component logic

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
      mrp: p.mrp ? String(p.mrp) : "",
      showDiscount: p.showDiscount || false,
      discountLabel: p.discountLabel || "",
      showBadge: p.showBadge || false,
      badgeType: p.badgeType || "custom",
      image: p.image || ""
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.variety || !form.weight || !form.price) {
      alert("Name, variety, weight, and price are required.");
      return;
    }
    if (Number(form.mrp) > 0 && Number(form.price) > Number(form.mrp)) {
      alert("⚠️ Selling Price cannot be greater than Base Price.");
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
      mrp: Number(form.mrp) || undefined,
      showDiscount: form.showDiscount,
      discountLabel: form.discountLabel,
      showBadge: form.showBadge,
      badgeType: form.badgeType,
      image: form.image
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploadingImage(true);
      const res = await client.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setForm((f) => ({ ...f, image: res.data }));
    } catch (err) {
      alert("Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  // ... rest of handlers can stay same or be part of next chunk if needed
  // I will end this chunk before handleToggleActive

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

  const handleNotify = async (product: Product) => {
    if (!window.confirm(`Send notification to all users about "${product.name}"?`)) return;
    try {
      const { data } = await client.post('/notifications/trigger', { productId: product._id });
      alert(data.message);
    } catch (err: any) {
      alert(err.response?.data?.message || "Trigger failed");
    }
  };

  return (
    <div>
      {/* ... header code ... */}
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

          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Basic Info */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Product Name</label>
                <Input
                  placeholder="e.g. 3 KG Mango Box"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="h-10 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Product Image</label>
                <div className="flex items-center gap-3">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="h-10 rounded-xl flex-1"
                  />
                  {uploadingImage && <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />}
                </div>
                {form.image && (
                  <div className="mt-2 text-xs flex items-center justify-between pr-1">
                    <span className="text-green-600 flex items-center gap-1 font-bold truncate">
                      <Check className="h-3 w-3" /> Image uploaded
                    </span>
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, image: "" }))}
                      className="text-red-500 hover:text-red-700 font-bold transition-colors"
                    >
                      Remove Image
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Variety</label>
                <Input
                  placeholder="e.g. Banganapalli"
                  value={form.variety}
                  onChange={(e) => setForm((f) => ({ ...f, variety: e.target.value }))}
                  className="h-10 rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Weight (KG)</label>
                <Input
                  type="number"
                  placeholder="3"
                  value={form.weight}
                  onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
                  className="h-10 rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Stock (units)</label>
                <Input
                  type="number"
                  placeholder="50"
                  value={form.stock}
                  onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                  className="h-10 rounded-xl"
                />
              </div>
            </div>

            {/* Pricing Section (Shopify Style) */}
            <div className="bg-muted/30 p-4 rounded-xl space-y-4 border border-border/50">
              <h3 className="font-semibold text-sm text-foreground uppercase tracking-wider">Pricing & Discounts</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 relative">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Base Price (MRP) ₹</label>
                  <Input
                    type="number"
                    placeholder="1000"
                    value={form.mrp}
                    onChange={(e) => {
                      const newMrp = e.target.value;
                      let newDiscountLabel = form.discountLabel;
                      if (newMrp && form.price && Number(newMrp) > Number(form.price)) {
                        newDiscountLabel = String(Math.round(((Number(newMrp) - Number(form.price)) / Number(newMrp)) * 100));
                      }
                      setForm((f) => ({ ...f, mrp: newMrp, discountLabel: newDiscountLabel }));
                    }}
                    className="h-10 rounded-xl bg-white"
                  />
                  <p className="text-[10px] text-muted-foreground">Original price before discount.</p>
                </div>

                <div className="space-y-1 relative">
                  <label className="text-xs font-medium text-foreground uppercase tracking-wider">Selling Price ₹</label>
                  <Input
                    type="number"
                    placeholder="899"
                    value={form.price}
                    onChange={(e) => {
                      const newPrice = e.target.value;
                      let newDiscountLabel = form.discountLabel;
                      if (form.mrp && newPrice && Number(form.mrp) > Number(newPrice)) {
                        newDiscountLabel = String(Math.round(((Number(form.mrp) - Number(newPrice)) / Number(form.mrp)) * 100));
                      }
                      setForm((f) => ({ ...f, price: newPrice, discountLabel: newDiscountLabel }));
                    }}
                    className="h-10 rounded-xl font-bold bg-[#FEF3C7] text-yellow-900 border-yellow-400 focus:border-yellow-500 placeholder:text-yellow-700/50 focus-visible:ring-yellow-400 transition-colors"
                  />
                  <p className="text-[10px] text-muted-foreground">Customers will pay this amount.</p>
                  {Number(form.mrp) > 0 && Number(form.price) > Number(form.mrp) && (
                    <p className="text-xs text-red-600 font-medium absolute -bottom-5 left-0">⚠️ Selling Price &gt; Base Price</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-border/50">
                  <Switch checked={form.showDiscount} onCheckedChange={(v) => setForm((f) => ({ ...f, showDiscount: v }))} id="show-discount" />
                  <label htmlFor="show-discount" className="text-sm font-medium cursor-pointer">Show Discount Badge</label>
                </div>
              </div>

              {form.showDiscount && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Discount Label</label>
                      {Number(form.mrp) > Number(form.price) && Number(form.mrp) > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            const percent = Math.round(((Number(form.mrp) - Number(form.price)) / Number(form.mrp)) * 100);
                            setForm(f => ({ ...f, discountLabel: String(percent) }));
                          }}
                          className="text-[10px] text-primary hover:underline font-medium cursor-pointer"
                        >
                          Auto-apply {Math.round(((Number(form.mrp) - Number(form.price)) / Number(form.mrp)) * 100)}% OFF
                        </button>
                      )}
                    </div>
                    <Input
                      placeholder="e.g. 30 (for 30% OFF), Special Price"
                      value={form.discountLabel}
                      onChange={(e) => setForm((f) => ({ ...f, discountLabel: e.target.value }))}
                      className="h-10 rounded-xl bg-white"
                    />
                    {/* Preview */}
                    <div className="text-xs text-muted-foreground pt-1 flex items-center gap-2">
                      <span>Preview:</span>
                      {form.discountLabel ? (
                        <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                          {/^\d+$/.test(form.discountLabel) ? `${form.discountLabel}% OFF` : form.discountLabel}
                        </span>
                      ) : (
                        <span className="italic opacity-50">No label</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</label>
                <Input
                  placeholder="Short description..."
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="h-10 rounded-xl"
                />
              </div>

              {/* Product Badge Section (Optional) */}
              <div className=" space-y-4 border border-border/50 bg-muted/30 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-foreground uppercase tracking-wider">Product Badge</h3>
                  <div className="flex items-center gap-3 bg-white p-1.5 rounded-lg border border-border/50">
                    <label htmlFor="show-badge" className={`text-xs font-medium cursor-pointer transition-colors ${form.showBadge ? "text-foreground" : "text-muted-foreground"}`}>
                      {form.showBadge ? "Badge ON" : "Badge OFF"}
                    </label>
                    <Switch checked={form.showBadge} onCheckedChange={(v) => setForm((f) => ({ ...f, showBadge: v }))} id="show-badge" />
                  </div>
                </div>

                {form.showBadge && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-200 space-y-4">
                    {/* Badge Type Toggle */}
                    <div className="flex p-1 bg-white border border-border/50 rounded-lg w-fit">
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, badgeType: 'preset' }))}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${form.badgeType === 'preset' ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        Select Preset
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, badgeType: 'custom' }))}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${form.badgeType === 'custom' ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        Custom Text
                      </button>
                    </div>

                    {/* Preset Selection */}
                    {form.badgeType === 'preset' && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {badgeOptions.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setForm(f => ({ ...f, badge: opt }))}
                            className={`text-xs py-2 px-3 rounded-lg border transition-all text-left truncate ${form.badge === opt
                              ? "border-green-600 bg-green-50 text-green-700 font-bold"
                              : "border-border/40 bg-white text-muted-foreground hover:border-border hover:text-foreground"
                              }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Custom Input */}
                    {form.badgeType === 'custom' && (
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Custom Badge Text</label>
                        <Input
                          placeholder="e.g. Farm Fresh"
                          value={form.badge}
                          onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))}
                          className="h-10 rounded-xl bg-white"
                        />
                      </div>
                    )}

                    {/* Preview */}
                    <div className="text-xs text-muted-foreground pt-2 border-t border-border/30 flex items-center gap-2">
                      <span>Preview:</span>
                      {form.badge ? (
                        <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                          {form.badge}
                        </span>
                      ) : (
                        <span className="italic opacity-50">No text selected</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch checked={form.active} onCheckedChange={(v) => setForm((f) => ({ ...f, active: v }))} id="active-switch" />
              <label htmlFor="active-switch" className="text-sm font-body text-foreground">{form.active ? "Active (visible to customers)" : "Inactive (hidden)"}</label>
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
                  <span className={`text-xs px-2 py-0.5 rounded-full font-body ${product.showBadge ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground opacity-60 italic"}`} title={product.showBadge ? "Badge Visible" : "Badge Hidden"}>
                    {product.badge} {product.showBadge ? "" : "(Hidden)"}
                  </span>
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
              <Button variant="outline" size="icon" onClick={() => handleNotify(product)} title="Send Notification">
                <Bell className="h-4 w-4 text-blue-600" />
              </Button>
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
