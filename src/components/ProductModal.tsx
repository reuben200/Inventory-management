import React, { useState, useEffect } from 'react';
import { useBusiness } from '../context/BusinessContext';
import { Product } from '../types';
import { Package, Plus } from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  product?: Product | null;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ isOpen, product, onClose }) => {
  const { addProduct, updateProduct } = useBusiness();

  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [stockQuantity, setStockQuantity] = useState(25);
  const [reorderPoint, setReorderPoint] = useState(10);
  const [reorderQuantity, setReorderQuantity] = useState(30);
  const [costPrice, setCostPrice] = useState(45.0);
  const [sellingPrice, setSellingPrice] = useState(89.99);
  const [supplierName, setSupplierName] = useState('Global Tech Distribution');
  const [supplierEmail, setSupplierEmail] = useState('sales@globaltech.com');
  const [leadTimeDays, setLeadTimeDays] = useState(4);
  const [location, setLocation] = useState('Warehouse A - Rack 01');

  useEffect(() => {
    if (product) {
      setSku(product.sku);
      setName(product.name);
      setCategory(product.category);
      setStockQuantity(product.stockQuantity);
      setReorderPoint(product.reorderPoint);
      setReorderQuantity(product.reorderQuantity);
      setCostPrice(product.costPrice);
      setSellingPrice(product.sellingPrice);
      setSupplierName(product.supplierName);
      setSupplierEmail(product.supplierEmail);
      setLeadTimeDays(product.leadTimeDays);
      setLocation(product.location);
    } else {
      setSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
      setName('');
      setCategory('Electronics');
      setStockQuantity(25);
      setReorderPoint(10);
      setReorderQuantity(30);
      setCostPrice(45.0);
      setSellingPrice(89.99);
      setSupplierName('Global Tech Distribution');
      setSupplierEmail('sales@globaltech.com');
      setLeadTimeDays(4);
      setLocation('Warehouse A - Rack 01');
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku) return;

    if (product) {
      updateProduct(product.id, {
        sku,
        name,
        category,
        stockQuantity,
        reorderPoint,
        reorderQuantity,
        costPrice,
        sellingPrice,
        supplierName,
        supplierEmail,
        leadTimeDays,
        location,
      });
    } else {
      addProduct({
        sku,
        name,
        category,
        stockQuantity,
        reservedQuantity: 0,
        reorderPoint,
        reorderQuantity,
        costPrice,
        sellingPrice,
        supplierName,
        supplierEmail,
        leadTimeDays,
        location,
        lastRestocked: new Date().toISOString().split('T')[0],
        autoReorderEnabled: true,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white text-base">
              {product ? 'Edit Product SKU' : 'Add New Inventory Item'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">SKU Code *</label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white font-mono p-2 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-lg"
              >
                <option value="Electronics">Electronics</option>
                <option value="Office Furniture">Office Furniture</option>
                <option value="Peripherals">Peripherals</option>
                <option value="Accessories">Accessories</option>
                <option value="Audio">Audio</option>
                <option value="Storage">Storage</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Product Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. UltraSharp 27 Monitor"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Initial Stock</label>
              <input
                type="number"
                min={0}
                value={stockQuantity}
                onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Reorder Threshold</label>
              <input
                type="number"
                min={1}
                value={reorderPoint}
                onChange={(e) => setReorderPoint(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-800 text-amber-400 p-2 rounded-lg font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Auto Batch Size</label>
              <input
                type="number"
                min={1}
                value={reorderQuantity}
                onChange={(e) => setReorderQuantity(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Unit Cost ($)</label>
              <input
                type="number"
                step="0.01"
                min={0}
                value={costPrice}
                onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Selling Price ($)</label>
              <input
                type="number"
                step="0.01"
                min={0}
                value={sellingPrice}
                onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 text-emerald-400 font-bold p-2 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Supplier Name</label>
              <input
                type="text"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Supplier Email</label>
              <input
                type="email"
                value={supplierEmail}
                onChange={(e) => setSupplierEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Supplier Lead Time (Days)</label>
              <input
                type="number"
                min={1}
                value={leadTimeDays}
                onChange={(e) => setLeadTimeDays(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Warehouse Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-lg"
              />
            </div>
          </div>

          <div className="flex space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-xl font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-xl font-semibold shadow transition-all"
            >
              {product ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
