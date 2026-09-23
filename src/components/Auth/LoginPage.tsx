import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AccountDisabled } from './AccountDisabled';

interface LoginPageProps {
    onToggleMode: () => void;
}

export function LoginPage({ onToggleMode }: LoginPageProps) {
    const { login, isAccountDisabled } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Por favor completa todos los campos.');
            return;
        }
        setError('');
        setLoading(true);

        try {
            const result = await login(email, password);
            if (!result.success && !result.disabled) {
                setError(result.error || 'Ocurrió un error inesperado.');
            }
        } catch (err) {
            setError('Error de conexión con el servidor.');
        } finally {
            setLoading(false);
        }
    };

    if (isAccountDisabled) {
        return <AccountDisabled />;
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo / Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-2xl items-center justify-center mb-4 shadow-lg shadow-indigo-500/50 inline-flex p-0.5">
                        <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                            <span className="text-white text-3xl font-black italic tracking-tighter">CF</span>
                        </div>
                    </div>
                    <h1 className="text-white text-3xl font-bold tracking-tight">Gestio</h1>
                    <p className="text-neutral-400 text-sm mt-1">Sistema de Gestión Empresarial</p>
                </div>

                {/* Form Card */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl">
                    <h2 className="text-white text-2xl font-semibold mb-6">Iniciar Sesión</h2>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl mb-4">
                            <p className="text-red-400 text-xs font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Email Input */}
                        <div className="mb-4">
                            <label className="text-neutral-400 text-xs font-medium mb-2 block">Correo Electrónico</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tu@correo.com"
                                className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl px-4 py-3.5 text-sm focus:border-indigo-500 focus:outline-none transition-colors"
                            />
                        </div>

                        {/* Password Input */}
                        <div className="mb-6">
                            <label className="text-neutral-400 text-xs font-medium mb-2 block">Contraseña</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl px-4 py-3.5 text-sm focus:border-indigo-500 focus:outline-none transition-colors"
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:from-indigo-700 active:to-purple-700 disabled:from-indigo-600/50 disabled:to-purple-600/50 rounded-xl py-3.5 items-center justify-center shadow-lg shadow-indigo-500/20 transition-all"
                        >
                            {loading ? (
                                <span className="text-white text-base font-bold">Cargando...</span>
                            ) : (
                                <span className="text-white text-base font-bold">Ingresar</span>
                            )}
                        </button>
                    </form>

                    {/* Toggle Mode */}
                    <button
                        type="button"
                        onClick={onToggleMode}
                        className="w-full mt-6 text-center"
                    >
                        <span className="text-neutral-400 text-xs">
                            ¿No tienes cuenta?{' '}
                            <span className="text-indigo-400 font-semibold">Regístrate</span>
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
