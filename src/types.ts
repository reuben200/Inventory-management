export type StockStatus = 'In Stock' | 'Low Stock' | 'Critical' | 'Out of Stock' | 'Overstocked';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  stockQuantity: number;
  reservedQuantity: number;
  reorderPoint: number;
  reorderQuantity: number;
  costPrice: number;
  sellingPrice: number;
  supplierName: string;
  supplierEmail: string;
  leadTimeDays: number;
  location: string;
  lastRestocked: string;
  status: StockStatus;
  autoReorderEnabled: boolean;
  imageUrl?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
export type PaymentStatus = 'Paid' | 'Unpaid' | 'Refunded';

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  totalAmount: number;
  tax: number;
  shipping: number;
  grandTotal: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  shippingAddress: string;
  trackingNumber?: string;
  notes?: string;
}

export type POStatus = 'Pending Approval' | 'Ordered' | 'In Transit' | 'Received' | 'Cancelled';
export type TriggerType = 'Automated Threshold' | 'Manual Reorder' | 'AI Reorder Recommendation';

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  productId: string;
  productName: string;
  sku: string;
  supplierName: string;
  supplierEmail: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  triggeredBy: TriggerType;
  status: POStatus;
  createdAt: string;
  expectedDeliveryDate: string;
}

export interface StockMovementLog {
  id: string;
  productId: string;
  productName: string;
  type: 'Sale' | 'Purchase Restock' | 'Manual Adjustment' | 'Order Cancellation' | 'Reserved';
  quantityDelta: number;
  previousQuantity: number;
  newQuantity: number;
  reference: string;
  timestamp: string;
}

export interface ReorderTriggerLog {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  triggerStockLevel: number;
  thresholdPoint: number;
  poNumber: string;
  quantityOrdered: number;
  timestamp: string;
}

export interface AIInsightData {
  healthScore: number;
  executiveSummary: string;
  topAlerts: Array<{
    type: 'critical' | 'warning' | 'opportunity';
    title: string;
    description: string;
  }>;
  stockOptimizations: Array<{
    sku: string;
    productName: string;
    suggestion: string;
    impact: 'High' | 'Medium' | 'Low';
  }>;
  demandForecast: string;
  actionableSteps: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export type ActiveTab = 'inventory' | 'orders' | 'reorder' | 'analytics' | 'logs';
