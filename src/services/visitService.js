const API_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/visits`;

export const visitService = {
    async scheduleVisit(token, visitData) {
        const response = await fetch(`${API_URL}/request`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                publicationId: visitData.publicationId,
                visitDate: visitData.visitDate,
                visitTime: visitData.visitTime,
                userMessage: visitData.message
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error al agendar la visita');
        }

        return data;
    },

    async getUserVisits(token) {
        const response = await fetch(`${API_URL}/my-visits`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error al cargar las visitas');
        }

        return data;
    },

    async cancelVisit(token, visitId) {
        const response = await fetch(`${API_URL}/${visitId}/cancel`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error al cancelar la visita');
        }

        return data;
    },

    async getVisitNotifications(token) {
        const response = await fetch(`${API_URL}/notifications`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error al cargar las notificaciones de visitas');
        }

        return data;
    },

    async markVisitNotificationsAsRead(token, type) {
        const response = await fetch(`${API_URL}/notifications/mark-read?type=${type}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error al marcar notificaciones como leídas');
        }

        return data;
    },

    async getPropertyVisits(token, page = 0, size = 10) {
        const response = await fetch(`${API_URL}/my-property-visits?page=${page}&size=${size}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error al cargar las visitas a mis propiedades');
        }

        return data;
    },

    async acceptVisit(token, visitId, meetingLocation, additionalMessage) {
        const response = await fetch(`${API_URL}/${visitId}/accept`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ meetingLocation, additionalMessage })
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Error al aceptar la visita');
        }
        return data;
    },

    async rejectVisit(token, visitId, rejectionReason) {
        const response = await fetch(`${API_URL}/${visitId}/reject`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ rejectionReason })
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Error al rechazar la visita');
        }
        return data;
    }
}; 