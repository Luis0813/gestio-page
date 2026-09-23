import React, { useState } from 'react';
import {
  Package,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Plus,
  Edit2,
  Trash2,
  ChefHat,
  ShoppingBag,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Product } from '../../types';

interface ProductListProps {
  searchTerm: string;
  onEditProduct: (product: Product) => void;
  onOpenNewProductModal: () => void;
  onOpenRecipeModal: (product: Product) => void;
  onOpenMovementModal: (product: Product) => void;
}

export const ProductList: React.FC<ProductListProps> = ({
  searchTerm,
  onEditProduct,
  onOpenNewProductModal,
  onOpenRecipeModal,
  onOpenMovementModal
}) => {
  const { filteredProducts, deleteProduct } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyLowStock, setOnlyLowStock] = useState<boolean>(false);

  const categories = Array.from(new Set(filteredProducts.map((p) => p.category)));

  const displayedProducts = filteredProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesLowStock = !onlyLowStock || product.stock <= product.minStockAlert;
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const totalProducts = filteredProducts.length;
  const totalStockItems = filteredProducts.reduce((acc, p) => acc + p.stock, 0);
  const totalStockValue = filteredProducts.reduce((acc, p) => acc + p.stock * p.costPrice, 0);
  const lowStockCount = filteredProducts.filter((p) => p.stock <= p.minStockAlert).length;
  const avgMarginPercent =
    filteredProducts.length > 0
      ? filteredProducts.reduce((acc, p) => {
          const margin = p.salePrice > 0 ? ((p.salePrice - p.costPrice) / p.salePrice) * 100 : 0;
          return acc + margin;
        }, 0) / filteredProducts.length
      : 0;

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Productos</span>
            <div className="text-2xl font-black text-white mt-1">{totalProducts}</div>
            <span className="text-[11px] text-slate-400 mt-1 block">{totalStockItems} unidades en total</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Valor del Inventario</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">${totalStockValue.toFixed(2)}</div>
            <span className="text-[11px] text-slate-400 mt-1 block">Lo que tienes invertido</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Margen Promedio</span>
            <div className="text-2xl font-black text-purple-400 mt-1">{avgMarginPercent.toFixed(1)}%</div>
            <span className="text-[11px] text-slate-400 mt-1 block">Ganancia promedio</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div
          onClick={() => setOnlyLowStock(!onlyLowStock)}
          className={`glass-panel p-5 rounded-2xl border cursor-pointer transition-all ${
            onlyLowStock
              ? 'border-amber-500/80 bg-amber-500/10 shadow-lg shadow-amber-500/10'
              : 'border-slate-800 hover:border-amber-500/40'
          } flex items-center justify-between`}
        >
          <div>
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">¡Se están acabando!</span>
            <div className="text-2xl font-black text-amber-300 mt-1">{lowStockCount}</div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {onlyLowStock ? '✓ Mostrando solo estos' : 'Toca para ver cuáles'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Category Filter + Add Button */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">Filtrar:</span>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-950/60 text-slate-400 hover:text-white'
            }`}
          >
            Todos ({filteredProducts.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-950/60 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <button
          onClick={onOpenNewProductModal}
          className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/20 transition-all w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Producto</span>
        </button>
      </div>

      {/* Product Cards */}
      {displayedProducts.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800">
          <Info className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">Sin productos todavía</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Agrega tu primer producto para empezar a llevar el control de tu inventario.
          </p>
          <button
            onClick={onOpenNewProductModal}
            className="mt-4 inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Mi Primer Producto</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedProducts.map((product) => {
            const profitMargin = product.salePrice - product.costPrice;
            const marginPercent = product.salePrice > 0 ? (profitMargin / product.salePrice) * 100 : 0;
            const isLowStock = product.stock <= product.minStockAlert;

            return (
              <div
                key={product.id}
                className="glass-card rounded-2xl p-5 border border-slate-800/80 hover:border-indigo-500/40 transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* Top: SKU + Category */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-950 text-indigo-400 border border-indigo-500/20">
                      {product.sku}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        {product.category}
                      </span>
                      {isLowStock && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 animate-pulse">
                          <AlertTriangle className="w-3 h-3" /> ¡Poco stock!
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Product Name */}
                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug">
                    {product.name}
                  </h3>

                  {/* Stock Bar */}
                  <div className="mt-3 mb-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-400 font-medium">En stock:</span>
                      <span className={`font-bold ${isLowStock ? 'text-amber-400' : 'text-slate-200'}`}>
                        {product.stock} {product.unit}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isLowStock ? 'bg-amber-500' : 'bg-gradient-to-r from-emerald-500 to-indigo-500'
                        }`}
                        style={{
                          width: `${Math.min(100, (product.stock / (product.minStockAlert * 3)) * 100)}%`
                        }}
                      />
                    </div>
                  </div>

                  {/* Custom Attributes (if any) */}
                  {Object.keys(product.customAttributes).length > 0 && (
                    <div className="mb-4 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(product.customAttributes).map(([key, val]) => (
                          <span
                            key={key}
                            className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800"
                          >
                            <strong className="text-indigo-400">{key}:</strong> {String(val)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Price & Profit */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center mb-4">
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium block">Venta</span>
                      <span className="text-sm font-extrabold text-white">${product.salePrice.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium block">Costo</span>
                      <span className="text-sm font-extrabold text-slate-400">${product.costPrice.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-400 font-medium block">Ganas</span>
                      <span className="text-sm font-extrabold text-emerald-400">
                        +${profitMargin.toFixed(2)} <span className="text-[10px]">({marginPercent.toFixed(0)}%)</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onOpenMovementModal(product)}
                    className="flex-1 flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Vender</span>
                  </button>

                  {product.rawMaterialRecipe && product.rawMaterialRecipe.length > 0 && (
                    <button
                      onClick={() => onOpenRecipeModal(product)}
                      title="Ver receta / insumos"
                      className="flex items-center space-x-1 px-2.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold transition-all"
                    >
                      <ChefHat className="w-3.5 h-3.5" />
                      <span>Receta</span>
                    </button>
                  )}

                  <button
                    onClick={() => onEditProduct(product)}
                    title="Editar"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`¿Seguro que quieres eliminar "${product.name}"?`)) {
                        deleteProduct(product.id);
                      }
                    }}
                    title="Eliminar"
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
