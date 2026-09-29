/**
 * Typed API data-access layer for the React frontend.
 * Single bridge between Rails API (snake_case, integer ids) and React (camelCase, string ids).
 * All functions throw Error with Spanish messages on failure.
 */

import api from '../api';
import { createApiError } from './errors';
import {
    toProduct,
    toSnakeProduct,
    toSnakeProductUpdate,
    toRawMaterial,
    toSnakeRawMaterial,
    toSnakeRawMaterialUpdate,
    toExpense,
    toSnakeExpense,
    toSnakeExpenseUpdate,
    toWorkerPayroll,
    toSnakePayrollEntry,
    toSnakePayrollEntryUpdate,
    toCustomer,
    toSnakeCustomer,
    toSnakeCustomerUpdate,
    toStockMovement,
    toSnakeStockMovement,
    toStockMovementResult,
    type StockMovementResult,
} from './mappers';
import type {
    Product,
    RawMaterial,
    Expense,
    WorkerPayroll,
    Customer,
    StockMovement,
} from '../types';

/* ------------------------------------------------------------------ */
/* Generic request wrapper                                            */
/* ------------------------------------------------------------------ */

async function get<T>(url: string, fallback: string): Promise<T> {
    try {
        const response = await api.get<{ data: T }>(url);
        return response.data.data;
    } catch (err) {
        throw createApiError(err, fallback);
    }
}

async function post<T, B>(url: string, body: B, fallback: string): Promise<T> {
    try {
        const response = await api.post<{ data: T }>(url, body);
        return response.data.data;
    } catch (err) {
        throw createApiError(err, fallback);
    }
}

async function patch<T, B>(url: string, body: B, fallback: string): Promise<T> {
    try {
        const response = await api.patch<{ data: T }>(url, body);
        return response.data.data;
    } catch (err) {
        throw createApiError(err, fallback);
    }
}

async function del(url: string, fallback: string): Promise<void> {
    try {
        await api.delete(url);
    } catch (err) {
        throw createApiError(err, fallback);
    }
}

/* ------------------------------------------------------------------ */
/* Products API                                                       */
/* ------------------------------------------------------------------ */

/** Shape of the `data` payload returned by POST /products/import. */
export interface ImportProductsResult {
    created_count: number;
    products: import('./mappers').SnakeProduct[];
    errors: string[];
    /** True when the server capped `errors` at 100 entries. */
    errors_truncated?: boolean;
}

export const productsApi = {
    /**
     * GET /products
     * Returns all products for the current tenant.
     */
    list: (): Promise<Product[]> =>
        get<import('./mappers').SnakeProduct[]>('/products', 'No se pudo cargar los productos.').then((arr) =>
            arr.map(toProduct)
        ),

    /**
     * GET /products/:id
     * Returns a single product by id.
     */
    get: (id: string): Promise<Product> =>
        get<import('./mappers').SnakeProduct>(`/products/${id}`, 'No se pudo cargar el producto.').then(toProduct),

    /**
     * POST /products
     * Creates a new product. Body wraps fields under "product" key.
     * Returns the created product with server-generated id.
     */
    create: (data: Omit<Product, 'id'>): Promise<Product> =>
        post<import('./mappers').SnakeProduct, { product: ReturnType<typeof toSnakeProduct> }>(
            '/products',
            { product: toSnakeProduct(data) },
            'No se pudo crear el producto.'
        ).then(toProduct),

    /**
     * PATCH /products/:id
     * Updates an existing product. Body wraps fields under "product" key.
     * Returns the updated product.
     */
    update: (product: Product): Promise<Product> =>
        patch<import('./mappers').SnakeProduct, { product: ReturnType<typeof toSnakeProductUpdate> }>(
            `/products/${product.id}`,
            { product: toSnakeProductUpdate(product) },
            'No se pudo actualizar el producto.'
        ).then(toProduct),

    /**
     * DELETE /products/:id
     * Deletes a product.
     */
    remove: (id: string): Promise<void> =>
        del(`/products/${id}`, 'No se pudo eliminar el producto.'),

    /**
     * POST /products/import
     * Uploads a spreadsheet and bulk-creates products for the current tenant.
     * Returns the created products plus a per-row error list.
     */
    import: async (file: File): Promise<ImportProductsResult> => {
        const form = new FormData();
        form.append('file', file);
        try {
            // Content-Type must be left unset so the browser adds the multipart boundary.
            const response = await api.post<{
                status: { code: number; message: string };
                data: ImportProductsResult;
            }>('/products/import', form);
            return response.data.data;
        } catch (err) {
            throw createApiError(err, 'No se pudo importar el archivo de productos.');
        }
    },
};

/* ------------------------------------------------------------------ */
/* RawMaterials API                                                   */
/* ------------------------------------------------------------------ */

export const rawMaterialsApi = {
    list: (): Promise<RawMaterial[]> =>
        get<import('./mappers').SnakeRawMaterial[]>('/raw_materials', 'No se pudo cargar las materias primas.').then((arr) =>
            arr.map(toRawMaterial)
        ),

    get: (id: string): Promise<RawMaterial> =>
        get<import('./mappers').SnakeRawMaterial>(`/raw_materials/${id}`, 'No se pudo cargar la materia prima.').then(toRawMaterial),

    create: (data: Omit<RawMaterial, 'id'>): Promise<RawMaterial> =>
        post<import('./mappers').SnakeRawMaterial, { raw_material: ReturnType<typeof toSnakeRawMaterial> }>(
            '/raw_materials',
            { raw_material: toSnakeRawMaterial(data) },
            'No se pudo crear la materia prima.'
        ).then(toRawMaterial),

    update: (rawMaterial: RawMaterial): Promise<RawMaterial> =>
        patch<import('./mappers').SnakeRawMaterial, { raw_material: ReturnType<typeof toSnakeRawMaterialUpdate> }>(
            `/raw_materials/${rawMaterial.id}`,
            { raw_material: toSnakeRawMaterialUpdate(rawMaterial) },
            'No se pudo actualizar la materia prima.'
        ).then(toRawMaterial),

    remove: (id: string): Promise<void> =>
        del(`/raw_materials/${id}`, 'No se pudo eliminar la materia prima.'),
};

/* ------------------------------------------------------------------ */
/* Expenses API                                                       */
/* ------------------------------------------------------------------ */

export const expensesApi = {
    list: (): Promise<Expense[]> =>
        get<import('./mappers').SnakeExpense[]>('/expenses', 'No se pudo cargar los gastos.').then((arr) =>
            arr.map(toExpense)
        ),

    get: (id: string): Promise<Expense> =>
        get<import('./mappers').SnakeExpense>(`/expenses/${id}`, 'No se pudo cargar el gasto.').then(toExpense),

    create: (data: Omit<Expense, 'id'>): Promise<Expense> =>
        post<import('./mappers').SnakeExpense, { expense: ReturnType<typeof toSnakeExpense> }>(
            '/expenses',
            { expense: toSnakeExpense(data) },
            'No se pudo crear el gasto.'
        ).then(toExpense),

    update: (expense: Expense): Promise<Expense> =>
        patch<import('./mappers').SnakeExpense, { expense: ReturnType<typeof toSnakeExpenseUpdate> }>(
            `/expenses/${expense.id}`,
            { expense: toSnakeExpenseUpdate(expense) },
            'No se pudo actualizar el gasto.'
        ).then(toExpense),

    remove: (id: string): Promise<void> =>
        del(`/expenses/${id}`, 'No se pudo eliminar el gasto.'),
};

/* ------------------------------------------------------------------ */
/* Payroll API                                                        */
/* ------------------------------------------------------------------ */

export const payrollApi = {
    list: (): Promise<WorkerPayroll[]> =>
        get<import('./mappers').SnakePayrollEntry[]>('/payroll_entries', 'No se pudo cargar la nómina.').then((arr) =>
            arr.map(toWorkerPayroll)
        ),

    get: (id: string): Promise<WorkerPayroll> =>
        get<import('./mappers').SnakePayrollEntry>(`/payroll_entries/${id}`, 'No se pudo cargar la entrada de nómina.').then(toWorkerPayroll),

    create: (data: Omit<WorkerPayroll, 'id'>): Promise<WorkerPayroll> =>
        post<import('./mappers').SnakePayrollEntry, { payroll_entry: ReturnType<typeof toSnakePayrollEntry> }>(
            '/payroll_entries',
            { payroll_entry: toSnakePayrollEntry(data) },
            'No se pudo crear la entrada de nómina.'
        ).then(toWorkerPayroll),

    update: (payroll: WorkerPayroll): Promise<WorkerPayroll> =>
        patch<import('./mappers').SnakePayrollEntry, { payroll_entry: ReturnType<typeof toSnakePayrollEntryUpdate> }>(
            `/payroll_entries/${payroll.id}`,
            { payroll_entry: toSnakePayrollEntryUpdate(payroll) },
            'No se pudo actualizar la entrada de nómina.'
        ).then(toWorkerPayroll),

    remove: (id: string): Promise<void> =>
        del(`/payroll_entries/${id}`, 'No se pudo eliminar la entrada de nómina.'),
};

/* ------------------------------------------------------------------ */
/* Customers API                                                      */
/* ------------------------------------------------------------------ */

export const customersApi = {
    list: (): Promise<Customer[]> =>
        get<import('./mappers').SnakeCustomer[]>('/customers', 'No se pudo cargar los clientes.').then((arr) =>
            arr.map(toCustomer)
        ),

    get: (id: string): Promise<Customer> =>
        get<import('./mappers').SnakeCustomer>(`/customers/${id}`, 'No se pudo cargar el cliente.').then(toCustomer),

    create: (data: Omit<Customer, 'id'>): Promise<Customer> =>
        post<import('./mappers').SnakeCustomer, { customer: ReturnType<typeof toSnakeCustomer> }>(
            '/customers',
            { customer: toSnakeCustomer(data) },
            'No se pudo crear el cliente.'
        ).then(toCustomer),

    update: (customer: Customer): Promise<Customer> =>
        patch<import('./mappers').SnakeCustomer, { customer: ReturnType<typeof toSnakeCustomerUpdate> }>(
            `/customers/${customer.id}`,
            { customer: toSnakeCustomerUpdate(customer) },
            'No se pudo actualizar el cliente.'
        ).then(toCustomer),

    remove: (id: string): Promise<void> =>
        del(`/customers/${id}`, 'No se pudo eliminar el cliente.'),
};

/* ------------------------------------------------------------------ */
/* StockMovements API                                                 */
/* ------------------------------------------------------------------ */

export const stockMovementsApi = {
    list: (): Promise<StockMovement[]> =>
        get<import('./mappers').SnakeStockMovement[]>('/stock_movements', 'No se pudo cargar los movimientos de stock.').then((arr) =>
            arr.map(toStockMovement)
        ),

    get: (id: string): Promise<StockMovement> =>
        get<import('./mappers').SnakeStockMovement>(`/stock_movements/${id}`, 'No se pudo cargar el movimiento de stock.').then(toStockMovement),

    /**
     * POST /stock_movements
     * Creates a stock movement. The server atomically:
     * - inserts the movement
     * - adjusts product stock
     * - for "Venta", updates/creates customer totals
     * Returns a composite payload with the movement, updated product (or null), and updated customer (or null).
     */
    create: (data: Omit<StockMovement, 'id'>): Promise<StockMovementResult> =>
        post<import('./mappers').SnakeStockMovementResult, { stock_movement: ReturnType<typeof toSnakeStockMovement> }>(
            '/stock_movements',
            { stock_movement: toSnakeStockMovement(data) },
            'No se pudo crear el movimiento de stock.'
        ).then(toStockMovementResult),

    remove: (id: string): Promise<void> =>
        del(`/stock_movements/${id}`, 'No se pudo eliminar el movimiento de stock.'),
};

/* ------------------------------------------------------------------ */
/* Data API (admin/reset)                                             */
/* ------------------------------------------------------------------ */

export const dataApi = {
    /**
     * DELETE /data
     * Deletes all business data for the current tenant.
     * Use with caution — typically for testing or account reset.
     */
    reset: (): Promise<void> =>
        del('/data', 'No se pudo restablecer los datos.'),
};

/* ------------------------------------------------------------------ */
/* Re-export mappers and error utilities for consumers                */
/* ------------------------------------------------------------------ */

export * from './mappers';
export * from './errors';