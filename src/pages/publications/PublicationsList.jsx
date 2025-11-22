import { useEffect, useState, useMemo } from 'react';
import { usePublicationsStore } from '../../stores/usePublicationsStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useFavoritesStore } from '../../stores/useFavoritesStore';
import ExpandedPropertyCard from '@/components/Home/ExpandedPropertyCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Search, ChevronDown, SlidersHorizontal, X } from "lucide-react"
import { Card } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner"

export default function PublicationsList() {
  const { publications, loading, error, fetchPublications, searchPublications, filteredResults } = usePublicationsStore();
  const { token } = useAuthStore();
  const { toggleFavorite, favorites, fetchFavorites } = useFavoritesStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    department: '',
    minPrice: '',
    maxPrice: '',
    typeName: '',
    minSize: '',
    maxSize: '',
    bedrooms: '',
    floors: '',
    parking: '',
    furnished: ''
  });

  useEffect(() => {
    // Always fetch publications (with or without token)
    fetchPublications(token);
    
    // Only fetch favorites if authenticated
    if (token) {
      fetchFavorites(token, 0);
    }
  }, [token, fetchPublications, fetchFavorites]);

  const handleSearch = async () => {
    if (!token) {
      toast.error("Debes iniciar sesión para usar filtros avanzados");
      return;
    }

    // Verificar si hay algún filtro aplicado
    const hasFilters = Object.values(filters).some(value => value !== '');
    
    if (!hasFilters) {
      toast.info("Por favor, aplica al menos un filtro antes de buscar");
      return;
    }

    try {
      const results = await searchPublications(token, filters);
      if (results.length === 0) {
        toast.info("No se encontraron resultados con los filtros seleccionados");
        // Reset to show all publications
        fetchPublications(token);
      }
    } catch (error) {
      toast.error("Error al buscar publicaciones");
    }
  };

  const handleFilterChange = (key, value) => {
    // Validaciones específicas para campos numéricos
    if (['minPrice', 'maxPrice', 'minSize', 'maxSize', 'bedrooms', 'floors', 'parking'].includes(key)) {
      // Convertir a número y validar
      const numValue = parseFloat(value);
      
      // Si el valor no es un número válido y no está vacío, no actualizar
      if (value !== '' && isNaN(numValue)) {
        return;
      }
      
      // Para pisos y estacionamientos, solo permitir números enteros positivos
      if (['floors', 'parking', 'bedrooms'].includes(key)) {
        if (value !== '' && (numValue < 0 || !Number.isInteger(numValue))) {
          return;
        }
      }
      
      // Para precios y tamaños, solo permitir números positivos
      if (['minPrice', 'maxPrice', 'minSize', 'maxSize'].includes(key)) {
        if (value !== '' && numValue < 0) {
          return;
        }
      }
    }

    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      department: '',
      minPrice: '',
      maxPrice: '',
      typeName: '',
      minSize: '',
      maxSize: '',
      bedrooms: '',
      floors: '',
      parking: '',
      furnished: ''
    });
    setSearchTerm('');
    // Always fetch publications (with or without token)
    fetchPublications(token);
  };

  // Función para filtrar las publicaciones localmente
  const filteredPublications = useMemo(() => {
    const publicationsToFilter = filteredResults || publications;
    
    if (!searchTerm.trim()) {
      return publicationsToFilter;
    }

    const searchLower = searchTerm.toLowerCase();
    
    return publicationsToFilter.filter(publication => {
      // Buscar en múltiples campos
      return (
        publication.department?.toLowerCase().includes(searchLower) ||
        publication.municipality?.toLowerCase().includes(searchLower) ||
        publication.typeName?.toLowerCase().includes(searchLower) ||
        publication.title?.toLowerCase().includes(searchLower) ||
        publication.description?.toLowerCase().includes(searchLower) ||
        publication.price?.toLowerCase().includes(searchLower) ||
        publication.neighborhood?.toLowerCase().includes(searchLower)
      );
    });
  }, [searchTerm, publications, filteredResults]);

  const handlePropertyClick = (publication) => {
    navigate(`/property/${publication.id}`);
  };

  const handleFavoriteChange = async (publicationId, isFavorited) => {
    if (!token) {
      toast.error("Debes iniciar sesión para agregar a favoritos");
      return;
    }

    try {
      const result = await toggleFavorite(token, publicationId);
      if (result.success) {
        toast.success(isFavorited ? "Agregado a favoritos" : "Eliminado de favoritos");
      } else {
        toast.error(result.error || "Error al actualizar favoritos");
      }
    } catch (error) {
      toast.error("Error al actualizar favoritos");
    }
  };

  // Add this function to check if a publication is favorited
  const isFavorited = (publicationId) => {
    return favorites.some(fav => fav.id === publicationId);
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
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
    );
  }

  return (
    <div className="min-h-screen pt-[--header-height]">
      <div className="container mx-auto py-8 px-4">
        <PageHeader
          title="Publicaciones"
          description="Explora y encuentra la propiedad de tus sueños"
        />

        {/* Search and Filters Section */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por departamento, municipio, tipo de propiedad, precio..."
                className="w-full pl-10 h-12 text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filters Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Filtros</h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8">
                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                        Más filtros
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-80 p-4">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Área mínima (m²)</label>
                          <Input
                            type="number"
                            placeholder="Ej: 100"
                            min="0"
                            step="0.01"
                            value={filters.minSize}
                            onChange={(e) => handleFilterChange('minSize', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Área máxima (m²)</label>
                          <Input
                            type="number"
                            placeholder="Ej: 200"
                            min="0"
                            step="0.01"
                            value={filters.maxSize}
                            onChange={(e) => handleFilterChange('maxSize', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Pisos</label>
                          <Input
                            type="number"
                            placeholder="Ej: 2"
                            min="0"
                            step="1"
                            value={filters.floors}
                            onChange={(e) => handleFilterChange('floors', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Estacionamientos</label>
                          <Input
                            type="number"
                            placeholder="Ej: 1"
                            min="0"
                            step="1"
                            value={filters.parking}
                            onChange={(e) => handleFilterChange('parking', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Amueblado</label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={filters.furnished === 'true'}
                              onChange={(e) => handleFilterChange('furnished', e.target.checked ? 'true' : '')}
                              className="h-4 w-4 rounded border-gray-300"
                            />
                            <span className="text-sm">Sí</span>
                          </div>
                        </div>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={clearFilters}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Limpiar filtros
                </Button>
              </div>

              {/* Most common filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Departamento</label>
                  <Input
                    type="text"
                    placeholder="Ej: San Salvador"
                    value={filters.department}
                    onChange={(e) => handleFilterChange('department', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Precio mínimo</label>
                  <Input
                    type="number"
                    placeholder="Ej: 50000"
                    min="0"
                    step="0.01"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Precio máximo</label>
                  <Input
                    type="number"
                    placeholder="Ej: 200000"
                    min="0"
                    step="0.01"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo de propiedad</label>
                  <Input
                    type="text"
                    placeholder="Ej: Casa, Apartamento"
                    value={filters.typeName}
                    onChange={(e) => handleFilterChange('typeName', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Habitaciones</label>
                  <Input
                    type="number"
                    placeholder="Ej: 2"
                    min="0"
                    step="1"
                    value={filters.bedrooms}
                    onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  variant="default" 
                  onClick={handleSearch}
                  className="flex items-center gap-2"
                >
                  <Search className="h-4 w-4" />
                  Buscar
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Results Grid */}
        {filteredPublications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No se encontraron resultados
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPublications.map((publication) => (
              <div 
                key={publication.id}
                onClick={() => handlePropertyClick(publication)}
                className="cursor-pointer"
              >
                <ExpandedPropertyCard
                  {...publication}
                  favorited={isFavorited(publication.id)}
                  onFavoriteChange={(favorited) => handleFavoriteChange(publication.id, favorited)}
                />
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

// Reusable Dropdown Filter (no TS types here)
function FilterDropdown({ label, items }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 text-sm">
          {label} <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {items.map((item) => (
          <DropdownMenuItem key={item}>{item}</DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
