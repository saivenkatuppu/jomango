export interface User {
    _id: string;
    name: string;
    phone: string; // Mandatory
    email?: string; // Optional
    isAdmin: boolean;
    token: string;
    role?: 'admin' | 'staff' | 'user' | 'stall_owner';
    status?: 'active' | 'disabled';
    stallId?: string;
    assignedStall?: string;
}

export interface AuthResponse {
    _id: string;
    name: string;
    phone: string; // Mandatory
    email?: string; // Optional
    isAdmin: boolean;
    token: string;
    role?: 'admin' | 'staff' | 'user' | 'stall_owner';
    status?: 'active' | 'disabled';
    isImpersonated?: boolean;
    stallId?: string;
    assignedStall?: string;
}

export interface DecodedToken {
    id: string;
    iat: number;
    exp: number;
}
