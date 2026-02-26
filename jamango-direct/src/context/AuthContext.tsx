import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import client from '@/api/client';
import { User, AuthResponse } from '@/types/auth';

interface AuthContextType {
    user: User | null;
    login: (data: any) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => void;
    impersonate: (userId: string) => Promise<void>;
    stopImpersonating: () => void;
    isImpersonating: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const isAdminRoute = window.location.pathname.startsWith('/admin');

    const [user, setUser] = useState<User | null>(() => {
        let storedUser = null;
        if (isAdminRoute) {
            storedUser = localStorage.getItem('adminUser');
            if (!storedUser) {
                storedUser = localStorage.getItem('user'); // Fallback for backwards compatibility or active impersonation using old standard
            }
        } else {
            storedUser = localStorage.getItem('user');
        }
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isImpersonating, setIsImpersonating] = useState(() => {
        return !!localStorage.getItem('originalAdminUser');
    });

    useEffect(() => {
        // Validation check (optional): Ensure token exists if user exists
        const token = localStorage.getItem('token');
        if (user && !token) {
            logout();
        }
    }, [user]);

    const login = async (credentials: any) => {
        const { data } = await client.post<AuthResponse>('/users/login', credentials);

        const isUserAdminOrStaff = data.isAdmin || data.role === "admin" || data.role === "staff" || data.role === "stall_owner";

        if (window.location.pathname.startsWith('/admin')) {
            localStorage.setItem('adminUser', JSON.stringify(data));
            localStorage.setItem('adminToken', data.token);
            // Don't wipe 'user' and 'token' (store tokens) here, so store sessions survive
            localStorage.removeItem('originalAdminUser');
            localStorage.removeItem('originalAdminToken');
        } else {
            localStorage.setItem('user', JSON.stringify(data));
            localStorage.setItem('token', data.token);
        }

        setUser(data);
        setIsImpersonating(false);
    };

    const register = async (userData: any) => {
        const { data } = await client.post<AuthResponse>('/users', userData);
        localStorage.setItem('user', JSON.stringify(data));
        localStorage.setItem('token', data.token);
        setUser(data);
    };

    const logout = () => {
        if (window.location.pathname.startsWith('/admin')) {
            localStorage.removeItem('adminUser');
            localStorage.removeItem('adminToken');
            localStorage.removeItem('originalAdminUser');
            localStorage.removeItem('originalAdminToken');
            // We do NOT remove 'user'/'token' so the consumer session stays alive in another tab
        } else {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        }
        setUser(null);
        setIsImpersonating(false);
    };

    const impersonate = async (userId: string) => {
        // save admin state
        localStorage.setItem('originalAdminUser', localStorage.getItem('adminUser') || '');
        localStorage.setItem('originalAdminToken', localStorage.getItem('adminToken') || '');

        const { data } = await client.post<AuthResponse>(`/users/${userId}/impersonate`);

        // Temporarily override admin token with impersonated token
        localStorage.setItem('adminUser', JSON.stringify(data));
        localStorage.setItem('adminToken', data.token);

        setUser(data);
        setIsImpersonating(true);
    };

    const stopImpersonating = () => {
        const originalAdminUser = localStorage.getItem('originalAdminUser');
        const originalAdminToken = localStorage.getItem('originalAdminToken');
        if (originalAdminUser && originalAdminToken) {
            localStorage.setItem('adminUser', originalAdminUser);
            localStorage.setItem('adminToken', originalAdminToken);
            localStorage.removeItem('originalAdminUser');
            localStorage.removeItem('originalAdminToken');
            setUser(JSON.parse(originalAdminUser));
            setIsImpersonating(false);
        } else {
            logout();
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, impersonate, stopImpersonating, isImpersonating, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
