import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  Product,
  CustomerOrder,
  PurchaseOrder,
  StockMovementLog,
  ReorderTriggerLog,
  StockStatus,
  OrderStatus,
  POStatus,
  TriggerType,
  AIInsightData,
  ChatMessage,
  OrderItem,
} from '../types';
import {
  initialProducts,
  initialOrders,
  initialPurchaseOrders,
  initialMovementLogs,
  initialTriggerLogs,
} from '../data/mockData';

interface BusinessContextType {
  products: Product[];
  orders: CustomerOrder[];
  purchaseOrders: PurchaseOrder[];
  movementLogs: StockMovementLog[];
  triggerLogs: ReorderTriggerLog[];
  autoSimulate: boolean;
  autoReorderGlobalEnabled: boolean;
  aiInsights: AIInsightData | null;
  isGeneratingInsights: boolean;
  isFirebaseConnected: boolean;

  // Actions
  addProduct: (product: Omit<Product, 'id' | 'status'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (productId: string, delta: number, reason: string) => void;
  placeCustomerOrder: (orderData: {
    customerName: string;
    customerEmail: string;
    shippingAddress: string;
    items: { productId: string; quantity: number }[];
    notes?: string;
  }) => { success: boolean; message?: string; order?: CustomerOrder };
  updateOrderStatus: (orderId: string, status: OrderStatus, trackingNumber?: string) => void;
  cancelCustomerOrder: (orderId: string) => void;
  createPurchaseOrder: (productId: string, quantity?: number, triggeredBy?: TriggerType) => void;
  receivePurchaseOrder: (poId: string) => void;
  updatePOStatus: (poId: string, status: POStatus) => void;
  toggleGlobalAutoReorder: () => void;
  toggleProductAutoReorder: (productId: string) => void;
  toggleAutoSimulate: () => void;
  triggerAIInsights: () => Promise<void>;
  queryCopilot: (query: string, history: ChatMessage[]) => Promise<string>;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function calculateStockStatus(quantity: number, reorderPoint: number): StockStatus {
  if (quantity <= 0) return 'Out of Stock';
  if (quantity <= Math.ceil(reorderPoint * 0.5)) return 'Critical';
  if (quantity <= reorderPoint) return 'Low Stock';
  if (quantity >= reorderPoint * 4) return 'Overstocked';
  return 'In Stock';
}

export const BusinessProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState<CustomerOrder[]>(initialOrders);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(initialPurchaseOrders);
  const [movementLogs, setMovementLogs] = useState<StockMovementLog[]>(initialMovementLogs);
  const [triggerLogs, setTriggerLogs] = useState<ReorderTriggerLog[]>(initialTriggerLogs);

  const [autoSimulate, setAutoSimulate] = useState<boolean>(false);
  const [autoReorderGlobalEnabled, setAutoReorderGlobalEnabled] = useState<boolean>(true);
  const [aiInsights, setAiInsights] = useState<AIInsightData | null>(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState<boolean>(false);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);

  // Firestore Listeners & Initial Seeding
  useEffect(() => {
    let unsubscribeProducts: () => void;
    let unsubscribeOrders: () => void;
    let unsubscribePOs: () => void;
    let unsubscribeMovements: () => void;
    let unsubscribeTriggers: () => void;
    let unsubscribeSettings: () => void;

    const setupFirestore = async () => {
      try {
        // Check if products collection exists or needs initial seed
        const prodSnap = await getDocs(collection(db, 'products'));
        if (prodSnap.empty) {
          console.log('Seeding initial products into Firestore...');
          const batch = writeBatch(db);
          initialProducts.forEach((p) => {
            const pRef = doc(db, 'products', p.id);
            batch.set(pRef, p);
          });
          initialOrders.forEach((o) => {
            const oRef = doc(db, 'orders', o.id);
            batch.set(oRef, o);
          });
          initialPurchaseOrders.forEach((po) => {
            const poRef = doc(db, 'purchaseOrders', po.id);
            batch.set(poRef, po);
          });
          initialMovementLogs.forEach((m) => {
            const mRef = doc(db, 'movementLogs', m.id);
            batch.set(mRef, m);
          });
          initialTriggerLogs.forEach((t) => {
            const tRef = doc(db, 'triggerLogs', t.id);
            batch.set(tRef, t);
          });
          const settingsRef = doc(db, 'settings', 'global');
          batch.set(settingsRef, { autoReorderGlobalEnabled: true });

          await batch.commit();
        }

        setIsFirebaseConnected(true);

        // Real-time Listeners
        unsubscribeProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
          if (!snapshot.empty) {
            const list = snapshot.docs.map((d) => d.data() as Product);
            setProducts(list);
          }
        });

        unsubscribeOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
          if (!snapshot.empty) {
            const list = snapshot.docs.map((d) => d.data() as CustomerOrder);
            list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setOrders(list);
          }
        });

        unsubscribePOs = onSnapshot(collection(db, 'purchaseOrders'), (snapshot) => {
          if (!snapshot.empty) {
            const list = snapshot.docs.map((d) => d.data() as PurchaseOrder);
            list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setPurchaseOrders(list);
          }
        });

        unsubscribeMovements = onSnapshot(collection(db, 'movementLogs'), (snapshot) => {
          if (!snapshot.empty) {
            const list = snapshot.docs.map((d) => d.data() as StockMovementLog);
            list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            setMovementLogs(list);
          }
        });

        unsubscribeTriggers = onSnapshot(collection(db, 'triggerLogs'), (snapshot) => {
          if (!snapshot.empty) {
            const list = snapshot.docs.map((d) => d.data() as ReorderTriggerLog);
            list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            setTriggerLogs(list);
          }
        });

        unsubscribeSettings = onSnapshot(doc(db, 'settings', 'global'), (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            if (data && typeof data.autoReorderGlobalEnabled === 'boolean') {
              setAutoReorderGlobalEnabled(data.autoReorderGlobalEnabled);
            }
          }
        });
      } catch (err) {
        console.error('Firestore initialization error:', err);
      }
    };

    setupFirestore();

    return () => {
      if (unsubscribeProducts) unsubscribeProducts();
      if (unsubscribeOrders) unsubscribeOrders();
      if (unsubscribePOs) unsubscribePOs();
      if (unsubscribeMovements) unsubscribeMovements();
      if (unsubscribeTriggers) unsubscribeTriggers();
      if (unsubscribeSettings) unsubscribeSettings();
    };
  }, []);

  // Helper to add movement log
  const logMovement = useCallback(async (
    productId: string,
    productName: string,
    type: StockMovementLog['type'],
    delta: number,
    prevQty: number,
    newQty: number,
    reference: string
  ) => {
    const newLog: StockMovementLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      productId,
      productName,
      type,
      quantityDelta: delta,
      previousQuantity: prevQty,
      newQuantity: newQty,
      reference,
      timestamp: new Date().toISOString(),
    };
    setMovementLogs((prev) => [newLog, ...prev]);
    try {
      await setDoc(doc(db, 'movementLogs', newLog.id), newLog);
    } catch (e) {
      console.error('Error logging movement to Firestore:', e);
    }
  }, []);

  // Check reorder triggers for a product
  const checkAndTriggerReorder = useCallback(async (
    product: Product,
    currentStock: number,
    currentPOs: PurchaseOrder[]
  ) => {
    if (!autoReorderGlobalEnabled || !product.autoReorderEnabled) return;
    if (currentStock > product.reorderPoint) return;

    // Check if an active open PO already exists
    const hasOpenPO = currentPOs.some(
      (po) => po.productId === product.id && (po.status === 'Ordered' || po.status === 'Pending Approval' || po.status === 'In Transit')
    );

    if (hasOpenPO) return;

    // Trigger Automated Purchase Order!
    const newPONumber = `PO-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const deliveryDate = new Date(now.setDate(now.getDate() + (product.leadTimeDays || 4))).toISOString().split('T')[0];

    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber: newPONumber,
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      supplierName: product.supplierName,
      supplierEmail: product.supplierEmail,
      quantity: product.reorderQuantity,
      unitCost: product.costPrice,
      totalCost: product.costPrice * product.reorderQuantity,
      triggeredBy: 'Automated Threshold',
      status: 'Ordered',
      createdAt: new Date().toISOString(),
      expectedDeliveryDate: deliveryDate,
    };

    setPurchaseOrders((prev) => [newPO, ...prev]);
    try {
      await setDoc(doc(db, 'purchaseOrders', newPO.id), newPO);
    } catch (e) {
      console.error('Error saving PO to Firestore:', e);
    }

    const triggerLog: ReorderTriggerLog = {
      id: `trig-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      triggerStockLevel: currentStock,
      thresholdPoint: product.reorderPoint,
      poNumber: newPONumber,
      quantityOrdered: product.reorderQuantity,
      timestamp: new Date().toISOString(),
    };

    setTriggerLogs((prev) => [triggerLog, ...prev]);
    try {
      await setDoc(doc(db, 'triggerLogs', triggerLog.id), triggerLog);
    } catch (e) {
      console.error('Error saving trigger log to Firestore:', e);
    }
  }, [autoReorderGlobalEnabled]);

  // Adjust Stock
  const adjustStock = useCallback(async (productId: string, delta: number, reason: string) => {
    let updatedProduct: Product | null = null;
    const prevProducts = [...products];

    const nextProducts = prevProducts.map((p) => {
      if (p.id === productId) {
        const newQty = Math.max(0, p.stockQuantity + delta);
        const newStatus = calculateStockStatus(newQty, p.reorderPoint);
        updatedProduct = {
          ...p,
          stockQuantity: newQty,
          status: newStatus,
        };

        logMovement(
          p.id,
          p.name,
          delta > 0 ? 'Purchase Restock' : 'Manual Adjustment',
          delta,
          p.stockQuantity,
          newQty,
          reason
        );

        return updatedProduct;
      }
      return p;
    });

    setProducts(nextProducts);

    if (updatedProduct) {
      try {
        await setDoc(doc(db, 'products', productId), updatedProduct);
      } catch (e) {
        console.error('Firestore stock update error:', e);
      }
      checkAndTriggerReorder(updatedProduct, (updatedProduct as Product).stockQuantity, purchaseOrders);
    }
  }, [products, purchaseOrders, logMovement, checkAndTriggerReorder]);

  // Add Product
  const addProduct = useCallback(async (productData: Omit<Product, 'id' | 'status'>) => {
    const status = calculateStockStatus(productData.stockQuantity, productData.reorderPoint);
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      status,
    };
    setProducts((prev) => [newProduct, ...prev]);
    try {
      await setDoc(doc(db, 'products', newProduct.id), newProduct);
    } catch (e) {
      console.error('Error adding product to Firestore:', e);
    }
  }, []);

  // Update Product
  const updateProduct = useCallback(async (id: string, updates: Partial<Product>) => {
    let updatedProd: Product | null = null;
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newQty = updates.stockQuantity !== undefined ? updates.stockQuantity : p.stockQuantity;
          const reorderPt = updates.reorderPoint !== undefined ? updates.reorderPoint : p.reorderPoint;
          const status = calculateStockStatus(newQty, reorderPt);
          updatedProd = {
            ...p,
            ...updates,
            status,
          };
          return updatedProd;
        }
        return p;
      })
    );

    if (updatedProd) {
      try {
        await updateDoc(doc(db, 'products', id), updates);
      } catch (e) {
        console.error('Error updating product in Firestore:', e);
      }
    }
  }, []);

  // Delete Product
  const deleteProduct = useCallback(async (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (e) {
      console.error('Error deleting product from Firestore:', e);
    }
  }, []);

  // Place Customer Order
  const placeCustomerOrder = useCallback((orderData: {
    customerName: string;
    customerEmail: string;
    shippingAddress: string;
    items: { productId: string; quantity: number }[];
    notes?: string;
  }) => {
    const itemDetails: OrderItem[] = [];
    let subtotal = 0;
    const stockErrors: string[] = [];

    for (const item of orderData.items) {
      const prod = products.find((p) => p.id === item.productId);
      if (!prod) {
        stockErrors.push(`Product ID ${item.productId} not found.`);
        continue;
      }
      const available = prod.stockQuantity - prod.reservedQuantity;
      if (available < item.quantity) {
        stockErrors.push(`Insufficient stock for ${prod.name} (Available: ${available}, Requested: ${item.quantity}).`);
      } else {
        const itemTotal = prod.sellingPrice * item.quantity;
        subtotal += itemTotal;
        itemDetails.push({
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          quantity: item.quantity,
          unitPrice: prod.sellingPrice,
          totalPrice: itemTotal,
        });
      }
    }

    if (stockErrors.length > 0) {
      return { success: false, message: stockErrors.join(' ') };
    }

    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const shipping = subtotal > 200 ? 0 : 15.0;
    const grandTotal = subtotal + tax + shipping;

    const orderNum = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: CustomerOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      items: itemDetails,
      totalAmount: subtotal,
      tax,
      shipping,
      grandTotal,
      status: 'Pending',
      paymentStatus: 'Paid',
      createdAt: new Date().toISOString(),
      shippingAddress: orderData.shippingAddress,
      notes: orderData.notes,
    };

    // Save Order to Firestore
    setDoc(doc(db, 'orders', newOrder.id), newOrder).catch((e) =>
      console.error('Error writing order to Firestore:', e)
    );

    // Deduct stock and reserve
    const updatedProductsList = products.map((p) => {
      const orderedItem = itemDetails.find((it) => it.productId === p.id);
      if (orderedItem) {
        const newQty = p.stockQuantity - orderedItem.quantity;
        const newStatus = calculateStockStatus(newQty, p.reorderPoint);
        const updated = {
          ...p,
          stockQuantity: newQty,
          status: newStatus,
        };

        logMovement(
          p.id,
          p.name,
          'Sale',
          -orderedItem.quantity,
          p.stockQuantity,
          newQty,
          `Order #${orderNum}`
        );

        setDoc(doc(db, 'products', p.id), updated).catch((e) =>
          console.error('Error updating product in Firestore:', e)
        );

        return updated;
      }
      return p;
    });

    setProducts(updatedProductsList);
    setOrders((prev) => [newOrder, ...prev]);

    // Trigger reorders
    updatedProductsList.forEach((prod) => {
      const orderedItem = itemDetails.find((it) => it.productId === prod.id);
      if (orderedItem) {
        checkAndTriggerReorder(prod, prod.stockQuantity, purchaseOrders);
      }
    });

    return { success: true, order: newOrder };
  }, [products, purchaseOrders, logMovement, checkAndTriggerReorder]);

  // Update Order Status
  const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus, trackingNumber?: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status,
            trackingNumber: trackingNumber || o.trackingNumber,
          };
        }
        return o;
      })
    );

    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status,
        ...(trackingNumber ? { trackingNumber } : {}),
      });
    } catch (e) {
      console.error('Error updating order status in Firestore:', e);
    }
  }, []);

  // Cancel Customer Order
  const cancelCustomerOrder = useCallback(async (orderId: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder || targetOrder.status === 'Cancelled') return;

    // Restore stock
    targetOrder.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      if (prod) {
        const newQty = prod.stockQuantity + item.quantity;
        const newStatus = calculateStockStatus(newQty, prod.reorderPoint);
        const updatedProd = {
          ...prod,
          stockQuantity: newQty,
          status: newStatus,
        };

        logMovement(
          prod.id,
          prod.name,
          'Order Cancellation',
          item.quantity,
          prod.stockQuantity,
          newQty,
          `Cancelled Order #${targetOrder.orderNumber}`
        );

        setDoc(doc(db, 'products', prod.id), updatedProd).catch((e) =>
          console.error('Firestore restore stock error:', e)
        );
      }
    });

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'Cancelled', paymentStatus: 'Refunded' } : o))
    );

    try {
      await updateDoc(doc(db, 'orders', orderId), { status: 'Cancelled', paymentStatus: 'Refunded' });
    } catch (e) {
      console.error('Firestore cancel order error:', e);
    }
  }, [orders, products, logMovement]);

  // Create Purchase Order (Manual)
  const createPurchaseOrder = useCallback(async (productId: string, quantity?: number, triggeredBy: TriggerType = 'Manual Reorder') => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const qty = quantity || prod.reorderQuantity;
    const poNum = `PO-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const deliveryDate = new Date(now.setDate(now.getDate() + (prod.leadTimeDays || 4))).toISOString().split('T')[0];

    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber: poNum,
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      supplierName: prod.supplierName,
      supplierEmail: prod.supplierEmail,
      quantity: qty,
      unitCost: prod.costPrice,
      totalCost: prod.costPrice * qty,
      triggeredBy,
      status: 'Ordered',
      createdAt: new Date().toISOString(),
      expectedDeliveryDate: deliveryDate,
    };

    setPurchaseOrders((prev) => [newPO, ...prev]);
    try {
      await setDoc(doc(db, 'purchaseOrders', newPO.id), newPO);
    } catch (e) {
      console.error('Firestore save PO error:', e);
    }
  }, [products]);

  // Receive Purchase Order (Restock inventory!)
  const receivePurchaseOrder = useCallback(async (poId: string) => {
    const targetPO = purchaseOrders.find((po) => po.id === poId);
    if (!targetPO || targetPO.status === 'Received') return;

    // Update product stock
    const targetProd = products.find((p) => p.id === targetPO.productId);
    if (targetProd) {
      const newQty = targetProd.stockQuantity + targetPO.quantity;
      const newStatus = calculateStockStatus(newQty, targetProd.reorderPoint);
      const updatedProd = {
        ...targetProd,
        stockQuantity: newQty,
        lastRestocked: new Date().toISOString().split('T')[0],
        status: newStatus,
      };

      logMovement(
        targetProd.id,
        targetProd.name,
        'Purchase Restock',
        targetPO.quantity,
        targetProd.stockQuantity,
        newQty,
        `Received Shipment #${targetPO.poNumber}`
      );

      try {
        await setDoc(doc(db, 'products', targetProd.id), updatedProd);
      } catch (e) {
        console.error('Firestore update restock error:', e);
      }
    }

    setPurchaseOrders((prev) =>
      prev.map((po) => (po.id === poId ? { ...po, status: 'Received' } : po))
    );

    try {
      await updateDoc(doc(db, 'purchaseOrders', poId), { status: 'Received' });
    } catch (e) {
      console.error('Firestore update PO status error:', e);
    }
  }, [purchaseOrders, products, logMovement]);

  // Update PO Status
  const updatePOStatus = useCallback((poId: string, status: POStatus) => {
    if (status === 'Received') {
      receivePurchaseOrder(poId);
    } else {
      setPurchaseOrders((prev) => prev.map((po) => (po.id === poId ? { ...po, status } : po)));
      updateDoc(doc(db, 'purchaseOrders', poId), { status }).catch((e) =>
        console.error('Firestore PO status update error:', e)
      );
    }
  }, [receivePurchaseOrder]);

  const toggleGlobalAutoReorder = useCallback(async () => {
    const nextVal = !autoReorderGlobalEnabled;
    setAutoReorderGlobalEnabled(nextVal);
    try {
      await setDoc(doc(db, 'settings', 'global'), { autoReorderGlobalEnabled: nextVal }, { merge: true });
    } catch (e) {
      console.error('Firestore settings update error:', e);
    }
  }, [autoReorderGlobalEnabled]);

  const toggleProductAutoReorder = useCallback(async (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    const nextVal = !prod.autoReorderEnabled;

    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, autoReorderEnabled: nextVal } : p))
    );

    try {
      await updateDoc(doc(db, 'products', productId), { autoReorderEnabled: nextVal });
    } catch (e) {
      console.error('Firestore toggle product auto reorder error:', e);
    }
  }, [products]);

  const toggleAutoSimulate = useCallback(() => {
    setAutoSimulate((prev) => !prev);
  }, []);

  // Trigger AI Insights
  const triggerAIInsights = useCallback(async () => {
    setIsGeneratingInsights(true);
    try {
      const totalItems = products.length;
      const totalValuation = Math.round(products.reduce((acc, p) => acc + p.stockQuantity * p.costPrice, 0));
      const lowStockCount = products.filter((p) => p.status === 'Low Stock' || p.status === 'Critical' || p.status === 'Out of Stock').length;
      const totalRevenue = Math.round(orders.reduce((acc, o) => acc + (o.status !== 'Cancelled' ? o.grandTotal : 0), 0));
      const totalOrders = orders.length;

      const res = await fetch('/api/gemini/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inventory: products,
          orders,
          purchaseOrders,
          metrics: { totalItems, totalValuation, lowStockCount, totalRevenue, totalOrders },
        }),
      });

      const data = await res.json();
      if (data.success && data.insights) {
        setAiInsights(data.insights);
      }
    } catch (e) {
      console.error('Failed to trigger AI insights:', e);
    } finally {
      setIsGeneratingInsights(false);
    }
  }, [products, orders, purchaseOrders]);

  // Query Copilot
  const queryCopilot = useCallback(async (query: string, history: ChatMessage[]): Promise<string> => {
    try {
      const totalItems = products.length;
      const totalValuation = Math.round(products.reduce((acc, p) => acc + p.stockQuantity * p.costPrice, 0));
      const lowStockCount = products.filter((p) => p.status === 'Low Stock' || p.status === 'Critical' || p.status === 'Out of Stock').length;
      const totalRevenue = Math.round(orders.reduce((acc, o) => acc + (o.status !== 'Cancelled' ? o.grandTotal : 0), 0));
      const totalOrders = orders.length;

      const res = await fetch('/api/gemini/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          chatHistory: history,
          inventory: products,
          orders,
          metrics: { totalItems, totalValuation, lowStockCount, totalRevenue, totalOrders },
        }),
      });

      const data = await res.json();
      if (data.success && data.answer) {
        return data.answer;
      }
      return 'Sorry, I could not process your query at this moment.';
    } catch (e: any) {
      return `Error communicating with AI Copilot: ${e.message}`;
    }
  }, [products, orders]);

  // Auto order simulation effect
  useEffect(() => {
    if (!autoSimulate) return;

    const interval = setInterval(() => {
      const availableProducts = products.filter((p) => p.stockQuantity > 0);
      if (availableProducts.length === 0) return;

      const randomProd = availableProducts[Math.floor(Math.random() * availableProducts.length)];
      const qty = Math.min(randomProd.stockQuantity, Math.floor(Math.random() * 2) + 1);

      const customerNames = ['Vanguard Logistics', 'Starlight Tech', 'Horizon Media Group', 'Quantum Solutions', 'Krypton Labs'];
      const randomCustomer = customerNames[Math.floor(Math.random() * customerNames.length)];

      placeCustomerOrder({
        customerName: randomCustomer,
        customerEmail: `order@${randomCustomer.toLowerCase().replace(/\s+/g, '')}.com`,
        shippingAddress: '100 Enterprise Way, Technology Park, NY 10001',
        items: [{ productId: randomProd.id, quantity: qty }],
        notes: 'Simulated real-time automated customer order',
      });
    }, 14000);

    return () => clearInterval(interval);
  }, [autoSimulate, products, placeCustomerOrder]);

  return (
    <BusinessContext.Provider
      value={{
        products,
        orders,
        purchaseOrders,
        movementLogs,
        triggerLogs,
        autoSimulate,
        autoReorderGlobalEnabled,
        aiInsights,
        isGeneratingInsights,
        isFirebaseConnected,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        placeCustomerOrder,
        updateOrderStatus,
        cancelCustomerOrder,
        createPurchaseOrder,
        receivePurchaseOrder,
        updatePOStatus,
        toggleGlobalAutoReorder,
        toggleProductAutoReorder,
        toggleAutoSimulate,
        triggerAIInsights,
        queryCopilot,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
};
