import React, { useEffect } from "react";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import { useAuthStore } from "@/stores/useAuthStore";
import ExpandedPropertyCard from "@/components/Home/ExpandedPropertyCard.jsx";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/ui/page-header";
import { toast } from "sonner";

export default function Favorites() {
  const { 
    favorites, 
    loading, 
    error, 
    totalPages, 
    currentPage, 
    pendingToggles,
    fetchFavorites, 
    toggleFavoriteOptimistic 
  } = useFavoritesStore();
  const { token } = useAuthStore();

  useEffect(() => {
    if (token) {
      fetchFavorites(token, currentPage);
    }
  }, [token, currentPage, fetchFavorites]);

  const handleFavoriteChange = async (id, isFavorite) => {
    if (!token) {
      toast.error("Debes iniciar sesión para gestionar favoritos");
      return;
    }

    // Check if this toggle is already in progress
    if (pendingToggles.has(id)) {
      return;
    }

    try {
      const result = await toggleFavoriteOptimistic(token, id);
      if (result.success) {
        // No need to show success toast for removal since it's immediate
        // The UI is already updated optimistically
      } else {
        toast.error(result.error || "Error al actualizar favoritos");
      }
    } catch (error) {
      toast.error("Error al actualizar favoritos");
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchFavorites(token, newPage);
    }
  };

  if (error) {
    return (
      <div className="container mx-auto py-10 px-4 min-h-screen mt-4 pt-[--header-height]">
        <div className="text-center py-8">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 min-h-screen mt-4 pt-[--header-height]">
      <PageHeader
        title="Favoritos"
        description="Tus propiedades favoritas"
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
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
      ) : favorites.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No tienes propiedades favoritas
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((property) => (
              <ExpandedPropertyCard
                key={property.id}
                {...property}
                favorited={true}
                isPending={pendingToggles.has(property.id)}
                onFavoriteChange={(newState) =>
                  handleFavoriteChange(property.id, newState)
                }
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                >
                  Anterior
                </Button>
                {[...Array(totalPages)].map((_, index) => (
                  <Button
                    key={index}
                    variant={currentPage === index ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(index)}
                  >
                    {index + 1}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages - 1}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
