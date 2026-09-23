import React, { useState } from 'react';
import { X, ArrowUpRight, Save, UserCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Product } from '../../types';

interface StockMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export const StockMovementModal: React.FC<StockMovementModalProps> = ({
  isOpen,
  onClose,
  product
}) => {
  const { addStockMovement, customers } = useApp();

  if (!isOpen || !product) return null;

  const [type, setType] = useState<'Venta' | 'Compra Insumos' | 'Ajuste Stock' | 'Merma / Pérdida'>('Venta');
  const [quantity, setQuantity] = useState<number>(1);
  const [unitPrice, setUnitPrice] = useState<number>(product.salePrice);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customCustomerName, setCustomCustomerName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const handleTypeChange = (newType: 'Venta' | 'Compra Insumos' | 'Ajuste Stock' | 'Merma / Pérdida') => {
    setType(newType);
    if (newType === 'Venta') {
      setUnitPrice(product.salePrice);
    } else if (newType === 'Merma / Pérdida' || newType === 'Compra Insumos') {
      setUnitPrice(product.costPrice);
    } else {
      setUnitPrice(0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const customerObj = customers.find((c) => c.id === selectedCustomerId);
    const finalCustomerName = customerObj ? customerObj.name : customCustomerName.trim() || undefined;

    addStockMovement({
      productId: product.id,
      productName: product.name,
      type,
      quantity: Number(quantity),
      unitPrice: Number(unitPrice),
      totalAmount: Number(quantity) * Number(unitPrice),
      date: todayStr,
      customerId: selectedCustomerId || undefined,
      customerName: finalCustomerName,
      notes: notes || undefined
    });

    onClose();
  };

  const totalAmount = quantity * unitPrice;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-panel border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-2">
            <ArrowUpRight className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-extrabold text-white">Registrar Movimiento de Inventario</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white">{product.name}</div>
              <div className="text-[11px] text-slate-400">Stock Actual: {product.stock} {product.unit}</div>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
              {product.sku}
            </span>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Tipo de Movimiento:</label>
            <div className="grid grid-cols-2 gap-2">
              {(['Venta', 'Compra Insumos', 'Ajuste Stock', 'Merma / Pérdida'] as const).map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => handleTypeChange(t)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all ${
                    type === t
                      ? t === 'Venta'
                        ? 'bg-emerald-600 text-white'
                        : t === 'Merma / Pérdida'
                        ? 'bg-rose-600 text-white'
                        : 'bg-indigo-600 text-white'
                      : 'bg-slate-950 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Customer Selection for Venta */}
          {type === 'Venta' && (
            <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/30 space-y-2">
              <label className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-indigo-400" /> Registrar Cliente Comprador:
              </label>

              <select
                value={selectedCustomerId}
                onChange={(e) => {
                  setSelectedCustomerId(e.target.value);
                  if (e.target.value) setCustomCustomerName('');
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="">-- Cliente Anónimo / Venta Rápida --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    👤 {c.name} {c.phone ? `(${c.phone})` : ''}
                  </option>
                ))}
              </select>

              {!selectedCustomerId && (
                <input
                  type="text"
                  placeholder="O escribe el nombre del cliente aquí..."
                  value={customCustomerName}
                  onChange={(e) => setCustomCustomerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500"
                />
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1 block">Cantidad</label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1 block">Precio Unitario ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={unitPrice}
                onChange={(e) => setUnitPrice(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-bold"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 mb-1 block">Notas / Observaciones</label>
            <input
              type="text"
              placeholder="Ej. Venta en mostrador, factura #102..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Total Operación:</span>
            <strong className="text-emerald-400 font-extrabold text-sm">${totalAmount.toFixed(2)}</strong>
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg"
            >
              <Save className="w-4 h-4" />
              <span>Registrar Movimiento</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
