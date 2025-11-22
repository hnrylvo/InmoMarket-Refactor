import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { useAuthStore } from './useAuthStore';

export const usePublicationsStore = create((set, get) => ({
    publications: [],
    loading: false,
    error: null,
    filteredResults: null,
    lastFetchTime: null,

    // Get only active publications (if API doesn't filter them)
    getActivePublications: () => {
        const { publications } = get();
        // Filter out inactive publications if they have an 'active' or 'status' field
        // This assumes the API returns all active publications, but we add this as a safety measure
        return publications.filter(pub => {
            // If publication has an active field, use it; otherwise assume it's active
            return pub.active !== false && pub.status !== 'inactive';
        });
    },

    checkFavoriteStatus: async (token, publicationId) => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/favorites/check/${publicationId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            return response.data.isFavorite;
        } catch (error) {
            console.error('Error checking favorite status:', error);
            return false;
        }
    },

    fetchPublications: async (token) => {
        try {
            set({ loading: true, error: null });
            
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/publications/All`,
                { headers }
            );

            const transformedPublications = response.data.map(pub => ({
                id: pub.id,
                imageUrl: pub.propertyImageUrls?.[0] || '/placeholder.svg',
                images: pub.propertyImageUrls || [],
                title: pub.propertyTitle || `${pub.typeName} en ${pub.neighborhood}`,
                price: `$${pub.propertyPrice.toLocaleString()}`,
                location: `${pub.municipality}, ${pub.department}`,
                bedrooms: pub.propertyBedrooms,
                floors: pub.propertyFloors,
                publisherName: pub.userName,
                publisherId: pub.userId || pub.ownerId || null, // ID del vendedor para ver su perfil
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
                availableTimes: pub.availableTimes || []
            }));

            set({ 
                publications: transformedPublications,
                filteredResults: transformedPublications,
                loading: false,
                lastFetchTime: Date.now(),
                error: null
            });
        } catch (error) {
            const isUnauthorized = error.response?.status === 401;
            if (isUnauthorized && token) {
                useAuthStore.getState().logout();
            }

            set({ 
                error: error.response?.data?.message || 'Error al cargar las publicaciones', 
                loading: false,
                lastFetchTime: null
            });
        }
    },

    searchPublications: async (token, filters) => {
        try {
            set({ loading: true, error: null });
            
            // Build query string from filters
            const queryParams = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value) {
                    queryParams.append(key, value);
                }
            });

            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/publications?${queryParams.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const transformedPublications = await Promise.all(response.data.map(async pub => {
                const isFavorite = await get().checkFavoriteStatus(token, pub.id);
                return {
                    id: pub.id,
                    imageUrl: pub.propertyImageUrls?.[0] || '/placeholder.svg',
                    images: pub.propertyImageUrls || [],
                    title: pub.propertyTitle || `${pub.typeName} en ${pub.neighborhood}`,
                    price: `$${pub.propertyPrice.toLocaleString()}`,
                    location: `${pub.municipality}, ${pub.department}`,
                    bedrooms: pub.propertyBedrooms,
                    floors: pub.propertyFloors,
                    publisherName: pub.userName,
                    publisherId: pub.userId || pub.ownerId || null, // ID del vendedor para ver su perfil
                    isNew: true,
                    favorited: isFavorite,
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
                    availableTimes: pub.availableTimes || []
                };
            }));

            set({ 
                filteredResults: transformedPublications, 
                loading: false 
            });

            return transformedPublications;
        } catch (error) {
            const isUnauthorized = error.response?.status === 401;
            if (isUnauthorized) {
                useAuthStore.getState().logout();
            }

            set({ 
                error: error.response?.data?.message || 'Error al buscar las publicaciones', 
                loading: false 
            });
            throw error;
        }
    },

    fetchPublicationById: async (id, token) => {
        try {
            set({ loading: true, error: null });
            
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/publications/${id}`, {
                headers
            });

            const pub = response.data;
            const transformedPublication = {
                id: pub.id,
                imageUrl: pub.propertyImageUrls?.[0] || '/placeholder.svg',
                images: pub.propertyImageUrls || [],
                title: pub.propertyTitle || `${pub.typeName} in ${pub.neighborhood}`,
                price: `$${pub.propertyPrice.toLocaleString()}`,
                location: `${pub.municipality}, ${pub.department}`,
                bedrooms: pub.propertyBedrooms,
                floors: pub.propertyFloors,
                publisherName: pub.userName,
                publisherId: pub.userId || pub.ownerId || null, // ID del vendedor para ver su perfil
                isNew: true,
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
                availableTimes: pub.availableTimes || []
            };

            set(state => ({
                publications: state.publications.some(p => p.id === id)
                    ? state.publications.map(p => p.id === id ? transformedPublication : p)
                    : [...state.publications, transformedPublication],
                loading: false
            }));

            return transformedPublication;
        } catch (error) {
            const isUnauthorized = error.response?.status === 401;
            if (isUnauthorized && token) {
                useAuthStore.getState().logout();
            }

            set({ 
                error: error.response?.data?.message || 'Error al cargar la publicación', 
                loading: false 
            });
            throw error;
        }
    },

    reportPublication: async (token, reportData) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/reports/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(reportData)
            });

            if (!response.ok) {
                throw new Error('Error al reportar la publicación');
            }

            return await response.json();
        } catch (error) {
            console.error('Error reporting publication:', error);
            throw error;
        }
    },

    // Refresh publications (useful for manual refresh)
    refreshPublications: async (token) => {
        set({ lastFetchTime: null });
        return get().fetchPublications(token);
    },

    // Clear filtered results to show all publications
    clearFilters: () => {
        set({ filteredResults: null });
    }
})); 