import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { visitService } from "@/services/visitService";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";
import { Calendar, Clock, MessageSquare, CheckCircle2, XCircle } from "lucide-react";

export function VisitSchedulingDialog({ property, availableTimes, trigger }) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuthStore();

  const handleOpenDialog = () => {
    if (!token) {
      toast.error("Debes iniciar sesión para agendar una visita");
      return;
    }
    
    if (!availableTimes || availableTimes.length === 0) {
      toast.error("No hay horarios disponibles para esta propiedad");
      return;
    }
    
    const dates = getAvailableDates();
    if (dates.length === 0) {
      toast.error("No hay fechas disponibles para esta propiedad");
      return;
    }
    
    setOpen(true);
  };

  // Get available dates based on property's available times
  const getAvailableDates = () => {
    if (!availableTimes || availableTimes.length === 0) {
      return [];
    }

    const dates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for comparison
    
    // Get unique day of week numbers from available times
    const availableDayNumbers = [...new Set(availableTimes.map(time => time.dayOfWeek))];
    
    // Find the next 4 occurrences of each available day
    let foundDates = 0;
    let dayOffset = 0;
    
    while (foundDates < 4 && dayOffset < 28) { // Limit to 4 weeks to avoid infinite loop
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() + dayOffset);
      
      const dayOfWeek = checkDate.getDay();
      
      if (availableDayNumbers.includes(dayOfWeek)) {
        dates.push({
          value: checkDate.toISOString().split('T')[0],
          label: checkDate.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          dayOfWeek: dayOfWeek
        });
        foundDates++;
      }
      
      dayOffset++;
    }
    
    return dates;
  };

  // Get available times for selected date
  const getAvailableTimesForDate = () => {
    if (!selectedDate) return [];
    
    // Find the selected date object to get its dayOfWeek
    const selectedDateObj = availableDates.find(date => date.value === selectedDate);
    if (!selectedDateObj) return [];
    
    return availableTimes.filter(time => time.dayOfWeek === selectedDateObj.dayOfWeek);
  };

  const formatTime = (time) => {
    if (!time) return '';
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime) {
      toast.error("Por favor selecciona una fecha y hora");
      return;
    }

    if (!token) {
      toast.error("Debes iniciar sesión para agendar una visita");
      return;
    }

    setIsSubmitting(true);

    try {
      // Ensure time is in HH:MM:SS format
      const formattedTime = selectedTime.includes(':') && selectedTime.split(':').length === 2 
        ? `${selectedTime}:00` 
        : selectedTime;

      const visitData = {
        publicationId: property.id,
        visitDate: selectedDate,
        visitTime: formattedTime,
        message: message.trim() || "Solicito agendar una visita para conocer la propiedad."
      };

      console.log('Sending visit request:', visitData);

      await visitService.scheduleVisit(token, visitData);
      
      toast.success("Visita agendada exitosamente", {
        description: "El propietario será notificado de tu solicitud.",
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
        duration: 5000,
      });
      
      setOpen(false);
      setSelectedDate("");
      setSelectedTime("");
      setMessage("");
    } catch (error) {
      console.error('Error scheduling visit:', error);
      toast.error("Error al agendar la visita", {
        description: error.message || "Por favor, intenta nuevamente más tarde.",
        icon: <XCircle className="h-4 w-4 text-red-500" />,
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableDates = getAvailableDates();
  const availableTimesForDate = getAvailableTimesForDate();

  // Debug logging
  console.log('Available times from property:', availableTimes);
  console.log('Available dates for dialog:', availableDates);
  console.log('Selected date:', selectedDate);
  console.log('Available times for selected date:', availableTimesForDate);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div onClick={handleOpenDialog}>
          {trigger}
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Agendar visita
          </DialogTitle>
          <DialogDescription>
            Selecciona una fecha y hora disponible para agendar tu visita a la propiedad.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date Selection */}
          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Fecha
            </Label>
            <Select value={selectedDate} onValueChange={setSelectedDate}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una fecha" />
              </SelectTrigger>
              <SelectContent>
                {availableDates.map((date) => (
                  <SelectItem key={date.value} value={date.value}>
                    {date.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time Selection */}
          <div className="space-y-2">
            <Label htmlFor="time" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Hora
            </Label>
            <Select 
              value={selectedTime} 
              onValueChange={setSelectedTime}
              disabled={!selectedDate || availableTimesForDate.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  !selectedDate 
                    ? "Primero selecciona una fecha" 
                    : availableTimesForDate.length === 0 
                      ? "No hay horarios disponibles para esta fecha"
                      : "Selecciona una hora"
                } />
              </SelectTrigger>
              <SelectContent>
                {availableTimesForDate.map((time, index) => (
                  <SelectItem key={index} value={time.startTime}>
                    {formatTime(time.startTime)} - {formatTime(time.endTime)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Mensaje para el propietario (opcional)
            </Label>
            <Textarea
              id="message"
              placeholder="Escribe un mensaje personalizado para el propietario..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !selectedDate || !selectedTime}
            >
              {isSubmitting ? "Agendando..." : "Agendar visita"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 