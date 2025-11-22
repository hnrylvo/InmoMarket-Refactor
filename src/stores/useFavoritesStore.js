import { create } from 'zustand';
import axios from 'axios';

export const useFavoritesStore = create((set, get) => ({
  favorites: [],
  loading: false,
  error: null,
  totalPages: 0,
  currentPage: 0,
  totalElements: 0,
  pendingToggles: new Set(),

  fetchFavorites: async (token, page = 0) => {
    try {
      set({ loading: true, error: null });
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/favorites/my-favorites?page=${page}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const transformedFavorites = response.data.content.map(fav => ({
        id: fav.publicationId,
        imageUrl: fav.propertyImageUrls?.[0] || '/placeholder.svg',
        images: fav.propertyImageUrls || [],
        title: `${fav.typeName} en ${fav.neighborhood}`,
        price: `$${fav.propertyPrice.toLocaleString()}`,
        location: `${fav.municipality}, ${fav.department}`,
        bedrooms: fav.propertyBedrooms,
        floors: fav.propertyFloors,
        publisherName: fav.ownerName,
        isNew: false,
        favorited: true,
        description: fav.propertyDescription,
        address: fav.propertyAddress,
        neighborhood: fav.neighborhood,
        municipality: fav.municipality,
        department: fav.department,
        size: fav.propertySize,
        parking: fav.propertyParking,
        furnished: fav.propertyFurnished,
        coordinates: {
          lat: fav.latitude,
          lng: fav.longitude
        },
        availableTimes: fav.availableTimes || []
      }));

      set({ 
        favorites: transformedFavorites,
        loading: false,
        totalPages: response.data.totalPages,
        currentPage: response.data.number,
        totalElements: response.data.totalElements
      });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Error al cargar favoritos',
        loading: false 
      });
    }
  },


  toggleFavoriteOptimistic: async (token, publicationId) => {
    const { favorites, pendingToggles } = get();
    
    if (pendingToggles.has(publicationId)) {
      return { success: false, error: 'Operación en progreso' };
    }

    const propertyIndex = favorites.findIndex(fav => fav.id === publicationId);
    if (propertyIndex === -1) {
      return { success: false, error: 'Propiedad no encontrada' };
    }

    const originalFavorites = [...favorites];
    const removedProperty = favorites[propertyIndex];

    const updatedFavorites = favorites.filter(fav => fav.id !== publicationId);
    
    const newTotalElements = Math.max(0, get().totalElements - 1);
    
    const itemsPerPage = 12;
    const newTotalPages = Math.ceil(newTotalElements / itemsPerPage);
    
    let newCurrentPage = get().currentPage;
    if (updatedFavorites.length === 0 && newCurrentPage > 0) {
      newCurrentPage = Math.max(0, newCurrentPage - 1);
    }

    set({
      favorites: updatedFavorites,
      totalElements: newTotalElements,
      totalPages: newTotalPages,
      currentPage: newCurrentPage,
      pendingToggles: new Set([...pendingToggles, publicationId])
    });

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/favorites/toggle`,
        { publicationId },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      set({
        pendingToggles: new Set([...get().pendingToggles].filter(id => id !== publicationId))
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      set({
        favorites: originalFavorites,
        totalElements: get().totalElements + 1,
        totalPages: Math.ceil((get().totalElements + 1) / itemsPerPage),
        pendingToggles: new Set([...get().pendingToggles].filter(id => id !== publicationId))
      });
      
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error al actualizar favoritos' 
      };
    }
  },

  toggleFavorite: async (token, publicationId) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/favorites/toggle`,
        { publicationId },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error al actualizar favoritos' 
      };
    }
  },

  refreshFavorites: async (token) => {
    const { currentPage } = get();
    await get().fetchFavorites(token, currentPage);
  }
})); 
