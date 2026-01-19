import api from './api';

export const CollegeService = {
    getColleges: async () => {
        const response = await api.get('/colleges');
        return response.data;
    },

    createCollege: async (data: { name: string; email: string; password?: string }) => {
        const response = await api.post('/colleges', data);
        return response.data;
    },

    getDepartments: async (collegeId: string) => {
        const response = await api.get(`/colleges/${collegeId}/departments`);
        return response.data;
    },

    // For College Admin
    addDepartment: async (data: { name: string }) => {
        const response = await api.post('/colleges/departments', data);
        return response.data;
    },

    // For Department Management
    updateDepartment: async (id: string, name: string) => {
        const response = await api.put(`/colleges/departments/${id}`, { name });
        return response.data;
    },

    deleteDepartment: async (id: string) => {
        const response = await api.delete(`/colleges/departments/${id}`);
        return response.data;
    },

    deleteCollege: async (id: string) => {
        const response = await api.delete(`/colleges/${id}`);
        return response.data;
    },

    updateCollege: async (id: string, data: any) => {
        const response = await api.put(`/colleges/${id}`, data);
        return response.data;
    },

    // Coordinator Management
    getCoordinators: async () => {
        const response = await api.get('/colleges/coordinators');
        return response.data;
    },

    createCoordinator: async (data: any) => {
        const response = await api.post('/colleges/coordinators', data);
        return response.data;
    },

    deleteCoordinator: async (id: string) => {
        const response = await api.delete(`/colleges/coordinators/${id}`);
        return response.data;
    }
};
