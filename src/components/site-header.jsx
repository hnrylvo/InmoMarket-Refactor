"use client"

import React, { useEffect, useState } from 'react'
import { SidebarIcon } from "lucide-react"
import { Link, useLocation, useParams } from "react-router-dom"

import { SearchForm } from "@/components/search-form"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useSidebar } from "@/components/ui/sidebar"
import { useAuthStore } from "@/stores/useAuthStore"
import { usePublicationsStore } from "@/stores/usePublicationsStore"

export function SiteHeader() {
  const { toggleSidebar } = useSidebar()
  const token = useAuthStore((state) => state.token)
  const location = useLocation()
  const { id } = useParams()
  const { publications } = usePublicationsStore()

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean)
    const breadcrumbs = []

    // Get the current property if we're on a property page
    const currentProperty = id ? publications.find(p => p.id === id) : null
    const publicationTitle = currentProperty?.title

    // Always add home
    breadcrumbs.push({
      label: 'Inicio',
      href: '/'
    })

    // Build breadcrumbs based on path
    let currentPath = ''
    paths.forEach((path, index) => {
      // Skip both the ID and slug parts of the URL
      if (index > 0 && paths[index - 1] === 'property') {
        return
      }

      currentPath += `/${path}`
      
      // Special handling for property detail pages
      if (path === 'property') {
        breadcrumbs.push({
          label: 'Publicaciones',
          href: '/publications'
        })
        // Add the publication title as the last breadcrumb
        if (publicationTitle) {
          breadcrumbs.push({
            label: publicationTitle,
            href: currentPath
          })
        } else {
          // Add a loading state for the property title
          breadcrumbs.push({
            label: 'Cargando...',
            href: currentPath
          })
        }
        return
      }

      // For other paths, capitalize the first letter
      const label = path.charAt(0).toUpperCase() + path.slice(1)
      breadcrumbs.push({
        label: label,
        href: currentPath
      })
    })

    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <header className="fixed top-0 z-50 w-full items-center border-b bg-background">
      <div className="flex h-[--header-height] w-full items-center gap-2 px-4">
        <Button
          className="h-8 w-8"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
        >
          <SidebarIcon />
        </Button>
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.href}>
                <BreadcrumbItem>
                  {index === breadcrumbs.length - 1 ? (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link to={crumb.href}>{crumb.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        {!token && (
          <div className="flex gap-2 ml-auto">
            <Button
              variant="outline"
              asChild
            >
              <Link to="/login">Iniciar sesión</Link>
            </Button>
            <Button
              variant="primary"
              asChild
            >
              <Link to="/register">Registrarse</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
