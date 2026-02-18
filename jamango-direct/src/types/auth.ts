export interface User {
    _id: string;
    name: string;
    email: string;
    isAdmin: boolean;
    token: string;
    phone?: string;
}

export interface AuthResponse {
    _id: string;
    name: string;
    email: string;
    isAdmin: boolean;
    token: string;
    phone?: string;
}

export interface DecodedToken {
    id: string;
    iat: number;
    exp: number;
}
