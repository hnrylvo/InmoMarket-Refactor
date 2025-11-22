// src/App.jsx
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Layout from './components/Layout'
import NotificationsList from './pages/Notifications'
import Favorites from "@/pages/publications/Favorites.jsx";
import Settings from './pages/Settings'
import PublicationsList from './pages/publications/PublicationsList'
import { PropertyRoute } from './components/PropertyRoute'
import { Toaster } from "@/components/ui/sonner"
import MyPublications from './pages/publications/MyPublications'
import CreatePublication from './pages/publications/CreatePublication'
import Reports from './pages/Reports'
import Visits from './pages/Visits'
import UserProfile from './pages/UserProfile'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminRoute } from './components/AdminRoute'
import ErrorBoundary from './components/ErrorBoundary'

export default function App() {
  return (
    <ErrorBoundary>
      <Toaster />
      <Routes>
        {/* Auth Routes - redirect to home if authenticated */}
        <Route path="/login" element={
          <ProtectedRoute requireAuth={false}>
            <Login />
          </ProtectedRoute>
        } />
        <Route path="/register" element={
          <ProtectedRoute requireAuth={false}>
            <Register />
          </ProtectedRoute>
        } />

        {/* Public Routes with Layout - accessible to everyone */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/publications" element={<PublicationsList />} />
          <Route path="/property/:id/:slug?" element={<PropertyRoute />} />
          <Route path="/user/:userId" element={<UserProfile />} />
        </Route>

        
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/notifications" element={<NotificationsList />} />
          <Route path="/my-publications" element={<MyPublications />} />
          <Route path="/my-publications/create" element={<CreatePublication />} />
          <Route path="/visits" element={<Visits />} />
          
          {/* Admin Routes - Solo accesible para administradores */}
          <Route 
            path="/reportes" 
            element={
              <AdminRoute>
                <Reports />
              </AdminRoute>
            } 
          />
      </Routes>
    </ErrorBoundary>
  )
}