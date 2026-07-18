import { useState, useEffect, useRef, useCallback } from 'react';
import { Pencil, Check, X, Plus, Trash2, Upload, Image } from 'lucide-react';
import { adminAPI } from '../services/adminAPI';

const CATEGORIES = ['Veg Pickles', 'Podis', 'Snacks', 'Sweets'];

// ── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (amount) => `₹${Number(amount).toLocaleString('en-IN')}`;

// ── Add Product Modal ─────────────────────────────────────────────────────────

const AddProductModal = ({ onClose, onCreated }) => {
  const [form, setForm]       = useState({
    name: '', category: 'Veg Pickles', pricePerKg: '', description: '', isBestSeller: false,
  });
  const [imageFile, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const fileRef               = useRef();

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const price = parseInt(form.pricePerKg, 10);
    if (!form.name.trim()) return setError('Name is required');
    if (!form.category)    return setError('Category is required');
    if (isNaN(price) || price <= 0) return setError('Enter a valid price');

    try {
      setSaving(true);
      const result = await adminAPI.createProduct(
        {
          name: form.name.trim(),
          category: form.category,
          pricePerKg: price,
          description: form.description,
          featured: form.isBestSeller,
        },
        imageFile
      );
      if (!result.success) throw new Error(result.message);
      onCreated(result.product);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Add Product</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Image upload */}
          <div
            onClick={() => fileRef.current?.click()}
            className="w-full h-36 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#7B0D1E] transition-colors overflow-hidden bg-gray-50"
          >
            {preview ? (
              <img src={preview} alt="preview" className="w-full h-full object-cover" />
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-300 mb-1" />
                <p className="text-xs text-gray-400">Click to upload image (JPEG/PNG/WebP)</p>
                <p className="text-xs text-gray-300 mt-0.5">Auto-converted to WebP ≤300 KB</p>
              </>
            )}
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImage} />
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Product Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#7B0D1E] focus:border-transparent outline-none"
              placeholder="e.g. Mango Avakaya"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Category *</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#7B0D1E] outline-none"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Price */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Price per kg (₹) *</label>
            <input
              type="number"
              value={form.pricePerKg}
              onChange={(e) => setForm({ ...form, pricePerKg: e.target.value })}
              className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#7B0D1E] outline-none"
              placeholder="e.g. 750"
              min="1"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description (optional)</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#7B0D1E] outline-none resize-none"
              placeholder="Short product description..."
            />
          </div>

          {/* Best Seller Toggle */}
          <div className="flex items-center justify-between py-1 px-3 bg-amber-50 border border-amber-100 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-800">Our Best Seller</p>
              <p className="text-xs text-gray-400 mt-0.5">Show in Best Sellers section on Home</p>
            </div>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, isBestSeller: !f.isBestSeller }))}
              className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                form.isBestSeller ? 'bg-amber-500' : 'bg-gray-200'
              }`}
            >
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                form.isBestSeller ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 h-10 bg-[#7B0D1E] text-white rounded-lg text-sm font-medium disabled:opacity-60 hover:bg-[#5a0010] transition-colors"
            >
              {saving ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Image Upload Cell ────────────────────────────────────────────────────────

const ImageUploadCell = ({ product, onImageUpdated }) => {
  const fileRef  = useRef();
  const [uploading, setUploading] = useState(false);

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const result = await adminAPI.uploadProductImage(product.id, file);
      if (result.success) onImageUpdated(product.id, result.imageUrl);
      else alert('Image upload failed: ' + result.message);
    } catch (err) {
      alert('Upload error: ' + err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <button
      onClick={() => fileRef.current?.click()}
      disabled={uploading}
      title="Upload / Replace image"
      className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 hover:border-[#7B0D1E] transition-colors"
    >
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
          width={48}
          height={48}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-50">
          <Image className="w-5 h-5 text-gray-300" />
        </div>
      )}
      {uploading && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleImageChange}
      />
    </button>
  );
};

// ── Product Card ──────────────────────────────────────────────────────────────

const ProductCard = ({
  product, saving, editingPrice, priceInput,
  onToggleStock, onToggleBestSeller, onPriceUpdate, onEditPrice, onCancelEdit,
  onPriceInputChange, onDelete, onImageUpdated,
}) => {
  const isEditing = editingPrice === product.id;

  return (
    <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden">
      <div className="p-3 space-y-2">
        {/* Top row: image + ID */}
        <div className="flex items-start gap-2">
          <ImageUploadCell product={product} onImageUpdated={onImageUpdated} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-xs font-mono bg-[#fef3c7] text-[#854d0e] px-2 py-0.5 rounded inline-block">
                #{product.id}
              </span>
              {product.featured && (
                <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded inline-block">
                  ★ Best Seller
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2">
              {product.name}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{product.category}</p>
          </div>

          {/* Delete button */}
          <button
            onClick={() => onDelete(product)}
            title="Delete product"
            className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Price Row */}
        <div className="flex items-center gap-1 pt-1">
          {isEditing ? (
            <div className="flex items-center gap-1 w-full">
              <input
                type="number"
                value={priceInput}
                onChange={(e) => onPriceInputChange(e.target.value)}
                className="w-full px-2 py-1 border border-[#e5e7eb] rounded text-xs focus:ring-2 focus:ring-[#7B0D1E] focus:border-transparent outline-none"
                autoFocus
              />
              <button onClick={() => onPriceUpdate(product.id, priceInput)} disabled={saving}
                className="p-1.5 text-green-600 hover:bg-green-50 rounded disabled:opacity-50 flex-shrink-0">
                <Check className="w-3.5 h-3.5" />
              </button>
              <button onClick={onCancelEdit} className="p-1.5 text-red-500 hover:bg-red-50 rounded flex-shrink-0">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <p className="text-sm font-bold text-[#7B0D1E]">
                {fmt(product.pricePerKg)}
                <span className="text-xs font-normal text-gray-400"> /kg</span>
              </p>
              <button onClick={() => onEditPrice(product.id, product.pricePerKg)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stock toggle */}
      <div className="border-t border-[#e5e7eb] px-3 py-2.5">
        <button
          onClick={() => onToggleStock(product)}
          disabled={saving}
          className={`w-full flex items-center justify-between text-xs font-semibold py-1.5 px-2 rounded-lg transition-colors disabled:opacity-50 min-h-[36px] ${
            product.inStock ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
          }`}
        >
          <span>{product.inStock ? 'In Stock' : 'Out of Stock'}</span>
          <div className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${product.inStock ? 'bg-green-600' : 'bg-gray-300'}`}>
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${product.inStock ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </div>
        </button>
      </div>

      {/* Best Seller toggle */}
      <div className="border-t border-[#e5e7eb] px-3 py-2.5">
        <button
          onClick={() => onToggleBestSeller(product)}
          disabled={saving}
          className={`w-full flex items-center justify-between text-xs font-semibold py-1.5 px-2 rounded-lg transition-colors disabled:opacity-50 min-h-[36px] ${
            product.featured ? 'bg-amber-50 text-amber-700' : 'bg-gray-50 text-gray-500'
          }`}
        >
          <span>{product.featured ? '★ Our Best Seller' : 'Mark as Best Seller'}</span>
          <div className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${product.featured ? 'bg-amber-500' : 'bg-gray-300'}`}>
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${product.featured ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </div>
        </button>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

const AdminProducts = () => {
  const [products,     setProducts]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filter,       setFilter]       = useState('all');
  const [search,       setSearch]       = useState('');
  const [saving,       setSaving]       = useState(null);
  const [editingPrice, setEditingPrice] = useState(null);
  const [priceInput,   setPriceInput]   = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getProducts();
      if (data.success) setProducts(data.products);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const updateProduct = async (productId, updateData, imageFile = null) => {
    const numId = Number(productId);
    try {
      setSaving(numId);
      const result = await adminAPI.updateProduct(numId, updateData, imageFile);
      if (!result.success) throw new Error(result.message || 'Update failed');
      await fetchProducts();
    } catch (err) {
      alert('Failed to update: ' + err.message);
    } finally {
      setSaving(null);
    }
  };

  const toggleStock = (product) => {
    const id = Number(product.id || product.productId);
    updateProduct(id, { inStock: !product.inStock });
  };

  const toggleBestSeller = (product) => {
    const id = Number(product.id || product.productId);
    updateProduct(id, { featured: !product.featured });
  };

  const handlePriceUpdate = async (productId, newPrice) => {
    const p = parseInt(newPrice, 10);
    if (isNaN(p) || p <= 0) return alert('Enter a valid price');
    await updateProduct(Number(productId), { pricePerKg: p });
    setEditingPrice(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      const result = await adminAPI.deleteProduct(deleteTarget.id);
      if (!result.success) throw new Error(result.message);
      await fetchProducts();
      setDeleteTarget(null);
    } catch (err) {
      alert('Delete failed: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleImageUpdated = (productId, newUrl) => {
    setProducts((prev) =>
      prev.map((p) => p.id === productId ? { ...p, imageUrl: newUrl } : p)
    );
  };

  const categories = [...new Set(products.map((p) => p.category))].sort();
  const tabs        = ['all', ...categories];

  const visible = products.filter((p) => {
    const matchCat    = filter === 'all' || p.category === filter;
    const matchSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="pb-4 border-b border-gray-100 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Products</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#7B0D1E] text-white rounded-lg text-sm font-medium hover:bg-[#5a0010] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name..."
        className="w-full md:w-72 h-10 px-4 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#7B0D1E] focus:border-transparent outline-none"
      />

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {tabs.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors min-h-[40px] ${
              filter === cat ? 'bg-[#7B0D1E] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {cat === 'all' ? 'All' : cat}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="py-12 text-center text-gray-400 text-sm">No products found</div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {visible.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              saving={saving === product.id}
              editingPrice={editingPrice}
              priceInput={priceInput}
              onToggleStock={toggleStock}
              onToggleBestSeller={toggleBestSeller}
              onPriceUpdate={handlePriceUpdate}
              onEditPrice={(id, price) => { setEditingPrice(id); setPriceInput(String(price)); }}
              onCancelEdit={() => setEditingPrice(null)}
              onPriceInputChange={setPriceInput}
              onDelete={setDeleteTarget}
              onImageUpdated={handleImageUpdated}
            />
          ))}
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <AddProductModal
          onClose={() => setShowAddModal(false)}
          onCreated={() => { fetchProducts(); }}
        />
      )}

      {/* Delete Confirm Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Delete Product</h3>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete <strong>{deleteTarget.name}</strong>?
              This will also remove its image from Cloudflare R2.
            </p>
            <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">
              This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 h-10 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 h-10 bg-red-600 text-white rounded-lg text-sm font-medium disabled:opacity-60 hover:bg-red-700 transition-colors"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
