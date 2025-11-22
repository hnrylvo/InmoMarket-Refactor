import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Bath, BedDouble, CalendarDays, Users, ChevronDown, ChevronUp, Calendar, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePublicationsStore } from '../../stores/usePublicationsStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useFavoritesStore } from '../../stores/useFavoritesStore';
import { toast } from "sonner";
import { ReportDialog } from "@/components/ReportDialog";
import { FavoriteButton } from "@/components/ui/favoriteButton";
import { VisitSchedulingDialog } from "@/components/VisitSchedulingDialog";

export default function PropertyClientView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { publications, loading, error, fetchPublications } = usePublicationsStore();
  const { token } = useAuthStore();
  const { toggleFavorite, fetchFavorites } = useFavoritesStore();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const property = publications.find(p => p.id === id);

  // Generate slug for breadcrumbs
  const slug = property?.title
    ?.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  // Update URL to include slug for SEO and breadcrumbs
  useEffect(() => {
    if (property && slug) {
      // Update the URL with both ID and slug
      if (window.location.pathname !== `/property/${id}/${slug}`) {
        window.history.replaceState({}, '', `/property/${id}/${slug}`);
      }
      // Update the document title
      document.title = property.title;
    }
  }, [property, id, slug]);

  // Check if the property is in favorites
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (token && property?.id) {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/favorites/check/${property.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await response.json();
          setIsFavorited(data.isFavorite);
        } catch (error) {
          console.error('Error checking favorite status:', error);
        }
      }
    };

    checkFavoriteStatus();
  }, [token, property?.id]);

  const handleFavoriteToggle = async () => {
    if (!token) {
      toast.error("Debes iniciar sesión para agregar a favoritos");
      return;
    }

    if (!property?.id) {
      toast.error("No se pudo identificar la propiedad");
      return;
    }

    try {
      const result = await toggleFavorite(token, property.id);
      if (result.success) {
        const newFavoritedState = !isFavorited;
        setIsFavorited(newFavoritedState);
        toast.success(newFavoritedState ? "Agregado a favoritos" : "Eliminado de favoritos");
      } else {
        toast.error(result.error || "Error al actualizar favoritos");
      }
    } catch (error) {
      toast.error("Error al actualizar favoritos");
    }
  };

  // Add console logs to debug
  useEffect(() => {
    console.log('Current publications:', publications);
    console.log('Looking for property with id:', id);
    console.log('Found property:', property);
  }, [publications, id, property]);

  useEffect(() => {
    const loadData = async () => {
      if (publications.length === 0) {
        try {
          await fetchPublications(token);
        } catch (error) {
          console.error('Error loading publications:', error);
          toast.error("Error al cargar las publicaciones");
        }
      }
      setIsLoading(false);
    };

    loadData();
  }, [publications.length, token, fetchPublications]);

  // Remove unnecessary state and effects
  const [contactExpanded, setContactExpanded] = useState(false);
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [tourExpanded, setTourExpanded] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [mapExpanded, setMapExpanded] = useState(false);

  const formatPrice = (price) => {
    if (!price) return 'Precio no disponible';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatSize = (size) => {
    if (!size) return 'Tamaño no disponible';
    return `${size.toLocaleString('es-CO')} m²`;
  };

  const getDayName = (dayOfWeek) => {
    if (dayOfWeek === undefined) return 'Día no disponible';
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[dayOfWeek] || 'Día no disponible';
  };

  const formatTime = (time) => {
    if (!time) return 'Hora no disponible';
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen pt-[--header-height] mt-10 max-w-7xl mx-auto p-10 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Image Carousel and Info */}
          <div className="space-y-6">
            {/* Image Slider Skeleton */}
            <Skeleton className="h-80 w-full rounded-lg" />

            {/* Property Details Skeleton */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-8 w-32" />
              
              {/* Location Details Skeleton */}
              <div className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
              </div>

              {/* Property Features Skeleton */}
              <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-gray-200 dark:border-neutral-700">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>

              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>

          {/* Right Column - Map and Collapsible Sections */}
          <div className="space-y-6">
            {/* Map Skeleton */}
            <Skeleton className="h-[300px] w-full rounded-lg" />

            {/* Contact Section Skeleton */}
            <div className="border-t border-gray-300 dark:border-neutral-700 pt-6">
              <Skeleton className="h-8 w-3/4 mb-4" />
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>

            {/* Tour Section Skeleton */}
            <div className="border-t border-gray-300 dark:border-neutral-700 pt-6">
              <Skeleton className="h-8 w-1/2 mb-4" />
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-[--header-height] flex items-center justify-center">
        <div className="text-center space-y-6 p-8">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-red-500">{error}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            No pudimos cargar la publicación. Por favor, intenta nuevamente.
          </p>
          <Button 
            onClick={() => navigate("/publications")}
          >
            Volver a Publicaciones
          </Button>
        </div>
      </div>
    );
  }

  if (!property && !loading) {
    return (
      <div className="min-h-screen pt-[--header-height] flex items-center justify-center">
        <div className="text-center space-y-6 p-8">
          <div className="relative w-64 h-64 mx-auto">
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* House shape */}
              <path
                d="M100 20 L180 80 L180 180 L20 180 L20 80 Z"
                fill="#f3f4f6"
                stroke="#9ca3af"
                strokeWidth="2"
              />
              {/* Door */}
              <rect x="85" y="100" width="30" height="60" fill="#9ca3af" />
              {/* Windows */}
              <rect x="40" y="100" width="30" height="30" fill="#9ca3af" />
              <rect x="130" y="100" width="30" height="30" fill="#9ca3af" />
              {/* Roof */}
              <path
                d="M100 20 L180 80 L20 80 Z"
                fill="#e5e7eb"
                stroke="#9ca3af"
                strokeWidth="2"
              />
              {/* Question mark */}
              <text
                x="100"
                y="140"
                textAnchor="middle"
                fill="#4b5563"
                fontSize="40"
                fontWeight="bold"
              >
                ?
              </text>
            </svg>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">404</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              ¡Ups! No pudimos encontrar esta propiedad
            </p>
            <p className="text-gray-500 dark:text-gray-500">
              La propiedad que estás buscando no existe o ha sido removida
            </p>
            <Button
              onClick={() => navigate("/publications")}
              size="lg"
            >
              <Home className="mr-2 h-4 w-4" />
              Volver a Publicaciones
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const nextSlide = () => setSlideIndex((prev) => (prev + 1) % (property.images?.length || 1));
  const prevSlide = () => setSlideIndex((prev) => (prev - 1 + (property.images?.length || 1)) % (property.images?.length || 1));

  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(property.location)}&output=embed`;

  const today = new Date();
  const getNextDays = (count) => {
    return Array.from({ length: count }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      return {
        label: date.toLocaleDateString('en-US', { weekday: 'long' }),
        day: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        date,
      };
    });
  };

  const tourDates = getNextDays(4);

  const toggleDate = (dateObj) => {
    const exists = tourDates.find(d => d.date.toDateString() === dateObj.date.toDateString());
    if (exists) {
      // Remove the date from the tourDates array
      const updatedTourDates = tourDates.filter(d => d.date.toDateString() !== dateObj.date.toDateString());
      setTourDates(updatedTourDates);
    } else if (tourDates.length < 3) {
      setTourDates([...tourDates, dateObj]);
    }
  };

  return (
    <div className="min-h-screen pt-[--header-height] mt-10 max-w-7xl mx-auto p-10 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Image Carousel and Info */}
        <div className="space-y-6">
          {/* Image Slider */}
          <div className="relative h-80 w-full overflow-hidden rounded-lg">
            {property.images?.length > 0 ? (
              <>
                <img
                  src={property.images[slideIndex]}
                  alt={`Propiedad ${slideIndex + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
                <div className="absolute bottom-2 left-2">
                  <ReportDialog publicationId={property.id} />
                </div>
                <div 
                  className="absolute top-2 right-2 bg-black/30 backdrop-blur-sm rounded-full shadow-lg"
                  onClick={handleFavoriteToggle}
                >
                  <FavoriteButton
                    isFavorited={isFavorited}
                    onFavoriteChange={handleFavoriteToggle}
                  />
                </div>
                {property.images.length > 1 && (
                  <>
                    <button
                      onClick={prevSlide}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-40 text-white px-2 py-1 rounded hover:bg-opacity-60 transition-all"
                    >
                      &#8249;
                    </button>
                    <button
                      onClick={nextSlide}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-40 text-white px-2 py-1 rounded hover:bg-opacity-60 transition-all"
                    >
                      &#8250;
                    </button>
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                      {property.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setSlideIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === slideIndex
                              ? "bg-white scale-125"
                              : "bg-white/50 hover:bg-white/75"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">No hay imágenes disponibles</p>
              </div>
            )}
          </div>

          {/* Property Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{property.title || 'Tipo no especificado'}</h1>
              <span className="text-sm text-muted-foreground">{property.furnished ? 'Amueblado' : 'Sin amueblar'}</span>
            </div>
            <p className="text-2xl font-bold text-primary">{property.price || 'Precio no disponible'}</p>
            
            {/* Location Details */}
            <div className="space-y-2">
              <p className="text-gray-600 dark:text-gray-300 font-medium">{property?.address || 'Dirección no disponible'}</p>
              <p className="text-gray-600 dark:text-gray-300">
                {property?.municipality && property?.neighborhood 
                  ? `${property.neighborhood}, ${property.municipality}`
                  : property?.municipality 
                    ? property.municipality 
                    : property?.neighborhood 
                      ? property.neighborhood 
                      : 'Ubicación no disponible'}
              </p>
            </div>

            {/* Property Features */}
            <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-gray-200 dark:border-neutral-700">
              <div className="flex items-center gap-2 text-muted-foreground">
                <BedDouble className="w-4 h-4" />
                <span>{property.bedrooms || 0} habitaciones</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Home className="w-4 h-4" />
                <span>{property.size ? `${property.size} m²` : 'Tamaño no disponible'}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12h18M3 6h18M3 18h18" />
                </svg>
                <span>{property.floors || 0} pisos</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>{property.parking || 0} parqueadero{property.parking !== 1 ? 's' : ''}</span>
              </div>
            </div>

            <p className="text-gray-700 dark:text-gray-200">{property.description || 'Sin descripción disponible'}</p>
            <p className="text-sm text-muted-foreground">Publicado por {property.publisherName || 'Anónimo'}</p>
          </div>
        </div>

        {/* Right Column - Map and Collapsible Sections */}
        <div className="space-y-6">
          {/* Google Map */}
          <div
            className={`rounded-lg border w-full transition-all duration-300 cursor-pointer ${
              mapExpanded ? "h-[400px]" : "h-[300px]"
            }`}
            onClick={() => setMapExpanded(!mapExpanded)}
          >
            <iframe
              src={`https://www.google.com/maps?q=${property?.location || ''}&output=embed`}
              className="w-full h-full rounded-lg"
              allowFullScreen=""
              loading="lazy"
              title="Ubicación de la propiedad"
            ></iframe>
          </div>

          {/* TOUR SECTION */}
          <div className="border-t border-gray-300 dark:border-neutral-700 pt-6">
            <button
              onClick={() => setTourExpanded(!tourExpanded)}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center gap-2 font-semibold text-lg text-gray-900 dark:text-white">
                <Calendar className="w-5 h-5" />
                Agendar visita
              </div>
              {tourExpanded ? <ChevronUp /> : <ChevronDown />}
            </button>

            {tourExpanded && (
              <div className="mt-4 space-y-4">
                <h3 className="font-semibold text-md text-gray-900 dark:text-white">Horarios disponibles</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Selecciona uno de los siguientes horarios para agendar tu visita:
                </p>

                <div className="space-y-3">
                  {property?.availableTimes?.map((time, index) => (
                    <div
                      key={index}
                      className="p-4 border border-gray-200 dark:border-neutral-700 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer"
                    >
                      <div className="font-medium">{getDayName(time.dayOfWeek)}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {formatTime(time.startTime)} - {formatTime(time.endTime)}
                      </div>
                    </div>
                  ))}
                </div>

                <VisitSchedulingDialog 
                  property={property}
                  availableTimes={property?.availableTimes || []}
                  trigger={
                    <Button 
                      className="w-full"
                      disabled={!property?.availableTimes || property.availableTimes.length === 0}
                    >
                      {!property?.availableTimes || property.availableTimes.length === 0 
                        ? "No hay horarios disponibles" 
                        : "Solicitar visita"
                      }
                    </Button>
                  }
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}