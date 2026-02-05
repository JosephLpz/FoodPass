'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@/types';
import { login as apiLogin, logout as apiLogout } from '@/lib/api/services';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'foodpass_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for saved session on mount
    useEffect(() => {
        const savedUser = localStorage.getItem(STORAGE_KEY);
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch {
                localStorage.removeItem(STORAGE_KEY);
            }
        }
        setIsLoading(false);
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await apiLogin(email, password);

            if (response.success && response.data) {
                setUser(response.data);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(response.data));
                return { success: true };
            }

            return { success: false, error: response.error || 'Error al iniciar sesión' };
        } catch (error) {
            return { success: false, error: 'Error de conexión' };
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        setIsLoading(true);
        try {
            await apiLogout();
            setUser(null);
            localStorage.removeItem(STORAGE_KEY);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
