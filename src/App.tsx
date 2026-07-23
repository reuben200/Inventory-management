import React, { useState } from 'react';
import { BusinessProvider } from './context/BusinessContext';
import { ActiveTab, Product } from './types';
import { Navbar } from './components/Navbar';
import { InventoryView } from './components/InventoryView';
import { OrdersView } from './components/OrdersView';
import { ReorderTriggersView } from './components/ReorderTriggersView';
import { AnalyticsView } from './components/AnalyticsView';
import { StockLogsView } from './components/StockLogsView';
import { AIInsightsModal } from './components/AIInsightsModal';
import { ExportReportModal } from './components/ExportReportModal';
import { NewOrderModal } from './components/NewOrderModal';
import { ProductModal } from './components/ProductModal';

function AppContent() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('inventory');
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleOpenProductModal = (product?: Product | null) => {
    setEditingProduct(product || null);
    setIsProductModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white pb-12">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAIModal={() => setIsAIModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenNewOrderModal={() => setIsNewOrderModalOpen(true)}
      />

      {/* Main View Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'inventory' && (
          <InventoryView onOpenProductModal={handleOpenProductModal} />
        )}

        {activeTab === 'orders' && (
          <OrdersView onOpenNewOrderModal={() => setIsNewOrderModalOpen(true)} />
        )}

        {activeTab === 'reorder' && <ReorderTriggersView />}

        {activeTab === 'analytics' && (
          <AnalyticsView onOpenAIModal={() => setIsAIModalOpen(true)} />
        )}

        {activeTab === 'logs' && <StockLogsView />}
      </main>

      {/* Modals */}
      <AIInsightsModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />

      <ExportReportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} />

      <NewOrderModal isOpen={isNewOrderModalOpen} onClose={() => setIsNewOrderModalOpen(false)} />

      <ProductModal
        isOpen={isProductModalOpen}
        product={editingProduct}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <BusinessProvider>
      <AppContent />
    </BusinessProvider>
  );
}
