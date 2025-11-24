import { useEffect, useState, useMemo } from 'react';
import { useAdminPublicationsStore } from '@/stores/UseAdminPublicationsStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  RefreshCw,
  Search,
  Filter,
  Building2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AdminPublications() {
  const { token } = useAuthStore();
  const { 
    publications, 
    loading, 
    error, 
    fetchAllPublications, 
    refreshPublications,
    updatePublicationStatus,
    currentPage, 
    totalPages, 
    totalElements, 
    pageSize 
  } = useAdminPublicationsStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (token) {
      fetchAllPublications(token, 0, pageSize, statusFilter);
    }
  }, [token, statusFilter]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchAllPublications(token, newPage, pageSize, statusFilter);
    }
  };

  const handlePageSizeChange = (newSize) => {
    fetchAllPublications(token, 0, newSize, statusFilter);
  };

  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    fetchAllPublications(token, 0, pageSize, newStatus);
  };

  const handleRefresh = () => {
    refreshPublications(token);
  };

  const handleStatusUpdate = async (publicationId, newStatus) => {
    setIsUpdating(true);
    try {
      const result = await updatePublicationStatus(token, publicationId, newStatus);
      if (result.success) {
        toast.success(result.message);
        await refreshPublications(token);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Error al actualizar el estado');
    } finally {
      setIsUpdating(false);
    }
  };

  // Calcular estadísticas
  const stats = useMemo(() => {
    const active = publications.filter(p => p.status === 'ACTIVE').length;
    const inactive = publications.filter(p => p.status === 'INACTIVE').length;
    const reported = publications.filter(p => p.status === 'REPORTED' || p.isReported).length;
    return { active, inactive, reported, total: publications.length };
  }, [publications]);

  // Filtrar publicaciones por búsqueda
  const filteredPublications = useMemo(() => {
    if (!searchTerm.trim()) {
      return publications;
    }

    const searchLower = searchTerm.toLowerCase();
    return publications.filter(pub => 
      pub.title?.toLowerCase().includes(searchLower) ||
      pub.description?.toLowerCase().includes(searchLower) ||
      pub.publisherName?.toLowerCase().includes(searchLower) ||
      pub.location?.toLowerCase().includes(searchLower) ||
      pub.id?.toString().includes(searchLower)
    );
  }, [publications, searchTerm]);

  const getStatusVariant = (status, isReported) => {
    if (isReported || status === 'REPORTED') {
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    }
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    }
  };

  const getStatusIcon = (status, isReported) => {
    if (isReported || status === 'REPORTED') {
      return <AlertTriangle className="h-4 w-4" />;
    }
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'INACTIVE':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status, isReported) => {
    if (isReported || status === 'REPORTED') {
      return 'REPORTADA';
    }
    switch (status) {
      case 'ACTIVE':
        return 'ACTIVA';
      case 'INACTIVE':
        return 'INACTIVA';
      default:
        return status || 'DESCONOCIDO';
    }
  };

  if (error && !loading) {
    return (
      <div className="min-h-screen pt-[--header-height] bg-background">
        <div className="container mx-auto py-8 px-4">
          <Card className="border-destructive/50 bg-destructive/10">
            <CardHeader>
              <CardTitle className="text-destructive">Error al cargar las publicaciones</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={() => fetchAllPublications(token, currentPage, pageSize, statusFilter)}>
                Reintentar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-[--header-height] bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <PageHeader
              title="Administración de Publicaciones"
              description="Gestiona todas las publicaciones de la plataforma (activas, inactivas y reportadas)"
            />
          </div>
          <Button 
            variant="outline" 
            onClick={handleRefresh} 
            disabled={loading}
            className="w-full sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>

        {/* Estadísticas */}
        {!loading && publications.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalElements}</div>
                <p className="text-xs text-muted-foreground">Publicaciones en total</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Activas</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                <p className="text-xs text-muted-foreground">Publicaciones activas</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inactivas</CardTitle>
                <XCircle className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
                <p className="text-xs text-muted-foreground">Publicaciones inactivas</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reportadas</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.reported}</div>
                <p className="text-xs text-muted-foreground">Requieren revisión</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filtros y Búsqueda */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros y Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar por título, descripción, vendedor, ubicación o ID..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos los estados</SelectItem>
                  <SelectItem value="ACTIVE">Activas</SelectItem>
                  <SelectItem value="INACTIVE">Inactivas</SelectItem>
                  <SelectItem value="REPORTED">Reportadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de Publicaciones */}
        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        ) : filteredPublications.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground">
                {searchTerm || statusFilter !== 'ALL' 
                  ? 'No se encontraron publicaciones con los filtros aplicados' 
                  : 'No hay publicaciones disponibles'}
              </p>
              {(searchTerm || statusFilter !== 'ALL') && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchTerm('');
                    handleStatusFilterChange('ALL');
                  }}
                >
                  Limpiar filtros
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Publicaciones</CardTitle>
              <CardDescription>
                {filteredPublications.length} {filteredPublications.length === 1 ? 'publicación encontrada' : 'publicaciones encontradas'}
                {searchTerm && ` para "${searchTerm}"`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Vista de tabla para desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium text-sm">ID</th>
                      <th className="text-left p-4 font-medium text-sm">Título</th>
                      <th className="text-left p-4 font-medium text-sm">Vendedor</th>
                      <th className="text-left p-4 font-medium text-sm">Precio</th>
                      <th className="text-left p-4 font-medium text-sm">Ubicación</th>
                      <th className="text-left p-4 font-medium text-sm">Estado</th>
                      <th className="text-left p-4 font-medium text-sm">Reportes</th>
                      <th className="text-right p-4 font-medium text-sm">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPublications.map((publication) => (
                      <tr key={publication.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-4 text-sm font-mono">#{publication.id}</td>
                        <td className="p-4 text-sm">
                          <div className="max-w-xs">
                            <p className="font-medium truncate">{publication.title}</p>
                            {publication.description && (
                              <p className="text-muted-foreground text-xs truncate mt-1">
                                {publication.description}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-sm">
                          {publication.publisherId ? (
                            <Link 
                              to={`/user/${publication.publisherId}`}
                              className="text-primary hover:underline"
                            >
                              {publication.publisherName || 'Anónimo'}
                            </Link>
                          ) : (
                            <span>{publication.publisherName || 'Anónimo'}</span>
                          )}
                        </td>
                        <td className="p-4 text-sm font-medium">{publication.price}</td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {publication.location}
                        </td>
                        <td className="p-4">
                          <Badge className={getStatusVariant(publication.status, publication.isReported)}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(publication.status, publication.isReported)}
                              {getStatusLabel(publication.status, publication.isReported)}
                            </span>
                          </Badge>
                        </td>
                        <td className="p-4 text-sm">
                          {publication.reportCount > 0 ? (
                            <Badge variant="destructive">
                              {publication.reportCount} {publication.reportCount === 1 ? 'reporte' : 'reportes'}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end gap-2">
                            <Link to={`/property/${publication.id}`}>
                              <Button variant="ghost" size="sm" className="h-8">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            {publication.status === 'ACTIVE' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="h-8"
                                onClick={() => handleStatusUpdate(publication.id, 'INACTIVE')}
                                disabled={isUpdating}
                              >
                                Desactivar
                              </Button>
                            )}
                            {publication.status === 'INACTIVE' && (
                              <Button 
                                size="sm"
                                className="h-8"
                                onClick={() => handleStatusUpdate(publication.id, 'ACTIVE')}
                                disabled={isUpdating}
                              >
                                Activar
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Vista de cards para mobile */}
              <div className="md:hidden space-y-4">
                {filteredPublications.map((publication) => (
                  <Card key={publication.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-base">#{publication.id}</CardTitle>
                          <CardDescription className="mt-1">{publication.title}</CardDescription>
                        </div>
                        <Badge className={getStatusVariant(publication.status, publication.isReported)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(publication.status, publication.isReported)}
                            {getStatusLabel(publication.status, publication.isReported)}
                          </span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Vendedor</p>
                        {publication.publisherId ? (
                          <Link 
                            to={`/user/${publication.publisherId}`}
                            className="text-sm text-primary hover:underline"
                          >
                            {publication.publisherName || 'Anónimo'}
                          </Link>
                        ) : (
                          <p className="text-sm">{publication.publisherName || 'Anónimo'}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Precio</p>
                        <p className="text-sm font-medium">{publication.price}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Ubicación</p>
                        <p className="text-sm">{publication.location}</p>
                      </div>
                      {publication.reportCount > 0 && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Reportes</p>
                          <Badge variant="destructive">
                            {publication.reportCount} {publication.reportCount === 1 ? 'reporte' : 'reportes'}
                          </Badge>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2 pt-2">
                        <Link to={`/property/${publication.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <Eye className="h-4 w-4 mr-2" />
                            Ver
                          </Button>
                        </Link>
                        {publication.status === 'ACTIVE' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex-1"
                            onClick={() => handleStatusUpdate(publication.id, 'INACTIVE')}
                            disabled={isUpdating}
                          >
                            Desactivar
                          </Button>
                        )}
                        {publication.status === 'INACTIVE' && (
                          <Button 
                            size="sm"
                            className="flex-1"
                            onClick={() => handleStatusUpdate(publication.id, 'ACTIVE')}
                            disabled={isUpdating}
                          >
                            Activar
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Paginación */}
        {publications.length > 0 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Mostrando {publications.length} de {totalElements} publicaciones</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <span>Mostrar:</span>
                <Select 
                  value={pageSize.toString()} 
                  onValueChange={(value) => handlePageSizeChange(parseInt(value))}
                >
                  <SelectTrigger className="w-[80px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span>por página</span>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0 || loading}
                  >
                    Anterior
                  </Button>
                  <span className="px-4 text-sm text-muted-foreground">
                    Página {currentPage + 1} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages - 1 || loading}
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
