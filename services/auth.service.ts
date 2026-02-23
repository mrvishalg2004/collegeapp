import api from './api';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const setItem = async (key: string, value: string) => {
    if (Platform.OS === 'web') {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            console.error('Local storage unavailable', e);
        }
    } else {
        await SecureStore.setItemAsync(key, value);
    }
};

const getItem = async (key: string) => {
    if (Platform.OS === 'web') {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            console.error('Local storage unavailable', e);
            return null;
        }
    } else {
        return await SecureStore.getItemAsync(key);
    }
};

const deleteItem = async (key: string) => {
    if (Platform.OS === 'web') {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error('Local storage unavailable', e);
        }
    } else {
        await SecureStore.deleteItemAsync(key);
    }
};

export const AuthService = {
    login: async (email: string, password: string) => {
        const response = await api.post('/auth/login', { email, password });
        if ((response.data as any).token) {
            await setItem('token', (response.data as any).token);
            await setItem('user', JSON.stringify((response.data as any).user));
        }
        return response.data;
    },

    register: async (userData: any) => {
        const response = await api.post('/auth/register', userData);
        if ((response.data as any).token) {
            await setItem('token', (response.data as any).token);
            await setItem('user', JSON.stringify((response.data as any).user));
        }
        return response.data;
    },

    logout: async () => {
        await deleteItem('token');
        await deleteItem('user');
    },

    getCurrentUser: async () => {
        const userStr = await getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    getToken: async () => {
        return await getItem('token');
    }
};

