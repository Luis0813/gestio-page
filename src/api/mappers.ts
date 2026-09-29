/**
 * Mappers for converting between Rails API (snake_case, number ids)
 * and React frontend (camelCase, string ids).
 * These are pure functions with no side effects.
 */

import type {
    Product,
    RawMaterial,
    Expense,
    WorkerPayroll,
    Customer,
    StockMovement,
    RawMaterialRecipeItem,
    BusinessDomain,
} from '../types';

/* ------------------------------------------------------------------ */
/* Coercion helpers                                                    */
/* ------------------------------------------------------------------ */

/**
 * Rails may hand back a decimal as a JSON string ("3.0") depending on the
 * encoder used. The UI calls methods such as `toFixed(2)` on these values, so
 * every numeric field is coerced here to guarantee a real `number`.
 */
function num(value: unknown): number {
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

function str(value: unknown, fallback = ''): string {
    return typeof value === 'string' ? value : value == null ? fallback : String(value);
}

/* ------------------------------------------------------------------ */
/* Recipe item mappers (special case: nested array in Product)        */
/* ------------------------------------------------------------------ */

export interface SnakeRecipeItem {
    raw_material_id: number;
    quantity_needed: number;
}

export function toCamelRecipe(items: SnakeRecipeItem[] | null | undefined): RawMaterialRecipeItem[] | undefined {
    if (!items || items.length === 0) return undefined;
    return items.map((item) => ({
        rawMaterialId: String(item.raw_material_id),
        quantityNeeded: item.quantity_needed,
    }));
}

export function toSnakeRecipe(items: RawMaterialRecipeItem[] | undefined): SnakeRecipeItem[] | null {
    if (!items || items.length === 0) return null;
    return items.map((item) => ({
        raw_material_id: Number(item.rawMaterialId),
        quantity_needed: item.quantityNeeded,
    }));
}

/* ------------------------------------------------------------------ */
/* Product mappers                                                    */
/* ------------------------------------------------------------------ */

export interface SnakeProduct {
    id: number;
    user_id: number;
    name: string;
    sku: string;
    category: string;
    business_domain: BusinessDomain;
    stock: number;
    min_stock_alert: number;
    cost_price: number;
    sale_price: number;
    unit: string;
    custom_attributes: Record<string, string | number | boolean>;
    raw_material_recipe: SnakeRecipeItem[] | null;
    image_url: string | null;
    created_at: string;
    updated_at: string;
}

export function toProduct(api: SnakeProduct): Product {
    return {
        id: String(api.id),
        name: str(api.name),
        sku: str(api.sku, 'SIN-SKU'),
        category: str(api.category, 'General'),
        businessDomain: api.business_domain,
        stock: num(api.stock),
        minStockAlert: num(api.min_stock_alert),
        costPrice: num(api.cost_price),
        salePrice: num(api.sale_price),
        unit: str(api.unit, 'Unidad'),
        customAttributes: api.custom_attributes ?? {},
        rawMaterialRecipe: toCamelRecipe(api.raw_material_recipe),
        imageUrl: api.image_url ?? undefined,
    };
}

export function toSnakeProduct(product: Omit<Product, 'id'>): Omit<SnakeProduct, 'id' | 'user_id' | 'created_at' | 'updated_at'> {
    return {
        name: product.name,
        sku: product.sku,
        category: product.category,
        business_domain: product.businessDomain,
        stock: product.stock,
        min_stock_alert: product.minStockAlert,
        cost_price: product.costPrice,
        sale_price: product.salePrice,
        unit: product.unit,
        custom_attributes: product.customAttributes,
        raw_material_recipe: toSnakeRecipe(product.rawMaterialRecipe),
        image_url: product.imageUrl ?? null,
    };
}

export function toSnakeProductUpdate(product: Product): Omit<SnakeProduct, 'user_id' | 'created_at' | 'updated_at'> {
    return {
        id: Number(product.id),
        ...toSnakeProduct(product),
    };
}

/* ------------------------------------------------------------------ */
/* RawMaterial mappers                                                */
/* ------------------------------------------------------------------ */

export interface SnakeRawMaterial {
    id: number;
    user_id: number;
    name: string;
    unit: string;
    current_stock: number;
    cost_per_unit: number;
    supplier: string;
    min_stock_alert: number;
    last_restock_date: string;
    created_at: string;
    updated_at: string;
}

export function toRawMaterial(api: SnakeRawMaterial): RawMaterial {
    return {
        id: String(api.id),
        name: str(api.name),
        unit: str(api.unit, 'Unidad'),
        currentStock: num(api.current_stock),
        costPerUnit: num(api.cost_per_unit),
        supplier: str(api.supplier),
        minStockAlert: num(api.min_stock_alert),
        lastRestockDate: api.last_restock_date,
    };
}

export function toSnakeRawMaterial(rawMaterial: Omit<RawMaterial, 'id'>): Omit<SnakeRawMaterial, 'id' | 'user_id' | 'created_at' | 'updated_at'> {
    return {
        name: rawMaterial.name,
        unit: rawMaterial.unit,
        current_stock: rawMaterial.currentStock,
        cost_per_unit: rawMaterial.costPerUnit,
        supplier: rawMaterial.supplier,
        min_stock_alert: rawMaterial.minStockAlert,
        last_restock_date: rawMaterial.lastRestockDate,
    };
}

export function toSnakeRawMaterialUpdate(rawMaterial: RawMaterial): Omit<SnakeRawMaterial, 'user_id' | 'created_at' | 'updated_at'> {
    return {
        id: Number(rawMaterial.id),
        ...toSnakeRawMaterial(rawMaterial),
    };
}

/* ------------------------------------------------------------------ */
/* Expense mappers                                                    */
/* ------------------------------------------------------------------ */

export interface SnakeExpense {
    id: number;
    user_id: number;
    description: string;
    category: 'Alquiler' | 'Servicios' | 'Mantenimiento' | 'Marketing' | 'Herramientas' | 'Impuestos' | 'Otros';
    amount: number;
    date: string;
    periodicity: 'Único' | 'Semanal' | 'Quincenal' | 'Mensual';
    created_at: string;
    updated_at: string;
}

export function toExpense(api: SnakeExpense): Expense {
    return {
        id: String(api.id),
        description: api.description,
        category: api.category,
        amount: num(api.amount),
        date: api.date,
        periodicity: api.periodicity,
    };
}

export function toSnakeExpense(expense: Omit<Expense, 'id'>): Omit<SnakeExpense, 'id' | 'user_id' | 'created_at' | 'updated_at'> {
    return {
        description: expense.description,
        category: expense.category,
        amount: expense.amount,
        date: expense.date,
        periodicity: expense.periodicity,
    };
}

export function toSnakeExpenseUpdate(expense: Expense): Omit<SnakeExpense, 'user_id' | 'created_at' | 'updated_at'> {
    return {
        id: Number(expense.id),
        ...toSnakeExpense(expense),
    };
}

/* ------------------------------------------------------------------ */
/* WorkerPayroll mappers                                              */
/* ------------------------------------------------------------------ */

export interface SnakePayrollEntry {
    id: number;
    user_id: number;
    worker_name: string;
    role: string;
    payment_type: 'Fijo Mensual' | 'Fijo Quincenal' | 'Por Hora' | 'Por Obra / Destajo';
    base_rate: number;
    quantity_or_hours_completed: number;
    total_paid: number;
    payment_date: string;
    status: 'Pagado' | 'Pendiente';
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export function toWorkerPayroll(api: SnakePayrollEntry): WorkerPayroll {
    return {
        id: String(api.id),
        workerName: api.worker_name,
        role: api.role,
        paymentType: api.payment_type,
        baseRate: num(api.base_rate),
        quantityOrHoursCompleted: num(api.quantity_or_hours_completed),
        totalPaid: num(api.total_paid),
        paymentDate: api.payment_date,
        status: api.status,
        notes: api.notes ?? undefined,
    };
}

export function toSnakePayrollEntry(payroll: Omit<WorkerPayroll, 'id'>): Omit<SnakePayrollEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'> {
    return {
        worker_name: payroll.workerName,
        role: payroll.role,
        payment_type: payroll.paymentType,
        base_rate: payroll.baseRate,
        quantity_or_hours_completed: payroll.quantityOrHoursCompleted,
        total_paid: payroll.totalPaid,
        payment_date: payroll.paymentDate,
        status: payroll.status,
        notes: payroll.notes ?? null,
    };
}

export function toSnakePayrollEntryUpdate(payroll: WorkerPayroll): Omit<SnakePayrollEntry, 'user_id' | 'created_at' | 'updated_at'> {
    return {
        id: Number(payroll.id),
        ...toSnakePayrollEntry(payroll),
    };
}

/* ------------------------------------------------------------------ */
/* Customer mappers                                                   */
/* ------------------------------------------------------------------ */

export interface SnakeCustomer {
    id: number;
    user_id: number;
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    total_orders: number;
    total_spent: number;
    last_order_date: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export function toCustomer(api: SnakeCustomer): Customer {
    return {
        id: String(api.id),
        name: str(api.name),
        phone: api.phone ?? undefined,
        email: api.email ?? undefined,
        address: api.address ?? undefined,
        totalOrders: num(api.total_orders),
        totalSpent: num(api.total_spent),
        lastOrderDate: api.last_order_date ?? '',
        notes: api.notes ?? undefined,
    };
}

export function toSnakeCustomer(customer: Omit<Customer, 'id'>): Omit<SnakeCustomer, 'id' | 'user_id' | 'created_at' | 'updated_at'> {
    return {
        name: customer.name,
        phone: customer.phone ?? null,
        email: customer.email ?? null,
        address: customer.address ?? null,
        total_orders: customer.totalOrders,
        total_spent: customer.totalSpent,
        last_order_date: customer.lastOrderDate || null,
        notes: customer.notes ?? null,
    };
}

export function toSnakeCustomerUpdate(customer: Customer): Omit<SnakeCustomer, 'user_id' | 'created_at' | 'updated_at'> {
    return {
        id: Number(customer.id),
        ...toSnakeCustomer(customer),
    };
}

/* ------------------------------------------------------------------ */
/* StockMovement mappers                                              */
/* ------------------------------------------------------------------ */

export interface SnakeStockMovement {
    id: number;
    user_id: number;
    product_id: number | null;
    customer_id: number | null;
    product_name: string;
    type: 'Venta' | 'Compra Insumos' | 'Ajuste Stock' | 'Merma / Pérdida';
    quantity: number;
    unit_price: number;
    total_amount: number;
    date: string;
    customer_name: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export function toStockMovement(api: SnakeStockMovement): StockMovement {
    return {
        id: String(api.id),
        productId: api.product_id ? String(api.product_id) : '',
        productName: str(api.product_name),
        type: api.type,
        quantity: num(api.quantity),
        unitPrice: num(api.unit_price),
        totalAmount: num(api.total_amount),
        date: api.date,
        customerId: api.customer_id ? String(api.customer_id) : undefined,
        customerName: api.customer_name ?? undefined,
        notes: api.notes ?? undefined,
    };
}

export function toSnakeStockMovement(movement: Omit<StockMovement, 'id'>): Omit<SnakeStockMovement, 'id' | 'user_id' | 'created_at' | 'updated_at'> {
    return {
        product_id: movement.productId ? Number(movement.productId) : null,
        customer_id: movement.customerId ? Number(movement.customerId) : null,
        product_name: movement.productName,
        type: movement.type,
        quantity: movement.quantity,
        unit_price: movement.unitPrice,
        total_amount: movement.totalAmount,
        date: movement.date,
        customer_name: movement.customerName ?? null,
        notes: movement.notes ?? null,
    };
}

/* ------------------------------------------------------------------ */
/* Composite response for POST /stock_movements                       */
/* ------------------------------------------------------------------ */

export interface SnakeStockMovementResult {
    movement: SnakeStockMovement;
    product: SnakeProduct | null;
    customer: SnakeCustomer | null;
}

export interface StockMovementResult {
    movement: StockMovement;
    product: Product | null;
    customer: Customer | null;
}

export function toStockMovementResult(api: SnakeStockMovementResult): StockMovementResult {
    return {
        movement: toStockMovement(api.movement),
        product: api.product ? toProduct(api.product) : null,
        customer: api.customer ? toCustomer(api.customer) : null,
    };
}