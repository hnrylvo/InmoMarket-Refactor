import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { toast } from 'sonner';

/**
 * Componente que protege rutas accesibles solo para administradores
 * Redirige a usuarios no autenticados o sin rol de administrador
 */
export const AdminRoute = ({ children }) => {
  const { token, role } = useAuthStore();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Pequeño delay para asegurar que el store se haya inicializado
    const timer = setTimeout(() => {
      if (!token) {
        // Si no hay token, redirigir a login
        toast.error('Debes iniciar sesión para acceder a esta página');
        navigate('/login', { replace: true });
      } else if (role !== 'ROLE_ADMIN') {
        // Si no es administrador, redirigir a home y mostrar mensaje
        toast.error('No tienes permisos para acceder a esta página');
        navigate('/', { replace: true });
      }
      setIsChecking(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [token, role, navigate]);

  // Mostrar nada mientras se verifica la autenticación y el rol
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Si no hay token o no es admin, no renderizar nada (se redirigirá)
  if (!token || role !== 'ROLE_ADMIN') {
    return null;
  }

  return children;
};

