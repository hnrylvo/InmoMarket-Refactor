import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Mail, Phone, User } from "lucide-react";

export function UserInfoDialog({ open, onOpenChange, publisherName, userEmail, userPhoneNumber }) {

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información del Vendedor
          </DialogTitle>
          <DialogDescription>
            Información de contacto del usuario que publicó esta propiedad
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <User className="h-4 w-4" />
              Nombre
            </label>
            <p className="text-sm font-medium">{publisherName || "No disponible"}</p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Correo electrónico
            </label>
            {userEmail ? (
              <a 
                href={`mailto:${userEmail}`}
                className="text-sm text-primary hover:underline"
              >
                {userEmail}
              </a>
            ) : (
              <p className="text-sm text-muted-foreground">No disponible</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Teléfono
            </label>
            {userPhoneNumber ? (
              <a 
                href={`tel:${userPhoneNumber}`}
                className="text-sm text-primary hover:underline"
              >
                {userPhoneNumber}
              </a>
            ) : (
              <p className="text-sm text-muted-foreground">No disponible</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

