import api from './api';

export const PaymentService = {
    createOrder: async (eventId: string) => {
        const response = await api.post('/payments/create-order', { eventId });
        return response.data;
    },

    verifyPayment: async (data: any) => {
        const response = await api.post('/payments/verify', data);
        return response.data;
    },

    registerOffline: async (eventId: string) => {
        const response = await api.post('/payments/offline', { eventId });
        return response.data;
    },

    getPaymentHistory: async () => {
        const response = await api.get('/payments/history');
        return response.data;
    },

    getPendingPayments: async () => {
        const response = await api.get('/payments/pending');
        return response.data;
    },

    confirmOfflinePayment: async (id: string) => {
        const response = await api.post(`/payments/confirm-offline/${id}`);
        return response.data;
    }
};
