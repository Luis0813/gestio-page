import React, { useState } from 'react';
import { Sparkles, X, RotateCcw } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const WelcomeBanner: React.FC = () => {
  const { resetDemoData } = useApp();
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="glass-card rounded-2xl p-5 border border-indigo-500/30 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-purple-950/40 relative overflow-hidden shadow-xl mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>

          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              ¡Bienvenido a Gestio Enterprise! <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Modo Intuitivo</span>
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Sistema fácil e intuitivo diseñado para manejar tu inventario y finanzas en 4 simples módulos:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 mt-3">
              <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 text-[11px]">
                <strong className="text-indigo-400 block font-bold">1. Preset de Empresa</strong>
                <span className="text-slate-300">Cambia en la barra lateral entre Ropa, Empanadas o Ferretería.</span>
              </div>
              <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 text-[11px]">
                <strong className="text-emerald-400 block font-bold">2. Ganancia x Producto</strong>
                <span className="text-slate-300">Mira el margen neta y la receta de materia prima.</span>
              </div>
              <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 text-[11px]">
                <strong className="text-purple-400 block font-bold">3. Nómina & Obreros</strong>
                <span className="text-slate-300">Pagos fijos, horas y pagos por obra / destajo.</span>
              </div>
              <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 text-[11px]">
                <strong className="text-amber-400 block font-bold">4. Balance Neto</strong>
                <span className="text-slate-300">Consulta ganancias semanales, quincenales o mensuales.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
          <button
            onClick={() => {
              if (confirm('¿Deseas restaurar todos los datos de demostración limpios?')) {
                resetDemoData();
              }
            }}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-xl text-xs font-semibold transition-all border border-slate-700"
            title="Restaurar datos iniciales si deseas empezar desde cero"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Datos Demo</span>
          </button>

          <button
            onClick={() => setIsVisible(false)}
            className="flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md transition-all"
          >
            <span>¡Entendido!</span>
            <X className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};
