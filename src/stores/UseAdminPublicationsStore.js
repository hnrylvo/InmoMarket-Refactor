import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './useAuthStore';

export const useAdminPublicationsStore = create((set, get) => ({
    publications: [],
    loading: false,
    error: null,
    totalPages: 0,
    currentPage: 0,
    totalElements: 0,
    pageSize: 10,

    /**
     * Obtiene todas las publicaciones (activas, inactivas y reportadas) para administradores
     * @param {string} token - Token de autenticación del administrador
     * @param {number} page - Número de página (0-indexed)
     * @param {number} size - Tamaño de página
     * @param {string} statusFilter - Filtro por estado (ACTIVE, INACTIVE, REPORTED, ALL)
     */
    fetchAllPublications: async (token, page = 0, size = null, statusFilter = 'ALL') => {
        try {
            const currentSize = size || get().pageSize;
            set({ loading: true, error: null });
            
            // Construir query params
            const params = new URLSearchParams({
                page: page.toString(),
                size: currentSize.toString()
            });
            
            if (statusFilter !== 'ALL') {
                params.append('status', statusFilter);
            }
            
            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/publications/admin/all?${params.toString()}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Transformar los datos incluyendo el estado
            const transformedPublications = response.data.content.map(pub => ({
                id: pub.id,
                imageUrl: pub.propertyImageUrls?.[0] || '/placeholder.svg',
                images: pub.propertyImageUrls || [],
                title: pub.propertyTitle || `${pub.typeName} en ${pub.neighborhood}`,
                price: `$${pub.propertyPrice.toLocaleString()}`,
                location: `${pub.municipality}, ${pub.department}`,
                bedrooms: pub.propertyBedrooms,
                floors: pub.propertyFloors,
                publisherName: pub.userName,
                publisherId: pub.userId || pub.ownerId || null,
                status: pub.status || 'ACTIVE', // ACTIVE, INACTIVE, REPORTED
                isReported: pub.isReported || false,
                reportCount: pub.reportCount || 0,
                isNew: false,
                favorited: false,
                description: pub.propertyDescription,
                address: pub.propertyAddress,
                neighborhood: pub.neighborhood,
                municipality: pub.municipality,
                department: pub.department,
                size: pub.propertySize,
                parking: pub.propertyParking,
                furnished: pub.propertyFurnished,
                coordinates: {
                    lat: pub.latitude,
                    lng: pub.longitude
                },
                availableTimes: pub.availableTimes || [],
                createdAt: pub.createdAt || null,
                updatedAt: pub.updatedAt || null
            }));

            set({ 
                publications: transformedPublications,
                loading: false,
                totalPages: response.data.totalPages,
                currentPage: response.data.number,
                totalElements: response.data.totalElements,
                pageSize: currentSize,
                error: null
            });
        } catch (error) {
            const isUnauthorized = error.response?.status === 401;
            if (isUnauthorized) {
                useAuthStore.getState().logout();
            }

            set({ 
                error: error.response?.data?.message || 'Error al cargar las publicaciones', 
                loading: false
            });
            throw error;
        }
    },

    /**
     * Refresca las publicaciones con los mismos parámetros
     */
    refreshPublications: async (token) => {
        const { currentPage, pageSize } = get();
        return await get().fetchAllPublications(token, currentPage, pageSize);
    },

    /**
     * Cambia el estado de una publicación
     */
    updatePublicationStatus: async (token, publicationId, newStatus) => {
        try {
            set({ loading: true, error: null });
            
            const response = await axios.put(
                `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/publications/admin/${publicationId}/status`,
                { status: newStatus },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Actualizar el estado local
            const { publications } = get();
            const updatedPublications = publications.map(pub => 
                pub.id === publicationId 
                    ? { ...pub, status: newStatus }
                    : pub
            );

            set({ 
                publications: updatedPublications,
                loading: false
            });

            return { success: true, message: response.data?.message || 'Estado actualizado exitosamente' };
        } catch (error) {
            const isUnauthorized = error.response?.status === 401;
            if (isUnauthorized) {
                useAuthStore.getState().logout();
            }

            set({ 
                error: error.response?.data?.message || 'Error al actualizar el estado', 
                loading: false
            });
            return { 
                success: false, 
                message: error.response?.data?.message || 'Error al actualizar el estado' 
            };
        }
    }
}));

