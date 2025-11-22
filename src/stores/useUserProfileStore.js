import { create } from 'zustand';
import axios from 'axios';

export const useUserProfileStore = create((set, get) => ({
profile: null,
loading: false,
error: null,

/**
* Obtiene el perfil público de un usuario (solo datos autorizados)
* @param {string} token - Token de autenticación (opcional)
* @param {number|string} userId - ID del usuario cuyo perfil se quiere ver
*/
fetchUserProfile: async (token, userId) => {
try {
set({ loading: true, error: null });
const headers = {
'Content-Type': 'application/json'
};
// Si hay token, lo incluimos (puede ser útil para obtener más información si es el propio perfil)
if (token) {
headers['Authorization'] = `Bearer ${token}`;
}
const response = await axios.get(
`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/user/${userId}/public-profile`,
{ headers }
);

// Transformar los datos para asegurar que solo mostramos información autorizada
const transformedProfile = {
id: response.data.id,
name: response.data.name || 'Usuario',
email: response.data.email || null, // Solo si está autorizado
phone: response.data.phone || null, // Solo si está autorizado
profilePicture: response.data.profilePicture || null,
bio: response.data.bio || null,
// Solo incluir datos que el usuario haya autorizado mostrar públicamente
showEmail: response.data.showEmail || false,
showPhone: response.data.showPhone || false,
// Información adicional que puede ser pública
joinDate: response.data.joinDate || null,
totalPublications: response.data.totalPublications || 0,
};

set({
profile: transformedProfile,
loading: false,
error: null
});

return transformedProfile;
} catch (error) {
const errorMessage = error.response?.data?.message || 'Error al cargar el perfil del usuario';
set({
error: errorMessage,
loading: false,
profile: null
});
throw error;
}
},

/**
* Limpia el perfil del store
*/
clearProfile: () => {
set({ profile: null, error: null });
}
}));
