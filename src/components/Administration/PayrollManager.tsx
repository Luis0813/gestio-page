import React, { useState } from 'react';
import { Plus, Trash2, HardHat, CheckCircle2, X, Save } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { WorkerPayroll } from '../../types';

export const PayrollManager: React.FC = () => {
  const { payroll, addPayrollEntry, deletePayrollEntry } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [workerName, setWorkerName] = useState('');
  const [role, setRole] = useState('Obrero de Producción');
  const [paymentType, setPaymentType] = useState<WorkerPayroll['paymentType']>('Por Obra / Destajo');
  const [baseRate, setBaseRate] = useState<number>(0.15); // e.g. $0.15 per unit made
  const [quantityOrHoursCompleted, setQuantityOrHoursCompleted] = useState<number>(1000); // e.g. 1000 empanadas or 40 hours
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [status] = useState<'Pagado' | 'Pendiente'>('Pagado');
  const [notes, setNotes] = useState('');

  const totalPayrollCost = payroll.reduce((sum, p) => sum + p.totalPaid, 0);

  const calculateTotalPaid = (type: WorkerPayroll['paymentType'], rate: number, qty: number) => {
    if (type === 'Fijo Mensual' || type === 'Fijo Quincenal') {
      return rate;
    }
    return rate * qty;
  };

  const currentTotalCalculated = calculateTotalPaid(paymentType, baseRate, quantityOrHoursCompleted);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workerName.trim()) return;

    addPayrollEntry({
      workerName,
      role,
      paymentType,
      baseRate: Number(baseRate),
      quantityOrHoursCompleted: Number(quantityOrHoursCompleted),
      totalPaid: currentTotalCalculated,
      paymentDate,
      status,
      notes: notes || undefined
    });

    setWorkerName('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <HardHat className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Nómina Total de Trabajadores y Obreros
            </span>
            <div className="text-3xl font-black text-purple-300 mt-1">${totalPayrollCost.toFixed(2)}</div>
            <p className="text-xs text-slate-400 mt-0.5">
              Sueldos fijos, horas laboradas y <strong>pago por obra/destajo</strong>.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-5 py-3 rounded-xl text-xs font-bold shadow-lg shadow-purple-600/20 transition-all justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Pago a Trabajador / Obrero</span>
        </button>
      </div>

      {/* Payroll Records Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-4">Trabajador & Rol</th>
                <th className="p-4">Esquema de Pago</th>
                <th className="p-4">Tarifa / Renglón</th>
                <th className="p-4">Total Pagado</th>
                <th className="p-4">Fecha Pago</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs">
              {payroll.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-white flex items-center space-x-2">
                      <span>{item.workerName}</span>
                    </div>
                    <div className="text-[11px] text-purple-300 font-medium">{item.role}</div>
                  </td>

                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-200 border border-slate-700">
                      {item.paymentType}
                    </span>
                  </td>

                  <td className="p-4 text-slate-300">
                    {item.paymentType === 'Por Obra / Destajo' ? (
                      <div>
                        <strong>${item.baseRate.toFixed(2)}</strong> / unidad
                        <div className="text-[10px] text-slate-400">({item.quantityOrHoursCompleted} unidades)</div>
                      </div>
                    ) : item.paymentType === 'Por Hora' ? (
                      <div>
                        <strong>${item.baseRate.toFixed(2)}</strong> / hora
                        <div className="text-[10px] text-slate-400">({item.quantityOrHoursCompleted} horas)</div>
                      </div>
                    ) : (
                      <div>Fijo ${item.baseRate.toFixed(2)}</div>
                    )}
                  </td>

                  <td className="p-4 font-black text-purple-300 text-sm">${item.totalPaid.toFixed(2)}</td>

                  <td className="p-4 text-slate-400">{item.paymentDate}</td>

                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" /> {item.status}
                    </span>
                  </td>

                  <td className="p-4 text-right">
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar registro de pago para ${item.workerName}?`)) deletePayrollEntry(item.id);
                      }}
                      className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Payroll */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <h3 className="text-base font-extrabold text-white">Registrar Pago a Personal / Obreros</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-1 block">Nombre del Trabajador *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Carlos Mendoza, María Suárez"
                    value={workerName}
                    onChange={(e) => setWorkerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-1 block">Puesto / Rol</label>
                  <input
                    type="text"
                    placeholder="Maestro Cocinero, Obrero Fritura, Vendedor"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 block">Modalidad de Pago:</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Por Obra / Destajo', 'Por Hora', 'Fijo Quincenal', 'Fijo Mensual'] as const).map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => {
                        setPaymentType(t);
                        if (t === 'Por Obra / Destajo') setBaseRate(0.15);
                        if (t === 'Por Hora') setBaseRate(5.0);
                        if (t === 'Fijo Quincenal') setBaseRate(350.0);
                        if (t === 'Fijo Mensual') setBaseRate(700.0);
                      }}
                      className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition-all ${
                        paymentType === t
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'bg-slate-950 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-1 block">
                    {paymentType === 'Por Obra / Destajo'
                      ? 'Tarifa por Unidad Producción ($)'
                      : paymentType === 'Por Hora'
                      ? 'Tarifa por Hora ($)'
                      : 'Monto Salario Fijo ($)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={baseRate}
                    onChange={(e) => setBaseRate(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-bold"
                  />
                </div>

                {(paymentType === 'Por Obra / Destajo' || paymentType === 'Por Hora') && (
                  <div>
                    <label className="text-xs font-semibold text-purple-300 mb-1 block">
                      {paymentType === 'Por Obra / Destajo' ? 'Unidades Armadas / Hechas' : 'Horas Laboradas'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={quantityOrHoursCompleted}
                      onChange={(e) => setQuantityOrHoursCompleted(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-purple-300 font-bold"
                    />
                  </div>
                )}
              </div>

              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between text-xs">
                <span className="text-purple-300 font-semibold">Total a Pagar Calculado:</span>
                <strong className="text-purple-300 font-black text-sm">${currentTotalCalculated.toFixed(2)}</strong>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-1 block">Fecha de Pago</label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-1 block">Notas / Observaciones</label>
                  <input
                    type="text"
                    placeholder="Ej. Pago semana 32, lote especial"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
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
                  className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Registro</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
