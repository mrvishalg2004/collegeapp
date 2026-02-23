import api from './api';

export const CertificateService = {
    getMyCertificates: async () => {
        const response = await api.get('/certificates/my-certificates');
        return response.data;
    },

    generateCertificate: async (registrationId: string) => {
        const response = await api.post('/certificates/generate', { registrationId });
        return response.data;
    }
};
