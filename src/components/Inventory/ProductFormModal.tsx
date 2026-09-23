import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calculator, Save, ChefHat, Info } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Product, BusinessDomain, RawMaterialRecipeItem } from '../../types';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  productToEdit
}) => {
  const { addProduct, updateProduct, rawMaterials } = useApp();

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('');
  const [domain] = useState<BusinessDomain>('custom');
  const [stock, setStock] = useState<number>(10);
  const [minStockAlert, setMinStockAlert] = useState<number>(5);
  const [costPrice, setCostPrice] = useState<number>(1.0);
  const [salePrice, setSalePrice] = useState<number>(3.0);
  const [unit, setUnit] = useState('Unidad');

  // Custom attributes key-values
  const [customFields, setCustomFields] = useState<{ key: string; value: string }[]>([
    { key: '', value: '' }
  ]);

  // Recipe Raw Material Items
  const [recipeItems, setRecipeItems] = useState<RawMaterialRecipeItem[]>([]);
  const [useRawMaterialsForCost, setUseRawMaterialsForCost] = useState<boolean>(false);

  // Sync state when editing vs creating
  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setSku(productToEdit.sku);
      setCategory(productToEdit.category);
      setStock(productToEdit.stock);
      setMinStockAlert(productToEdit.minStockAlert);
      setCostPrice(productToEdit.costPrice);
      setSalePrice(productToEdit.salePrice);
      setUnit(productToEdit.unit);

      const attrs = Object.entries(productToEdit.customAttributes).map(([k, v]) => ({
        key: k,
        value: String(v)
      }));
      setCustomFields(attrs.length > 0 ? attrs : [{ key: '', value: '' }]);

      if (productToEdit.rawMaterialRecipe && productToEdit.rawMaterialRecipe.length > 0) {
        setRecipeItems(productToEdit.rawMaterialRecipe);
        setUseRawMaterialsForCost(true);
      } else {
        setRecipeItems([]);
        setUseRawMaterialsForCost(false);
      }
    } else {
      setName('');
      setSku(`PROD-${Math.floor(1000 + Math.random() * 9000)}`);
      setCategory('General');
      setUnit('Unidad');
      setStock(10);
      setMinStockAlert(5);
      setCostPrice(1.0);
      setSalePrice(3.0);
      setCustomFields([{ key: 'Especificación', value: 'Valor' }]);
      setRecipeItems([]);
      setUseRawMaterialsForCost(false);
    }
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAddField = () => {
    setCustomFields([...customFields, { key: '', value: '' }]);
  };

  const handleRemoveField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const handleFieldChange = (index: number, key: string, value: string) => {
    const updated = [...customFields];
    updated[index] = { key, value };
    setCustomFields(updated);
  };

  // Recipe Handlers
  const handleAddRecipeItem = () => {
    if (rawMaterials.length === 0) return;
    const newItem: RawMaterialRecipeItem = { rawMaterialId: rawMaterials[0].id, quantityNeeded: 0.1 };
    const updated = [...recipeItems, newItem];
    setRecipeItems(updated);
    recalculateCostFromRecipe(updated);
  };

  const handleRemoveRecipeItem = (index: number) => {
    const updated = recipeItems.filter((_, i) => i !== index);
    setRecipeItems(updated);
    recalculateCostFromRecipe(updated);
  };

  const handleRecipeItemChange = (index: number, rawMaterialId: string, quantityNeeded: number) => {
    const updated = [...recipeItems];
    updated[index] = { rawMaterialId, quantityNeeded };
    setRecipeItems(updated);
    recalculateCostFromRecipe(updated);
  };

  const recalculateCostFromRecipe = (items: RawMaterialRecipeItem[]) => {
    const total = items.reduce((sum, item) => {
      const rm = rawMaterials.find((r) => r.id === item.rawMaterialId);
      return sum + (rm ? rm.costPerUnit * item.quantityNeeded : 0);
    }, 0);
    setCostPrice(Number(total.toFixed(2)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const attributesObj: Record<string, string> = {};
    customFields.forEach((item) => {
      if (item.key.trim()) {
        attributesObj[item.key.trim()] = item.value.trim();
      }
    });

    const productPayload = {
      name,
      sku,
      category,
      businessDomain: domain,
      stock: Number(stock),
      minStockAlert: Number(minStockAlert),
      costPrice: Number(costPrice),
      salePrice: Number(salePrice),
      unit,
      customAttributes: attributesObj,
      rawMaterialRecipe: useRawMaterialsForCost ? recipeItems : undefined
    };

    if (productToEdit) {
      updateProduct({ ...productPayload, id: productToEdit.id });
    } else {
      addProduct(productPayload);
    }

    onClose();
  };

  // Live profit calculation
  const calculatedProfit = salePrice - costPrice;
  const calculatedMargin = salePrice > 0 ? (calculatedProfit / salePrice) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-panel border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150 my-8">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">
                {productToEdit ? 'Editar Producto' : 'Crear Nuevo Producto'}
              </h3>
              <p className="text-xs text-slate-400">Define el producto y sus materias primas de origen</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Basic Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1 block">Nombre del Producto *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Empanada de Carne, Camiseta, Taladro"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1 block">SKU / Código Único</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="PROD-001"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1 block">Categoría de Producto</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ej. Alimentos, Ropa, Herramientas"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1 block">Unidad de Medida</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Unidad">Unidad</option>
                <option value="Combo">Combo</option>
                <option value="Kg">Kilogramos (Kg)</option>
                <option value="Litros">Litros</option>
                <option value="Metro">Metro</option>
                <option value="Par">Par</option>
                <option value="Juego">Juego / Kit</option>
                <option value="Docena">Docena</option>
              </select>
            </div>
          </div>

          {/* Raw Material Recipe Section */}
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <ChefHat className="w-4 h-4 text-amber-400" /> Crear Producto a partir de Materia Prima:
              </span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useRawMaterialsForCost}
                  onChange={(e) => {
                    setUseRawMaterialsForCost(e.target.checked);
                    if (e.target.checked && recipeItems.length === 0 && rawMaterials.length > 0) {
                      handleAddRecipeItem();
                    }
                  }}
                  className="rounded border-slate-800 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-xs text-amber-300 font-semibold">Usar Receta/Insumos</span>
              </label>
            </div>

            {useRawMaterialsForCost && (
              <div className="space-y-3 pt-1">
                {rawMaterials.length === 0 ? (
                  <div className="text-xs text-amber-400/80 bg-amber-500/10 p-3 rounded-xl flex items-center gap-2">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>No tienes materias primas registradas todavía. Ve al módulo "Materia Prima" para agregar harina, carne, tela, acero, etc.</span>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      {recipeItems.map((item, idx) => {
                        const rm = rawMaterials.find((r) => r.id === item.rawMaterialId);
                        const subtotal = rm ? rm.costPerUnit * item.quantityNeeded : 0;

                        return (
                          <div key={idx} className="flex items-center space-x-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
                            <select
                              value={item.rawMaterialId}
                              onChange={(e) => handleRecipeItemChange(idx, e.target.value, item.quantityNeeded)}
                              className="w-1/2 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                            >
                              {rawMaterials.map((r) => (
                                <option key={r.id} value={r.id}>
                                  {r.name} (${r.costPerUnit.toFixed(2)}/{r.unit})
                                </option>
                              ))}
                            </select>

                            <div className="flex items-center space-x-1 w-1/3">
                              <input
                                type="number"
                                step="0.01"
                                min="0.001"
                                value={item.quantityNeeded}
                                onChange={(e) => handleRecipeItemChange(idx, item.rawMaterialId, Number(e.target.value))}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-white font-bold"
                              />
                              <span className="text-[10px] text-slate-400">{rm?.unit || ''}</span>
                            </div>

                            <div className="w-1/4 text-right">
                              <span className="font-extrabold text-amber-400">${subtotal.toFixed(2)}</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveRecipeItem(idx)}
                              className="p-1 text-rose-400 hover:bg-rose-500/10 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={handleAddRecipeItem}
                      className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Agregar Insumo / Materia Prima
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Pricing & Profit Simulator */}
          <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-indigo-400" /> Costo Base y Precio de Venta
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${calculatedMargin >= 30
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
              >
                {calculatedMargin.toFixed(1)}% Margen
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">
                  {useRawMaterialsForCost ? 'Costo Calculado de Materias Primas ($)' : 'Costo Directo de Producción / Compra ($)'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  readOnly={useRawMaterialsForCost}
                  value={costPrice}
                  onChange={(e) => setCostPrice(Number(e.target.value))}
                  className={`w-full border rounded-xl px-3 py-2 text-xs font-bold ${
                    useRawMaterialsForCost
                      ? 'bg-amber-950/40 border-amber-500/40 text-amber-300 cursor-not-allowed'
                      : 'bg-slate-950 border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-emerald-400 mb-1 block">Precio de Venta al Público ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={salePrice}
                  onChange={(e) => setSalePrice(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-emerald-500/40 rounded-xl px-3 py-2 text-xs text-emerald-400 focus:outline-none focus:border-emerald-500 font-black text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-indigo-500/20 text-slate-300">
              <span>Ganancia Neta estimada por unidad:</span>
              <strong className="text-emerald-400 font-extrabold text-sm">
                +${calculatedProfit.toFixed(2)} / {unit}
              </strong>
            </div>
          </div>

          {/* Inventory Stock & Alerts */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1 block">Stock Inicial Disponible</label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-amber-400 mb-1 block">Alerta de Stock Mínimo</label>
              <input
                type="number"
                min="1"
                value={minStockAlert}
                onChange={(e) => setMinStockAlert(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-amber-300 focus:outline-none focus:border-amber-500 font-bold"
              />
            </div>
          </div>

          {/* Dynamic Custom Attributes Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Especificaciones / Atributos Dinámicos:
              </label>
              <button
                type="button"
                onClick={handleAddField}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar Campo
              </button>
            </div>

            <div className="space-y-2">
              {customFields.map((field, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Ej. Talla / Marca / Medida"
                    value={field.key}
                    onChange={(e) => handleFieldChange(idx, e.target.value, field.value)}
                    className="w-1/2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-medium"
                  />
                  <input
                    type="text"
                    placeholder="Ej. M / Truper / 1/2 pulgada"
                    value={field.value}
                    onChange={(e) => handleFieldChange(idx, field.key, e.target.value)}
                    className="w-1/2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                  {customFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveField(idx)}
                      className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{productToEdit ? 'Guardar Cambios' : 'Crear Producto'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
