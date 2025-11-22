import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, User, MessageSquare, CheckCircle, XCircle, AlertCircle } from "lucide-react"

export default function MyVisitDialog({ visit, children }) {
  const [open, setOpen] = useState(false)

  const getStatusIcon = (status) => {
    switch (status) {
      case "PENDING":
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      case "ACCEPTED":
      case "CONFIRMED":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "REJECTED":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "ACCEPTED":
      case "CONFIRMED":
        return "bg-green-100 text-green-800 border-green-200"
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString) => {
    return timeString.substring(0, 5)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStatusIcon(visit.status)}
            Detalles de mi Solicitud de Visita
          </DialogTitle>
          <DialogDescription>
            Información de tu solicitud y la respuesta del propietario
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Lado izquierdo: Mi solicitud */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Status Badge */}
            <div className="flex justify-center">
              <Badge className={`${getStatusColor(visit.status)} border`}>
                {visit.status === "PENDING" && "Pendiente"}
                {visit.status === "ACCEPTED" && "Aceptada"}
                {visit.status === "CONFIRMED" && "Confirmada"}
                {visit.status === "REJECTED" && "Rechazada"}
                {visit.status === "CANCELLED" && "Cancelada"}
                {visit.status === "COMPLETED" && "Completada"}
              </Badge>
            </div>
            {/* Property Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Propiedad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-medium text-lg">{visit.publicationTitle}</h4>
                  <p className="text-sm text-muted-foreground">{visit.publicationAddress}</p>
                </div>
              </CardContent>
            </Card>
            {/* Visit Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Detalles de la Visita
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Fecha</p>
                      <p className="text-sm text-muted-foreground">{formatDate(visit.visitDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Hora</p>
                      <p className="text-sm text-muted-foreground">{formatTime(visit.visitTime)}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Propietario</p>
                    <p className="text-sm text-muted-foreground">{visit.ownerName}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Mensaje enviado */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Mi mensaje
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm">{visit.userMessage || 'Sin mensaje'}</p>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Lado derecho: Respuesta del propietario */}
          <div className="flex-1 min-w-[320px] max-w-md border-l pl-6 space-y-6">
            <h3 className="text-lg font-semibold mb-4">Respuesta del propietario</h3>
            {visit.status === 'PENDING' && (
              <div className="text-gray-500">Aún no hay respuesta del propietario.</div>
            )}
            {(visit.status === 'ACCEPTED' || visit.status === 'CONFIRMED') && (
              <div className="space-y-4">
                <div>
                  <span className="font-medium">Punto de encuentro:</span>
                  <div className="bg-muted border rounded p-2 mt-1">
                    {visit.meetingLocation}
                  </div>
                </div>
                {visit.ownerResponse && (
                  <div>
                    <span className="font-medium">Mensaje adicional:</span>
                    <div className="bg-muted border rounded p-2 mt-1">
                      {visit.ownerResponse}
                    </div>
                  </div>
                )}
              </div>
            )}
            {visit.status === 'REJECTED' && (
              <div>
                <span className="font-medium">Motivo del rechazo:</span>
                <div className="bg-muted border rounded p-2 mt-1">
                  {visit.rejectionReason}
                </div>
              </div>
            )}
            {visit.status === 'CANCELLED' && (
              <div className="text-gray-500">La solicitud fue cancelada.</div>
            )}
            {visit.status === 'COMPLETED' && (
              <div className="text-green-700">La visita fue completada.</div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 