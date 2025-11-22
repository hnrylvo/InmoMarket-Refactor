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
import { usePublicationsStore } from "@/stores/usePublicationsStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";
import { Flag, CheckCircle2, XCircle } from "lucide-react";

export function ReportDialog({ publicationId }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const { reportPublication } = usePublicationsStore();
  const { token } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await reportPublication(token, {
        publicationId,
        reason,
        description
      });
      toast.success("Reporte enviado correctamente", {
        description: "Gracias por ayudarnos a mantener la calidad de nuestras publicaciones.",
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
        duration: 5000,
      });
      setOpen(false);
      setReason("");
      setDescription("");
    } catch (error) {
      toast.error("Error al enviar el reporte", {
        description: "Por favor, intenta nuevamente más tarde.",
        icon: <XCircle className="h-4 w-4 text-red-500" />,
        duration: 5000,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="secondary" 
          size="icon" 
          className="h-8 w-8 bg-white/90 hover:bg-white shadow-sm"
        >
          <Flag className="h-4 w-4 text-red-500" />
          <span className="sr-only">Reportar</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reportar Publicación</DialogTitle>
          <DialogDescription>
            Por favor, proporciona los detalles del reporte.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Razón del reporte</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej: Información falsa, contenido inapropiado..."
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Proporciona más detalles sobre el reporte..."
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit">Enviar Reporte</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 