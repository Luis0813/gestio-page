import React, { useState } from 'react';
import { Boxes, Plus, Trash2, Edit2, AlertTriangle, Search, RefreshCw, X, Save } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { RawMaterial } from '../../types';

export const RawMaterialManager: React.FC = () => {
  const { rawMaterials, addRawMaterial, updateRawMaterial, deleteRawMaterial } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMat, setEditingMat] = useState<RawMaterial | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('Kg');
  const [currentStock, setCurrentStock] = useState<number>(10);
  const [costPerUnit, setCostPerUnit] = useState<number>(1.5);
  const [supplier, setSupplier] = useState('');
  const [minStockAlert, setMinStockAlert] = useState<number>(5);

  const filteredMaterials = rawMaterials.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalInvestment = rawMaterials.reduce((sum, m) => sum + m.currentStock * m.costPerUnit, 0);
  const lowStockCount = rawMaterials.filter((m) => m.currentStock <= m.minStockAlert).length;

  const openCreateModal = () => {
    setEditingMat(null);
    setName('');
    setUnit('Kg');
    setCurrentStock(20);
    setCostPerUnit(2.0);
    setSupplier('');
    setMinStockAlert(5);
    setIsModalOpen(true);
  };

  const openEditModal = (mat: RawMaterial) => {
    setEditingMat(mat);
    setName(mat.name);
    setUnit(mat.unit);
    setCurrentStock(mat.currentStock);
    setCostPerUnit(mat.costPerUnit);
    setSupplier(mat.supplier);
    setMinStockAlert(mat.minStockAlert);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name,
      unit,
      currentStock: Number(currentStock),
      costPerUnit: Number(costPerUnit),
      supplier: supplier || 'Proveedor General',
      minStockAlert: Number(minStockAlert),
      lastRestockDate: new Date().toISOString().split('T')[0]
    };

    if (editingMat) {
      updateRawMaterial({ ...payload, id: editingMat.id });
    } else {
      addRawMaterial(payload);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total de Insumos</span>
            <div className="text-2xl font-black text-white mt-1">{rawMaterials.length}</div>
            <span className="text-[11px] text-slate-400">Variedades en almacén</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Boxes className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Inversión Materia Prima</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">${totalInvestment.toFixed(2)}</div>
            <span className="text-[11px] text-slate-400">Valor total en insumos</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <RefreshCw className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Alertas Reabastecimiento</span>
            <div className="text-2xl font-black text-amber-300 mt-1">{lowStockCount}</div>
            <span className="text-[11px] text-slate-400">Insumos bajo mínimo</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar materia prima..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-amber-600/20 transition-all w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Materia Prima</span>
        </button>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-4">Materia Prima / Insumo</th>
                <th className="p-4">Stock Actual</th>
                <th className="p-4">Costo por Unidad</th>
                <th className="p-4">Inversión Subtotal</th>
                <th className="p-4">Proveedor</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs">
              {filteredMaterials.map((mat) => {
                const isLow = mat.currentStock <= mat.minStockAlert;
                const subtotal = mat.currentStock * mat.costPerUnit;

                return (
                  <tr key={mat.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white">{mat.name}</div>
                      <div className="text-[10px] text-slate-400">Última reposesión: {mat.lastRestockDate}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <span className={`font-bold ${isLow ? 'text-amber-400' : 'text-slate-200'}`}>
                          {mat.currentStock} {mat.unit}
                        </span>
                        {isLow && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                            Reabastecer (Mín. {mat.minStockAlert})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-slate-300">${mat.costPerUnit.toFixed(2)} / {mat.unit}</td>
                    <td className="p-4 font-extrabold text-emerald-400">${subtotal.toFixed(2)}</td>
                    <td className="p-4 text-slate-300 font-medium">{mat.supplier}</td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(mat)}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar ${mat.name}?`)) deleteRawMaterial(mat.id);
                        }}
                        className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <h3 className="text-base font-extrabold text-white">
                {editingMat ? 'Editar Materia Prima' : 'Nueva Materia Prima'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 block">Nombre de Insumo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Harina de Trigo / Tela Algodón / Varilla Acero"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-1 block">Unidad</label>
                  <input
                    type="text"
                    placeholder="Kg, Litros, Metros"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-1 block">Costo por Unidad ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={costPerUnit}
                    onChange={(e) => setCostPerUnit(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-1 block">Stock Actual</label>
                  <input
                    type="number"
                    min="0"
                    value={currentStock}
                    onChange={(e) => setCurrentStock(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-amber-400 mb-1 block">Alerta Reabastecimiento</label>
                  <input
                    type="number"
                    min="1"
                    value={minStockAlert}
                    onChange={(e) => setMinStockAlert(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-amber-300 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 block">Proveedor / Origen</label>
                <input
                  type="text"
                  placeholder="Ej. Distribuidora Central, Molinos del Valle"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
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
                  className="flex items-center space-x-2 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Insumo</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
