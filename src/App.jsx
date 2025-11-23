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
import EditPublication from './pages/publications/EditPublication'
import Reports from './pages/Reports'
import Visits from './pages/Visits'
import UserProfile from './pages/Settings/UserProfile'
import AdminPublications from './pages/AdminPublications'
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

        {/* All Routes with Layout - sidebar available in all views */}
        <Route element={<Layout />}>
          {/* Public Routes - accessible to everyone */}
          <Route path="/" element={<Home />} />
          <Route path="/publications" element={<PublicationsList />} />
          <Route path="/property/:id/:slug?" element={<PropertyRoute />} />
          <Route path="/user/:userId" element={<UserProfile />} />
          
          {/* Protected Routes - require authentication */}
          <Route path="/favorites" element={
            <ProtectedRoute>
              <Favorites />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute>
              <NotificationsList />
            </ProtectedRoute>
          } />
          <Route path="/my-publications" element={
            <ProtectedRoute>
              <MyPublications />
            </ProtectedRoute>
          } />
          <Route path="/my-publications/create" element={
            <ProtectedRoute>
              <CreatePublication />
            </ProtectedRoute>
          } />
          <Route path="/my-publications/edit/:id" element={
            <ProtectedRoute>
              <EditPublication />
            </ProtectedRoute>
          } />
          <Route path="/visits" element={
            <ProtectedRoute>
              <Visits />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes - Solo accesible para administradores */}
          <Route 
            path="/reportes" 
            element={
              <AdminRoute>
                <Reports />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/publications" 
            element={
              <AdminRoute>
                <AdminPublications />
              </AdminRoute>
            } 
          />
        </Route>
      </Routes>
    </ErrorBoundary>
  )
}