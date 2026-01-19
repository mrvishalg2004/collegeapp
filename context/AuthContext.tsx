import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthService } from '../services/auth.service';

interface AuthContextType {
    user: any;
    loading: boolean;
    login: (email: string, pass: string) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const u = await AuthService.getCurrentUser();
            setUser(u);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, pass: string) => {
        const res = await AuthService.login(email, pass);
        // AuthService already saves to storage
        setUser((res as any).user);
    };

    const register = async (data: any) => {
        const res = await AuthService.register(data);
        setUser((res as any).user);
    };

    const logout = async () => {
        await AuthService.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
