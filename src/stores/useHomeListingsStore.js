import { create } from 'zustand';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const useHomeListingsStore = create((set, get) => ({
  popularProperties: [],
  newListings: [],
  loading: false,
  error: null,
  isDataLoaded: false,

  fetchHomeListings: async () => {
    if (get().isDataLoaded) {
      return;
    }

    try {
      set({ loading: true, error: null });

      const headers = {
        'Content-Type': 'application/json'
      };

      const popularResponse = await axios.get(
        `${API_BASE_URL}/publications/mostPopularPublications`,
        { headers }
      );

      const newListingsResponse = await axios.get(
        `${API_BASE_URL}/publications/lastPublications`,
        { headers }
      );

      const transformProperty = (property, isNewListing = false) => {
        return {
          id: property.id,
          imageUrl: property.propertyImageUrls?.[0] || '/placeholder.svg',
          images: property.propertyImageUrls || [],
          title: `${property.typeName} en ${property.neighborhood}`,
          price: `$${property.propertyPrice.toLocaleString()}`,
          location: `${property.municipality}, ${property.department}`,
          bedrooms: property.propertyBedrooms,
          floors: property.propertyFloors,
          publisherName: property.userName,
          isNew: isNewListing,
          favorited: false,
          description: property.propertyDescription,
          address: property.propertyAddress,
          neighborhood: property.neighborhood,
          municipality: property.municipality,
          department: property.department,
          size: property.propertySize,
          parking: property.propertyParking,
          furnished: property.propertyFurnished,
          coordinates: {
            lat: property.latitude,
            lng: property.longitude
          },
          availableTimes: property.availableTimes || []
        };
      };

      if (!Array.isArray(popularResponse.data) || !Array.isArray(newListingsResponse.data)) {
        throw new Error('Invalid response format from API');
      }

      set({
        popularProperties: popularResponse.data.map(property => transformProperty(property, false)),
        newListings: newListingsResponse.data.map(property => transformProperty(property, true)),
        loading: false,
        isDataLoaded: true
      });
    } catch (error) {
      console.error('Error in fetchHomeListings:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      let errorMessage = 'Error al cargar las publicaciones';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message === 'Invalid response format from API') {
        errorMessage = 'Formato de respuesta inválido del servidor';
      } else if (error.response?.status === 404) {
        errorMessage = 'No se encontraron publicaciones';
      }

      set({
        error: errorMessage,
        loading: false
      });
    }
  },

  refreshHomeListings: async () => {
    set({ isDataLoaded: false });
    return get().fetchHomeListings();
  },

  updateFavoriteStatus: (propertyId, isFavorited) => {
    set((state) => ({
      popularProperties: state.popularProperties.map(property =>
        property.id === propertyId ? { ...property, favorited: isFavorited } : property
      ),
      newListings: state.newListings.map(property =>
        property.id === propertyId ? { ...property, favorited: isFavorited } : property
      )
    }));
  }
})); 