import React, { createContext, useContext, useState, useMemo, useEffect, useCallback, useRef } from 'react';
import type {
  FinancialPeriod,
  Product,
  RawMaterial,
  Expense,
  WorkerPayroll,
  StockMovement,
  Customer,
  FinancialBalanceSummary
} from '../types';
import {
  productsApi,
  rawMaterialsApi,
  expensesApi,
  payrollApi,
  customersApi,
  stockMovementsApi,
  dataApi,
} from '../api/resources';
import { useAuth } from './AuthContext';
import type { ToastMessage } from '../components/Toast';

interface AppContextType {
  financialPeriod: FinancialPeriod;
  setFinancialPeriod: (period: FinancialPeriod) => void;

  products: Product[];
  filteredProducts: Product[];
  rawMaterials: RawMaterial[];
  expenses: Expense[];
  payroll: WorkerPayroll[];
  movements: StockMovement[];
  customers: Customer[];

  isLoading: boolean;

  // Notifications & Utilities
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;
  resetDemoData: () => Promise<void>;
  refreshData: () => Promise<void>;

  // Actions
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  addRawMaterial: (material: Omit<RawMaterial, 'id'>) => Promise<void>;
  updateRawMaterial: (material: RawMaterial) => Promise<void>;
  deleteRawMaterial: (id: string) => Promise<void>;

  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  addPayrollEntry: (entry: Omit<WorkerPayroll, 'id'>) => Promise<void>;
  deletePayrollEntry: (id: string) => Promise<void>;

  addCustomer: (customer: Omit<Customer, 'id' | 'totalOrders' | 'totalSpent' | 'lastOrderDate'>) => Promise<void>;
  updateCustomer: (customer: Customer) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;

  addStockMovement: (movement: Omit<StockMovement, 'id'>) => Promise<void>;

  calculateRecipeCost: (recipe: { rawMaterialId: string; quantityNeeded: number }[]) => number;
  financialSummary: FinancialBalanceSummary;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();

  const [financialPeriod, setFinancialPeriod] = useState<FinancialPeriod>('mensual');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [payroll, setPayroll] = useState<WorkerPayroll[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Request sequence token to guard against race conditions on user switch
  const requestSeqRef = useRef(0);

  // Toast Helpers
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Guard: require authenticated user
  const requireAuth = useCallback((): boolean => {
    if (!user || !token) {
      showToast('Debes iniciar sesión para modificar los datos.', 'error');
      return false;
    }
    return true;
  }, [user, token, showToast]);

  // Load all data from Rails API
  const refreshData = useCallback(async () => {
    if (!user || !token) return;

    const currentSeq = ++requestSeqRef.current;
    setIsLoading(true);
    try {
      const [prods, mats, exps, pays, movs, custs] = await Promise.all([
        productsApi.list(),
        rawMaterialsApi.list(),
        expensesApi.list(),
        payrollApi.list(),
        stockMovementsApi.list(),
        customersApi.list(),
      ]);
      // Guard against state updates after unmount or user switch
      if (currentSeq !== requestSeqRef.current) return;
      setProducts(prods);
      setRawMaterials(mats);
      setExpenses(exps);
      setPayroll(pays);
      setMovements(movs);
      setCustomers(custs);
    } catch (err: any) {
      if (currentSeq !== requestSeqRef.current) return;
      console.error('Error loading data from API:', err);
      showToast(`❌ Error al cargar datos: ${err.message}`, 'error');
    } finally {
      if (currentSeq === requestSeqRef.current) {
        setIsLoading(false);
      }
    }
  }, [user, token, showToast]);

  // Load data when user logs in
  useEffect(() => {
    if (user && token) {
      refreshData();
    } else {
      // Clear local state on logout
      setProducts([]);
      setRawMaterials([]);
      setExpenses([]);
      setPayroll([]);
      setMovements([]);
      setCustomers([]);
    }
  }, [user, token, refreshData]);

  // Reset Data (calls backend DELETE /data then refreshes)
  const resetDemoData = useCallback(async () => {
    if (!requireAuth()) return;
    setIsLoading(true);
    try {
      await dataApi.reset();
      await refreshData();
      showToast('🔄 Datos de demostración restaurados exitosamente', 'info');
    } catch (err: any) {
      showToast(`❌ Error al restablecer datos: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [requireAuth, refreshData, showToast]);

  const filteredProducts = products;

  // Recipe cost calculator
  const calculateRecipeCost = useCallback((recipe: { rawMaterialId: string; quantityNeeded: number }[]) => {
    return recipe.reduce((total, item) => {
      const rm = rawMaterials.find((r) => r.id === item.rawMaterialId);
      if (!rm) return total;
      return total + rm.costPerUnit * item.quantityNeeded;
    }, 0);
  }, [rawMaterials]);

  // ===================== Product CRUD =====================

  const addProduct = useCallback(async (productData: Omit<Product, 'id'>) => {
    if (!requireAuth()) return;
    try {
      const created = await productsApi.create(productData);
      setProducts((prev) => [created, ...prev]);
      showToast(`✅ Producto "${productData.name}" agregado al inventario`, 'success');
    } catch (err: any) {
      showToast(`❌ ${err.message}`, 'error');
    }
  }, [requireAuth, showToast]);

  const updateProduct = useCallback(async (updatedProduct: Product) => {
    if (!requireAuth()) return;
    try {
      const updated = await productsApi.update(updatedProduct);
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      showToast(`✏️ Producto "${updated.name}" actualizado correctamente`, 'success');
    } catch (err: any) {
      showToast(`❌ ${err.message}`, 'error');
    }
  }, [requireAuth, showToast]);

  const deleteProduct = useCallback(async (id: string) => {
    if (!requireAuth()) return;
    const prod = products.find((p) => p.id === id);
    try {
      await productsApi.remove(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast(`🗑️ Producto "${prod?.name || 'eliminado'}" fue removido`, 'info');
    } catch (err: any) {
      showToast(`❌ ${err.message}`, 'error');
    }
  }, [products, requireAuth, showToast]);

  // ===================== Raw Material CRUD =====================

  const addRawMaterial = useCallback(async (matData: Omit<RawMaterial, 'id'>) => {
    if (!requireAuth()) return;
    try {
      const created = await rawMaterialsApi.create(matData);
      setRawMaterials((prev) => [created, ...prev]);
      showToast(`🥩 Insumo "${matData.name}" registrado en stock`, 'success');
    } catch (err: any) {
      showToast(`❌ ${err.message}`, 'error');
    }
  }, [requireAuth, showToast]);

  const updateRawMaterial = useCallback(async (updatedMat: RawMaterial) => {
    if (!requireAuth()) return;
    try {
      const updated = await rawMaterialsApi.update(updatedMat);
      setRawMaterials((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      showToast(`✏️ Insumo "${updated.name}" actualizado`, 'success');
    } catch (err: any) {
      showToast(`❌ ${err.message}`, 'error');
    }
  }, [requireAuth, showToast]);

  const deleteRawMaterial = useCallback(async (id: string) => {
    if (!requireAuth()) return;
    try {
      await rawMaterialsApi.remove(id);
      setRawMaterials((prev) => prev.filter((m) => m.id !== id));
      showToast(`🗑️ Insumo eliminado`, 'info');
    } catch (err: any) {
      showToast(`❌ ${err.message}`, 'error');
    }
  }, [requireAuth, showToast]);

  // ===================== Expense CRUD =====================

  const addExpense = useCallback(async (expenseData: Omit<Expense, 'id'>) => {
    if (!requireAuth()) return;
    try {
      const created = await expensesApi.create(expenseData);
      setExpenses((prev) => [created, ...prev]);
      showToast(`💸 Gasto de $${expenseData.amount.toFixed(2)} registrado (${expenseData.category})`, 'success');
    } catch (err: any) {
      showToast(`❌ ${err.message}`, 'error');
    }
  }, [requireAuth, showToast]);

  const deleteExpense = useCallback(async (id: string) => {
    if (!requireAuth()) return;
    try {
      await expensesApi.remove(id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      showToast(`🗑️ Gasto eliminado`, 'info');
    } catch (err: any) {
      showToast(`❌ ${err.message}`, 'error');
    }
  }, [requireAuth, showToast]);

  // ===================== Payroll CRUD =====================

  const addPayrollEntry = useCallback(async (entryData: Omit<WorkerPayroll, 'id'>) => {
    if (!requireAuth()) return;
    try {
      const created = await payrollApi.create(entryData);
      setPayroll((prev) => [created, ...prev]);
      showToast(`👷 Pago de $${entryData.totalPaid.toFixed(2)} registrado para ${entryData.workerName}`, 'success');
    } catch (err: any) {
      showToast(`❌ ${err.message}`, 'error');
    }
  }, [requireAuth, showToast]);

  const deletePayrollEntry = useCallback(async (id: string) => {
    if (!requireAuth()) return;
    try {
      await payrollApi.remove(id);
      setPayroll((prev) => prev.filter((p) => p.id !== id));
      showToast(`🗑️ Registro de pago eliminado`, 'info');
    } catch (err: any) {
      showToast(`❌ ${err.message}`, 'error');
    }
  }, [requireAuth, showToast]);

  // ===================== Customer CRUD =====================

  const addCustomer = useCallback(async (customerData: Omit<Customer, 'id' | 'totalOrders' | 'totalSpent' | 'lastOrderDate'>) => {
    if (!requireAuth()) return;
    try {
      // Server will initialize totalOrders, totalSpent, lastOrderDate
      const created = await customersApi.create(customerData as Omit<Customer, 'id'>);
      setCustomers((prev) => [created, ...prev]);
      showToast(`👤 Cliente "${customerData.name}" registrado con éxito`, 'success');
    } catch (err: any) {
      showToast(`❌ ${err.message}`, 'error');
    }
  }, [requireAuth, showToast]);

  const updateCustomer = useCallback(async (updatedCustomer: Customer) => {
    if (!requireAuth()) return;
    try {
      const updated = await customersApi.update(updatedCustomer);
      setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      showToast(`✏️ Cliente "${updated.name}" actualizado`, 'success');
    } catch (err: any) {
      showToast(`❌ ${err.message}`, 'error');
    }
  }, [requireAuth, showToast]);

  const deleteCustomer = useCallback(async (id: string) => {
    if (!requireAuth()) return;
    const cli = customers.find((c) => c.id === id);
    try {
      await customersApi.remove(id);
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      showToast(`🗑️ Cliente "${cli?.name || ''}" eliminado`, 'info');
    } catch (err: any) {
      showToast(`❌ ${err.message}`, 'error');
    }
  }, [customers, requireAuth, showToast]);

  // ===================== Stock Movement =====================

  const addStockMovement = useCallback(async (movData: Omit<StockMovement, 'id'>) => {
    if (!requireAuth()) return;
    try {
      const result = await stockMovementsApi.create(movData);

      // Add the new movement to local state
      setMovements((prev) => [result.movement, ...prev]);

      // Update product stock from server response
      if (result.product) {
        setProducts((prevProducts) =>
          prevProducts.map((p) => (p.id === result.product!.id ? result.product! : p))
        );
      }

      // Update customer from server response (for sales)
      if (result.customer) {
        setCustomers((prevCustomers) => {
          const exists = prevCustomers.some((c) => c.id === result.customer!.id);
          if (exists) {
            return prevCustomers.map((c) => (c.id === result.customer!.id ? result.customer! : c));
          }
          // New customer was created by the server
          return [result.customer!, ...prevCustomers];
        });
      }

      if (movData.type === 'Venta') {
        const cliText = movData.customerName ? ` a ${movData.customerName}` : '';
        showToast(`🎉 Venta de ${movData.quantity}u. de "${movData.productName}"${cliText} (+$${movData.totalAmount.toFixed(2)})`, 'success');
      } else {
        showToast(`📦 Movimiento (${movData.type}) registrado exitosamente`, 'info');
      }
    } catch (err: any) {
      showToast(`❌ ${err.message}`, 'error');
    }
  }, [requireAuth, showToast]);

  // Financial Balance summary based on selected period
  const financialSummary = useMemo((): FinancialBalanceSummary => {
    const now = new Date();
    let daysToSubtract = 365;

    if (financialPeriod === 'semanal') daysToSubtract = 7;
    if (financialPeriod === 'quincenal') daysToSubtract = 15;
    if (financialPeriod === 'mensual') daysToSubtract = 30;

    const cutoffDate = new Date(now.getTime() - daysToSubtract * 24 * 60 * 60 * 1000);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];

    const periodMovements = financialPeriod === 'todo'
      ? movements
      : movements.filter((m) => m.date >= cutoffStr);

    const salesMovements = periodMovements.filter((m) => m.type === 'Venta');
    const totalSalesRevenue = salesMovements.reduce((sum, m) => sum + m.totalAmount, 0);
    const totalUnitsSold = salesMovements.reduce((sum, m) => sum + m.quantity, 0);

    const totalRawMaterialInvestment = rawMaterials.reduce((sum, rm) => sum + rm.currentStock * rm.costPerUnit, 0);

    const periodPayroll = financialPeriod === 'todo'
      ? payroll
      : payroll.filter((p) => p.paymentDate >= cutoffStr);
    const totalPayrollExpenses = periodPayroll.reduce((sum, p) => sum + p.totalPaid, 0);

    const periodExpenses = financialPeriod === 'todo'
      ? expenses
      : expenses.filter((e) => e.date >= cutoffStr);
    const totalOperatingExpenses = periodExpenses.reduce((sum, e) => sum + e.amount, 0);

    const totalCosts = totalPayrollExpenses + totalOperatingExpenses;
    const netProfit = totalSalesRevenue - totalCosts;
    const profitMarginPercent = totalSalesRevenue > 0 ? (netProfit / totalSalesRevenue) * 100 : 0;

    return {
      period: financialPeriod,
      totalSalesRevenue,
      totalRawMaterialInvestment,
      totalPayrollExpenses,
      totalOperatingExpenses,
      totalCosts,
      netProfit,
      profitMarginPercent,
      totalUnitsSold
    };
  }, [financialPeriod, movements, rawMaterials, payroll, expenses]);

  return (
    <AppContext.Provider
      value={{
        financialPeriod,
        setFinancialPeriod,
        products,
        filteredProducts,
        rawMaterials,
        expenses,
        payroll,
        movements,
        customers,
        isLoading,
        toasts,
        showToast,
        dismissToast,
        resetDemoData,
        refreshData,
        addProduct,
        updateProduct,
        deleteProduct,
        addRawMaterial,
        updateRawMaterial,
        deleteRawMaterial,
        addExpense,
        deleteExpense,
        addPayrollEntry,
        deletePayrollEntry,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addStockMovement,
        calculateRecipeCost,
        financialSummary
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
