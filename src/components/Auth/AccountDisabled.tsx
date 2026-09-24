import { ShieldX, Phone } from 'lucide-react';

export function AccountDisabled() {
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo / Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-2xl items-center justify-center mb-4 shadow-lg shadow-indigo-500/50 inline-flex p-0.5">
                        <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                            <span className="text-white text-3xl font-black tracking-tighter">G</span>
                        </div>
                    </div>
                    <h1 className="text-white text-3xl font-bold tracking-tight">Gestio</h1>
                    <p className="text-neutral-400 text-sm mt-1">Sistema de Gestión Empresarial</p>
                </div>

                {/* Disabled Account Card */}
                <div className="bg-neutral-900 border border-red-500/20 rounded-3xl p-8 shadow-2xl">
                    <div className="flex flex-col items-center text-center">
                        {/* Icon */}
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                            <ShieldX className="w-8 h-8 text-red-400" />
                        </div>

                        {/* Title */}
                        <h2 className="text-white text-2xl font-semibold mb-2">
                            Cuenta Deshabilitada
                        </h2>

                        {/* Message */}
                        <p className="text-neutral-400 text-sm mb-6">
                            Tu cuenta ha sido deshabilitada porque el pago de la mensualidad ha vencido.
                        </p>

                        {/* Contact Info */}
                        <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 w-full mb-6">
                            <div className="flex items-center justify-center gap-2 text-indigo-400 mb-2">
                                <Phone className="w-4 h-4" />
                                <span className="text-sm font-medium">Contacta con soporte</span>
                            </div>
                            <p className="text-neutral-300 text-sm">
                                Para reactivar tu cuenta, comunícate con nosotros al:
                            </p>
                            <p className="text-white font-semibold text-lg mt-1">
                                +58 412-123-4567
                            </p>
                        </div>

                        {/* Additional Info */}
                        <p className="text-neutral-500 text-xs">
                            Una vez realizado el pago, tu cuenta será reactivada en un plazo máximo de 24 horas.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
