import {useRef, useState, useEffect} from "react"
import {HomeHero} from "@/components/Home/HomeHero"
import {ChevronLeft, ChevronRight} from "lucide-react"
import ExpandedPropertyCard from "@/components/Home/ExpandedPropertyCard.jsx";
import Footer from "@/components/footer"
import { useAuthStore } from "@/stores/useAuthStore"
import { useFavoritesStore } from "@/stores/useFavoritesStore"
import { useHomeListingsStore } from "@/stores/useHomeListingsStore"
import { useNavigate } from "react-router-dom"
import axios from 'axios';
import { toast } from "sonner";
import { useVisitsStore } from '@/stores/useVisitsStore'

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
  const { fetchFavorites, toggleFavorite } = useFavoritesStore();
  const { popularProperties, newListings, loading, error, fetchHomeListings, isDataLoaded, updateFavoriteStatus } = useHomeListingsStore();
  const fetchVisitNotifications = useVisitsStore((state) => state.fetchVisitNotifications)
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const navigate = useNavigate();

  // Add handler for favorite changes
  const handleFavoriteChange = async (publicationId, isFavorited) => {
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
  };

  useEffect(() => {
    const loadData = async () => {
      if (token) {
        try {
          // Only fetch if data isn't already loaded
          if (!isDataLoaded) {
            await Promise.all([
              fetchFavorites(token, 0),
              fetchHomeListings(),
              fetchVisitNotifications()
            ]);
          } else {
            // Si ya hay datos, igual precarga notificaciones
            fetchVisitNotifications()
          }
        } catch (error) {
          console.error('Error loading data:', error);
        } finally {
          setIsInitialLoad(false);
        }
      } else {
        // If no token, still fetch home listings but not favorites
        try {
          if (!isDataLoaded) {
            await fetchHomeListings();
          }
        } catch (error) {
          console.error('Error loading home listings:', error);
        } finally {
          setIsInitialLoad(false);
        }
      }
    };

    loadData();
  }, [token, fetchFavorites, fetchHomeListings, isDataLoaded, fetchVisitNotifications]);

  // Show loading state during initial load
  if (isInitialLoad || loading) {
    return (
      <div className="min-h-screen bg-background pt-[--header-height]">
        <div className="container mx-auto p-4">
          <div className="h-[400px] lg:h-[500px] bg-muted rounded-2xl animate-pulse" />
          <div className="mt-8 space-y-8">
            <div className="h-8 w-48 bg-muted rounded animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="h-[200px] bg-muted rounded-lg animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background pt-[--header-height]">
        <div className="container mx-auto p-4">
          <div className="text-red-500 text-center">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background min-h-screen pt-[--header-height]">
      {/* Hero Section */}
      <section className="container mx-auto p-4">
        <div className="h-[400px] lg:h-[500px] bg-muted rounded-2xl flex items-center justify-center">
          <HomeHero/>
        </div>
      </section>

      {/* Popular Properties */}
      <section className="container mx-auto px-4 py-8 lg:py-12">
        <div className="space-y-6 lg:space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">Propiedades Populares</h2>
            <button 
              onClick={() => navigate('/publications')}
              className="text-primary hover:text-primary/80 font-medium hidden sm:block"
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

      {/* New Listings */}
      <section className="container mx-auto px-4 py-8 lg:py-12">
        <div className="space-y-6 lg:space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">Nuevas Publicaciones</h2>
            <button 
              onClick={() => navigate('/publications')}
              className="text-primary hover:text-primary/80 font-medium hidden sm:block"
            >
              Ver todas
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newListings.map((property, i) => (
              <ExpandedPropertyCard
                key={i}
                {...property}
                onFavoriteChange={(favorited) => handleFavoriteChange(property.id, favorited)}
              />
            ))}
          </div>
        </div>
      </section>

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
