import React from 'react';
import {
  PieChart as PieChartIcon,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Award,
  UserCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useApp } from '../../context/AppContext';
import type { FinancialPeriod } from '../../types';

export const BalanceDashboard: React.FC = () => {
  const { financialSummary, financialPeriod, setFinancialPeriod, products, movements, customers } = useApp();

  const periodLabels: Record<FinancialPeriod, string> = {
    semanal: 'Última Semana (7 Días)',
    quincenal: 'Última Quincena (15 Días)',
    mensual: 'Último Mes (30 Días)',
    todo: 'Histórico Completo'
  };

  // Product profitability ranking
  const productSalesMap: Record<string, { name: string; category: string; units: number; revenue: number; profit: number }> = {};

  movements.forEach((m) => {
    if (m.type === 'Venta') {
      const prod = products.find((p) => p.id === m.productId);
      const unitCost = prod ? prod.costPrice : 0;
      const profitPerUnit = m.unitPrice - unitCost;
      const totalProfit = profitPerUnit * m.quantity;

      if (!productSalesMap[m.productId]) {
        productSalesMap[m.productId] = {
          name: m.productName,
          category: prod?.category || 'General',
          units: 0,
          revenue: 0,
          profit: 0
        };
      }
      productSalesMap[m.productId].units += m.quantity;
      productSalesMap[m.productId].revenue += m.totalAmount;
      productSalesMap[m.productId].profit += totalProfit;
    }
  });

  const rankedProducts = Object.values(productSalesMap).sort((a, b) => b.profit - a.profit);

  // Top Customers ranking (sorted by totalOrders and totalSpent)
  const rankedCustomers = [...customers].sort((a, b) => b.totalOrders - a.totalOrders || b.totalSpent - a.totalSpent);

  // Chart data for expenses breakdown
  const costBreakdownData = [
    { name: 'Nómina & Obreros', value: financialSummary.totalPayrollExpenses, color: '#a855f7' },
    { name: 'Gastos Operativos', value: financialSummary.totalOperatingExpenses, color: '#f43f5e' },
    { name: 'Materia Prima Stock', value: financialSummary.totalRawMaterialInvestment, color: '#f59e0b' }
  ];

  // Bar chart data comparing Revenue vs Total Costs vs Net Profit
  const summaryBarData = [
    { name: 'Ingresos', Monto: financialSummary.totalSalesRevenue },
    { name: 'Costos Totales', Monto: financialSummary.totalCosts },
    { name: 'Ganancia Neta', Monto: financialSummary.netProfit }
  ];

  return (
    <div className="space-y-6">
      {/* Period Selection Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-indigo-400" />
          <span className="text-sm font-bold text-white">Período de Análisis:</span>
          <span className="text-xs text-indigo-300 font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30">
            {periodLabels[financialPeriod]}
          </span>
        </div>

        <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          {(['semanal', 'quincenal', 'mensual', 'todo'] as FinancialPeriod[]).map((period) => (
            <button
              key={period}
              onClick={() => setFinancialPeriod(period)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                financialPeriod === period
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ingresos por Ventas</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              ${financialSummary.totalSalesRevenue.toFixed(2)}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {financialSummary.totalUnitsSold} unidades vendidas
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Payroll Expenses */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Nómina y Obreros</span>
            <div className="text-2xl font-black text-purple-400 mt-1">
              ${financialSummary.totalPayrollExpenses.toFixed(2)}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Sueldos y destajos</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Operating Expenses */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gastos Operativos</span>
            <div className="text-2xl font-black text-rose-400 mt-1">
              ${financialSummary.totalOperatingExpenses.toFixed(2)}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Alquiler, luz, servicios</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <PieChartIcon className="w-6 h-6" />
          </div>
        </div>

        {/* Net Profit Hero Card */}
        <div className="glass-card p-5 rounded-2xl border border-indigo-500/30 bg-gradient-to-tr from-indigo-950/40 via-purple-950/20 to-slate-900 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Ganancia Neta (Balance)</span>
            <div className="text-2xl font-black text-white mt-1">
              ${financialSummary.netProfit.toFixed(2)}
            </div>
            <span className="text-[11px] text-emerald-400 font-bold mt-1 block">
              {financialSummary.profitMarginPercent.toFixed(1)}% Margen Neto
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Expenses Bar Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Comparativa Financiera</h3>
              <p className="text-xs text-slate-400">Ingresos brutos vs Costos y Utilidad Neta</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summaryBarData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                  formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Monto']}
                />
                <Bar dataKey="Monto" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost Breakdown Pie Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Distribución de Costos</h3>
              <p className="text-xs text-slate-400">Nómina vs Gastos Operativos vs Materia Prima</p>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={costBreakdownData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {costBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                  formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Costo']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-around items-center pt-2 text-xs">
            {costBreakdownData.map((item) => (
              <div key={item.name} className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-300 font-medium">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Side-by-Side Tables Grid: Products Ranking & Customers Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Product Profitability Ranking List */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-extrabold text-white">Productos Más Vendidos</h3>
              </div>
              <span className="text-[11px] text-slate-400">Por Utilidad Generada</span>
            </div>

            {rankedProducts.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Aún no hay ventas registradas en el historial para mostrar el ranking de productos.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="p-3">#</th>
                      <th className="p-3">Producto</th>
                      <th className="p-3">Vendidos</th>
                      <th className="p-3 text-right">Ganancia Neta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-xs">
                    {rankedProducts.slice(0, 6).map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-amber-400">#{idx + 1}</td>
                        <td className="p-3 font-bold text-white">{p.name}</td>
                        <td className="p-3 text-slate-300 font-medium">{p.units} u.</td>
                        <td className="p-3 text-right font-extrabold text-emerald-400 text-sm">
                          +${p.profit.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right: Top Customers Ranking List */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-extrabold text-white">Clientes Con Más Compras</h3>
              </div>
              <span className="text-[11px] text-slate-400">Por Órdenes / Total Gastado</span>
            </div>

            {rankedCustomers.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Aún no hay clientes con compras registradas.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="p-3">#</th>
                      <th className="p-3">Cliente</th>
                      <th className="p-3">Órdenes</th>
                      <th className="p-3 text-right">Total Comprado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-xs">
                    {rankedCustomers.slice(0, 6).map((cli, idx) => (
                      <tr key={cli.id} className="hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-indigo-400">#{idx + 1}</td>
                        <td className="p-3">
                          <div className="font-bold text-white">{cli.name}</div>
                          {cli.phone && <div className="text-[10px] text-slate-400">{cli.phone}</div>}
                        </td>
                        <td className="p-3 font-extrabold text-purple-300">
                          {cli.totalOrders} compras
                        </td>
                        <td className="p-3 text-right font-black text-emerald-400 text-sm">
                          ${cli.totalSpent.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
