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
                title: pub.propertyTitle || '', // Always use propertyTitle, never combine with typeName
                propertyTitle: pub.propertyTitle || '', // Store propertyTitle separately
                typeName: pub.typeName || '', // Add typeName for editing
                price: `$${pub.propertyPrice.toLocaleString()}`,
                location: `${pub.municipality}, ${pub.department}`,
                bedrooms: pub.propertyBedrooms,
                floors: pub.propertyFloors,
                publisherName: pub.userName,
                publisherId: pub.userId || pub.ownerId || null, // ID del vendedor para ver su perfil
                userEmail: pub.userEmail || null,
                userPhoneNumber: pub.userPhoneNumber || null,
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
                    title: pub.propertyTitle || '', // Always use propertyTitle, never combine with typeName
                    propertyTitle: pub.propertyTitle || '', // Store propertyTitle separately
                    typeName: pub.typeName || '', // Add typeName for editing
                    price: `$${pub.propertyPrice.toLocaleString()}`,
                    location: `${pub.municipality}, ${pub.department}`,
                    bedrooms: pub.propertyBedrooms,
                    floors: pub.propertyFloors,
                    publisherName: pub.userName,
                    publisherId: pub.userId || pub.ownerId || null, // ID del vendedor para ver su perfil
                    userEmail: pub.userEmail || null,
                    userPhoneNumber: pub.userPhoneNumber || null,
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
            
            console.log('fetchPublicationById - Fetching publication:', id)
            const apiUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/publications/publicationById?publicationId=${id}`
            console.log('fetchPublicationById - URL:', apiUrl)
            
            const response = await axios.get(apiUrl, {
                headers
            });

            const pub = response.data;
            
            // Debug: log the raw API response to see what fields are available
            console.log('fetchPublicationById - Raw API response propertyTitle:', pub.propertyTitle);
            console.log('fetchPublicationById - Raw API response title field:', pub.title);
            console.log('fetchPublicationById - All fields:', Object.keys(pub));
            console.log('fetchPublicationById - Raw API response:', pub)
            console.log('fetchPublicationById - Available fields:', Object.keys(pub))
            console.log('fetchPublicationById - userId:', pub.userId)
            console.log('fetchPublicationById - ownerId:', pub.ownerId)
            console.log('fetchPublicationById - user:', pub.user)
            
            // Try multiple possible field names for the owner ID
            const publisherId = pub.userId || 
                               pub.ownerId || 
                               pub.user?.id || 
                               pub.userId || 
                               pub.publisherId ||
                               (pub.user && typeof pub.user === 'object' ? pub.user.id : null) ||
                               null;
            
            console.log('fetchPublicationById - Resolved publisherId:', publisherId)
            
            const transformedPublication = {
                id: pub.id,
                imageUrl: pub.propertyImageUrls?.[0] || '/placeholder.svg',
                images: pub.propertyImageUrls || [],
                // Always use propertyTitle, never combine with typeName
                // Handle null explicitly - convert to empty string
                title: (pub.propertyTitle !== null && pub.propertyTitle !== undefined) ? pub.propertyTitle : '',
                propertyTitle: (pub.propertyTitle !== null && pub.propertyTitle !== undefined) ? pub.propertyTitle : '', // Store propertyTitle separately
                typeName: pub.typeName || '', // Add typeName for editing
                price: `$${pub.propertyPrice.toLocaleString()}`,
                propertyPrice: pub.propertyPrice, // Store original price for editing
                location: `${pub.municipality}, ${pub.department}`,
                bedrooms: pub.propertyBedrooms,
                floors: pub.propertyFloors,
                publisherName: pub.userName,
                publisherId: publisherId, // ID del vendedor para ver su perfil
                userEmail: pub.userEmail || null,
                userPhoneNumber: pub.userPhoneNumber || null,
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

            set(state => {
                // If the API returned null propertyTitle but we have a title in the store, preserve it
                const existingPublication = state.publications.find(p => p.id === id);
                if (existingPublication && (!transformedPublication.propertyTitle || transformedPublication.propertyTitle === null || transformedPublication.propertyTitle === '')) {
                    const existingTitle = existingPublication.propertyTitle || existingPublication.title;
                    if (existingTitle && existingTitle !== null && existingTitle !== '') {
                        console.log('fetchPublicationById - Preserving existing title from store:', existingTitle);
                        transformedPublication.propertyTitle = existingTitle;
                        transformedPublication.title = existingTitle;
                    }
                }
                
                return {
                    publications: state.publications.some(p => p.id === id)
                        ? state.publications.map(p => p.id === id ? transformedPublication : p)
                        : [...state.publications, transformedPublication],
                    loading: false,
                    error: null
                };
            });

            return transformedPublication;
        } catch (error) {
            const isUnauthorized = error.response?.status === 401;
            if (isUnauthorized && token) {
                useAuthStore.getState().logout();
            }

            // Log detailed error information
            console.error('fetchPublicationById - Error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message,
                url: error.config?.url
            });
            
            if (error.response?.data) {
                console.error('fetchPublicationById - Full error response:', JSON.stringify(error.response.data, null, 2));
            }

            set({ 
                error: error.response?.data?.message || error.response?.data?.error || 'Error al cargar la publicación', 
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
    },

    // Update publication
    updatePublication: async (token, publicationId, formData) => {
        try {
            set({ loading: true, error: null });

            // Helper function to format price (same as CreatePublication)
            const formatPriceForAPI = (price) => {
                if (!price) return '0.00'
                const priceStr = String(price).replace(/\D/g, '') // Remove non-digits
                if (!priceStr) return '0.00'
                const padded = priceStr.padStart(3, '0')
                const dollars = padded.slice(0, -2)
                const cents = padded.slice(-2)
                return `${parseInt(dollars, 10)}.${cents}`
            }

            const formDataToSend = new FormData();

            // Add basic property information
            formDataToSend.append('propertyAddress', formData.propertyAddress || '');
            // Ensure propertyTitle is sent - trim whitespace and ensure it's not null
            // The backend should handle empty strings appropriately
            const propertyTitle = (formData.title && typeof formData.title === 'string') 
                ? formData.title.trim() 
                : '';
            console.log('updatePublication - propertyTitle to send:', propertyTitle, 'type:', typeof propertyTitle);
            formDataToSend.append('propertyTitle', propertyTitle);
            formDataToSend.append('typeName', formData.tipo || '');
            formDataToSend.append('neighborhood', formData.neighborhood || '');
            formDataToSend.append('municipality', formData.municipality || '');
            formDataToSend.append('department', formData.department || '');
            formDataToSend.append('longitude', formData.longitude || '');
            formDataToSend.append('latitude', formData.latitude || '');
            formDataToSend.append('propertySize', formData.propertySize?.toString() || '');
            formDataToSend.append('propertyBedrooms', formData.propertyBedrooms?.toString() || '');
            formDataToSend.append('propertyFloors', formData.propertyFloors?.toString() || '');
            formDataToSend.append('propertyParking', formData.propertyParking?.toString() || '');
            formDataToSend.append('propertyFurnished', formData.propertyFurnished ? 'true' : 'false');
            formDataToSend.append('PropertyDescription', formData.propertyDescription || '');
            formDataToSend.append('PropertyPrice', formatPriceForAPI(formData.propertyPrice || ''));

            // Add available times - handle the orphan deletion issue
            // The backend has issues with orphan deletion when updating collections
            // Solution: Only send availableTimes if they have changed, or send them in a way
            // that doesn't trigger orphan deletion issues
            const availableTimes = formData.availableTimes || [];
            const timesChanged = formData.availableTimesChanged !== false; // Default to true if not specified
            
            console.log('updatePublication - availableTimes structure:', availableTimes);
            console.log('updatePublication - timesChanged flag:', timesChanged);
            
            // Only send availableTimes if they have changed
            // This avoids the orphan deletion issue when times haven't changed
            if (timesChanged && availableTimes.length > 0) {
                availableTimes.forEach((slot, index) => {
                    console.log(`updatePublication - Processing slot ${index}:`, slot);
                    
                    // Always include ID if it exists - this helps the backend identify existing records
                    if (slot.id !== undefined && slot.id !== null) {
                        formDataToSend.append(`availableTimes[${index}].id`, slot.id.toString());
                        console.log(`updatePublication - Added ID for slot ${index}:`, slot.id);
                    }
                    
                    // Send the time slot data
                    formDataToSend.append(`availableTimes[${index}].dayOfWeek`, slot.dayOfWeek?.toString() || '');
                    formDataToSend.append(`availableTimes[${index}].startTime`, slot.startTime || '');
                    formDataToSend.append(`availableTimes[${index}].endTime`, slot.endTime || '');
                });
            } else if (timesChanged && availableTimes.length === 0) {
                // If times changed to empty, we need to tell the backend to clear them
                // But this might trigger the orphan deletion issue
                // Try sending an empty indicator
                console.log('updatePublication - Times changed to empty, sending empty array indicator');
                formDataToSend.append('availableTimes', '[]');
            } else {
                // Times haven't changed, don't send them to avoid orphan deletion issue
                console.log('updatePublication - Times haven\'t changed, not sending to avoid orphan deletion issue');
            }

            // Add files if they exist (new images)
            if (formData.files && formData.files.length > 0) {
                for (const file of formData.files) {
                    formDataToSend.append('files', file);
                }
            }

            // Debug: Log what we're sending
            const propertyTitleToSend = formData.title ? formData.title.trim() : '';
            console.log('updatePublication - Sending form data:', {
                propertyAddress: formData.propertyAddress,
                propertyTitle: propertyTitleToSend,
                propertyTitleOriginal: formData.title,
                typeName: formData.tipo,
                neighborhood: formData.neighborhood,
                municipality: formData.municipality,
                department: formData.department,
                longitude: formData.longitude,
                latitude: formData.latitude,
                propertySize: formData.propertySize,
                propertyBedrooms: formData.propertyBedrooms,
                propertyFloors: formData.propertyFloors,
                propertyParking: formData.propertyParking,
                propertyFurnished: formData.propertyFurnished ? 'true' : 'false',
                PropertyDescription: formData.propertyDescription,
                PropertyPrice: formatPriceForAPI(formData.propertyPrice || ''),
                availableTimes: formData.availableTimes,
                files: formData.files ? formData.files.length : 0
            });

            // Log FormData contents for debugging
            console.log('updatePublication - FormData contents:');
            for (let pair of formDataToSend.entries()) {
                console.log('  ', pair[0], ':', pair[1]);
            }

            const response = await axios.put(
                `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/publications/${publicationId}`,
                formDataToSend,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            // Update the publication in the store
            const pub = response.data;
            
            // Debug: log what we received from the update
            console.log('updatePublication - Response propertyTitle:', pub.propertyTitle);
            console.log('updatePublication - Response title field:', pub.title);
            
            const transformedPublication = {
                id: pub.id,
                imageUrl: pub.propertyImageUrls?.[0] || '/placeholder.svg',
                images: pub.propertyImageUrls || [],
                // Handle null explicitly - convert to empty string
                title: (pub.propertyTitle !== null && pub.propertyTitle !== undefined) ? pub.propertyTitle : '',
                propertyTitle: (pub.propertyTitle !== null && pub.propertyTitle !== undefined) ? pub.propertyTitle : '', // Store propertyTitle for slug generation
                typeName: pub.typeName || '', // Store typeName for display
                price: `$${pub.propertyPrice.toLocaleString()}`,
                location: `${pub.municipality}, ${pub.department}`,
                bedrooms: pub.propertyBedrooms,
                floors: pub.propertyFloors,
                publisherName: pub.userName,
                publisherId: pub.userId || pub.ownerId || null,
                userEmail: pub.userEmail || null,
                userPhoneNumber: pub.userPhoneNumber || null,
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
            };

            set(state => ({
                publications: state.publications.some(p => p.id === publicationId)
                    ? state.publications.map(p => p.id === publicationId ? transformedPublication : p)
                    : [...state.publications, transformedPublication],
                filteredResults: state.filteredResults?.some(p => p.id === publicationId)
                    ? state.filteredResults.map(p => p.id === publicationId ? transformedPublication : p)
                    : state.filteredResults,
                loading: false,
                error: null
            }));

            return transformedPublication;
        } catch (error) {
            const isUnauthorized = error.response?.status === 401;
            if (isUnauthorized) {
                useAuthStore.getState().logout();
            }

            // Log detailed error information
            console.error('updatePublication - Error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message,
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                    headers: error.config?.headers
                }
            });
            
            // Log the full error response data
            if (error.response?.data) {
                console.error('updatePublication - Full error response data:', JSON.stringify(error.response.data, null, 2));
            }
            
            // Log the error message if available
            if (error.response?.data?.message) {
                console.error('updatePublication - Error message:', error.response.data.message);
            }
            
            if (error.response?.data?.error) {
                console.error('updatePublication - Error:', error.response.data.error);
            }

            set({ 
                error: error.response?.data?.message || error.response?.data?.error || 'Error al actualizar la publicación', 
                loading: false 
            });
            throw error;
        }
    }
})); 