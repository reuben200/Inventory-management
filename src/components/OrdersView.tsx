import React, { useState, useMemo } from 'react';
import { useBusiness } from '../context/BusinessContext';
import { CustomerOrder, OrderStatus } from '../types';
import {
  Search,
  ShoppingCart,
  DollarSign,
  PackageCheck,
  Clock,
  Printer,
  XCircle,
  Truck,
  CheckCircle2,
  FileText,
  User,
  MapPin,
  Calendar,
} from 'lucide-react';

interface OrdersViewProps {
  onOpenNewOrderModal: () => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ onOpenNewOrderModal }) => {
  const { orders, updateOrderStatus, cancelCustomerOrder } = useBusiness();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<CustomerOrder | null>(null);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.shippingAddress.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = selectedStatus === 'All' || o.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, selectedStatus]);

  // Order Metrics
  const totalRevenue = useMemo(() => {
    return orders.reduce((acc, o) => acc + (o.status !== 'Cancelled' ? o.grandTotal : 0), 0);
  }, [orders]);

  const pendingCount = useMemo(() => {
    return orders.filter((o) => o.status === 'Pending' || o.status === 'Processing').length;
  }, [orders]);

  const shippedCount = useMemo(() => {
    return orders.filter((o) => o.status === 'Shipped').length;
  }, [orders]);

  const deliveredCount = useMemo(() => {
    return orders.filter((o) => o.status === 'Delivered').length;
  }, [orders]);

  const getOrderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3 mr-1" /> Pending
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
            Processing
          </span>
        );
      case 'Shipped':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/30">
            <Truck className="w-3 h-3 mr-1" /> Shipped
          </span>
        );
      case 'Delivered':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Delivered
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3 h-3 mr-1" /> Cancelled
          </span>
        );
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Total Order Revenue</p>
            <h3 className="text-2xl font-bold text-emerald-400 mt-1">
              ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{orders.length} Total orders recorded</p>
          </div>
          <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20 text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Pending Fulfillment</p>
            <h3 className="text-2xl font-bold text-amber-400 mt-1">{pendingCount} Orders</h3>
            <p className="text-xs text-slate-500 mt-0.5">Requires packing & dispatch</p>
          </div>
          <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20 text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">In Transit (Shipped)</p>
            <h3 className="text-2xl font-bold text-purple-400 mt-1">{shippedCount} Orders</h3>
            <p className="text-xs text-slate-500 mt-0.5">Active courier tracking</p>
          </div>
          <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20 text-purple-400">
            <Truck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Completed Orders</p>
            <h3 className="text-2xl font-bold text-indigo-400 mt-1">{deliveredCount} Orders</h3>
            <p className="text-xs text-slate-500 mt-0.5">Successfully delivered</p>
          </div>
          <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 text-indigo-400">
            <PackageCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Control & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by order #, customer name, email, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 pl-9 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Status Tabs Filter */}
          <div className="flex items-center space-x-1 overflow-x-auto bg-slate-950 p-1 rounded-lg border border-slate-800">
            {['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                  selectedStatus === status
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* New Order Button */}
          <button
            onClick={onOpenNewOrderModal}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center space-x-1.5 shadow-sm transition-all"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>+ Create Order</span>
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Order # & Date</th>
                <th className="px-4 py-3">Customer Info</th>
                <th className="px-4 py-3">Purchased Items</th>
                <th className="px-4 py-3 text-right">Grand Total</th>
                <th className="px-4 py-3">Fulfillment Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredOrders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-800/40 transition-colors">
                  {/* Order Number & Date */}
                  <td className="px-4 py-3">
                    <div className="font-mono font-bold text-indigo-400 text-sm">{o.orderNumber}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {new Date(o.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </td>

                  {/* Customer Info */}
                  <td className="px-4 py-3">
                    <div className="font-semibold text-white">{o.customerName}</div>
                    <div className="text-xs text-slate-400">{o.customerEmail}</div>
                    <div className="text-[11px] text-slate-500 truncate max-w-[200px]" title={o.shippingAddress}>
                      {o.shippingAddress}
                    </div>
                  </td>

                  {/* Purchased Items */}
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      {o.items.map((it, idx) => (
                        <div key={idx} className="text-xs text-slate-300 flex items-center justify-between gap-2">
                          <span className="font-medium truncate max-w-[180px]" title={it.productName}>
                            {it.productName}
                          </span>
                          <span className="text-slate-400 font-mono">
                            x{it.quantity} (${it.unitPrice.toFixed(2)})
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* Grand Total */}
                  <td className="px-4 py-3 text-right">
                    <div className="font-mono font-bold text-emerald-400 text-base">
                      ${o.grandTotal.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Tax: ${o.tax.toFixed(2)} | Ship: ${o.shipping.toFixed(2)}
                    </div>
                  </td>

                  {/* Fulfillment Status Select */}
                  <td className="px-4 py-3">
                    {o.status === 'Cancelled' ? (
                      getOrderStatusBadge('Cancelled')
                    ) : (
                      <div className="flex items-center space-x-2">
                        <select
                          value={o.status}
                          onChange={(e) => updateOrderStatus(o.id, e.target.value as OrderStatus)}
                          className="bg-slate-950 border border-slate-800 text-slate-200 text-xs px-2.5 py-1 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="Pending" className="bg-slate-900">
                            Pending
                          </option>
                          <option value="Processing" className="bg-slate-900">
                            Processing
                          </option>
                          <option value="Shipped" className="bg-slate-900">
                            Shipped
                          </option>
                          <option value="Delivered" className="bg-slate-900">
                            Delivered
                          </option>
                        </select>
                      </div>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <button
                        onClick={() => setSelectedOrderForInvoice(o)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 text-xs font-medium flex items-center space-x-1"
                        title="View & Print Order Invoice"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Invoice</span>
                      </button>

                      {o.status !== 'Cancelled' && o.status !== 'Delivered' && (
                        <button
                          onClick={() => {
                            if (confirm(`Cancel Order #${o.orderNumber}? Items will be restocked to inventory.`)) {
                              cancelCustomerOrder(o.id);
                            }
                          }}
                          className="p-1 bg-slate-800 hover:bg-rose-900/50 text-rose-400 rounded border border-slate-700 hover:border-rose-700"
                          title="Cancel Order & Restock Inventory"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Drawer Modal */}
      {selectedOrderForInvoice && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">INVOICE #{selectedOrderForInvoice.orderNumber}</h3>
                  <p className="text-xs text-slate-400">StockSync Operational Record</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrintInvoice}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center space-x-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Invoice</span>
                </button>
                <button
                  onClick={() => setSelectedOrderForInvoice(null)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Content */}
            <div className="printable-invoice space-y-6 text-slate-200">
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">CUSTOMER DETAILS</p>
                  <p className="font-bold text-white text-sm mt-1">{selectedOrderForInvoice.customerName}</p>
                  <p className="text-slate-400">{selectedOrderForInvoice.customerEmail}</p>
                  <p className="text-slate-400 mt-1">{selectedOrderForInvoice.shippingAddress}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">ORDER INFO</p>
                  <p className="text-slate-300 mt-1">
                    Date:{' '}
                    <span className="font-mono text-white">
                      {new Date(selectedOrderForInvoice.createdAt).toLocaleDateString()}
                    </span>
                  </p>
                  <p className="text-slate-300">
                    Status: <span className="font-bold text-indigo-400">{selectedOrderForInvoice.status}</span>
                  </p>
                  <p className="text-slate-300">
                    Payment: <span className="font-bold text-emerald-400">{selectedOrderForInvoice.paymentStatus}</span>
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-3">Item Description</th>
                      <th className="p-3 font-mono">SKU</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {selectedOrderForInvoice.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="p-3 font-semibold text-white">{it.productName}</td>
                        <td className="p-3 font-mono text-indigo-400">{it.sku}</td>
                        <td className="p-3 text-center font-bold text-white">{it.quantity}</td>
                        <td className="p-3 text-right font-mono">${it.unitPrice.toFixed(2)}</td>
                        <td className="p-3 text-right font-mono font-bold text-white">${it.totalPrice.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Breakdown */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal:</span>
                    <span className="font-mono text-slate-200">${selectedOrderForInvoice.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Tax (8%):</span>
                    <span className="font-mono text-slate-200">${selectedOrderForInvoice.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Shipping:</span>
                    <span className="font-mono text-slate-200">${selectedOrderForInvoice.shipping.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-sm text-white">
                    <span>Grand Total:</span>
                    <span className="font-mono text-emerald-400">${selectedOrderForInvoice.grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
