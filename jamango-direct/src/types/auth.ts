export interface User {
    _id: string;
    name: string;
    phone: string; // Mandatory
    email?: string; // Optional
    isAdmin: boolean;
    token: string;
    role?: 'admin' | 'staff' | 'user';
    status?: 'active' | 'disabled';
}

export interface AuthResponse {
    _id: string;
    name: string;
    phone: string; // Mandatory
    email?: string; // Optional
    isAdmin: boolean;
    token: string;
    role?: 'admin' | 'staff' | 'user';
    status?: 'active' | 'disabled';
    isImpersonated?: boolean;
}

export interface DecodedToken {
    id: string;
    iat: number;
    exp: number;
}
