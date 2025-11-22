import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';

export const ProtectedRoute = ({ children, requireAuth = true, redirectTo = '/login' }) => {
  const { token } = useAuthStore();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Pequeño delay para asegurar que el store se haya inicializado
    const timer = setTimeout(() => {
      if (requireAuth && !token) {
        // Si requiere autenticación y no hay token, redirigir a login
        navigate(redirectTo, { replace: true });
      } else if (!requireAuth && token) {
        // Si NO requiere autenticación (como login/register) y hay token, redirigir a home
        navigate('/', { replace: true });
      }
      setIsChecking(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [token, requireAuth, navigate, redirectTo]);

  // Mostrar nada mientras se verifica la autenticación
  if (isChecking) {
    return null;
  }

  // Si requiere autenticación y no hay token, no renderizar nada
  if (requireAuth && !token) {
    return null;
  }

  // Si NO requiere autenticación y hay token, no renderizar nada (se redirigirá)
  if (!requireAuth && token) {
    return null;
  }

  return children;
}; 