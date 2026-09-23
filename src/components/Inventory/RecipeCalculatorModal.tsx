import React, { useState, useEffect } from 'react';
import { X, ChefHat, Plus, Trash2, Save, Calculator } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Product, RawMaterialRecipeItem } from '../../types';

interface RecipeCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export const RecipeCalculatorModal: React.FC<RecipeCalculatorModalProps> = ({
  isOpen,
  onClose,
  product
}) => {
  const { rawMaterials, updateProduct, calculateRecipeCost } = useApp();
  const [recipeItems, setRecipeItems] = useState<RawMaterialRecipeItem[]>([]);

  useEffect(() => {
    if (product) {
      setRecipeItems(product.rawMaterialRecipe || []);
    } else {
      setRecipeItems([]);
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const handleAddIngredient = () => {
    if (rawMaterials.length === 0) return;
    setRecipeItems([...recipeItems, { rawMaterialId: rawMaterials[0].id, quantityNeeded: 0.1 }]);
  };

  const handleRemoveIngredient = (index: number) => {
    setRecipeItems(recipeItems.filter((_, i) => i !== index));
  };

  const handleIngredientChange = (index: number, rawMaterialId: string, quantityNeeded: number) => {
    const updated = [...recipeItems];
    updated[index] = { rawMaterialId, quantityNeeded };
    setRecipeItems(updated);
  };

  const calculatedCost = calculateRecipeCost(recipeItems);

  const handleSaveRecipe = () => {
    updateProduct({
      ...product,
      costPrice: Number(calculatedCost.toFixed(2)),
      rawMaterialRecipe: recipeItems
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-panel border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-amber-950/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Receta / Insumos Materia Prima</h3>
              <p className="text-xs text-slate-400">
                Producto: <strong className="text-amber-300">{product.name}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Ingredientes & Insumos Utilizados:
            </span>
            <button
              onClick={handleAddIngredient}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Agregar Insumo
            </button>
          </div>

          {recipeItems.length === 0 ? (
            <div className="p-6 text-center bg-slate-950/60 rounded-2xl border border-slate-800 text-xs text-slate-400">
              No hay insumos vinculados a este producto. Haz clic en "Agregar Insumo" para calcular el costo de producción exacto.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {recipeItems.map((item, idx) => {
                const mat = rawMaterials.find((r) => r.id === item.rawMaterialId);
                const itemTotalCost = mat ? mat.costPerUnit * item.quantityNeeded : 0;

                return (
                  <div key={idx} className="flex items-center space-x-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <select
                      value={item.rawMaterialId}
                      onChange={(e) => handleIngredientChange(idx, e.target.value, item.quantityNeeded)}
                      className="w-1/2 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    >
                      {rawMaterials.map((rm) => (
                        <option key={rm.id} value={rm.id}>
                          {rm.name} (${rm.costPerUnit.toFixed(2)}/{rm.unit})
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center space-x-1 w-1/3">
                      <input
                        type="number"
                        step="0.01"
                        min="0.001"
                        value={item.quantityNeeded}
                        onChange={(e) => handleIngredientChange(idx, item.rawMaterialId, Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white font-bold"
                      />
                      <span className="text-[10px] text-slate-400">{mat?.unit || ''}</span>
                    </div>

                    <div className="w-1/4 text-right">
                      <span className="text-xs font-extrabold text-amber-400">${itemTotalCost.toFixed(2)}</span>
                    </div>

                    <button
                      onClick={() => handleRemoveIngredient(idx)}
                      className="p-1 text-rose-400 hover:bg-rose-500/10 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Cost Summary Box */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calculator className="w-5 h-5 text-amber-400" />
              <div>
                <span className="text-xs text-amber-300 font-semibold block">Costo de Materia Prima Calculado</span>
                <span className="text-[11px] text-slate-400">Actualizará el costo base del producto</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-amber-400">${calculatedCost.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-slate-800 flex justify-end space-x-3 bg-slate-900/60">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancelar
          </button>
          <button
            onClick={handleSaveRecipe}
            className="flex items-center space-x-2 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-amber-600/20"
          >
            <Save className="w-4 h-4" />
            <span>Aplicar Costo de Materia Prima</span>
          </button>
        </div>
      </div>
    </div>
  );
};
