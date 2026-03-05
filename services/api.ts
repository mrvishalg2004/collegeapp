import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// For production builds (APK), always use the Render URL.
// For local development, it dynamically fetches your laptop's Wi-Fi IP automatically.
const RENDER_URL = 'https://collegeapp-1-8zi4.onrender.com/api';

const getLocalIpAddress = () => {
    try {
        const hostUri = Constants.expoConfig?.hostUri;
        if (hostUri) {
            // Extracts the IP address from the Expo host URL
            const ip = hostUri.split(':')[0];
            return `http://${ip}:3000/api`;
        }
    } catch (e) {
        console.log('Error fetching dynamic IP:', e);
    }
    // Fallback IP if unable to resolve
    return 'http://192.168.1.13:3000/api';
};

const LOCAL_URL = getLocalIpAddress();

const API_URL = __DEV__ ? LOCAL_URL : RENDER_URL;

console.log('--- SYSTEM CORE: API INITIALIZED ---');
console.log('NODE_ENV:', __DEV__ ? 'DEVELOPMENT' : 'PRODUCTION');
console.log('BASE_URL:', API_URL);
console.log('------------------------------------');

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
