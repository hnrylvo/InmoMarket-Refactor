import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { Bell, CheckCheck, Clock, Mail, AlertTriangle, Eye, Calendar, MapPin, User, ChevronDown } from "lucide-react"
import { useAuthStore } from "@/stores/useAuthStore"
import { visitService } from "@/services/visitService"
import VisitDetailsDialog from "@/components/VisitDetailsDialog"

export default function NotificationsPage() {
  const [notificationList, setNotificationList] = useState(notifications)
  const [pendingVisits, setPendingVisits] = useState([])
  const [respondedVisits, setRespondedVisits] = useState([])
  const [newVisitRequests, setNewVisitRequests] = useState(0)
  const [newVisitResponses, setNewVisitResponses] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { token } = useAuthStore()

  useEffect(() => {
    if (token) {
      fetchVisitNotifications()
    }
  }, [token])

  const fetchVisitNotifications = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await visitService.getVisitNotifications(token)
      setPendingVisits(response.pendingVisits || [])
      setRespondedVisits(response.respondedVisits || [])
      setNewVisitRequests(response.newVisitRequests || 0)
      setNewVisitResponses(response.newVisitResponses || 0)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching visit notifications:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAllAsRead = async () => {
    setNotificationList((prev) => prev.map((n) => ({ ...n, read: true })))
    if (!token) return
    try {
      await visitService.markVisitNotificationsAsRead(token, 'request')
      await visitService.markVisitNotificationsAsRead(token, 'responses')
      fetchVisitNotifications()
    } catch (err) {
      console.error('Error al marcar todas las notificaciones de visitas como leídas:', err)
    }
  }

  const handleMarkRequestsAsRead = async () => {
    if (!token) return
    try {
      await visitService.markVisitNotificationsAsRead(token, 'request')
      fetchVisitNotifications()
    } catch (err) {
      console.error('Error al marcar solicitudes como leídas:', err)
    }
  }

  const handleMarkResponsesAsRead = async () => {
    if (!token) return
    try {
      await visitService.markVisitNotificationsAsRead(token, 'responses')
      fetchVisitNotifications()
    } catch (err) {
      console.error('Error al marcar respuestas como leídas:', err)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "APPROVED":
        return "bg-green-100 text-green-800 border-green-200"
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "PENDING":
        return "Pendiente"
      case "APPROVED":
        return "Aprobada"
      case "REJECTED":
        return "Rechazada"
      default:
        return status
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatTime = (timeString) => {
    return timeString.substring(0, 5)
  }

  return (
    <div className="container mx-auto py-10 px-4 min-h-screen pt-[--header-height]">
      <Card className="w-full max-w-4xl mx-auto mt-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Notificaciones</CardTitle>
              <CardDescription>Mantente alerta con las últimas notificaciones</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="h-4 w-4" />
              <span>Marcar todos como leído</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Visit Petitions Section */}
          {pendingVisits.length > 0 && newVisitRequests > 0 && (
            <div className="flex justify-end mb-1">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={handleMarkRequestsAsRead}
              >
                Marcar solicitudes como leídas
              </Button>
            </div>
          )}
          <Collapsible>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5" />
                  <span className="font-medium">Solicitudes de Visita</span>
                  {pendingVisits.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {newVisitRequests > 0 ? `${newVisitRequests} nuevas` : pendingVisits.length}
                    </Badge>
                  )}
                </div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">Cargando solicitudes...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-sm text-red-600">{error}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={fetchVisitNotifications}
                  >
                    Reintentar
                  </Button>
                </div>
              ) : pendingVisits.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No tienes solicitudes de visita</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingVisits.map((visit) => (
                    <VisitDetailsDialog key={visit.id} visit={visit}>
                      <div className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="rounded-full p-2 bg-blue-500">
                          <Calendar className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium truncate">{visit.publicationTitle}</h3>
                              <p className="text-sm text-muted-foreground truncate">{visit.publicationAddress}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">{formatDate(visit.visitDate)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">{formatTime(visit.visitTime)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">{visit.visitorName || visit.ownerName}</span>
                                </div>
                              </div>
                            </div>
                            <Badge className={`${getStatusColor(visit.status)} border`}>
                              {getStatusText(visit.status)}
                            </Badge>
                          </div>
                          {visit.isNewRequest && (
                            <div className="mt-2">
                              <Badge variant="destructive" className="text-xs">
                                Nueva solicitud
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </VisitDetailsDialog>
                  ))}
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Visit Responses Section */}
          {respondedVisits.length > 0 && newVisitResponses > 0 && (
            <div className="flex justify-end mb-1">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={handleMarkResponsesAsRead}
              >
                Marcar respuestas como leídas
              </Button>
            </div>
          )}
          <Collapsible>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5" />
                  <span className="font-medium">Respuestas a Mis Visitas</span>
                  {respondedVisits.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {newVisitResponses > 0 ? `${newVisitResponses} nuevas` : respondedVisits.length}
                    </Badge>
                  )}
                </div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">Cargando respuestas...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-sm text-red-600">{error}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={fetchVisitNotifications}
                  >
                    Reintentar
                  </Button>
                </div>
              ) : respondedVisits.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No tienes respuestas a tus solicitudes de visita</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {respondedVisits.map((visit) => (
                    <VisitDetailsDialog key={visit.id} visit={visit}>
                      <div className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="rounded-full p-2 bg-green-500">
                          <Eye className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium truncate">{visit.publicationTitle}</h3>
                              <p className="text-sm text-muted-foreground truncate">{visit.publicationAddress}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">{formatDate(visit.visitDate)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">{formatTime(visit.visitTime)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">{visit.ownerName || visit.visitorName}</span>
                                </div>
                              </div>
                            </div>
                            <Badge className={`${getStatusColor(visit.status)} border`}>
                              {getStatusText(visit.status)}
                            </Badge>
                          </div>
                          {visit.hasNewResponse && (
                            <div className="mt-2">
                              <Badge variant="destructive" className="text-xs">
                                Nueva respuesta
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </VisitDetailsDialog>
                  ))}
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper functions
function getNotificationIcon(type) {
  switch (type) {
    case "message":
      return <Mail className="h-4 w-4 text-white" />
    case "alert":
      return <AlertTriangle className="h-4 w-4 text-white" />
    default:
      return <Eye className="h-4 w-4 text-white" />
  }
}

function getIconBackground(type) {
  switch (type) {
    case "message":
      return "bg-blue-500"
    case "alert":
      return "bg-orange-500"
    default:
      return "bg-green-500"
  }
}

// Sample notifications data
const notifications = [
  {
    id: 1,
    type: "message",
    title: "Nuevo mensaje",
    message: "You have a new message from Sarah about the project deadline.",
    time: "Just now",
    read: false,
  },
  {
    id: 2,
    type: "alert",
    title: "Payment reminder",
    message: "Your subscription will expire in 3 days. Please renew to avoid service interruption.",
    time: "2 hours ago",
    read: false,
  },
  {
    id: 3,
    type: "default",
    title: "50 personas han visto tu anuncio",
    message: "Tu anuncio ha sido visto por 50 personas en las últimas 24 horas.",
    time: "Yesterday",
    read: true,
  },
  {
    id: 4,
    type: "message",
    title: "Se ha publicado tu nuevo anuncio",
    message: "Tu anuncio ha sido publicado con éxito y está visible para los usuarios.",
    time: "2 days ago",
    read: true,
  },
]
