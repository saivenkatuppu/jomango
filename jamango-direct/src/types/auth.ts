export interface User {
    _id: string;
    name: string;
    email: string;
    isAdmin: boolean;
    token: string;
    phone?: string;
    role?: 'admin' | 'staff' | 'user';
    status?: 'active' | 'disabled';
}

export interface AuthResponse {
    _id: string;
    name: string;
    email: string;
    isAdmin: boolean;
    token: string;
    phone?: string;
    role?: 'admin' | 'staff' | 'user';
    status?: 'active' | 'disabled';
    isImpersonated?: boolean;
}

export interface DecodedToken {
    id: string;
    iat: number;
    exp: number;
}
