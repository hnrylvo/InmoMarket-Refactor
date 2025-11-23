import React, { useEffect } from 'react'
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Plus, Edit } from "lucide-react"
import { useNavigate } from 'react-router-dom'
import ExpandedPropertyCard from "@/components/Home/ExpandedPropertyCard"
import { useUserPublicationsStore } from '@/stores/useUserPublicationsStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export default function MyPublications() {
    const navigate = useNavigate()
    const { publications, loading, error, fetchUserPublications } = useUserPublicationsStore()
    const { token, userId } = useAuthStore()

    useEffect(() => {
        console.log('Current userId:', userId)
        console.log('Current token:', token)
        
        if (token && userId) {
            console.log('Fetching publications for user:', userId)
            fetchUserPublications(token, userId)
        } else {
            console.log('Missing token or userId')
        }
    }, [token, userId, fetchUserPublications])

    console.log('Current publications:', publications)
    console.log('Loading state:', loading)
    console.log('Error state:', error)

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-500">{error}</p>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="container mx-auto py-10 px-4 min-h-screen mt-4 pt-[--header-height]">
                <div className="container mx-auto py-8 px-4">
                    <div className="flex justify-between items-center">
                        <PageHeader
                            title="Mis Avisos"
                            description="Encuentra tus avisos y crea otros."
                        />
                        <Button 
                            className="flex items-center gap-2"
                            onClick={() => navigate('/my-publications/create')}
                        >
                            <Plus className="h-4 w-4" />
                            Crear aviso
                        </Button>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, index) => (
                        <div key={index} className="space-y-4">
                            <Skeleton className="h-[200px] w-full rounded-lg" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                                <div className="flex gap-4">
                                    <Skeleton className="h-4 w-1/4" />
                                    <Skeleton className="h-4 w-1/4" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-10 px-4 min-h-screen mt-4 pt-[--header-height]">
            <div className="container mx-auto py-8 px-4">
                <div className="flex justify-between items-center">
                    <PageHeader
                        title="Mis Avisos"
                        description="Encuentra tus avisos y crea otros."
                    />
                    <Button 
                        className="flex items-center gap-2"
                        onClick={() => navigate('/my-publications/create')}
                    >
                        <Plus className="h-4 w-4" />
                        Crear aviso
                    </Button>
                </div>
            </div>

            {/* Results Grid */}
            {publications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    No se encontraron resultados
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {publications.map((publication) => (
                        <div key={publication.id} className="relative group h-full">
                            <ExpandedPropertyCard
                                {...publication}
                                onFavoriteChange={(favorited) => {
                                    console.log('Favorite changed:', favorited);
                                }}
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/my-publications/edit/${publication.id}`);
                                }}
                                className="absolute top-3 left-3 z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-900 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-2"
                            >
                                <Edit className="w-4 h-4" />
                                Editar
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}