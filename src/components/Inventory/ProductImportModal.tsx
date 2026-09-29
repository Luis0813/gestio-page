import React, { useRef, useState } from 'react';
import { X, Upload, FileSpreadsheet, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { productsApi } from '../../api/resources';
import { useApp } from '../../context/AppContext';

interface ProductImportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

/** Column names the importer understands, flagged as required or optional. */
const EXPECTED_COLUMNS = [
    { name: 'Nombre', required: true },
    { name: 'Costo', required: true },
    { name: 'Precio', required: true },
    { name: 'SKU', required: false },
    { name: 'Categoría', required: false },
    { name: 'Unidad', required: false },
    { name: 'Stock', required: false },
    { name: 'Stock Mínimo', required: false },
];

export const ProductImportModal: React.FC<ProductImportModalProps> = ({ isOpen, onClose }) => {
    const { showToast, refreshData } = useApp();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [rowErrors, setRowErrors] = useState<string[]>([]);
    const [errorsTruncated, setErrorsTruncated] = useState(false);

    if (!isOpen) return null;

    const resetAndClose = () => {
        setFile(null);
        setRowErrors([]);
        setErrorsTruncated(false);
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        onClose();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0] ?? null;
        setFile(selected);
        setRowErrors([]);
        setErrorsTruncated(false);
    };

    const handleImport = async () => {
        if (!file) {
            showToast('Selecciona un archivo primero.', 'error');
            return;
        }

        setIsImporting(true);
        setRowErrors([]);
        setErrorsTruncated(false);
        try {
            const result = await productsApi.import(file);
            setRowErrors(result.errors);
            setErrorsTruncated(Boolean(result.errors_truncated));

            if (result.created_count > 0) {
                showToast(`Se importaron ${result.created_count} producto(s).`, 'success');
                await refreshData();
            } else {
                showToast('No se importó ningún producto. Revisa los errores.', 'error');
            }

            if (result.errors_truncated) {
                showToast('Solo se muestran los primeros 100 errores. Revisa el archivo completo.', 'info');
            }

            if (result.errors.length > 0 && result.created_count > 0) {
                // Keep the modal open so the user can read the row errors.
                return;
            }
            resetAndClose();
        } catch (err: any) {
            showToast(err.message || 'Error al importar el archivo.', 'error');
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="glass-panel border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150 my-8">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                            <FileSpreadsheet className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-extrabold text-white">Importar Productos</h3>
                            <p className="text-xs text-slate-400">Sube tu Excel y crea los productos de una vez</p>
                        </div>
                    </div>
                    <button
                        onClick={resetAndClose}
                        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">
                    {/* Column guide */}
                    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
                        <p className="text-xs font-bold text-slate-300 mb-2">Columnas en la primera fila:</p>
                        <div className="flex flex-wrap gap-1.5">
                            {EXPECTED_COLUMNS.map((col) => (
                                <span
                                    key={col.name}
                                    className={`text-[10px] font-mono px-2 py-0.5 rounded border ${col.required
                                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                        : 'bg-slate-900 text-slate-400 border-slate-800'
                                        }`}
                                >
                                    {col.name}{col.required ? ' *' : ''}
                                </span>
                            ))}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-2">
                            <span className="text-emerald-400 font-semibold">* Obligatorias</span>: nombre, precio de inversión
                            y precio de venta. Las demás son opcionales: si no están o vienen vacías, se completan solas
                            (SKU automático, categoría "General", stock 0). Las columnas extra se ignoran, y no
                            importan mayúsculas ni tildes.
                        </p>
                    </div>

                    {/* File picker */}
                    <div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className={`w-full border-2 border-dashed rounded-2xl p-8 text-center transition-all ${file
                                ? 'border-emerald-500/50 bg-emerald-500/5'
                                : 'border-slate-700 hover:border-indigo-500/50 hover:bg-slate-950/40'
                                }`}
                        >
                            {file ? (
                                <>
                                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                                    <p className="text-sm font-bold text-white">{file.name}</p>
                                    <p className="text-[11px] text-slate-400 mt-1">Toca para cambiar el archivo</p>
                                </>
                            ) : (
                                <>
                                    <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                                    <p className="text-sm font-bold text-white">Toca para elegir tu archivo</p>
                                    <p className="text-[11px] text-slate-400 mt-1">Formatos: .xlsx, .xls, .csv</p>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Row errors */}
                    {rowErrors.length > 0 && (
                        <div className="bg-rose-950/30 border border-rose-500/30 rounded-2xl p-4 max-h-48 overflow-y-auto">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="w-4 h-4 text-rose-400" />
                                <p className="text-xs font-bold text-rose-300">
                                    {rowErrors.length} fila(s) no se importaron
                                </p>
                            </div>
                            <ul className="space-y-1">
                                {rowErrors.map((err, idx) => (
                                    <li key={idx} className="text-[11px] text-rose-200/90 font-mono">
                                        • {err}
                                    </li>
                                ))}
                            </ul>
                            {errorsTruncated && (
                                <p className="text-[11px] text-amber-300/90 mt-2 font-semibold">
                                    Se muestran solo los primeros 100 errores. Revisa el archivo completo.
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-end gap-3 bg-slate-900/40">
                    <button
                        type="button"
                        onClick={resetAndClose}
                        disabled={isImporting}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleImport}
                        disabled={!file || isImporting}
                        className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                        <Upload className="w-4 h-4" />
                        {isImporting ? 'Importando...' : 'Importar'}
                    </button>
                </div>
            </div>
        </div>
    );
};
