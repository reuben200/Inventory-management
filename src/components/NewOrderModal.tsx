import React, { useState } from 'react';
import { useBusiness } from '../context/BusinessContext';
import { ShoppingCart, Plus, Trash2, AlertCircle } from 'lucide-react';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({ isOpen, onClose }) => {
  const { products, placeCustomerOrder } = useBusiness();

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes] = useState('');

  const [orderItems, setOrderItems] = useState<Array<{ productId: string; quantity: number }>>([
    { productId: products[0]?.id || '', quantity: 1 },
  ]);

  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleAddItemRow = () => {
    setOrderItems([...orderItems, { productId: products[0]?.id || '', quantity: 1 }]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (orderItems.length === 1) return;
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: 'productId' | 'quantity', value: any) => {
    const updated = [...orderItems];
    updated[index] = { ...updated[index], [field]: value };
    setOrderItems(updated);
  };

  // Calculate Subtotal
  const subtotal = orderItems.reduce((sum, item) => {
    const prod = products.find((p) => p.id === item.productId);
    return sum + (prod ? prod.sellingPrice * item.quantity : 0);
  }, 0);

  const tax = subtotal * 0.08;
  const shipping = subtotal > 200 ? 0 : 15;
  const grandTotal = subtotal + tax + shipping;

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName || !customerEmail || !shippingAddress) {
      setErrorMessage('Please fill in customer name, email, and shipping address.');
      return;
    }

    const res = placeCustomerOrder({
      customerName,
      customerEmail,
      shippingAddress,
      items: orderItems,
      notes,
    });

    if (res.success) {
      onClose();
    } else {
      setErrorMessage(res.message || 'Failed to place customer order.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white text-base">Process New Customer Order</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            ✕
          </button>
        </div>

        {errorMessage && (
          <div className="bg-rose-950/50 border border-rose-800 text-rose-300 p-3 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="space-y-4 text-xs">
          {/* Customer Details */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Customer Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Apex Innovations LLC"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-lg focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Customer Email *</label>
              <input
                type="email"
                required
                placeholder="e.g. orders@apexinnovations.io"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-lg focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Shipping Address *</label>
            <input
              type="text"
              required
              placeholder="e.g. 450 Innovation Way, Austin, TX 78701"
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white p-2 rounded-lg focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Line Items */}
          <div className="space-y-2 border-t border-slate-800 pt-3">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                Order Line Items
              </label>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Product</span>
              </button>
            </div>

            {orderItems.map((item, idx) => {
              const selectedProd = products.find((p) => p.id === item.productId);
              const available = selectedProd ? selectedProd.stockQuantity - selectedProd.reservedQuantity : 0;

              return (
                <div key={idx} className="flex items-center space-x-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                  <select
                    value={item.productId}
                    onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 text-white p-2 rounded-lg"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id} className="bg-slate-900">
                        {p.name} (${p.sellingPrice.toFixed(2)}) — Stock: {p.stockQuantity}
                      </option>
                    ))}
                  </select>

                  <div className="w-20">
                    <input
                      type="number"
                      min={1}
                      max={available || 1}
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-full bg-slate-900 border border-slate-800 text-white font-mono text-center p-2 rounded-lg"
                    />
                  </div>

                  <span className="w-20 text-right font-mono text-emerald-400 font-bold">
                    ${((selectedProd?.sellingPrice || 0) * item.quantity).toFixed(2)}
                  </span>

                  {orderItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItemRow(idx)}
                      className="text-rose-400 hover:text-rose-300 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Totals Summary */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 text-slate-300">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-mono">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Estimated Tax (8%):</span>
              <span className="font-mono">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Shipping Fee:</span>
              <span className="font-mono">${shipping.toFixed(2)}</span>
            </div>
            <div className="border-t border-slate-800 pt-1 flex justify-between font-bold text-white text-sm">
              <span>Grand Total:</span>
              <span className="font-mono text-emerald-400">${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl font-semibold shadow-md shadow-indigo-600/20 transition-all"
            >
              Confirm & Deduct Inventory
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
