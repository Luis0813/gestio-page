import React, { useState, useEffect } from 'react';
import api from './api';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Toast } from './components/Toast';
import { LoginPage } from './components/Auth/LoginPage';
import { RegisterPage } from './components/Auth/RegisterPage';
import { AccountDisabled } from './components/Auth/AccountDisabled';

import { ProductList } from './components/Inventory/ProductList';
import { ProductFormModal } from './components/Inventory/ProductFormModal';
import { RecipeCalculatorModal } from './components/Inventory/RecipeCalculatorModal';
import { StockMovementModal } from './components/Inventory/StockMovementModal';

import { RawMaterialManager } from './components/Administration/RawMaterialManager';
import { ExpensesManager } from './components/Administration/ExpensesManager';
import { PayrollManager } from './components/Administration/PayrollManager';
import { CompaniesManager } from './components/Administration/CompaniesManager';

import { CustomerManager } from './components/Customers/CustomerManager';

import { BalanceDashboard } from './components/Financials/BalanceDashboard';
import { MovementHistory } from './components/Movements/MovementHistory';

import type { Product } from './types';

const MainApp: React.FC = () => {
  const { toasts, dismissToast } = useApp();
  const { user, logout, isLoading, isAccountDisabled } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('financials');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [checkingStatus, setCheckingStatus] = useState(false);

  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const [recipeProduct, setRecipeProduct] = useState<Product | null>(null);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState<boolean>(false);

  const [movementProduct, setMovementProduct] = useState<Product | null>(null);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState<boolean>(false);

  const handleOpenNewProductModal = () => {
    setProductToEdit(null);
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setProductToEdit(product);
    setIsProductModalOpen(true);
  };

  const handleOpenRecipeModal = (product: Product) => {
    setRecipeProduct(product);
    setIsRecipeModalOpen(true);
  };

  const handleOpenMovementModal = (product: Product) => {
    setMovementProduct(product);
    setIsMovementModalOpen(true);
  };

  const handleToggleAuthMode = () => {
    setAuthMode(prev => prev === 'login' ? 'register' : 'login');
  };

  const handleLogout = async () => {
    await logout();
  };

  // Check account status on load if user is logged in
  useEffect(() => {
    async function checkAccountStatus() {
      if (user && !checkingStatus) {
        setCheckingStatus(true);
        try {
          const token = localStorage.getItem('gestio_token');
          if (token) {
            try {
              await api.get('/me');
            } catch (err: any) {
              if (err.response?.status === 401 || err.response?.status === 403) {
                // Account is disabled or token invalid/expired, clear session
                await logout();
              }
            }
          }
        } catch (err) {
          console.error('Error checking account status:', err);
        } finally {
          setCheckingStatus(false);
        }
      }
    }

    checkAccountStatus();
  }, [user]);

  if (isLoading || checkingStatus) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-lg">Cargando...</div>
      </div>
    );
  }

  if (isAccountDisabled) {
    return <AccountDisabled />;
  }

  if (!user) {
    return authMode === 'login' ? (
      <LoginPage onToggleMode={handleToggleAuthMode} />
    ) : (
      <RegisterPage onToggleMode={handleToggleAuthMode} />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans antialiased">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header
          activeTab={activeTab}
          onQuickAddProduct={handleOpenNewProductModal}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          user={user}
          onLogout={handleLogout}
        />

        <main className="p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'financials' && <BalanceDashboard />}

          {activeTab === 'inventory' && (
            <ProductList
              searchTerm={searchTerm}
              onEditProduct={handleEditProduct}
              onOpenNewProductModal={handleOpenNewProductModal}
              onOpenRecipeModal={handleOpenRecipeModal}
              onOpenMovementModal={handleOpenMovementModal}
            />
          )}

          {activeTab === 'materials' && <RawMaterialManager />}
          {activeTab === 'customers' && <CustomerManager />}
          {activeTab === 'expenses' && <ExpensesManager />}
          {activeTab === 'payroll' && <PayrollManager />}
          {activeTab === 'movements' && <MovementHistory />}
          {activeTab === 'companies' && user.role === 'admin' && <CompaniesManager />}
        </main>
      </div>

      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        productToEdit={productToEdit}
      />

      <RecipeCalculatorModal
        isOpen={isRecipeModalOpen}
        onClose={() => setIsRecipeModalOpen(false)}
        product={recipeProduct}
      />

      <StockMovementModal
        isOpen={isMovementModalOpen}
        onClose={() => setIsMovementModalOpen(false)}
        product={movementProduct}
      />

      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainApp />
      </AppProvider>
    </AuthProvider>
  );
}
