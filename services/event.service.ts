import api from './api';

export const EventService = {
    getEvents: async (filters?: { collegeId?: string; departmentId?: string }) => {
        const params = new URLSearchParams(filters as any).toString();
        const response = await api.get(`/events?${params}`);
        return response.data;
    },

    createEvent: async (data: any) => {
        const response = await api.post('/events', data);
        return response.data;
    },

    getMyAssignments: async () => {
        const response = await api.get('/events/my-assignments');
        return response.data;
    },

    deleteEvent: async (id: string) => {
        const response = await api.delete(`/events/${id}`);
        return response.data;
    },

    completeEvent: async (id: string) => {
        const response = await api.put(`/events/${id}/complete`);
        return response.data;
    }
};
