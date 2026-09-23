import React, { useState } from 'react';
import { Plus, Trash2, Calendar, Tag, X, Save } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Expense } from '../../types';

export const ExpensesManager: React.FC = () => {
  const { expenses, addExpense, deleteExpense } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Expense['category']>('Servicios');
  const [amount, setAmount] = useState<number>(50.0);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [periodicity, setPeriodicity] = useState<Expense['periodicity']>('Mensual');

  const categories: Expense['category'][] = [
    'Alquiler',
    'Servicios',
    'Mantenimiento',
    'Marketing',
    'Herramientas',
    'Impuestos',
    'Otros'
  ];

  const totalExpensesAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    addExpense({
      description,
      category,
      amount: Number(amount),
      date,
      periodicity
    });

    setDescription('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner KPI */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Gastos Operativos</span>
          <div className="text-3xl font-black text-rose-400 mt-1">${totalExpensesAmount.toFixed(2)}</div>
          <p className="text-xs text-slate-400 mt-1">
            Incluye servicios públicos, alquileres, herramientas y mantenimientos.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white px-5 py-3 rounded-xl text-xs font-bold shadow-lg shadow-rose-600/20 transition-all justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Nuevo Gasto Operativo</span>
        </button>
      </div>

      {/* Expense Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {expenses.map((expense) => (
          <div
            key={expense.id}
            className="glass-card rounded-2xl p-5 border border-slate-800/80 hover:border-rose-500/30 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
                  {expense.category}
                </span>
                <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-500" /> {expense.date}
                </span>
              </div>

              <h4 className="text-sm font-bold text-white mb-2 leading-snug">{expense.description}</h4>

              <div className="text-xs text-slate-400 flex items-center space-x-2">
                <Tag className="w-3.5 h-3.5 text-slate-500" />
                <span>Periodicidad: <strong>{expense.periodicity}</strong></span>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">Monto Gasto:</span>
                <span className="text-lg font-black text-rose-400">${expense.amount.toFixed(2)}</span>
              </div>

              <button
                onClick={() => {
                  if (confirm(`¿Eliminar gasto ${expense.description}?`)) deleteExpense(expense.id);
                }}
                className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all"
                title="Eliminar Gasto"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add Expense */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <h3 className="text-base font-extrabold text-white">Registrar Gasto Operativo</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 block">Descripción del Gasto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Pago Luz Eléctrica, Licencia Software, Publicidad"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-1 block">Categoría</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-1 block">Periodicidad</label>
                  <select
                    value={periodicity}
                    onChange={(e) => setPeriodicity(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="Único">Único</option>
                    <option value="Semanal">Semanal</option>
                    <option value="Quincenal">Quincenal</option>
                    <option value="Mensual">Mensual</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-rose-400 mb-1 block">Monto Total ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-rose-400 font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-1 block">Fecha de Registro</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-2 bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Gasto</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
