import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import client from '@/api/client';
import { User, AuthResponse } from '@/types/auth';

interface AuthContextType {
    user: User | null;
    login: (data: any) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => void;
    impersonate: (staffId: string) => Promise<void>;
    stopImpersonating: () => void;
    isImpersonating: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isImpersonating, setIsImpersonating] = useState(false);

    useEffect(() => {
        // Check localStorage on mount
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        const adminUser = localStorage.getItem('adminUser');

        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
        if (adminUser) {
            setIsImpersonating(true);
        }
        setIsLoading(false);
    }, []);

    const login = async (credentials: any) => {
        const { data } = await client.post<AuthResponse>('/users/login', credentials);
        localStorage.setItem('user', JSON.stringify(data));
        localStorage.setItem('token', data.token);
        setUser(data);
    };

    const register = async (userData: any) => {
        const { data } = await client.post<AuthResponse>('/users', userData);
        localStorage.setItem('user', JSON.stringify(data));
        localStorage.setItem('token', data.token);
        setUser(data);
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('adminUser');
        localStorage.removeItem('adminToken');
        setUser(null);
        setIsImpersonating(false);
    };

    const impersonate = async (staffId: string) => {
        // save admin state
        localStorage.setItem('adminUser', localStorage.getItem('user') || '');
        localStorage.setItem('adminToken', localStorage.getItem('token') || '');

        const { data } = await client.post<AuthResponse>(`/users/staff/${staffId}/impersonate`);
        localStorage.setItem('user', JSON.stringify(data));
        localStorage.setItem('token', data.token);
        setUser(data);
        setIsImpersonating(true);
    };

    const stopImpersonating = () => {
        const adminUser = localStorage.getItem('adminUser');
        const adminToken = localStorage.getItem('adminToken');
        if (adminUser && adminToken) {
            localStorage.setItem('user', adminUser);
            localStorage.setItem('token', adminToken);
            localStorage.removeItem('adminUser');
            localStorage.removeItem('adminToken');
            setUser(JSON.parse(adminUser));
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
