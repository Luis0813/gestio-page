import { useState, useEffect } from 'react';
import { Building2, Check, X, Loader2, RefreshCw, Calendar, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Company {
    id: number;
    email: string;
    company_name: string;
    active: boolean;
    membership_expires_at?: string;
    created_at: string;
}

export function CompaniesManager() {
    const { token } = useAuth();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await fetch('http://localhost:3000/companies', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (response.ok) {
                setCompanies(data.data);
            } else if (response.status === 401) {
                setError('Sesión no autorizada o expirada. Por favor cierra sesión y vuelve a ingresar.');
            } else {
                setError(data.status?.message || 'Error al cargar empresas.');
            }
        } catch (err) {
            setError('Error de conexión con el servidor.');
        } finally {
            setLoading(false);
        }
    };

    const toggleCompanyStatus = async (companyId: number, currentStatus: boolean) => {
        try {
            setUpdatingId(companyId);
            const response = await fetch(`http://localhost:3000/companies/${companyId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user: { active: !currentStatus }
                })
            });

            const data = await response.json();

            if (response.ok) {
                setCompanies(prev => prev.map(c =>
                    c.id === companyId ? { ...c, active: !currentStatus } : c
                ));
            } else {
                setError(data.status?.message || 'Error al actualizar empresa.');
            }
        } catch (err) {
            setError('Error de conexión con el servidor.');
        } finally {
            setUpdatingId(null);
        }
    };

    const extendMembership = async (companyId: number, currentExp?: string) => {
        try {
            setUpdatingId(companyId);
            const baseDate = currentExp && new Date(currentExp) > new Date()
                ? new Date(currentExp)
                : new Date();

            // Extend 1 month
            const newExp = new Date(baseDate.setMonth(baseDate.getMonth() + 1)).toISOString();

            const response = await fetch(`http://localhost:3000/companies/${companyId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user: {
                        active: true,
                        membership_expires_at: newExp
                    }
                })
            });

            const data = await response.json();

            if (response.ok) {
                setCompanies(prev => prev.map(c =>
                    c.id === companyId ? { ...c, active: true, membership_expires_at: newExp } : c
                ));
            } else {
                setError(data.status?.message || 'Error al extender membresía.');
            }
        } catch (err) {
            setError('Error de conexión con el servidor.');
        } finally {
            setUpdatingId(null);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Sin fecha';
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const isExpired = (dateString?: string) => {
        if (!dateString) return false;
        return new Date(dateString) < new Date();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
                        <Building2 className="w-7 h-7 text-indigo-400" />
                        Gestión de Empresas & Membresías
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                        Controla el acceso, fechas de vencimiento de membresía y renovaciones de empresas
                    </p>
                </div>
                <button
                    onClick={fetchCompanies}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white rounded-xl text-sm font-medium transition-colors"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Actualizar
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
                    <p className="text-red-400 text-sm font-medium">{error}</p>
                </div>
            )}

            {/* Loading State */}
            {loading && companies.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                </div>
            ) : null}

            {/* Companies Table */}
            {!loading && companies.length > 0 ? (
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-neutral-800 bg-neutral-950/60 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    <th className="text-left px-6 py-4">Empresa</th>
                                    <th className="text-left px-6 py-4">Email</th>
                                    <th className="text-left px-6 py-4">Fecha Registro</th>
                                    <th className="text-left px-6 py-4">Vencimiento Membresía</th>
                                    <th className="text-center px-6 py-4">Estado</th>
                                    <th className="text-center px-6 py-4">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800 text-xs">
                                {companies.map((company) => {
                                    const expired = isExpired(company.membership_expires_at);

                                    return (
                                        <tr key={company.id} className="hover:bg-neutral-800/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${company.active && !expired
                                                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                        }`}>
                                                        <Building2 className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <div className="text-white font-bold text-sm">{company.company_name}</div>
                                                        <div className="text-[11px] text-slate-400">ID: #{company.id}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className="text-slate-300 font-medium">{company.email}</span>
                                            </td>

                                            <td className="px-6 py-4 font-mono text-slate-400">
                                                {formatDate(company.created_at)}
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 font-mono">
                                                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                                                    <span className={`font-bold ${expired ? 'text-rose-400' : 'text-emerald-400'}`}>
                                                        {formatDate(company.membership_expires_at)}
                                                    </span>
                                                </div>
                                                {expired && (
                                                    <span className="text-[10px] text-rose-400 font-bold block mt-0.5">
                                                        ⚠️ Membresía Vencida
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold ${company.active && !expired
                                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                    }`}>
                                                    {company.active && !expired ? (
                                                        <>
                                                            <Check className="w-3.5 h-3.5" />
                                                            Activa
                                                        </>
                                                    ) : (
                                                        <>
                                                            <X className="w-3.5 h-3.5" />
                                                            Deshabilitada
                                                        </>
                                                    )}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-center space-x-2">
                                                <button
                                                    onClick={() => extendMembership(company.id, company.membership_expires_at)}
                                                    disabled={updatingId === company.id}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition-all disabled:opacity-50"
                                                    title="Renovar / Sumar 1 mes de membresía"
                                                >
                                                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                                                    <span>+1 Mes</span>
                                                </button>

                                                <button
                                                    onClick={() => toggleCompanyStatus(company.id, company.active)}
                                                    disabled={updatingId === company.id}
                                                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${company.active
                                                            ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20'
                                                            : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
                                                        } disabled:opacity-50`}
                                                >
                                                    {updatingId === company.id ? (
                                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    ) : company.active ? (
                                                        'Bloquear'
                                                    ) : (
                                                        'Activar'
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : !loading && companies.length === 0 ? (
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center">
                    <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No hay empresas registradas</h3>
                    <p className="text-sm text-slate-400">
                        Las empresas aparecerán aquí cuando se registren en el sistema.
                    </p>
                </div>
            ) : null}
        </div>
    );
}
