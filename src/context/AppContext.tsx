import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
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
  INITIAL_PRODUCTS,
  INITIAL_RAW_MATERIALS,
  INITIAL_EXPENSES,
  INITIAL_PAYROLL,
  INITIAL_MOVEMENTS,
  INITIAL_CUSTOMERS
} from '../data/mockData';
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

  // Notifications & Utilities
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;
  resetDemoData: () => void;

  // Actions
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  
  addRawMaterial: (material: Omit<RawMaterial, 'id'>) => void;
  updateRawMaterial: (material: RawMaterial) => void;
  deleteRawMaterial: (id: string) => void;

  addExpense: (expense: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;

  addPayrollEntry: (entry: Omit<WorkerPayroll, 'id'>) => void;
  deletePayrollEntry: (id: string) => void;

  addCustomer: (customer: Omit<Customer, 'id' | 'totalOrders' | 'totalSpent' | 'lastOrderDate'>) => void;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (id: string) => void;

  addStockMovement: (movement: Omit<StockMovement, 'id'>) => void;

  calculateRecipeCost: (recipe: { rawMaterialId: string; quantityNeeded: number }[]) => number;
  financialSummary: FinancialBalanceSummary;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userId = user ? user.id : 'guest';

  const [financialPeriod, setFinancialPeriod] = useState<FinancialPeriod>('mensual');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [products, setProducts] = useState<Product[]>([]);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [payroll, setPayroll] = useState<WorkerPayroll[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Load user-scoped data whenever logged-in user changes (Multi-Tenancy Data Isolation)
  useEffect(() => {
    const savedProducts = localStorage.getItem(`gestio_products_${userId}`);
    setProducts(savedProducts ? JSON.parse(savedProducts) : INITIAL_PRODUCTS);

    const savedRaw = localStorage.getItem(`gestio_raw_materials_${userId}`);
    setRawMaterials(savedRaw ? JSON.parse(savedRaw) : INITIAL_RAW_MATERIALS);

    const savedExp = localStorage.getItem(`gestio_expenses_${userId}`);
    setExpenses(savedExp ? JSON.parse(savedExp) : INITIAL_EXPENSES);

    const savedPay = localStorage.getItem(`gestio_payroll_${userId}`);
    setPayroll(savedPay ? JSON.parse(savedPay) : INITIAL_PAYROLL);

    const savedMov = localStorage.getItem(`gestio_movements_${userId}`);
    setMovements(savedMov ? JSON.parse(savedMov) : INITIAL_MOVEMENTS);

    const savedCust = localStorage.getItem(`gestio_customers_${userId}`);
    setCustomers(savedCust ? JSON.parse(savedCust) : INITIAL_CUSTOMERS);
  }, [userId]);

  // Sync user-scoped data to local storage per company
  useEffect(() => {
    if (userId !== 'guest') {
      localStorage.setItem(`gestio_products_${userId}`, JSON.stringify(products));
    }
  }, [products, userId]);

  useEffect(() => {
    if (userId !== 'guest') {
      localStorage.setItem(`gestio_raw_materials_${userId}`, JSON.stringify(rawMaterials));
    }
  }, [rawMaterials, userId]);

  useEffect(() => {
    if (userId !== 'guest') {
      localStorage.setItem(`gestio_expenses_${userId}`, JSON.stringify(expenses));
    }
  }, [expenses, userId]);

  useEffect(() => {
    if (userId !== 'guest') {
      localStorage.setItem(`gestio_payroll_${userId}`, JSON.stringify(payroll));
    }
  }, [payroll, userId]);

  useEffect(() => {
    if (userId !== 'guest') {
      localStorage.setItem(`gestio_movements_${userId}`, JSON.stringify(movements));
    }
  }, [movements, userId]);

  useEffect(() => {
    if (userId !== 'guest') {
      localStorage.setItem(`gestio_customers_${userId}`, JSON.stringify(customers));
    }
  }, [customers, userId]);

  // Toast Helpers
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Reset Demo Data
  const resetDemoData = () => {
    setProducts(INITIAL_PRODUCTS);
    setRawMaterials(INITIAL_RAW_MATERIALS);
    setExpenses(INITIAL_EXPENSES);
    setPayroll(INITIAL_PAYROLL);
    setMovements(INITIAL_MOVEMENTS);
    setCustomers(INITIAL_CUSTOMERS);
    localStorage.clear();
    showToast('🔄 Datos de demostración restaurados exitosamente', 'info');
  };

  const filteredProducts = products;

  // Recipe cost calculator
  const calculateRecipeCost = (recipe: { rawMaterialId: string; quantityNeeded: number }[]) => {
    return recipe.reduce((total, item) => {
      const rm = rawMaterials.find((r) => r.id === item.rawMaterialId);
      if (!rm) return total;
      return total + rm.costPerUnit * item.quantityNeeded;
    }, 0);
  };

  // Product CRUD
  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`
    };
    setProducts((prev) => [newProduct, ...prev]);
    showToast(`✅ Producto "${productData.name}" agregado al inventario`, 'success');
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
    showToast(`✏️ Producto "${updatedProduct.name}" actualizado correctamente`, 'success');
  };

  const deleteProduct = (id: string) => {
    const prod = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast(`🗑️ Producto "${prod?.name || 'eliminado'}" fue removido`, 'info');
  };

  // Raw Material CRUD
  const addRawMaterial = (matData: Omit<RawMaterial, 'id'>) => {
    const newMat: RawMaterial = {
      ...matData,
      id: `rm-${Date.now()}`
    };
    setRawMaterials((prev) => [newMat, ...prev]);
    showToast(`🥩 Insumo "${matData.name}" registrado en stock`, 'success');
  };

  const updateRawMaterial = (updatedMat: RawMaterial) => {
    setRawMaterials((prev) => prev.map((m) => (m.id === updatedMat.id ? updatedMat : m)));
    showToast(`✏️ Insumo "${updatedMat.name}" actualizado`, 'success');
  };

  const deleteRawMaterial = (id: string) => {
    setRawMaterials((prev) => prev.filter((m) => m.id !== id));
    showToast(`🗑️ Insumo eliminado`, 'info');
  };

  // Expense CRUD
  const addExpense = (expenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`
    };
    setExpenses((prev) => [newExpense, ...prev]);
    showToast(`💸 Gasto de $${expenseData.amount.toFixed(2)} registrado (${expenseData.category})`, 'success');
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    showToast(`🗑️ Gasto eliminado`, 'info');
  };

  // Payroll CRUD
  const addPayrollEntry = (entryData: Omit<WorkerPayroll, 'id'>) => {
    const newEntry: WorkerPayroll = {
      ...entryData,
      id: `pay-${Date.now()}`
    };
    setPayroll((prev) => [newEntry, ...prev]);
    showToast(`👷 Pago de $${entryData.totalPaid.toFixed(2)} registrado para ${entryData.workerName}`, 'success');
  };

  const deletePayrollEntry = (id: string) => {
    setPayroll((prev) => prev.filter((p) => p.id !== id));
    showToast(`🗑️ Registro de pago eliminado`, 'info');
  };

  // Customer CRUD
  const addCustomer = (customerData: Omit<Customer, 'id' | 'totalOrders' | 'totalSpent' | 'lastOrderDate'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: `cli-${Date.now()}`,
      totalOrders: 0,
      totalSpent: 0,
      lastOrderDate: new Date().toISOString().split('T')[0]
    };
    setCustomers((prev) => [newCustomer, ...prev]);
    showToast(`👤 Cliente "${customerData.name}" registrado con éxito`, 'success');
  };

  const updateCustomer = (updatedCustomer: Customer) => {
    setCustomers((prev) => prev.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c)));
    showToast(`✏️ Cliente "${updatedCustomer.name}" actualizado`, 'success');
  };

  const deleteCustomer = (id: string) => {
    const cli = customers.find((c) => c.id === id);
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    showToast(`🗑️ Cliente "${cli?.name || ''}" eliminado`, 'info');
  };

  // Stock Movement CRUD & Customer Stats Updating
  const addStockMovement = (movData: Omit<StockMovement, 'id'>) => {
    const newMov: StockMovement = {
      ...movData,
      id: `mov-${Date.now()}`
    };
    setMovements((prev) => [newMov, ...prev]);

    // Adjust product stock
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        if (p.id === movData.productId) {
          let updatedStock = p.stock;
          if (movData.type === 'Venta' || movData.type === 'Merma / Pérdida') {
            updatedStock = Math.max(0, p.stock - movData.quantity);
          } else if (movData.type === 'Compra Insumos' || movData.type === 'Ajuste Stock') {
            updatedStock = p.stock + movData.quantity;
          }
          return { ...p, stock: updatedStock };
        }
        return p;
      })
    );

    // If movement is Venta and customer is specified, update customer spending & orders count
    if (movData.type === 'Venta' && (movData.customerId || movData.customerName)) {
      setCustomers((prevCustomers) => {
        const todayStr = movData.date || new Date().toISOString().split('T')[0];
        let found = false;

        const updated = prevCustomers.map((c) => {
          if (movData.customerId && c.id === movData.customerId) {
            found = true;
            return {
              ...c,
              totalOrders: c.totalOrders + 1,
              totalSpent: c.totalSpent + movData.totalAmount,
              lastOrderDate: todayStr
            };
          }
          if (!movData.customerId && movData.customerName && c.name.toLowerCase() === movData.customerName.toLowerCase()) {
            found = true;
            return {
              ...c,
              totalOrders: c.totalOrders + 1,
              totalSpent: c.totalSpent + movData.totalAmount,
              lastOrderDate: todayStr
            };
          }
          return c;
        });

        // If customer was entered by name but not existing in state, create new customer
        if (!found && movData.customerName) {
          const newCli: Customer = {
            id: `cli-${Date.now()}`,
            name: movData.customerName,
            totalOrders: 1,
            totalSpent: movData.totalAmount,
            lastOrderDate: todayStr
          };
          return [newCli, ...updated];
        }
        return updated;
      });
    }

    if (movData.type === 'Venta') {
      const cliText = movData.customerName ? ` a ${movData.customerName}` : '';
      showToast(`🎉 Venta de ${movData.quantity}u. de "${movData.productName}"${cliText} (+$${movData.totalAmount.toFixed(2)})`, 'success');
    } else {
      showToast(`📦 Movimiento (${movData.type}) registrado exitosamente`, 'info');
    }
  };

  // Financial Balance summary based on selected period
  const financialSummary = useMemo((): FinancialBalanceSummary => {
    const now = new Date('2026-08-30');
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
        toasts,
        showToast,
        dismissToast,
        resetDemoData,
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
