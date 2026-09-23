import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MovementHistory: React.FC = () => {
  const { movements } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredMovements = movements.filter((m) => {
    const matchesSearch =
      m.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.notes && m.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || m.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por producto u observaciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 font-medium">Filtrar por:</span>
          {['all', 'Venta', 'Compra Insumos', 'Ajuste Stock', 'Merma / Pérdida'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterType === t
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              {t === 'all' ? 'Todos' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Movements Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-4">Tipo Movimiento</th>
                <th className="p-4">Producto</th>
                <th className="p-4">Cantidad</th>
                <th className="p-4">Precio / Costo Unitario</th>
                <th className="p-4">Monto Total</th>
                <th className="p-4">Fecha</th>
                <th className="p-4">Notas / Observaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs">
              {filteredMovements.map((m) => {
                const isVenta = m.type === 'Venta';
                const isMerma = m.type === 'Merma / Pérdida';

                return (
                  <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                          isVenta
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : isMerma
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                        }`}
                      >
                        {isVenta ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                        {m.type}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-white">{m.productName}</td>
                    <td className="p-4 font-extrabold text-slate-200">{m.quantity} u.</td>
                    <td className="p-4 font-medium text-slate-400">${m.unitPrice.toFixed(2)}</td>
                    <td className="p-4 font-black text-white">${m.totalAmount.toFixed(2)}</td>
                    <td className="p-4 text-slate-400 font-mono">{m.date}</td>
                    <td className="p-4 text-slate-400">{m.notes || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
