import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { useReportsStore } from "@/stores/useReportsStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import ReportResolutionDialog from "@/components/ReportResolutionDialog";

export default function Reports() {
  const { token } = useAuthStore();
  const { reports, loading, error, fetchReports, resolveReport, refreshReports, currentPage, totalPages, totalElements, pageSize } = useReportsStore();
  
  const [resolutionDialog, setResolutionDialog] = useState({
    isOpen: false,
    reportId: null,
    action: null
  });

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

  const getStatusVariant = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4 min-h-screen mt-4 pt-[--header-height]">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 px-4 min-h-screen mt-4 pt-[--header-height]">
        <div className="text-red-500 text-center py-10">
          <p>Error al cargar los reportes: {error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => fetchReports(token, currentPage)}
          >
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 min-h-screen mt-4 pt-[--header-height]">
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <PageHeader
            title="Reportes"
            description={`Total de reportes: ${totalElements}`}
          />
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <svg 
              className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              />
            </svg>
            Actualizar
          </Button>
        </div>

        {reports.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">No hay reportes disponibles</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reports.map((report) => (
              <Card key={report.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">Reporte #{report.id}</CardTitle>
                    <Badge className={getStatusVariant(report.status)}>
                      {report.status === 'PENDING' ? 'PENDIENTE' : 
                       report.status === 'RESOLVED' ? 'RESUELTO' : 'RECHAZADO'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    Publicación: {report.publicationId}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Motivo</p>
                      <p className="text-sm">{report.reason}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Descripción</p>
                      <p className="text-sm">{report.description || 'Sin descripción'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Reportado por</p>
                      <p className="text-sm">{report.reporterName || 'Anónimo'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Dirección</p>
                      <p className="text-sm">{report.address || 'No especificada'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Fecha</p>
                      <p className="text-sm">
                        {report.reportDate ? (
                          format(new Date(report.reportDate), 'PPPp', { locale: es })
                        ) : (
                          'Fecha no disponible'
                        )}
                      </p>
                    </div>
                    {report.adminFeedback && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Feedback del Admin</p>
                        <p className="text-sm">{report.adminFeedback}</p>
                      </div>
                    )}
                    {report.reviewedAt && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Revisado el</p>
                        <p className="text-sm">
                          {format(new Date(report.reviewedAt), 'PPPp', { locale: es })}
                        </p>
                      </div>
                    )}
                    {report.adminName && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Revisado por</p>
                        <p className="text-sm">{report.adminName}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Link to={`/property/${report.publicationId}`}>
                    <Button variant="outline" size="sm">
                      Ver Publicación
                    </Button>
                  </Link>
                  {report.status === 'PENDING' && (
                    <>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => openResolutionDialog(report.id, 'DISMISS')}
                        disabled={loading}
                      >
                        Rechazar
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => openResolutionDialog(report.id, 'APPROVE')}
                        disabled={loading}
                      >
                        Resolver
                      </Button>
                    </>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {reports.length > 0 && (
          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span>Mostrar:</span>
              <select 
                value={pageSize} 
                onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                className="border rounded px-2 py-1"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>por página</span>
            </div>
            <div className="text-sm text-gray-500">
              Mostrando {reports.length} de {totalElements} reportes
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                >
                  Anterior
                </Button>
                <span className="px-4">
                  Página {currentPage + 1} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages - 1}
                >
                  Siguiente
                </Button>
              </div>
            )}
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
