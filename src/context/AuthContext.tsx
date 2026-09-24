import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api';
import { AxiosError } from 'axios';

export type UserRole = 'admin' | 'company';

export interface User {
    id: number;
    email: string;
    role: UserRole;
    company_name?: string;
    membership_expires_at?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAccountDisabled: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string; disabled?: boolean }>;
    register: (email: string, password: string, role: UserRole, companyName?: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    clearDisabledStatus: () => void;
    checkAccountStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isAccountDisabled, setIsAccountDisabled] = useState<boolean>(false);

    useEffect(() => {
        async function loadStorageData() {
            try {
                const storedToken = localStorage.getItem('gestio_token');
                const storedUser = localStorage.getItem('gestio_user');

                if (storedToken && storedUser) {
                    // Verify token with backend
                    try {
                        await api.get('/me');
                        setToken(storedToken);
                        setUser(JSON.parse(storedUser));
                    } catch (err) {
                        // Stale or expired token
                        localStorage.removeItem('gestio_token');
                        localStorage.removeItem('gestio_user');
                    }
                }
            } catch (e) {
                console.error('Failed to load storage data:', e);
            } finally {
                setIsLoading(false);
            }
        }

        loadStorageData();
    }, []);

    const logout = useCallback(async () => {
        try {
            if (localStorage.getItem('gestio_token')) {
                await api.delete('/logout');
            }
        } catch (error) {
            console.error('Logout request failed:', error);
        } finally {
            localStorage.clear();
            setToken(null);
            setUser(null);
            setIsAccountDisabled(false);
        }
    }, []);

    const checkAccountStatus = useCallback(async () => {
        const currentToken = localStorage.getItem('gestio_token');
        if (!currentToken) return;

        try {
            await api.get('/me');
        } catch (err: any) {
            if (err.response?.status === 401 || err.response?.status === 403) {
                // Account is disabled or token invalid/expired, log out
                await logout();
            }
        }
    }, [logout]);

    // Check account status every 30 seconds when user is logged in
    useEffect(() => {
        if (!user || !token) return;

        const interval = setInterval(() => {
            checkAccountStatus();
        }, 30000); // Check every 30 seconds

        return () => clearInterval(interval);
    }, [user, token, checkAccountStatus]);

    const login = async (email: string, password: string) => {
        try {
            const response = await api.post('/login', { user: { email, password } });

            const headers = response.headers as Record<string, any>;
            const authHeader: string = typeof headers.authorization === 'string'
                ? headers.authorization
                : typeof headers.get === 'function'
                ? headers.get('authorization')
                : '';
            const tokenString = authHeader ? authHeader.replace('Bearer ', '') : '';

            if (tokenString) {
                localStorage.setItem('gestio_token', tokenString);
                localStorage.setItem('gestio_user', JSON.stringify(response.data.data));
                setToken(tokenString);
                setUser(response.data.data);
                setIsAccountDisabled(false);
                return { success: true };
            }
            return { success: false, error: 'No token returned from server.' };
        } catch (error: any) {
            const err = error as AxiosError<any>;
            if (err.response?.status === 403) {
                setIsAccountDisabled(true);
                return { success: false, error: err.response.data?.status?.message || 'Your account has been disabled.', disabled: true };
            } else {
                return { success: false, error: err.response?.data?.error || 'Invalid credentials.' };
            }
        }
    };

    const register = async (email: string, password: string, role: UserRole, companyName?: string) => {
        try {
            const userData: Record<string, string> = {
                email,
                password,
                password_confirmation: password,
                role
            };
            if (role === 'company' && companyName) {
                userData.company_name = companyName;
            }

            const response = await api.post('/signup', { user: userData });

            const headers = response.headers as Record<string, any>;
            const authHeader: string = typeof headers.authorization === 'string'
                ? headers.authorization
                : typeof headers.get === 'function'
                ? headers.get('authorization')
                : '';
            const tokenString = authHeader ? authHeader.replace('Bearer ', '') : '';

            if (tokenString) {
                localStorage.setItem('gestio_token', tokenString);
                localStorage.setItem('gestio_user', JSON.stringify(response.data.data));
                setToken(tokenString);
                setUser(response.data.data);
                setIsAccountDisabled(false);
            }
            return { success: true };
        } catch (error: any) {
            const err = error as AxiosError<any>;
            return { success: false, error: err.response?.data?.status?.message || 'Failed to sign up.' };
        }
    };

    const clearDisabledStatus = () => {
        setIsAccountDisabled(false);
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, isAccountDisabled, login, register, logout, clearDisabledStatus, checkAccountStatus }}>
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
