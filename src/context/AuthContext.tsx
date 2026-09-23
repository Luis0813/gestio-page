import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

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

const API_URL = 'http://localhost:3000';

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
                    const response = await fetch(`${API_URL}/me`, {
                        headers: {
                            'Authorization': `Bearer ${storedToken}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.ok) {
                        setToken(storedToken);
                        setUser(JSON.parse(storedUser));
                    } else {
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

    const checkAccountStatus = useCallback(async () => {
        if (!token) return;

        try {
            const response = await fetch(`${API_URL}/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 401 || response.status === 403) {
                // Account is disabled or token invalid/expired, log out
                await logout();
            }
        } catch (err) {
            console.error('Error checking account status:', err);
        }
    }, [token]);

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
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user: { email, password } }),
            });

            const data = await response.json();

            if (response.ok) {
                const authHeader = response.headers.get('Authorization');
                const tokenString = authHeader ? authHeader.replace('Bearer ', '') : '';

                if (tokenString) {
                    localStorage.setItem('gestio_token', tokenString);
                    localStorage.setItem('gestio_user', JSON.stringify(data.data));
                    setToken(tokenString);
                    setUser(data.data);
                    setIsAccountDisabled(false);
                    return { success: true };
                }
                return { success: false, error: 'No token returned from server.' };
            } else if (response.status === 403) {
                setIsAccountDisabled(true);
                return { success: false, error: data.status?.message || 'Your account has been disabled.', disabled: true };
            } else {
                return { success: false, error: data.error || 'Invalid credentials.' };
            }
        } catch (error: any) {
            console.error(error);
            return { success: false, error: 'Network error connecting to backend.' };
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

            const response = await fetch(`${API_URL}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user: userData }),
            });

            const data = await response.json();

            if (response.ok) {
                const authHeader = response.headers.get('Authorization');
                const tokenString = authHeader ? authHeader.replace('Bearer ', '') : '';

                if (tokenString) {
                    localStorage.setItem('gestio_token', tokenString);
                    localStorage.setItem('gestio_user', JSON.stringify(data.data));
                    setToken(tokenString);
                    setUser(data.data);
                    setIsAccountDisabled(false);
                }
                return { success: true };
            } else {
                return { success: false, error: data.status?.message || 'Failed to sign up.' };
            }
        } catch (error) {
            console.error(error);
            return { success: false, error: 'Network error connecting to backend.' };
        }
    };

    const logout = async () => {
        try {
            if (token) {
                await fetch(`${API_URL}/logout`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                });
            }
        } catch (error) {
            console.error('Logout request failed:', error);
        } finally {
            localStorage.removeItem('gestio_token');
            localStorage.removeItem('gestio_user');
            setToken(null);
            setUser(null);
            setIsAccountDisabled(false);
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
