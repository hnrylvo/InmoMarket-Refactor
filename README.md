# InmoMarket Frontend

Aplicación frontend para el mercado inmobiliario desarrollada con React, Vite y Tailwind CSS.

## 🚀 Características

- **Autenticación unificada**: Sistema de autenticación basado en Zustand para mejor rendimiento
- **Protección de rutas**: Redirección automática para usuarios autenticados/no autenticados
- **Manejo de errores**: ErrorBoundary para capturar errores en producción
- **Responsive Design**: Interfaz adaptativa para móviles y desktop
- **Tema oscuro/claro**: Soporte para múltiples temas

## 🛠️ Tecnologías

- React 18
- Vite
- Tailwind CSS
- Zustand (State Management)
- React Router DOM
- Lucide React (Iconos)
- Sonner (Notificaciones)

## 📦 Instalación

1. Clona el repositorio:
```bash
git clone <repository-url>
cd inmomarket-frontend
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
```bash
# Crea un archivo .env.local
VITE_API_BASE_URL=http://localhost:8080/api
```

4. Ejecuta el servidor de desarrollo:
```bash
npm run dev
```

## 🚀 Despliegue en Vercel

### Configuración automática:
1. Conecta tu repositorio a Vercel
2. Vercel detectará automáticamente que es una aplicación Vite/React
3. El archivo `vercel.json` configurará las rutas correctamente

### Variables de entorno en Vercel:
- `VITE_API_BASE_URL`: URL de tu API backend

## 🔧 Problemas Resueltos

### Problema: Crash en producción al navegar a /login con sesión activa

**Causa**: 
- Conflicto entre dos sistemas de autenticación (AuthContext y useAuthStore)
- Uso incorrecto de hooks de React en stores de Zustand
- Falta de protección de rutas para usuarios autenticados

**Solución implementada**:
1. **Unificación del sistema de autenticación**: Eliminado AuthContext, usando solo useAuthStore
2. **Componente ProtectedRoute**: Maneja redirecciones automáticas
3. **ErrorBoundary**: Captura errores en producción
4. **Configuración de Vercel**: Manejo correcto de rutas SPA

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── ui/             # Componentes de UI base
│   ├── ProtectedRoute.jsx  # Protección de rutas
│   └── ErrorBoundary.jsx   # Manejo de errores
├── pages/              # Páginas de la aplicación
├── stores/             # Stores de Zustand
├── services/           # Servicios de API
└── contexts/           # Contextos de React (legacy)
```

## 🔐 Autenticación

El sistema de autenticación utiliza Zustand con persistencia en localStorage:

```javascript
import { useAuthStore } from '@/stores/useAuthStore';

const { token, login, logout } = useAuthStore();
```

## 🛡️ Protección de Rutas

Las rutas están protegidas automáticamente:

- **Rutas públicas** (`/login`, `/register`): Redirigen a `/` si el usuario está autenticado
- **Rutas privadas**: Redirigen a `/login` si el usuario no está autenticado

## 🐛 Debugging

Para debugging en producción:
1. Revisa la consola del navegador
2. El ErrorBoundary capturará errores y mostrará una UI de fallback
3. Los logs de autenticación se muestran en la consola

## 📝 Scripts Disponibles

- `npm run dev`: Servidor de desarrollo
- `npm run build`: Build de producción
- `npm run preview`: Preview del build
- `npm run lint`: Linting del código

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.
