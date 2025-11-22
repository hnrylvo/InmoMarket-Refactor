import React, { useEffect } from "react";
import { useUserReportsStore } from "@/stores/useUserReportsStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { MessageSquare, User, Calendar } from "lucide-react";

const UserReportsWithFeedback = () => {
  const { token, userId, role } = useAuthStore();
  const { 
    reports, 
    loading, 
    error, 
    fetchUserReports, 
    currentPage, 
    totalPages, 
    totalElements 
  } = useUserReportsStore();

  useEffect(() => {
    console.log("UserReportsWithFeedback component - Auth state:", { 
      hasToken: !!token, 
      userId, 
      role,
      apiUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
    });
    
    if (token) {
      console.log("Fetching user reports with feedback");
      fetchUserReports(token);
    } else {
      console.log("No token available for fetching reports with feedback");
    }
  }, [token, fetchUserReports]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchUserReports(token, newPage);
    }
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

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING':
        return 'PENDIENTE';
      case 'RESOLVED':
        return 'RESUELTO';
      case 'REJECTED':
        return 'RECHAZADO';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-4">
        <p>Error al cargar los reportes: {error}</p>
        <Button 
          variant="outline" 
          className="mt-2"
          onClick={() => fetchUserReports(token, currentPage)}
        >
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Mis Reportes</h3>
        <span className="text-sm text-gray-500">
          Total: {totalElements}
        </span>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No has enviado ningún reporte aún</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">Reporte #{report.id.slice(0, 8)}</CardTitle>
                  <Badge className={getStatusVariant(report.status)}>
                    {getStatusText(report.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Motivo</p>
                  <p className="text-sm">{report.reason}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Descripción</p>
                  <p className="text-sm">{report.description || 'Sin descripción'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Dirección</p>
                  <p className="text-sm">{report.address || 'No especificada'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Fecha del Reporte</p>
                  <p className="text-sm">
                    {report.reportDate ? (
                      format(new Date(report.reportDate), 'PPPp', { locale: es })
                    ) : (
                      'Fecha no disponible'
                    )}
                  </p>
                </div>

                {/* Admin Feedback Section */}
                {report.hasFeedback && report.adminFeedback && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-2 mb-2">
                      <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Feedback del Administrador</p>
                        {report.adminName && (
                          <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-300 mt-1">
                            <User className="h-3 w-3" />
                            <span>{report.adminName}</span>
                          </div>
                        )}
                        {report.reviewedAt && (
                          <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-300 mt-1">
                            <Calendar className="h-3 w-3" />
                            <span>{format(new Date(report.reviewedAt), 'PPPp', { locale: es })}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">{report.adminFeedback}</p>
                  </div>
                )}

                {!report.hasFeedback && report.status === 'PENDING' && (
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Tu reporte está siendo revisado por nuestro equipo. Te notificaremos cuando tengamos una respuesta.
                    </p>
                  </div>
                )}

                <div className="pt-2">
                  <Link to={`/property/${report.publicationId}`}>
                    <Button variant="outline" size="sm">
                      Ver Publicación
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
          >
            Anterior
          </Button>
          <span className="px-4 text-sm">
            Página {currentPage + 1} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
};

export default UserReportsWithFeedback; 