import React, { useState } from 'react';
import { useBusiness } from '../context/BusinessContext';
import { Download, Printer, FileSpreadsheet, FileText, CheckCircle2 } from 'lucide-react';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({ isOpen, onClose }) => {
  const { products, orders, purchaseOrders, movementLogs } = useBusiness();
  const [reportType, setReportType] = useState<'inventory' | 'orders' | 'purchaseOrders' | 'movements'>('inventory');

  if (!isOpen) return null;

  // CSV Generator Helper
  const downloadCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((row) => row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCSV = () => {
    if (reportType === 'inventory') {
      const headers = ['SKU', 'Name', 'Category', 'Stock Quantity', 'Reorder Point', 'Cost Price', 'Selling Price', 'Location', 'Supplier', 'Status'];
      const rows = products.map((p) => [
        p.sku,
        p.name,
        p.category,
        p.stockQuantity,
        p.reorderPoint,
        p.costPrice,
        p.sellingPrice,
        p.location,
        p.supplierName,
        p.status,
      ]);
      downloadCSV(`StockSync_Inventory_Report_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
    } else if (reportType === 'orders') {
      const headers = ['Order Number', 'Customer Name', 'Customer Email', 'Grand Total', 'Status', 'Payment Status', 'Created At', 'Address'];
      const rows = orders.map((o) => [
        o.orderNumber,
        o.customerName,
        o.customerEmail,
        o.grandTotal,
        o.status,
        o.paymentStatus,
        o.createdAt,
        o.shippingAddress,
      ]);
      downloadCSV(`StockSync_Customer_Orders_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
    } else if (reportType === 'purchaseOrders') {
      const headers = ['PO Number', 'Product SKU', 'Product Name', 'Supplier', 'Quantity', 'Total Cost', 'Triggered By', 'Status', 'Date'];
      const rows = purchaseOrders.map((po) => [
        po.poNumber,
        po.sku,
        po.productName,
        po.supplierName,
        po.quantity,
        po.totalCost,
        po.triggeredBy,
        po.status,
        po.createdAt,
      ]);
      downloadCSV(`StockSync_Purchase_Orders_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
    } else if (reportType === 'movements') {
      const headers = ['Timestamp', 'Product Name', 'Type', 'Quantity Delta', 'Previous Qty', 'New Qty', 'Reference'];
      const rows = movementLogs.map((m) => [
        m.timestamp,
        m.productName,
        m.type,
        m.quantityDelta,
        m.previousQuantity,
        m.newQuantity,
        m.reference,
      ]);
      downloadCSV(`StockSync_Stock_Movements_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
    }
  };

  const handlePrintPDFReport = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Export Operations & Sales Reports</h3>
              <p className="text-xs text-slate-400">Download formatted CSV data or print structured PDF summaries</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            ✕
          </button>
        </div>

        {/* Report Selection */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
            Select Data Set to Export:
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setReportType('inventory')}
              className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                reportType === 'inventory'
                  ? 'bg-indigo-600/20 border-indigo-500 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-indigo-400 mb-1" />
              <span>Inventory Valuation & SKUs</span>
              <span className="block text-[10px] text-slate-400 font-normal mt-0.5">{products.length} Items</span>
            </button>

            <button
              onClick={() => setReportType('orders')}
              className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                reportType === 'orders'
                  ? 'bg-indigo-600/20 border-indigo-500 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400 mb-1" />
              <span>Customer Orders & Invoices</span>
              <span className="block text-[10px] text-slate-400 font-normal mt-0.5">{orders.length} Records</span>
            </button>

            <button
              onClick={() => setReportType('purchaseOrders')}
              className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                reportType === 'purchaseOrders'
                  ? 'bg-indigo-600/20 border-indigo-500 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-amber-400 mb-1" />
              <span>Supplier Purchase Orders</span>
              <span className="block text-[10px] text-slate-400 font-normal mt-0.5">{purchaseOrders.length} POs</span>
            </button>

            <button
              onClick={() => setReportType('movements')}
              className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                reportType === 'movements'
                  ? 'bg-indigo-600/20 border-indigo-500 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-purple-400 mb-1" />
              <span>Inventory Movement Ledger</span>
              <span className="block text-[10px] text-slate-400 font-normal mt-0.5">{movementLogs.length} Events</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 pt-2">
          <button
            onClick={handleExportCSV}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-3 rounded-xl flex items-center justify-center space-x-2 shadow-md shadow-emerald-600/20 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV Spreadsheet</span>
          </button>

          <button
            onClick={handlePrintPDFReport}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-3 rounded-xl flex items-center justify-center space-x-2 shadow-md shadow-indigo-600/20 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};
