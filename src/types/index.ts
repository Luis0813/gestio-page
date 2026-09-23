export type BusinessDomain = 'ropa' | 'empanadas' | 'ferreteria' | 'custom';

export type FinancialPeriod = 'semanal' | 'quincenal' | 'mensual' | 'todo';

export interface DynamicAttributeField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'date';
  options?: string[]; // for select type
  required?: boolean;
}

export interface RawMaterialRecipeItem {
  rawMaterialId: string;
  quantityNeeded: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  businessDomain: BusinessDomain;
  stock: number;
  minStockAlert: number;
  costPrice: number; // Purchased cost or calculated from raw materials
  salePrice: number;
  unit: string; // e.g. 'Unidad', 'Kg', 'Metro', 'Par', 'Docena'
  customAttributes: Record<string, string | number | boolean>;
  rawMaterialRecipe?: RawMaterialRecipeItem[];
  imageUrl?: string;
}

export interface RawMaterial {
  id: string;
  name: string;
  unit: string; // e.g. 'Kg', 'Litros', 'Unidades', 'Gramos'
  currentStock: number;
  costPerUnit: number;
  supplier: string;
  minStockAlert: number;
  lastRestockDate: string;
}

export interface Expense {
  id: string;
  description: string;
  category: 'Alquiler' | 'Servicios' | 'Mantenimiento' | 'Marketing' | 'Herramientas' | 'Impuestos' | 'Otros';
  amount: number;
  date: string; // YYYY-MM-DD
  periodicity: 'Único' | 'Semanal' | 'Quincenal' | 'Mensual';
}

export interface WorkerPayroll {
  id: string;
  workerName: string;
  role: string; // e.g. 'Obrero de Producción', 'Cocinero', 'Vendedor', 'Supervisor'
  paymentType: 'Fijo Mensual' | 'Fijo Quincenal' | 'Por Hora' | 'Por Obra / Destajo';
  baseRate: number; // Monthly base or rate per hour/unit
  quantityOrHoursCompleted: number; // e.g. 100 empanadas made, 40 hours worked, or 1 for fixed
  totalPaid: number;
  paymentDate: string; // YYYY-MM-DD
  status: 'Pagado' | 'Pendiente';
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  notes?: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'Venta' | 'Compra Insumos' | 'Ajuste Stock' | 'Merma / Pérdida';
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  date: string; // YYYY-MM-DD
  customerId?: string;
  customerName?: string;
  notes?: string;
}

export interface FinancialBalanceSummary {
  period: FinancialPeriod;
  totalSalesRevenue: number;
  totalRawMaterialInvestment: number;
  totalPayrollExpenses: number;
  totalOperatingExpenses: number;
  totalCosts: number;
  netProfit: number;
  profitMarginPercent: number;
  totalUnitsSold: number;
}
