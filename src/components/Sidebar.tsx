import React from 'react';
import {
  Package,
  Boxes,
  DollarSign,
  Users,
  PieChart,
  History,
  Store,
  LogOut,
  UserCheck,
  Building2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => Promise<void>;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout }) => {
  const { user } = useAuth();

  const navItems = [
    { id: 'financials', label: 'Balance General', icon: <PieChart className="w-5 h-5" />, desc: 'Ganancias y resumen' },
    { id: 'inventory', label: 'Productos', icon: <Package className="w-5 h-5" />, desc: 'Tu inventario' },
    { id: 'customers', label: 'Clientes', icon: <UserCheck className="w-5 h-5" />, desc: 'Directorio y compras' },
    { id: 'materials', label: 'Materia Prima', icon: <Boxes className="w-5 h-5" />, desc: 'Insumos y costos' },
    { id: 'expenses', label: 'Gastos', icon: <DollarSign className="w-5 h-5" />, desc: 'Gastos del negocio' },
    { id: 'payroll', label: 'Empleados', icon: <Users className="w-5 h-5" />, desc: 'Pagos al personal' },
    { id: 'movements', label: 'Movimientos', icon: <History className="w-5 h-5" />, desc: 'Historial de ventas' }
  ];

  // Admin-only nav items
  const adminNavItems = [
    { id: 'companies', label: 'Empresas', icon: <Building2 className="w-5 h-5" />, desc: 'Gestión de empresas' }
  ];

  const allNavItems = user?.role === 'admin'
    ? [...navItems, ...adminNavItems]
    : navItems;

  return (
    <aside className="w-64 bg-slate-900/90 backdrop-blur-xl border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0 z-40 select-none">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Store className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <h1 className="font-extrabold text-lg text-white tracking-tight leading-none">
                Gestio
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Tu negocio, bajo control.
              </p>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="p-3 space-y-1 mt-2">
          {allNavItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${isActive
                  ? 'bg-indigo-600/20 text-white border border-indigo-500/30 shadow-inner'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
              >
                <span className={`${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                  {item.icon}
                </span>
                <div className="text-left">
                  <div className={`font-semibold ${isActive ? 'text-white' : ''}`}>{item.label}</div>
                  <div className="text-[10px] text-slate-500 leading-tight">{item.desc}</div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800/80">
        <button
          onClick={onLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors mb-3"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar Sesión</span>
        </button>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Gestio v1.0</span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Activo
          </span>
        </div>
      </div>
    </aside>
  );
};
