import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function ReportResolutionDialog({ 
  isOpen, 
  onClose, 
  onResolve, 
  reportId, 
  action, 
  loading 
}) {
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    // Validate feedback length
    if (feedback.length < 10) {
      setError("El feedback debe tener al menos 10 caracteres");
      return;
    }
    if (feedback.length > 500) {
      setError("El feedback no puede exceder 500 caracteres");
      return;
    }

    setError("");
    onResolve(reportId, action, feedback);
    setFeedback("");
  };

  const handleClose = () => {
    setFeedback("");
    setError("");
    onClose();
  };

  const getActionText = () => {
    return action === 'APPROVE' ? 'Resolver' : 'Rechazar';
  };

  const getActionDescription = () => {
    return action === 'APPROVE' 
      ? 'Resolver este reporte' 
      : 'Rechazar este reporte';
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{getActionText()} Reporte</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {getActionDescription()}. Por favor proporciona un feedback explicando tu decisión.
          </p>
          
          <div className="space-y-2">
            <Label htmlFor="feedback">Feedback (10-500 caracteres)</Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Explica tu decisión sobre este reporte..."
              rows={4}
              maxLength={500}
              className="resize-none"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{feedback.length}/500 caracteres</span>
              <span>Mínimo: 10 caracteres</span>
            </div>
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || feedback.length < 10}
          >
            {loading ? 'Procesando...' : getActionText()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 