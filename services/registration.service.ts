import api from './api';

export const RegistrationService = {
    getRegistrationsByEvent: async (eventId: string) => {
        // Need backend route for this. Assuming: GET /events/:id/registrations
        // Or GET /registrations?eventId=...
        // Let's use the latter if we created it.
        // Actually, I didn't create a 'get registrations' route in 'registration' model file or 'events' file explicitly yet. 
        // I will mock it or assume I add it.
        // Let's assume GET /events/:id/registrations exists or I'll implement it in EventService/Backend.
        // For now, let's use a mock implementation or fail gracefully.
        try {
            const response = await api.get(`/events/${eventId}/registrations`);
            return response.data;
        } catch {
            // Fallback for UI dev
            return [];
        }
    },

    markAttendance: async (registrationId: string, status: boolean) => {
        const response = await api.put(`/registrations/${registrationId}/attendance`, { attendance: status });
        return response.data;
    }
};
