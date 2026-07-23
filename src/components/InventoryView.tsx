import React, { useState, useMemo } from 'react';
import { useBusiness } from '../context/BusinessContext';
import { Product, StockStatus } from '../types';
import {
  Search,
  Plus,
  Filter,
  AlertTriangle,
  ArrowUpDown,
  Zap,
  Edit2,
  Trash2,
  Sliders,
  CheckCircle2,
  XCircle,
  LayoutGrid,
  List,
  Layers,
  DollarSign,
  PackageCheck,
  TrendingDown,
  Building,
} from 'lucide-react';

interface InventoryViewProps {
  onOpenProductModal: (product?: Product) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ onOpenProductModal }) => {
  const {
    products,
    adjustStock,
    deleteProduct,
    createPurchaseOrder,
    toggleProductAutoReorder,
  } = useBusiness();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Stock Adjustment Modal state
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState<string>('Stock Take Audit');

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ['All', ...Array.from(set)];
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;

      let matchesStatus = true;
      if (selectedStatus === 'Low/Critical') {
        matchesStatus = p.status === 'Low Stock' || p.status === 'Critical' || p.status === 'Out of Stock';
      } else if (selectedStatus !== 'All') {
        matchesStatus = p.status === selectedStatus;
      }

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchTerm, selectedCategory, selectedStatus]);

  // Summary Metrics
  const totalValuation = useMemo(() => {
    return products.reduce((sum, p) => sum + p.stockQuantity * p.costPrice, 0);
  }, [products]);

  const totalRetailValuation = useMemo(() => {
    return products.reduce((sum, p) => sum + p.stockQuantity * p.sellingPrice, 0);
  }, [products]);

  const totalStockUnits = useMemo(() => {
    return products.reduce((sum, p) => sum + p.stockQuantity, 0);
  }, [products]);

  const lowStockCount = useMemo(() => {
    return products.filter((p) => p.status === 'Low Stock' || p.status === 'Critical' || p.status === 'Out of Stock').length;
  }, [products]);

  const handleApplyAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct || adjustmentAmount === 0) return;
    adjustStock(adjustingProduct.id, adjustmentAmount, adjustmentReason);
    setAdjustingProduct(null);
    setAdjustmentAmount(0);
  };

  const getStatusBadge = (status: StockStatus) => {
    switch (status) {
      case 'In Stock':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3 mr-1" /> In Stock
          </span>
        );
      case 'Low Stock':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <AlertTriangle className="w-3 h-3 mr-1" /> Low Stock
          </span>
        );
      case 'Critical':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800 animate-pulse">
            <AlertTriangle className="w-3 h-3 mr-1" /> Critical
          </span>
        );
      case 'Out of Stock':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            <XCircle className="w-3 h-3 mr-1" /> Out of Stock
          </span>
        );
      case 'Overstocked':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
            Overstocked
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Total SKUs Tracked</p>
            <h3 className="text-2xl font-bold text-white mt-1">{products.length} Items</h3>
            <p className="text-xs text-slate-500 mt-0.5">{totalStockUnits.toLocaleString()} units in warehouses</p>
          </div>
          <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 text-indigo-400">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Cost Valuation</p>
            <h3 className="text-2xl font-bold text-emerald-400 mt-1">
              ${totalValuation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Retail: ${totalRetailValuation.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </p>
          </div>
          <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20 text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Low Stock Alerts</p>
            <h3 className="text-2xl font-bold text-amber-400 mt-1">{lowStockCount} Products</h3>
            <p className="text-xs text-slate-500 mt-0.5">At or below reorder points</p>
          </div>
          <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20 text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Automated Reordering</p>
            <h3 className="text-2xl font-bold text-indigo-400 mt-1">
              {products.filter((p) => p.autoReorderEnabled).length} / {products.length}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Active triggers enabled</p>
          </div>
          <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20 text-purple-400">
            <Zap className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Category, Status, Add Product */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by product name, SKU, supplier, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 pl-9 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-900 text-slate-200">
                    Category: {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="All" className="bg-slate-900 text-slate-200">
                  Status: All
                </option>
                <option value="Low/Critical" className="bg-slate-900 text-slate-200">
                  ⚠️ Low & Critical Only
                </option>
                <option value="In Stock" className="bg-slate-900 text-slate-200">
                  In Stock
                </option>
                <option value="Low Stock" className="bg-slate-900 text-slate-200">
                  Low Stock
                </option>
                <option value="Critical" className="bg-slate-900 text-slate-200">
                  Critical
                </option>
                <option value="Out of Stock" className="bg-slate-900 text-slate-200">
                  Out of Stock
                </option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            {/* Add New Product */}
            <button
              onClick={() => onOpenProductModal()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center space-x-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add SKU</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Inventory Display */}
      {viewMode === 'table' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Product Name & SKU</th>
                  <th className="px-4 py-3">Stock Level</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Cost</th>
                  <th className="px-4 py-3 text-right">Selling Price</th>
                  <th className="px-4 py-3 text-right">Valuation</th>
                  <th className="px-4 py-3">Auto-Reorder</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredProducts.map((p) => {
                  const stockPercent = Math.min(100, Math.round((p.stockQuantity / (p.reorderPoint * 3)) * 100));

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Name & SKU */}
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white">{p.name}</div>
                        <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
                          <span className="font-mono text-indigo-400">{p.sku}</span>
                          <span>•</span>
                          <span>{p.category}</span>
                          <span>•</span>
                          <span className="text-slate-500">{p.location}</span>
                        </div>
                      </td>

                      {/* Stock Level & Progress Bar */}
                      <td className="px-4 py-3 min-w-[160px]">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-white text-sm">{p.stockQuantity} units</span>
                          <span className="text-slate-400 text-[11px]">Threshold: {p.reorderPoint}</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              p.stockQuantity <= p.reorderPoint
                                ? p.stockQuantity <= Math.ceil(p.reorderPoint * 0.5)
                                  ? 'bg-rose-500'
                                  : 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.max(5, stockPercent)}%` }}
                          />
                        </div>
                        {p.reservedQuantity > 0 && (
                          <div className="text-[10px] text-slate-400 mt-1">
                            Reserved: <span className="text-amber-400">{p.reservedQuantity}</span>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">{getStatusBadge(p.status)}</td>

                      {/* Cost */}
                      <td className="px-4 py-3 text-right font-mono text-slate-300">
                        ${p.costPrice.toFixed(2)}
                      </td>

                      {/* Selling Price */}
                      <td className="px-4 py-3 text-right font-mono font-medium text-emerald-400">
                        ${p.sellingPrice.toFixed(2)}
                      </td>

                      {/* Valuation */}
                      <td className="px-4 py-3 text-right font-mono font-bold text-white">
                        ${(p.stockQuantity * p.costPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Auto Reorder */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleProductAutoReorder(p.id)}
                          className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium transition-all ${
                            p.autoReorderEnabled
                              ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                              : 'bg-slate-800 text-slate-500 border border-slate-700'
                          }`}
                        >
                          <Zap className={`w-3 h-3 ${p.autoReorderEnabled ? 'fill-amber-400 text-amber-400' : ''}`} />
                          <span>{p.autoReorderEnabled ? `Trigger @ ${p.reorderPoint}` : 'Off'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          {/* Stock Adjust button */}
                          <button
                            onClick={() => {
                              setAdjustingProduct(p);
                              setAdjustmentAmount(0);
                            }}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded border border-slate-700"
                            title="Adjust Stock (+/-)"
                          >
                            <ArrowUpDown className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Manual PO Trigger */}
                          <button
                            onClick={() => createPurchaseOrder(p.id)}
                            className="p-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded border border-amber-500/30"
                            title="Trigger Manual Purchase Order to Supplier"
                          >
                            <Zap className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => onOpenProductModal(p)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
                            title="Edit Product Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete SKU ${p.sku}?`)) {
                                deleteProduct(p.id);
                              }
                            }}
                            className="p-1.5 bg-slate-800 hover:bg-rose-900/50 text-rose-400 rounded border border-slate-700 hover:border-rose-700"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition-all space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {p.sku}
                  </span>
                  <h4 className="font-bold text-white text-base mt-2">{p.name}</h4>
                  <p className="text-xs text-slate-400">{p.category} • {p.location}</p>
                </div>
                <div>{getStatusBadge(p.status)}</div>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Current Stock:</span>
                  <span className="font-bold text-white">{p.stockQuantity} units</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Reorder Threshold:</span>
                  <span className="text-amber-400 font-semibold">{p.reorderPoint} units</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Auto-Reorder Batch:</span>
                  <span className="text-slate-300">{p.reorderQuantity} units</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-950/50 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">UNIT COST</span>
                  <span className="font-mono text-slate-300 text-sm font-semibold">${p.costPrice.toFixed(2)}</span>
                </div>
                <div className="bg-slate-950/50 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">SELLING PRICE</span>
                  <span className="font-mono text-emerald-400 text-sm font-semibold">${p.sellingPrice.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800 pt-3">
                <div className="flex items-center space-x-1 truncate max-w-[180px]">
                  <Building className="w-3.5 h-3.5 text-slate-500" />
                  <span className="truncate">{p.supplierName}</span>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => {
                      setAdjustingProduct(p);
                      setAdjustmentAmount(0);
                    }}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded text-xs font-medium border border-slate-700"
                  >
                    Adjust
                  </button>
                  <button
                    onClick={() => onOpenProductModal(p)}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-medium border border-slate-700"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {adjustingProduct && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Adjust Inventory Stock</h3>
              <button
                onClick={() => setAdjustingProduct(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <p className="text-sm font-semibold text-white">{adjustingProduct.name}</p>
              <p className="text-xs text-slate-400 font-mono mt-0.5">SKU: {adjustingProduct.sku}</p>
              <p className="text-xs text-slate-300 mt-2 bg-slate-950 p-2 rounded border border-slate-800">
                Current Stock: <span className="font-bold text-white">{adjustingProduct.stockQuantity} units</span>
              </p>
            </div>

            <form onSubmit={handleApplyAdjustment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Quantity Delta (Positive to Restock, Negative to Deduct):
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={adjustmentAmount}
                    onChange={(e) => setAdjustmentAmount(parseInt(e.target.value) || 0)}
                    placeholder="e.g. +20 or -5"
                    className="w-full bg-slate-950 border border-slate-800 text-white font-mono px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  New Quantity will be:{' '}
                  <span className="font-bold text-emerald-400">
                    {Math.max(0, adjustingProduct.stockQuantity + adjustmentAmount)} units
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Reason / Reference:</label>
                <select
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Stock Take Audit">Stock Take Audit</option>
                  <option value="Manual Supplier Restock">Manual Supplier Restock</option>
                  <option value="Damaged / Write-Off">Damaged / Write-Off</option>
                  <option value="Sample / Internal Use">Sample / Internal Use</option>
                  <option value="Customer Return">Customer Return</option>
                </select>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustingProduct(null)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold py-2 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2 rounded-lg shadow transition-all"
                >
                  Apply Stock Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
