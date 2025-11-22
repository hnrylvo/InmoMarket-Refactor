import {useRef, useState, useEffect, useMemo, useCallback} from "react"
import {HomeHero} from "@/components/Home/HomeHero"
import {ChevronLeft, ChevronRight} from "lucide-react"
import ExpandedPropertyCard from "@/components/Home/ExpandedPropertyCard.jsx";
import Footer from "@/components/footer"
import { useAuthStore } from "@/stores/useAuthStore"
import { useFavoritesStore } from "@/stores/useFavoritesStore"
import { useHomeListingsStore } from "@/stores/useHomeListingsStore"
import { usePublicationsStore } from "@/stores/usePublicationsStore"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner";
import { useVisitsStore } from '@/stores/useVisitsStore'
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

// Improved Carousel with better UX
function PropertyCarousel({properties, onFavoriteChange}) {
  const carouselRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  // Check scroll position to enable/disable buttons
  const checkScrollPosition = () => {
    if (!carouselRef.current) return

    const {scrollLeft, scrollWidth, clientWidth} = carouselRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
  }

  useEffect(() => {
    checkScrollPosition()
    const carousel = carouselRef.current
    if (carousel) {
      carousel.addEventListener('scroll', checkScrollPosition)
      return () => carousel.removeEventListener('scroll', checkScrollPosition)
    }
  }, [])

  // Better scroll calculation
  const getScrollAmount = () => {
    if (!carouselRef.current) return 0

    const carousel = carouselRef.current
    const firstCard = carousel.querySelector('div')

    if (window.innerWidth < 640) {
      // On mobile, scroll by card width + gap
      return firstCard ? firstCard.offsetWidth + 24 : window.innerWidth * 0.85
    }
    // On desktop, scroll by card width + gap
    return 364 // 340px + 24px gap
  }

  const scrollByAmount = (direction) => {
    if (!carouselRef.current) return

    const scrollAmount = getScrollAmount()
    carouselRef.current.scrollBy({
      left: direction * scrollAmount,
      behavior: "smooth"
    })
  }

  return (
    <div className="relative">
      {/* Left button */}
      <button
        aria-label="Scroll left"
        className={`absolute -left-2 top-1/2 -translate-y-1/2 z-10 
                   w-11 h-11 rounded-full flex items-center justify-center
                   bg-background/90 hover:bg-background shadow-md border
                   transition-all duration-200 ${!canScrollLeft ? 'opacity-0 pointer-events-none' : 'opacity-0 hover:opacity-100'}`}
        onClick={() => scrollByAmount(-1)}
        disabled={!canScrollLeft}
        type="button"
      >
        <ChevronLeft className="h-5 w-5 text-foreground"/>
      </button>

      {/* Right button */}
      <button
        aria-label="Scroll right"
        className={`absolute -right-2 top-1/2 -translate-y-1/2 z-10 
                   w-11 h-11 rounded-full flex items-center justify-center
                   bg-background/90 hover:bg-background shadow-md border
                   transition-all duration-200 ${!canScrollRight ? 'opacity-0 pointer-events-none' : 'opacity-0 hover:opacity-100'}`}
        onClick={() => scrollByAmount(1)}
        disabled={!canScrollRight}
        type="button"
      >
        <ChevronRight className="h-5 w-5 text-foreground"/>
      </button>

      {/* Carousel */}
      <div
        ref={carouselRef}
        className="flex gap-6 overflow-x-auto pb-4 scroll-smooth select-none scrollbar-hide"
      >
        {properties.map((property, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-[85vw] sm:w-[340px] transition-all"
          >
            <ExpandedPropertyCard 
              {...property} 
              onFavoriteChange={(favorited) => onFavoriteChange(property.id, favorited)}
            />
          </div>
        ))}
      </div>

      {/* Scroll indicator for mobile */}
      <div className="flex justify-center mt-4 sm:hidden">
        <div className="flex space-x-1">
          {properties.map((_, i) => (
            <div key={i} className="w-2 h-2 bg-muted rounded-full"/>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const { token } = useAuthStore();
  const { fetchFavorites, toggleFavorite, favorites } = useFavoritesStore();
  const { popularProperties, newListings, loading: homeListingsLoading, error: homeListingsError, fetchHomeListings, isDataLoaded, updateFavoriteStatus } = useHomeListingsStore();
  const { publications, loading: publicationsLoading, error: publicationsError, fetchPublications } = usePublicationsStore();
  const fetchVisitNotifications = useVisitsStore((state) => state.fetchVisitNotifications)
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const navigate = useNavigate();

  // Helper to check if a publication is favorited
  const isFavorited = useCallback((publicationId) => {
    return favorites.some(fav => fav.id === publicationId);
  }, [favorites]);

  // Add handler for favorite changes
  const handleFavoriteChange = useCallback(async (publicationId, isFavorited) => {
    if (!token) {
      toast.error("Debes iniciar sesión para gestionar favoritos");
      return;
    }

    try {
      // Optimistically update the UI
      updateFavoriteStatus(publicationId, isFavorited);
      
      const result = await toggleFavorite(token, publicationId);
      if (result.success) {
        toast.success(isFavorited ? "Agregado a favoritos" : "Eliminado de favoritos");
        // Refresh favorites to update the UI
        await fetchFavorites(token, 0);
      } else {
        // Revert the optimistic update if the API call failed
        updateFavoriteStatus(publicationId, !isFavorited);
        toast.error(result.error || "Error al actualizar favoritos");
      }
    } catch (error) {
      // Revert the optimistic update if there was an error
      updateFavoriteStatus(publicationId, !isFavorited);
      toast.error("Error al actualizar favoritos");
    }
  }, [token, toggleFavorite, updateFavoriteStatus, fetchFavorites]);

  // Memoize active publications with favorite status
  const activePublications = useMemo(() => {
    return (publications || []).map(pub => ({
      ...pub,
      favorited: isFavorited(pub.id)
    }));
  }, [publications, isFavorited]);

  // Paginated publications for main feed
  const paginatedPublications = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return activePublications.slice(startIndex, startIndex + itemsPerPage);
  }, [activePublications, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(activePublications.length / itemsPerPage);

  // Reset to page 1 when publications change significantly
  useEffect(() => {
    if (activePublications.length > 0 && currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [activePublications.length, totalPages, currentPage]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const promises = [];
        
        // Always fetch all publications (main feed requirement)
        promises.push(fetchPublications(token));
        
        // Only fetch if data isn't already loaded
        if (!isDataLoaded) {
          promises.push(fetchHomeListings());
        }
        
        if (token) {
          promises.push(fetchFavorites(token, 0));
          promises.push(fetchVisitNotifications());
        }
        
        await Promise.all(promises);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsInitialLoad(false);
      }
    };

    loadData();
  }, [token, fetchFavorites, fetchHomeListings, fetchPublications, isDataLoaded, fetchVisitNotifications]);

  const loading = isInitialLoad || homeListingsLoading || publicationsLoading;
  const error = homeListingsError || publicationsError;

  // Show loading state during initial load
  if (isInitialLoad) {
    return (
      <div className="min-h-screen bg-background pt-[--header-height]">
        <div className="container mx-auto p-4">
          <Skeleton className="h-[400px] lg:h-[500px] w-full rounded-2xl mb-8" />
          <div className="space-y-8">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="space-y-4 p-0">
                  <Skeleton className="h-[200px] w-full rounded-t-lg" />
                  <div className="p-5 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-[--header-height]">
      {/* Hero Section */}
      <section className="container mx-auto p-4">
        <div className="h-[400px] lg:h-[500px] bg-muted rounded-2xl flex items-center justify-center">
          <HomeHero/>
        </div>
      </section>

      {/* Main Feed - All Active Publications */}
      <section className="container mx-auto px-4 py-8 lg:py-12" aria-label="Feed principal de publicaciones">
        <div className="space-y-6 lg:space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
                Todas las Publicaciones
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Explora todas las ofertas disponibles en la plataforma
              </p>
            </div>
            {activePublications.length > itemsPerPage && (
              <button 
                onClick={() => navigate('/publications')}
                className="text-primary hover:text-primary/80 font-medium hidden sm:block transition-colors"
                aria-label="Ver todas las publicaciones"
              >
                Ver todas ({activePublications.length})
              </button>
            )}
          </div>

          {error && (
            <Card className="p-4 border-destructive/50 bg-destructive/10">
              <p className="text-sm text-destructive text-center">
                {error}
              </p>
            </Card>
          )}

          {loading && publications.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(itemsPerPage)].map((_, i) => (
                <Card key={i} className="space-y-4 p-0 overflow-hidden">
                  <Skeleton className="h-[200px] w-full" />
                  <div className="p-5 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </Card>
              ))}
            </div>
          ) : paginatedPublications.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="space-y-4">
                <p className="text-lg font-medium text-muted-foreground">
                  No hay publicaciones disponibles
                </p>
                <p className="text-sm text-muted-foreground">
                  Vuelve más tarde para ver nuevas ofertas
                </p>
              </div>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedPublications.map((property) => (
                  <ExpandedPropertyCard
                    key={property.id}
                    {...property}
                    favorited={property.favorited}
                    onFavoriteChange={(favorited) => handleFavoriteChange(property.id, favorited)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Página anterior"
                  >
                    Anterior
                  </button>
                  <span className="px-4 py-2 text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Página siguiente"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Popular Properties */}
      {popularProperties.length > 0 && (
        <section className="container mx-auto px-4 py-8 lg:py-12" aria-label="Propiedades populares">
          <div className="space-y-6 lg:space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground">Propiedades Populares</h2>
              <button 
                onClick={() => navigate('/publications')}
                className="text-primary hover:text-primary/80 font-medium hidden sm:block transition-colors"
                aria-label="Ver todas las propiedades populares"
              >
                Ver todas
              </button>
            </div>

            <PropertyCarousel
              properties={popularProperties}
              onFavoriteChange={handleFavoriteChange}
            />
          </div>
        </section>
      )}

      {/* New Listings */}
      {newListings.length > 0 && (
        <section className="container mx-auto px-4 py-8 lg:py-12" aria-label="Nuevas publicaciones">
          <div className="space-y-6 lg:space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground">Nuevas Publicaciones</h2>
              <button 
                onClick={() => navigate('/publications')}
                className="text-primary hover:text-primary/80 font-medium hidden sm:block transition-colors"
                aria-label="Ver todas las nuevas publicaciones"
              >
                Ver todas
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newListings.map((property) => (
                <ExpandedPropertyCard
                  key={property.id}
                  {...property}
                  onFavoriteChange={(favorited) => handleFavoriteChange(property.id, favorited)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Call to Action */}
      <Footer />

      {/* Scrollbar hiding styles */}
      <style>{`
          .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
          }

          .scrollbar-hide::-webkit-scrollbar {
              display: none;
          }
      `}</style>
    </div>
  )
}
