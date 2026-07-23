import React, { useState } from 'react';
import { ActiveTab } from '../types';
import { useBusiness } from '../context/BusinessContext';
import {
  Package,
  ShoppingCart,
  Zap,
  BarChart3,
  History,
  Sparkles,
  Download,
  Play,
  Square,
  Menu,
  X,
  Database,
} from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAIModal: () => void;
  onOpenExportModal: () => void;
  onOpenNewOrderModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAIModal,
  onOpenExportModal,
  onOpenNewOrderModal,
}) => {
  const {
    products,
    orders,
    purchaseOrders,
    autoSimulate,
    toggleAutoSimulate,
    autoReorderGlobalEnabled,
    toggleGlobalAutoReorder,
    isFirebaseConnected,
  } = useBusiness();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const lowStockCount = products.filter(
    (p) => p.status === 'Low Stock' || p.status === 'Critical' || p.status === 'Out of Stock'
  ).length;

  const pendingOrdersCount = orders.filter((o) => o.status === 'Pending' || o.status === 'Processing').length;
  const activePOsCount = purchaseOrders.filter((po) => po.status === 'Ordered' || po.status === 'In Transit').length;

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Top Header Row */}
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-white truncate">
                  StockSync
                </span>
                <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
                  Business OS
                </span>
                {isFirebaseConnected && (
                  <span className="hidden md:inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Database className="w-2.5 h-2.5" />
                    Firebase DB
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 hidden sm:block truncate">Real-time Inventory & Operations</p>
            </div>
          </div>

          {/* Quick Action Controls (Desktop) */}
          <div className="hidden lg:flex items-center space-x-2 sm:space-x-2.5">
            {/* Live Simulation Toggle */}
            <button
              onClick={toggleAutoSimulate}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                autoSimulate
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
              title="Simulates live incoming customer orders periodically"
            >
              {autoSimulate ? <Square className="w-3.5 h-3.5 fill-emerald-400" /> : <Play className="w-3.5 h-3.5" />}
              <span>{autoSimulate ? 'Simulating Live Orders' : 'Simulate Orders'}</span>
            </button>

            {/* Global Auto Reorder Switch */}
            <button
              onClick={toggleGlobalAutoReorder}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                autoReorderGlobalEnabled
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
              title="Automatically creates supplier POs when stock crosses reorder point"
            >
              <Zap className={`w-3.5 h-3.5 ${autoReorderGlobalEnabled ? 'fill-amber-400' : ''}`} />
              <span>{autoReorderGlobalEnabled ? 'Auto-Reorder ACTIVE' : 'Auto-Reorder Off'}</span>
            </button>

            {/* New Customer Order Button */}
            <button
              onClick={onOpenNewOrderModal}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-3.5 py-1.5 rounded-lg flex items-center space-x-1.5 shadow-sm transition-all"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>+ New Order</span>
            </button>

            {/* AI Copilot Button */}
            <button
              onClick={onOpenAIModal}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1.5 shadow-md shadow-indigo-500/20 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>AI Copilot</span>
            </button>

            {/* Export Reports */}
            <button
              onClick={onOpenExportModal}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 text-xs transition-all"
              title="Export Reports (CSV / Print PDF)"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex lg:hidden items-center space-x-2">
            {/* Primary CTA on Mobile */}
            <button
              onClick={onOpenNewOrderModal}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-2.5 py-1.5 rounded-lg flex items-center space-x-1 shadow-sm transition-all shrink-0"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span className="text-[11px] sm:text-xs">+ Order</span>
            </button>

            {/* AI Copilot Icon Button on Mobile */}
            <button
              onClick={onOpenAIModal}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-1.5 rounded-lg flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0"
              title="AI Copilot"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
            </button>

            {/* Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-all shrink-0"
              aria-label="Toggle mobile controls menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-indigo-400" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Expandable Controls Bar */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 px-2 mb-2 bg-slate-800/90 border border-slate-700/80 rounded-xl space-y-2.5 animate-fadeIn">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1 pb-1 border-b border-slate-700/50">
              <span className="font-semibold text-slate-300">Quick Controls & Automation</span>
              {isFirebaseConnected && (
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400">
                  <Database className="w-3 h-3" /> Firestore Active
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  toggleAutoSimulate();
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  autoSimulate
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-900/80 text-slate-300 border border-slate-700'
                }`}
              >
                {autoSimulate ? <Square className="w-3.5 h-3.5 fill-emerald-400" /> : <Play className="w-3.5 h-3.5" />}
                <span className="truncate">{autoSimulate ? 'Stop Simulating' : 'Simulate Orders'}</span>
              </button>

              <button
                onClick={() => {
                  toggleGlobalAutoReorder();
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  autoReorderGlobalEnabled
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-900/80 text-slate-400 border border-slate-700'
                }`}
              >
                <Zap className={`w-3.5 h-3.5 ${autoReorderGlobalEnabled ? 'fill-amber-400' : ''}`} />
                <span className="truncate">{autoReorderGlobalEnabled ? 'Auto Reorder ON' : 'Auto Reorder OFF'}</span>
              </button>
            </div>

            <div className="flex space-x-2 pt-1">
              <button
                onClick={() => {
                  onOpenExportModal();
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2 bg-slate-900/80 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 text-xs font-medium flex items-center justify-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Reports</span>
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs Bar */}
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-2 pt-2 scrollbar-none border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
              activeTab === 'inventory'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Inventory</span>
            {lowStockCount > 0 && (
              <span className="ml-1 bg-amber-500 text-slate-900 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                {lowStockCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
              activeTab === 'orders'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Orders</span>
            {pendingOrdersCount > 0 && (
              <span className="ml-1 bg-blue-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                {pendingOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('reorder')}
            className={`flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
              activeTab === 'reorder'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Reorder Triggers</span>
            {activePOsCount > 0 && (
              <span className="ml-1 bg-emerald-500 text-slate-950 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                {activePOsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
              activeTab === 'analytics'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
              activeTab === 'logs'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Logs</span>
          </button>
        </div>
      </div>
    </header>
  );
};
