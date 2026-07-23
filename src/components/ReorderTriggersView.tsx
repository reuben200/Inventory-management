import React, { useState } from 'react';
import { useBusiness } from '../context/BusinessContext';
import { POStatus, TriggerType } from '../types';
import {
  Zap,
  PackageCheck,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Building,
  Plus,
  Sliders,
  Check,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export const ReorderTriggersView: React.FC = () => {
  const {
    products,
    purchaseOrders,
    triggerLogs,
    receivePurchaseOrder,
    updatePOStatus,
    toggleGlobalAutoReorder,
    toggleProductAutoReorder,
    updateProduct,
    createPurchaseOrder,
    autoReorderGlobalEnabled,
  } = useBusiness();

  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [editingReorderSKU, setEditingReorderSKU] = useState<string | null>(null);
  const [tempPoint, setTempPoint] = useState<number>(0);
  const [tempQty, setTempQty] = useState<number>(0);

  const filteredPOs = purchaseOrders.filter((po) => {
    if (filterStatus === 'Active') return po.status === 'Ordered' || po.status === 'In Transit' || po.status === 'Pending Approval';
    if (filterStatus === 'Received') return po.status === 'Received';
    return true;
  });

  const getPOStatusBadge = (status: POStatus) => {
    switch (status) {
      case 'Pending Approval':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3 mr-1" /> Pending Approval
          </span>
        );
      case 'Ordered':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <CheckCircle2 className="w-3 h-3 mr-1" /> PO Sent
          </span>
        );
      case 'In Transit':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/30">
            <Truck className="w-3 h-3 mr-1" /> In Transit
          </span>
        );
      case 'Received':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <PackageCheck className="w-3 h-3 mr-1" /> Received & Restocked
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            <XCircle className="w-3 h-3 mr-1" /> Cancelled
          </span>
        );
    }
  };

  const getTriggerTypeBadge = (type: TriggerType) => {
    if (type === 'Automated Threshold') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
          <Zap className="w-3 h-3 mr-1 fill-amber-400" /> Automated Trigger
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
        Manual
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Automated Trigger Engine Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center space-x-1">
                <Zap className="w-3.5 h-3.5 fill-amber-400" />
                <span>AUTOMATED REORDER ENGINE</span>
              </span>
              <span className="text-xs text-slate-400">Zero Stockout Protection</span>
            </div>
            <h2 className="text-xl font-bold text-white">Real-Time Autonomous Inventory Replenishment</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              When live customer orders or stock consumption cause inventory levels to breach designated reorder points, StockSync immediately triggers supplier Purchase Orders for predetermined batch sizes.
            </p>
          </div>

          <div className="flex items-center space-x-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
            <div>
              <p className="text-xs font-medium text-slate-400">Global Engine Status</p>
              <p className={`text-base font-bold ${autoReorderGlobalEnabled ? 'text-emerald-400' : 'text-slate-400'}`}>
                {autoReorderGlobalEnabled ? 'ACTIVE & MONITORING' : 'DISABLED'}
              </p>
            </div>
            <button
              onClick={toggleGlobalAutoReorder}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                autoReorderGlobalEnabled
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {autoReorderGlobalEnabled ? 'Turn Engine Off' : 'Enable Engine'}
            </button>
          </div>
        </div>

        {/* Workflow steps visual */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 bg-slate-950/50 p-3 rounded-lg border border-slate-800/60">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
              1
            </div>
            <div className="text-xs">
              <p className="font-semibold text-white">Stock Drops Below Threshold</p>
              <p className="text-slate-400 text-[11px]">Monitors live consumption 24/7</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-slate-950/50 p-3 rounded-lg border border-slate-800/60">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
              2
            </div>
            <div className="text-xs">
              <p className="font-semibold text-white">Automated PO Dispatch</p>
              <p className="text-slate-400 text-[11px]">Supplier PO generated with batch qty</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-slate-950/50 p-3 rounded-lg border border-slate-800/60">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
              3
            </div>
            <div className="text-xs">
              <p className="font-semibold text-white">Receive & Restock Stock</p>
              <p className="text-slate-400 text-[11px]">1-click restock adds inventory units</p>
            </div>
          </div>
        </div>
      </div>

      {/* Supplier Purchase Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-white text-base">Supplier Purchase Orders Ledger</h3>
            <p className="text-xs text-slate-400">Track and manage automated and manual purchase orders</p>
          </div>

          <div className="flex items-center space-x-2">
            {['All', 'Active', 'Received'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filterStatus === st ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">PO Number & Date</th>
                <th className="px-4 py-3">Product & SKU</th>
                <th className="px-4 py-3">Supplier Name</th>
                <th className="px-4 py-3">Trigger Type</th>
                <th className="px-4 py-3 text-center">Batch Quantity</th>
                <th className="px-4 py-3 text-right">Total PO Cost</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredPOs.map((po) => (
                <tr key={po.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-mono font-bold text-indigo-400">{po.poNumber}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {new Date(po.createdAt).toLocaleDateString()}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="font-semibold text-white">{po.productName}</div>
                    <div className="text-xs font-mono text-slate-400">{po.sku}</div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="text-slate-200 text-xs font-medium">{po.supplierName}</div>
                    <div className="text-[11px] text-slate-400">{po.supplierEmail}</div>
                  </td>

                  <td className="px-4 py-3">{getTriggerTypeBadge(po.triggeredBy)}</td>

                  <td className="px-4 py-3 text-center font-bold text-white font-mono">
                    {po.quantity} units
                  </td>

                  <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">
                    ${po.totalCost.toFixed(2)}
                  </td>

                  <td className="px-4 py-3">{getPOStatusBadge(po.status)}</td>

                  <td className="px-4 py-3 text-center">
                    {po.status !== 'Received' && po.status !== 'Cancelled' ? (
                      <button
                        onClick={() => receivePurchaseOrder(po.id)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1 shadow-sm transition-all mx-auto"
                      >
                        <PackageCheck className="w-3.5 h-3.5" />
                        <span>Receive Shipment</span>
                      </button>
                    ) : (
                      <span className="text-xs text-slate-500">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reorder Trigger Settings Table per SKU */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-base">Reorder Thresholds & Rules Configuration</h3>
            <p className="text-xs text-slate-400">Configure safety thresholds and reorder batch sizes per product</p>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Product / SKU</th>
                <th className="p-3 text-center">Current Stock</th>
                <th className="p-3 text-center">Reorder Threshold</th>
                <th className="p-3 text-center">Reorder Batch Qty</th>
                <th className="p-3">Supplier Lead Time</th>
                <th className="p-3 text-center">Auto-Trigger Switch</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {products.map((p) => {
                const isEditing = editingReorderSKU === p.id;

                return (
                  <tr key={p.id} className="hover:bg-slate-800/40">
                    <td className="p-3">
                      <span className="font-semibold text-white block">{p.name}</span>
                      <span className="font-mono text-indigo-400 text-[11px]">{p.sku}</span>
                    </td>

                    <td className="p-3 text-center font-bold text-white font-mono">{p.stockQuantity}</td>

                    <td className="p-3 text-center">
                      {isEditing ? (
                        <input
                          type="number"
                          value={tempPoint}
                          onChange={(e) => setTempPoint(parseInt(e.target.value) || 0)}
                          className="w-16 bg-slate-950 border border-indigo-500 text-white font-mono text-center p-1 rounded"
                        />
                      ) : (
                        <span className="font-mono font-bold text-amber-400">{p.reorderPoint} units</span>
                      )}
                    </td>

                    <td className="p-3 text-center">
                      {isEditing ? (
                        <input
                          type="number"
                          value={tempQty}
                          onChange={(e) => setTempQty(parseInt(e.target.value) || 0)}
                          className="w-16 bg-slate-950 border border-indigo-500 text-white font-mono text-center p-1 rounded"
                        />
                      ) : (
                        <span className="font-mono text-slate-300">{p.reorderQuantity} units</span>
                      )}
                    </td>

                    <td className="p-3 text-slate-400">{p.leadTimeDays} days ({p.supplierName})</td>

                    <td className="p-3 text-center">
                      <button
                        onClick={() => toggleProductAutoReorder(p.id)}
                        className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                          p.autoReorderEnabled
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {p.autoReorderEnabled ? '⚡ Enabled' : 'Disabled'}
                      </button>
                    </td>

                    <td className="p-3 text-center">
                      {isEditing ? (
                        <button
                          onClick={() => {
                            updateProduct(p.id, { reorderPoint: tempPoint, reorderQuantity: tempQty });
                            setEditingReorderSKU(null);
                          }}
                          className="p-1.5 bg-emerald-600 text-white rounded text-xs font-medium"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingReorderSKU(p.id);
                            setTempPoint(p.reorderPoint);
                            setTempQty(p.reorderQuantity);
                          }}
                          className="p-1.5 bg-slate-800 text-slate-300 hover:text-white rounded text-xs font-medium border border-slate-700"
                        >
                          Configure
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Automated Trigger Activity History Log */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
        <h3 className="font-bold text-white text-base flex items-center space-x-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Automated Trigger Audit Log</span>
        </h3>
        <p className="text-xs text-slate-400">Historical records of automated replenishment triggers executed by the engine</p>

        <div className="space-y-2">
          {triggerLogs.map((log) => (
            <div
              key={log.id}
              className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2"
            >
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <div>
                  <span className="font-bold text-white">{log.productName}</span>{' '}
                  <span className="font-mono text-indigo-400">({log.sku})</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Stock dropped to <span className="text-amber-400 font-bold">{log.triggerStockLevel}</span> units (Threshold: {log.thresholdPoint})
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono font-bold text-emerald-400">PO #{log.poNumber}</span>
                <span className="text-slate-400 block text-[11px]">
                  Ordered: {log.quantityOrdered} units • {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
