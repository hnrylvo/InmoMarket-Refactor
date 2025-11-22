import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './useAuthStore';

export const useUserPublicationsStore = create((set, get) => ({
    publications: [],
    loading: false,
    error: null,
    isDataLoaded: false,

    fetchUserPublications: async (token, userId) => {
        if (get().isDataLoaded) {
            return;
        }

        try {
            console.log('Starting to fetch user publications...')
            set({ loading: true, error: null });
            
            const formData = new FormData();
            formData.append('userID', userId);

            console.log('Making API request with userID:', userId)
            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/publications/userPublications`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    },
                    params: {
                        userID: userId
                    }
                }
            );

            console.log('API Response:', response.data)

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

            console.log('Transformed publications:', transformedPublications)
            set({ 
                publications: transformedPublications, 
                loading: false,
                isDataLoaded: true 
            });
        } catch (error) {
            console.error('Error fetching user publications:', error)
            const isUnauthorized = error.response?.status === 401;
            if (isUnauthorized) {
                useAuthStore.getState().logout();
            }

            set({ 
                error: error.response?.data?.message || 'Error al cargar tus publicaciones', 
                loading: false 
            });
        }
    },

    refreshUserPublications: async (token, userId) => {
        set({ isDataLoaded: false });
        return get().fetchUserPublications(token, userId);
    }
})); 