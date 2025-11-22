import React, { useEffect, useState, useMemo } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { useReportsStore } from "@/stores/useReportsStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import ReportResolutionDialog from "@/components/ReportResolutionDialog";
import { 
  RefreshCw, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Filter,
  ExternalLink,
  Eye
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export default function Reports() {
  const { token } = useAuthStore();
  const { reports, loading, error, fetchReports, resolveReport, refreshReports, currentPage, totalPages, totalElements, pageSize } = useReportsStore();
  
  const [resolutionDialog, setResolutionDialog] = useState({
    isOpen: false,
    reportId: null,
    action: null
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    if (token) {
      fetchReports(token);
    }
  }, [token]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchReports(token, newPage);
    }
  };

  const handlePageSizeChange = (newSize) => {
    fetchReports(token, 0, newSize);
  };

  const handleRefresh = () => {
    refreshReports(token);
  };

  const handleResolveReport = async (reportId, action, feedback) => {
    const result = await resolveReport(token, reportId, action, feedback);
    
    if (result.success) {
      toast.success(result.message);
      setResolutionDialog({ isOpen: false, reportId: null, action: null });
      // Refrescar los reportes después de resolver
      await refreshReports(token);
    } else {
      toast.error(result.message);
    }
  };

  const openResolutionDialog = (reportId, action) => {
    setResolutionDialog({ isOpen: true, reportId, action });
  };

  const closeResolutionDialog = () => {
    setResolutionDialog({ isOpen: false, reportId: null, action: null });
  };

  // Calcular estadísticas
  const stats = useMemo(() => {
    const pending = reports.filter(r => r.status === 'PENDING').length;
    const resolved = reports.filter(r => r.status === 'RESOLVED').length;
    const rejected = reports.filter(r => r.status === 'REJECTED').length;
    return { pending, resolved, rejected, total: reports.length };
  }, [reports]);

  // Filtrar reportes
  const filteredReports = useMemo(() => {
    let filtered = reports;

    // Filtrar por estado
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    // Filtrar por búsqueda
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        r.reason?.toLowerCase().includes(searchLower) ||
        r.description?.toLowerCase().includes(searchLower) ||
        r.reporterName?.toLowerCase().includes(searchLower) ||
        r.publicationId?.toString().includes(searchLower) ||
        r.id?.toString().includes(searchLower)
      );
    }

    return filtered;
  }, [reports, statusFilter, searchTerm]);

  const getStatusVariant = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'RESOLVED':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (error && !loading) {
    return (
      <div className="min-h-screen pt-[--header-height] bg-background">
        <div className="container mx-auto py-10 px-4">
          <Card className="border-destructive/50 bg-destructive/10">
            <CardHeader>
              <CardTitle className="text-destructive">Error al cargar los reportes</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
          <Button 
            variant="outline" 
            onClick={() => fetchReports(token, currentPage)}
          >
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
              title="Panel de Administración - Reportes"
              description="Gestiona y modera las publicaciones reportadas por los usuarios"
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
        {!loading && reports.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalElements}</div>
                <p className="text-xs text-muted-foreground">Reportes en total</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <p className="text-xs text-muted-foreground">Requieren atención</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resueltos</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
                <p className="text-xs text-muted-foreground">Procesados</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rechazados</CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                <p className="text-xs text-muted-foreground">Descartados</p>
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
                  placeholder="Buscar por motivo, descripción, reportero o ID..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                    </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos los estados</SelectItem>
                  <SelectItem value="PENDING">Pendientes</SelectItem>
                  <SelectItem value="RESOLVED">Resueltos</SelectItem>
                  <SelectItem value="REJECTED">Rechazados</SelectItem>
                </SelectContent>
              </Select>
                    </div>
          </CardContent>
        </Card>

        {/* Tabla de Reportes */}
        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-20 w-full" />
                    </div>
                ))}
                    </div>
            </CardContent>
          </Card>
        ) : filteredReports.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground">
                {searchTerm || statusFilter !== 'ALL' 
                  ? 'No se encontraron reportes con los filtros aplicados' 
                  : 'No hay reportes disponibles'}
              </p>
              {(searchTerm || statusFilter !== 'ALL') && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('ALL');
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
              <CardTitle>Reportes de Publicaciones</CardTitle>
              <CardDescription>
                {filteredReports.length} {filteredReports.length === 1 ? 'reporte encontrado' : 'reportes encontrados'}
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
                      <th className="text-left p-4 font-medium text-sm">Publicación</th>
                      <th className="text-left p-4 font-medium text-sm">Motivo</th>
                      <th className="text-left p-4 font-medium text-sm">Reportado por</th>
                      <th className="text-left p-4 font-medium text-sm">Fecha</th>
                      <th className="text-left p-4 font-medium text-sm">Estado</th>
                      <th className="text-right p-4 font-medium text-sm">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.map((report) => (
                      <tr key={report.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-4 text-sm font-mono">#{report.id}</td>
                        <td className="p-4 text-sm">
                          <Link 
                            to={`/property/${report.publicationId}`}
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            #{report.publicationId}
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </td>
                        <td className="p-4 text-sm">
                          <div className="max-w-xs">
                            <p className="font-medium truncate">{report.reason}</p>
                            {report.description && (
                              <p className="text-muted-foreground text-xs truncate mt-1">
                                {report.description}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-sm">{report.reporterName || 'Anónimo'}</td>
                        <td className="p-4 text-sm text-muted-foreground">
                        {report.reportDate ? (
                            format(new Date(report.reportDate), 'dd/MM/yyyy HH:mm', { locale: es })
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td className="p-4">
                          <Badge className={getStatusVariant(report.status)}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(report.status)}
                              {report.status === 'PENDING' ? 'PENDIENTE' : 
                               report.status === 'RESOLVED' ? 'RESUELTO' : 'RECHAZADO'}
                            </span>
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end gap-2">
                            <Link to={`/property/${report.publicationId}`}>
                              <Button variant="ghost" size="sm" className="h-8">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            {report.status === 'PENDING' && (
                              <>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  className="h-8"
                                  onClick={() => openResolutionDialog(report.id, 'DISMISS')}
                                  disabled={loading}
                                >
                                  Rechazar
                                </Button>
                                <Button 
                                  size="sm"
                                  className="h-8"
                                  onClick={() => openResolutionDialog(report.id, 'APPROVE')}
                                  disabled={loading}
                                >
                                  Resolver
                                </Button>
                              </>
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
                {filteredReports.map((report) => (
                  <Card key={report.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">Reporte #{report.id}</CardTitle>
                          <CardDescription className="mt-1">
                            Publicación: #{report.publicationId}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusVariant(report.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(report.status)}
                            {report.status === 'PENDING' ? 'PENDIENTE' : 
                             report.status === 'RESOLVED' ? 'RESUELTO' : 'RECHAZADO'}
                          </span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Motivo</p>
                        <p className="text-sm">{report.reason}</p>
                        {report.description && (
                          <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                        )}
                    </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Reportado por</p>
                        <p className="text-sm">{report.reporterName || 'Anónimo'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Fecha</p>
                        <p className="text-sm">
                          {report.reportDate ? (
                            format(new Date(report.reportDate), 'dd/MM/yyyy HH:mm', { locale: es })
                          ) : (
                            'N/A'
                          )}
                        </p>
                  </div>
                </CardContent>
                    <CardContent className="pt-0">
                      <div className="flex flex-wrap gap-2">
                        <Link to={`/property/${report.publicationId}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <Eye className="h-4 w-4 mr-2" />
                      Ver Publicación
                    </Button>
                  </Link>
                  {report.status === 'PENDING' && (
                    <>
                      <Button 
                        variant="destructive" 
                        size="sm"
                              className="flex-1"
                        onClick={() => openResolutionDialog(report.id, 'DISMISS')}
                        disabled={loading}
                      >
                        Rechazar
                      </Button>
                      <Button 
                        size="sm"
                              className="flex-1"
                        onClick={() => openResolutionDialog(report.id, 'APPROVE')}
                        disabled={loading}
                      >
                        Resolver
                      </Button>
                    </>
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
        {reports.length > 0 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Mostrando {reports.length} de {totalElements} reportes</span>
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
      
      <ReportResolutionDialog
        isOpen={resolutionDialog.isOpen}
        onClose={closeResolutionDialog}
        onResolve={handleResolveReport}
        reportId={resolutionDialog.reportId}
        action={resolutionDialog.action}
        loading={loading}
      />
    </div>
  );
}
