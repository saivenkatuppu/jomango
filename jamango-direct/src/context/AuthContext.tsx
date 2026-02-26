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
    const [user, setUser] = useState<User | null>(() => {
        let activeRole = sessionStorage.getItem('active_role');
        let storedUser = null;

        // If no active role in this tab, try to inherit an existing session from local storage prioritizing admin > staff > stall > customer
        if (!activeRole) {
            if (localStorage.getItem('adminUser')) activeRole = 'admin';
            else if (localStorage.getItem('staffUser')) activeRole = 'staff';
            else if (localStorage.getItem('stallUser')) activeRole = 'stall';
            else if (localStorage.getItem('user')) activeRole = 'customer';

            if (activeRole) sessionStorage.setItem('active_role', activeRole);
        }

        if (activeRole === 'admin') {
            storedUser = localStorage.getItem('adminUser') || localStorage.getItem('originalAdminUser'); // fallback for mid-impersonation
        } else if (activeRole === 'staff') {
            storedUser = localStorage.getItem('staffUser');
        } else if (activeRole === 'stall') {
            storedUser = localStorage.getItem('stallUser');
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

        const isAdmin = data.isAdmin || data.role === "admin";
        const isStaff = data.role === "staff";

        if (isAdmin) {
            localStorage.setItem('adminUser', JSON.stringify(data));
            localStorage.setItem('adminToken', data.token);
            sessionStorage.setItem('active_role', 'admin');
        } else if (isStaff) {
            localStorage.setItem('staffUser', JSON.stringify(data));
            localStorage.setItem('staffToken', data.token);
            sessionStorage.setItem('active_role', 'staff');
        } else if (data.role === "stall_owner") {
            localStorage.setItem('stallUser', JSON.stringify(data));
            localStorage.setItem('stallToken', data.token);
            sessionStorage.setItem('active_role', 'stall');
        } else {
            localStorage.setItem('user', JSON.stringify(data));
            localStorage.setItem('token', data.token);
            sessionStorage.setItem('active_role', 'customer');
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
        const activeRole = sessionStorage.getItem('active_role');

        if (activeRole === 'admin') {
            localStorage.removeItem('adminUser');
            localStorage.removeItem('adminToken');
            localStorage.removeItem('originalAdminUser');
            localStorage.removeItem('originalAdminToken');
        } else if (activeRole === 'staff') {
            localStorage.removeItem('staffUser');
            localStorage.removeItem('staffToken');
        } else if (activeRole === 'stall') {
            localStorage.removeItem('stallUser');
            localStorage.removeItem('stallToken');
        } else {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        }

        sessionStorage.removeItem('active_role');
        setUser(null);
        setIsImpersonating(false);
    };

    const impersonate = async (userId: string) => {
        // save admin state
        localStorage.setItem('originalAdminUser', localStorage.getItem('adminUser') || '');
        localStorage.setItem('originalAdminToken', localStorage.getItem('adminToken') || '');

        const { data } = await client.post<AuthResponse>(`/users/${userId}/impersonate`);

        // Temporarily override admin token with impersonated token
        // Keep the tab role as 'admin' so it correctly knows to fetch the overridden admin token
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
