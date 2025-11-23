import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './useAuthStore';

export const useFavoritesStore = create((set, get) => ({
  favorites: [],
  loading: false,
  error: null,
  totalPages: 0,
  currentPage: 0,
  totalElements: 0,
  pendingToggles: new Set(),

  fetchFavorites: async (token, page = 0) => {
    // Validate token before proceeding
    if (!token || typeof token !== 'string' || token.trim() === '') {
      set({ 
        error: 'No hay token de autenticación. Por favor, inicia sesión nuevamente.',
        loading: false 
      });
      return;
    }

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
      let errorMessage = 'Error al cargar favoritos';
      
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          // Session expired - logout user
          if (token) {
            useAuthStore.getState().logout();
          }
          errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
        } else if (status === 403) {
          errorMessage = 'No tienes permiso para acceder a esta información.';
        } else {
          errorMessage = error.response.data?.message || `Error del servidor (${status})`;
        }
      } else if (error.request) {
        errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
      } else {
        errorMessage = error.message || 'Error al procesar la solicitud';
      }
      
      console.error('Error fetching favorites:', {
        error,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
      
      set({ 
        error: errorMessage,
        loading: false 
      });
    }
  },


  toggleFavoriteOptimistic: async (token, publicationId) => {
    // Validate token before proceeding
    if (!token || typeof token !== 'string' || token.trim() === '') {
      return { 
        success: false, 
        error: 'No hay token de autenticación. Por favor, inicia sesión nuevamente.' 
      };
    }

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
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/favorites/toggle`;
      const requestBody = { publicationId };
      
      console.log('Toggle favorite optimistic request:', {
        url: apiUrl,
        publicationId,
        tokenLength: token.length,
        tokenPrefix: token.substring(0, 20) + '...'
      });
      
      const response = await axios.post(
        apiUrl,
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          validateStatus: (status) => status < 500 // Don't throw for 4xx errors
        }
      );
      
      console.log('Toggle favorite optimistic response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });
      
      // Check if response indicates an error
      if (response.status === 401) {
        // Session expired - logout user
        if (token) {
          useAuthStore.getState().logout();
        }
        // Revert optimistic update
        set({
          favorites: originalFavorites,
          totalElements: get().totalElements + 1,
          totalPages: Math.ceil((get().totalElements + 1) / itemsPerPage),
          pendingToggles: new Set([...get().pendingToggles].filter(id => id !== publicationId))
        });
        return { 
          success: false, 
          error: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.' 
        };
      }
      
      if (response.status === 403) {
        // Revert optimistic update
        set({
          favorites: originalFavorites,
          totalElements: get().totalElements + 1,
          totalPages: Math.ceil((get().totalElements + 1) / itemsPerPage),
          pendingToggles: new Set([...get().pendingToggles].filter(id => id !== publicationId))
        });
        return { 
          success: false, 
          error: 'No tienes permiso para realizar esta acción. Por favor, verifica tu sesión.' 
        };
      }
      
      if (response.status === 404) {
        // Revert optimistic update
        set({
          favorites: originalFavorites,
          totalElements: get().totalElements + 1,
          totalPages: Math.ceil((get().totalElements + 1) / itemsPerPage),
          pendingToggles: new Set([...get().pendingToggles].filter(id => id !== publicationId))
        });
        return { 
          success: false, 
          error: 'La publicación no fue encontrada.' 
        };
      }
      
      if (response.status >= 400) {
        // Revert optimistic update
        set({
          favorites: originalFavorites,
          totalElements: get().totalElements + 1,
          totalPages: Math.ceil((get().totalElements + 1) / itemsPerPage),
          pendingToggles: new Set([...get().pendingToggles].filter(id => id !== publicationId))
        });
        return { 
          success: false, 
          error: response.data?.message || `Error del servidor: ${response.status}` 
        };
      }
      
      set({
        pendingToggles: new Set([...get().pendingToggles].filter(id => id !== publicationId))
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      // Revert optimistic update
      set({
        favorites: originalFavorites,
        totalElements: get().totalElements + 1,
        totalPages: Math.ceil((get().totalElements + 1) / itemsPerPage),
        pendingToggles: new Set([...get().pendingToggles].filter(id => id !== publicationId))
      });
      
      // Enhanced error handling
      let errorMessage = 'Error al actualizar favoritos';
      
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        if (status === 401) {
          // Session expired - logout user
          if (token) {
            useAuthStore.getState().logout();
          }
          errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
        } else if (status === 403) {
          errorMessage = 'No tienes permiso para realizar esta acción. Por favor, verifica tu sesión.';
        } else if (status === 404) {
          errorMessage = 'La publicación no fue encontrada.';
        } else {
          errorMessage = error.response.data?.message || `Error del servidor (${status})`;
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
      } else {
        // Error setting up the request
        errorMessage = error.message || 'Error al procesar la solicitud';
      }
      
      console.error('Error toggling favorite:', {
        error,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  },

  toggleFavorite: async (token, publicationId) => {
    // Validate token before proceeding
    if (!token || typeof token !== 'string' || token.trim() === '') {
      return { 
        success: false, 
        error: 'No hay token de autenticación. Por favor, inicia sesión nuevamente.' 
      };
    }

    try {
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/favorites/toggle`;
      const requestBody = { publicationId };
      
      console.log('Toggle favorite request:', {
        url: apiUrl,
        publicationId,
        tokenLength: token.length,
        tokenPrefix: token.substring(0, 20) + '...'
      });
      
      const response = await axios.post(
        apiUrl,
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          validateStatus: (status) => status < 500 // Don't throw for 4xx errors
        }
      );
      
      console.log('Toggle favorite response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });
      
      // Check if response indicates an error
      if (response.status === 401) {
        // Session expired - logout user
        if (token) {
          useAuthStore.getState().logout();
        }
        return { 
          success: false, 
          error: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.' 
        };
      }
      
      if (response.status === 403) {
        return { 
          success: false, 
          error: 'No tienes permiso para realizar esta acción. Por favor, verifica tu sesión.' 
        };
      }
      
      if (response.status === 404) {
        return { 
          success: false, 
          error: 'La publicación no fue encontrada.' 
        };
      }
      
      if (response.status >= 400) {
        return { 
          success: false, 
          error: response.data?.message || `Error del servidor: ${response.status}` 
        };
      }
      
      return { success: true, data: response.data };
    } catch (error) {
      // Enhanced error handling
      let errorMessage = 'Error al actualizar favoritos';
      
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        if (status === 401) {
          // Session expired - logout user
          if (token) {
            useAuthStore.getState().logout();
          }
          errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
        } else if (status === 403) {
          errorMessage = 'No tienes permiso para realizar esta acción. Por favor, verifica tu sesión.';
        } else if (status === 404) {
          errorMessage = 'La publicación no fue encontrada.';
        } else {
          errorMessage = error.response.data?.message || `Error del servidor (${status})`;
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
      } else {
        // Error setting up the request
        errorMessage = error.message || 'Error al procesar la solicitud';
      }
      
      console.error('Error toggling favorite:', {
        error,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data,
        publicationId,
        tokenExists: !!token
      });
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  },

  refreshFavorites: async (token) => {
    const { currentPage } = get();
    await get().fetchFavorites(token, currentPage);
  }
})); 
