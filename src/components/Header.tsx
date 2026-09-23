import React from 'react';
import { Calendar, TrendingUp, Plus, Search, UserIcon, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { FinancialPeriod } from '../types';
import type { User } from '../context/AuthContext';

interface HeaderProps {
  activeTab: string;
  onQuickAddProduct: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  user: User | null;
  onLogout: () => Promise<void>;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onQuickAddProduct,
  searchTerm,
  setSearchTerm,
  user,
  onLogout
}) => {
  const { financialPeriod, setFinancialPeriod, financialSummary } = useApp();

  const titleMap: Record<string, { title: string; desc: string }> = {
    inventory: { title: '📦 Productos e Inventario', desc: 'Aquí ves todo lo que vendes, cuánto tienes y cuánto ganas por producto.' },
    customers: { title: '👥 Directorio de Clientes', desc: 'Registra a tus clientes y mira sus compras acumuladas e historial.' },
    materials: { title: '🥩 Materia Prima e Insumos', desc: 'Lo que compras para producir: ingredientes, materiales, etc.' },
    expenses: { title: '💸 Gastos del Negocio', desc: 'Alquiler, luz, agua, publicidad y otros gastos fijos o variables.' },
    payroll: { title: '👷 Empleados y Pagos', desc: 'Sueldos fijos, pagos por hora o pagos por producción (destajo).' },
    financials: { title: '📊 Balance General del Negocio', desc: '¿Cuánto entra, cuánto sale y cuánto queda? Tu resumen completo aquí.' },
    movements: { title: '📋 Historial de Movimientos', desc: 'Todo lo que ha pasado: ventas, compras, ajustes y pérdidas.' }
  };

  const currentInfo = titleMap[activeTab] || { title: 'Panel Principal', desc: '' };

  const netProfit = financialSummary.netProfit;
  const isProfit = netProfit >= 0;

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'company': return 'Empresa';
      default: return role;
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-8 py-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title */}
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">{currentInfo.title}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{currentInfo.desc}</p>
        </div>

        {/* Action Bar */}
        <div className="flex items-center flex-wrap gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-44 focus:w-56 transition-all"
            />
          </div>

          {/* Period */}
          <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-xl p-1 text-xs">
            <span className="px-2 text-slate-400 flex items-center gap-1 font-medium">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            </span>
            {(['semanal', 'quincenal', 'mensual', 'todo'] as FinancialPeriod[]).map((period) => (
              <button
                key={period}
                onClick={() => setFinancialPeriod(period)}
                className={`px-2.5 py-1 rounded-lg font-semibold capitalize transition-all ${financialPeriod === period
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
              >
                {period}
              </button>
            ))}
          </div>

          {/* Quick Profit Pill */}
          <div className={`hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs border ${isProfit
            ? 'bg-emerald-500/10 border-emerald-500/20'
            : 'bg-rose-500/10 border-rose-500/20'
            }`}>
            <TrendingUp className={`w-4 h-4 ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`} />
            <div>
              <div className={`text-[10px] font-medium leading-none ${isProfit ? 'text-emerald-300' : 'text-rose-300'}`}>
                {isProfit ? 'Ganancia' : 'Pérdida'} ({financialPeriod})
              </div>
              <div className={`font-extrabold text-xs ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                ${Math.abs(netProfit).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Add Product */}
          <button
            onClick={onQuickAddProduct}
            className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </button>

          {/* User Info & Logout */}
          {user && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <UserIcon className="w-4 h-4 text-indigo-400" />
                <div className="text-xs">
                  <div className="text-white font-medium">{user.email}</div>
                  <div className="text-slate-400 text-[10px]">{getRoleLabel(user.role)}</div>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Cerrar Sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
