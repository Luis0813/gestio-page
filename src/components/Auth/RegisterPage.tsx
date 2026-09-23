import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../context/AuthContext';
import { AccountDisabled } from './AccountDisabled';

interface RegisterPageProps {
    onToggleMode: () => void;
}

interface RegisterFormState {
    email: string;
    password: string;
    confirmPassword: string;
    role: UserRole;
    companyName: string;
    error: string;
    loading: boolean;
}

export function RegisterPage({ onToggleMode }: RegisterPageProps) {
    const { register, isAccountDisabled } = useAuth();

    // Consolidated single state object
    const [formState, setFormState] = useState<RegisterFormState>({
        email: '',
        password: '',
        confirmPassword: '',
        role: 'company',
        companyName: '',
        error: '',
        loading: false
    });

    const updateForm = (fields: Partial<RegisterFormState>) => {
        setFormState(prev => ({ ...prev, ...fields }));
    };

    // Form validation dictionary strategy
    const validateForm = (state: RegisterFormState): string | null => {
        const validationRules: Record<string, { isValid: boolean; message: string }> = {
            requiredFields: {
                isValid: Boolean(state.email.trim() && state.password && state.confirmPassword),
                message: 'Por favor completa todos los campos obligatorios.'
            },
            passwordMatch: {
                isValid: state.password === state.confirmPassword,
                message: 'Las contraseñas no coinciden.'
            },
            companyNameRequired: {
                isValid: state.role !== 'company' || Boolean(state.companyName.trim()),
                message: 'El nombre de la empresa es obligatorio para el rol de empresa.'
            }
        };

        const failedRuleKey = Object.keys(validationRules).find(
            key => !validationRules[key].isValid
        );

        return failedRuleKey ? validationRules[failedRuleKey].message : null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationError = validateForm(formState);
        if (validationError) {
            updateForm({ error: validationError });
            return;
        }

        updateForm({ error: '', loading: true });

        try {
            const { email, password, role, companyName } = formState;
            const result = await register(
                email,
                password,
                role,
                role === 'company' ? companyName : undefined
            );

            if (!result.success) {
                updateForm({ error: result.error || 'Ocurrió un error inesperado al registrar.' });
            }
        } catch (err) {
            updateForm({ error: 'Error de conexión con el servidor.' });
        } finally {
            updateForm({ loading: false });
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
                    <h2 className="text-white text-2xl font-semibold mb-6">Crear Cuenta</h2>

                    {formState.error && (
                        <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl mb-4">
                            <p className="text-red-400 text-xs font-medium">{formState.error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Email Input */}
                        <div className="mb-4">
                            <label className="text-neutral-400 text-xs font-medium mb-2 block">Correo Electrónico</label>
                            <input
                                type="email"
                                value={formState.email}
                                onChange={(e) => updateForm({ email: e.target.value })}
                                placeholder="tu@correo.com"
                                className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl px-4 py-3.5 text-sm focus:border-indigo-500 focus:outline-none transition-colors"
                            />
                        </div>

                        {/* Password Input */}
                        <div className="mb-4">
                            <label className="text-neutral-400 text-xs font-medium mb-2 block">Contraseña</label>
                            <input
                                type="password"
                                value={formState.password}
                                onChange={(e) => updateForm({ password: e.target.value })}
                                placeholder="••••••••"
                                className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl px-4 py-3.5 text-sm focus:border-indigo-500 focus:outline-none transition-colors"
                            />
                        </div>

                        {/* Confirm Password Input */}
                        <div className="mb-4">
                            <label className="text-neutral-400 text-xs font-medium mb-2 block">Confirmar Contraseña</label>
                            <input
                                type="password"
                                value={formState.confirmPassword}
                                onChange={(e) => updateForm({ confirmPassword: e.target.value })}
                                placeholder="••••••••"
                                className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl px-4 py-3.5 text-sm focus:border-indigo-500 focus:outline-none transition-colors"
                            />
                        </div>

                        {/* Role Selection */}
                        <div className="mb-4">
                            <label className="text-neutral-400 text-xs font-medium mb-2.5 block">Tipo de Cuenta</label>
                            <div className="flex-row gap-x-2 flex">
                                <button
                                    type="button"
                                    onClick={() => updateForm({ role: 'company' })}
                                    className={`flex-1 py-3 rounded-xl border items-center justify-center transition-colors ${formState.role === 'company'
                                            ? 'bg-indigo-600/10 border-indigo-500'
                                            : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                                        }`}
                                >
                                    <span className={`text-sm font-medium ${formState.role === 'company' ? 'text-indigo-400' : 'text-neutral-400'}`}>
                                        Empresa
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => updateForm({ role: 'admin' })}
                                    className={`flex-1 py-3 rounded-xl border items-center justify-center transition-colors ${formState.role === 'admin'
                                            ? 'bg-indigo-600/10 border-indigo-500'
                                            : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                                        }`}
                                >
                                    <span className={`text-sm font-medium ${formState.role === 'admin' ? 'text-indigo-400' : 'text-neutral-400'}`}>
                                        Admin
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Company Name Input (Only for Company Role) */}
                        {formState.role === 'company' && (
                            <div className="mb-6">
                                <label className="text-neutral-400 text-xs font-medium mb-2 block">Nombre de la Empresa</label>
                                <input
                                    type="text"
                                    value={formState.companyName}
                                    onChange={(e) => updateForm({ companyName: e.target.value })}
                                    placeholder="Nombre de tu empresa"
                                    className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl px-4 py-3.5 text-sm focus:border-indigo-500 focus:outline-none transition-colors"
                                />
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={formState.loading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:from-indigo-700 active:to-purple-700 disabled:from-indigo-600/50 disabled:to-purple-600/50 rounded-xl py-3.5 items-center justify-center shadow-lg shadow-indigo-500/20 transition-all"
                        >
                            {formState.loading ? (
                                <span className="text-white text-base font-bold">Cargando...</span>
                            ) : (
                                <span className="text-white text-base font-bold">Registrarse</span>
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
                            ¿Ya tienes una cuenta?{' '}
                            <span className="text-indigo-400 font-semibold">Inicia Sesión</span>
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
