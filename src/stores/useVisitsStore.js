import { create } from 'zustand'
import { visitService } from '@/services/visitService'
import { useAuthStore } from './useAuthStore'

export const useVisitsStore = create((set, get) => ({
  pendingVisits: [],
  respondedVisits: [],
  newVisitRequests: 0,
  newVisitResponses: 0,
  loading: false,
  error: null,
  async fetchVisitNotifications() {
    const token = useAuthStore.getState().token
    if (!token) return
    set({ loading: true, error: null })
    try {
      const response = await visitService.getVisitNotifications(token)
      set({
        pendingVisits: response.pendingVisits || [],
        respondedVisits: response.respondedVisits || [],
        newVisitRequests: response.newVisitRequests || 0,
        newVisitResponses: response.newVisitResponses || 0,
        loading: false,
        error: null,
      })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },
  clearNotifications() {
    set({
      pendingVisits: [],
      respondedVisits: [],
      newVisitRequests: 0,
      newVisitResponses: 0,
      loading: false,
      error: null,
    })
  }
})) 