import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, User, MessageSquare, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { useAuthStore } from '@/stores/useAuthStore'
import { visitService } from '@/services/visitService'
import { toast } from 'sonner'
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

export default function VisitDetailsDialog({ visit, children, onRespond }) {
  const [open, setOpen] = useState(false)
  const { token } = useAuthStore()
  const [meetingLocation, setMeetingLocation] = useState('')
  const [additionalMessage, setAdditionalMessage] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [responseType, setResponseType] = useState('')

  const getStatusIcon = (status) => {
    switch (status) {
      case "PENDING":
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      case "ACCEPTED":
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

  const handleAccept = async () => {
    setLoading(true)
    try {
      await visitService.acceptVisit(token, visit.id, meetingLocation, additionalMessage)
      toast.success('Visita aceptada correctamente')
      setOpen(false)
      if (onRespond) onRespond()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    setLoading(true)
    try {
      await visitService.rejectVisit(token, visit.id, rejectionReason)
      toast.success('Visita rechazada correctamente')
      setOpen(false)
      if (onRespond) onRespond()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
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
            Detalles de la Solicitud de Visita
          </DialogTitle>
          <DialogDescription>
            Información completa sobre la solicitud de visita
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 min-w-0 space-y-6">
            <div className="flex justify-center">
              <Badge className={`${getStatusColor(visit.status)} border`}>
                {visit.status === "PENDING" && "Pendiente"}
                {visit.status === "ACCEPTED" && "Aceptada"}
                {visit.status === "REJECTED" && "Rechazada"}
              </Badge>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Detalles de la Solicitud
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-lg mb-1">{visit.publicationTitle}</h4>
                  <p className="text-sm text-muted-foreground">{visit.publicationAddress}</p>
                </div>
                
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
                    <p className="text-sm font-medium">Solicitante</p>
                    <p className="text-sm text-muted-foreground">{visit.visitorName} ({visit.visitorEmail})</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">Mensaje del solicitante:</p>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm">{visit.userMessage || 'Sin mensaje'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {visit.status === 'PENDING' && (
            <div className="flex-1 min-w-[320px] max-w-md border-l pl-6">
              <h3 className="text-lg font-semibold mb-4">Responder Solicitud</h3>
              
              <RadioGroup value={responseType} onValueChange={setResponseType} className="mb-6">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="accept" id="accept" />
                  <Label htmlFor="accept">Aceptar visita</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="reject" id="reject" />
                  <Label htmlFor="reject">Rechazar visita</Label>
                </div>
              </RadioGroup>

              {responseType === 'accept' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="meetingLocation">Punto de encuentro *</Label>
                    <Input
                      id="meetingLocation"
                      placeholder="Lugar de encuentro"
                      value={meetingLocation}
                      onChange={e => setMeetingLocation(e.target.value)}
                      disabled={loading}
                      className="bg-transparent mt-1"
                    />
                    {meetingLocation && meetingLocation.length < 10 && (
                      <p className="text-sm text-red-500 mt-1">Debe tener al menos 10 caracteres</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="additionalMessage">Mensaje adicional (opcional)</Label>
                    <Textarea
                      id="additionalMessage"
                      placeholder="Mensaje adicional"
                      value={additionalMessage}
                      onChange={e => setAdditionalMessage(e.target.value)}
                      disabled={loading}
                      className="bg-transparent mt-1"
                    />
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handleAccept} 
                    disabled={loading || !meetingLocation || meetingLocation.length < 10}
                  >
                    Aceptar visita
                  </Button>
                </div>
              )}

              {responseType === 'reject' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="rejectionReason">Motivo del rechazo *</Label>
                    <Textarea
                      id="rejectionReason"
                      placeholder="Motivo del rechazo"
                      value={rejectionReason}
                      onChange={e => setRejectionReason(e.target.value)}
                      disabled={loading}
                      className="bg-transparent mt-1"
                    />
                    {rejectionReason && rejectionReason.length < 10 && (
                      <p className="text-sm text-red-500 mt-1">Debe tener al menos 10 caracteres</p>
                    )}
                  </div>
                  <Button 
                    variant="destructive" 
                    className="w-full" 
                    onClick={handleReject} 
                    disabled={loading || !rejectionReason || rejectionReason.length < 10}
                  >
                    Rechazar visita
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 