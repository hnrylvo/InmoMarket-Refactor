import { create } from 'zustand';
import axios from 'axios';

export const useReportsStore = create((set, get) => ({
    reports: [],
    loading: false,
    error: null,
    totalPages: 0,
    currentPage: 0,
    totalElements: 0,
    pageSize: 10,

    fetchReports: async (token, page = 0, size = null) => {
        try {
            const currentSize = size || get().pageSize;
            set({ loading: true, error: null });
            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/reports/admin/all?page=${page}&size=${currentSize}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Transform the data to match the API response structure
            const transformedReports = response.data.content.map(report => ({
                id: report.id,
                publicationId: report.publicationId,
                address: report.publicationAddress,
                reporterId: report.reporterId,
                reporterName: report.reporterName,
                reason: report.reason,
                description: report.description,
                status: report.status,
                reportDate: report.reportDate,
                adminFeedback: report.adminFeedback,
                adminId: report.adminId,
                adminName: report.adminName,
                reviewedAt: report.reviewedAt,
                hasFeedback: report.hasFeedback
            }));

            set({ 
                reports: transformedReports,
                loading: false,
                totalPages: response.data.totalPages,
                currentPage: response.data.number,
                totalElements: response.data.totalElements,
                pageSize: currentSize
            });
        } catch (error) {
            set({ 
                error: error.response?.data?.message || 'Error al cargar reportes',
                loading: false
            });
        }
    },

    resolveReport: async (token, reportId, action, feedback) => {
        try {
            set({ loading: true, error: null });
            const response = await axios.put(
                `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/reports/admin/${reportId}/resolve-with-feedback`,
                {
                    action: action,
                    feedback: feedback
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Update the report status in the local state
            const { reports } = get();
            const updatedReports = reports.map(report => 
                report.id === reportId 
                    ? { 
                        ...report, 
                        status: action === 'APPROVE' ? 'RESOLVED' : 'REJECTED',
                        adminFeedback: feedback,
                        reviewedAt: new Date().toISOString()
                    }
                    : report
            );

            set({ 
                reports: updatedReports,
                loading: false
            });

            return { success: true, message: response.data?.message || 'Reporte procesado exitosamente' };
        } catch (error) {
            set({ 
                error: error.response?.data?.message || 'Error al procesar el reporte',
                loading: false
            });
            return { 
                success: false, 
                message: error.response?.data?.message || 'Error al procesar el reporte' 
            };
        }
    },

    refreshReports: async (token) => {
        const { currentPage, pageSize } = get();
        return await get().fetchReports(token, currentPage, pageSize);
    },
})); 