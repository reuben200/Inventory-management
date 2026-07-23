import React, { useState } from 'react';
import { useBusiness } from '../context/BusinessContext';
import { History, Search, ArrowUpRight, ArrowDownLeft, ShieldCheck, Filter } from 'lucide-react';

export const StockLogsView: React.FC = () => {
  const { movementLogs } = useBusiness();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');

  const filteredLogs = movementLogs.filter((log) => {
    const matchesSearch =
      log.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.reference.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === 'All' || log.type === selectedType;

    return matchesSearch && matchesType;
  });

  const getTypeBadge = (type: string, delta: number) => {
    if (delta > 0) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <ArrowDownLeft className="w-3 h-3 mr-1" /> +{delta} ({type})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
        <ArrowUpRight className="w-3 h-3 mr-1" /> {delta} ({type})
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <History className="w-5 h-5 text-indigo-400" />
            <span>Real-time Inventory Movement Ledger</span>
          </h2>
          <p className="text-xs text-slate-400">Complete audit trail of sales deductions, purchase restocks, and stock adjustments</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by product or order/PO ref..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 pl-9 pr-4 py-1.5 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-slate-900">Type: All</option>
              <option value="Sale" className="bg-slate-900">Sale</option>
              <option value="Purchase Restock" className="bg-slate-900">Purchase Restock</option>
              <option value="Manual Adjustment" className="bg-slate-900">Manual Adjustment</option>
              <option value="Order Cancellation" className="bg-slate-900">Order Cancellation</option>
            </select>
          </div>
        </div>
      </div>

      {/* Movement Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Product Name</th>
                <th className="px-4 py-3">Movement Type</th>
                <th className="px-4 py-3 text-center">Stock Change</th>
                <th className="px-4 py-3 text-center">Qty Transition</th>
                <th className="px-4 py-3">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>

                  <td className="px-4 py-3 font-semibold text-white">
                    {log.productName}
                  </td>

                  <td className="px-4 py-3">
                    {getTypeBadge(log.type, log.quantityDelta)}
                  </td>

                  <td className="px-4 py-3 text-center font-mono font-bold">
                    <span className={log.quantityDelta > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {log.quantityDelta > 0 ? `+${log.quantityDelta}` : log.quantityDelta}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center font-mono text-xs text-slate-300">
                    {log.previousQuantity} → <span className="font-bold text-white">{log.newQuantity}</span>
                  </td>

                  <td className="px-4 py-3 font-mono text-xs text-indigo-400">
                    {log.reference}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
