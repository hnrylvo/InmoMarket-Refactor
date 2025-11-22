import { create } from 'zustand';
import axios from 'axios';

export const useUserReportsStore = create((set, get) => ({
    reports: [],
    loading: false,
    error: null,
    totalPages: 0,
    currentPage: 0,
    totalElements: 0,

    fetchUserReports: async (token, page = 0, size = 10) => {
        try {
            console.log("Starting fetchUserReports with token:", token ? "Token exists" : "No token");
            
            if (!token) {
                set({ 
                    error: 'No authentication token available',
                    loading: false 
                });
                return;
            }

            set({ loading: true, error: null });
            
            const url = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/reports/my-reports-with-feedback?page=${page}&size=${size}`;
            console.log("Making request to:", url);
            console.log("Token being used:", token.substring(0, 20) + "...");
            
            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log("Response received:", response.data);

            // Transform the data to match our component needs
            const transformedReports = response.data.content.map(report => ({
                id: report.id,
                publicationId: report.publicationId,
                address: report.publicationAddress,
                reason: report.reason,
                description: report.description,
                status: report.status,
                reportDate: report.reportDate,
                adminFeedback: report.adminFeedback,
                adminId: report.adminId,
                adminName: report.adminName,
                reviewedAt: report.reviewedAt,
                hasFeedback: report.hasFeedback,
            }));

            set({ 
                reports: transformedReports,
                loading: false,
                totalPages: response.data.totalPages,
                currentPage: response.data.number,
                totalElements: response.data.totalElements
            });
        } catch (error) {
            console.error("Error in fetchUserReports:", error);
            console.error("Error response:", error.response);
            
            let errorMessage = 'Error al cargar reportes';
            
            if (error.response?.status === 401) {
                errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
            } else if (error.response?.status === 403) {
                errorMessage = 'No tienes permisos para acceder a esta información.';
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            set({ 
                error: errorMessage,
                loading: false
            });
        }
    },
})); 