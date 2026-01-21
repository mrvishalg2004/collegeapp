import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const API_URL = 'https://collegeapp-1-8zi4.onrender.com/api';

const api = axios.create({
    baseURL: API_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
    (async (config: any) => {
        let token;
        if (Platform.OS === 'web') {
            token = localStorage.getItem('token');
        } else {
            token = await SecureStore.getItemAsync('token');
        }

        if (token && config.headers) {
            config.headers['x-auth-token'] = token;
        }
        return config;
    }) as any,
    (error) => {
        console.error('API Error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            url: error.config?.url
        });
        return Promise.reject(error);
    }
);

export default api;
