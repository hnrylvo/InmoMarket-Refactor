# InmoMarket – Plataforma Web para Compra y Venta de Propiedades (Frontend)

InmoMarket es una plataforma web diseñada para facilitar la compraventa de bienes raíces mediante un marketplace digital moderno, accesible y sencillo de utilizar. Surge como respuesta a la falta de un espacio confiable donde compradores y vendedores puedan interactuar sin intermediarios, evitando así los riesgos asociados al uso de redes sociales o grupos informales.

El objetivo principal es ofrecer una plataforma organizada donde cada usuario pueda gestionar sus propiedades, editar su información personal y consultar publicaciones de otros, mientras que el administrador tiene la capacidad de supervisar, moderar y mantener el orden dentro del sistema. Con esto se busca mejorar la transparencia, la seguridad y la eficiencia del proceso inmobiliario.

## ¿Para quién está pensada?

- Personas que desean vender una propiedad sin depender de agentes, comisiones o plataformas que cobren por publicar.
- Usuarios interesados en comprar, que quieran explorar opciones de forma rápida, comparar información y contactar directamente con los vendedores.
- Administradores que requieren una herramienta clara para supervisar publicaciones, reportes y perfiles dentro del sistema.

## ¿Qué problema resuelve?

El uso de redes sociales para la compra y venta de propiedades presenta varios inconvenientes:

- Información dispersa.
- Publicaciones inexactas o engañosas.
- Perfiles poco confiables.
- Ausencia de moderación.

InmoMarket soluciona estos problemas al proporcionar:

- Un sistema centralizado y ordenado para gestionar publicaciones.
- Control total del usuario sobre su información y su contenido.
- Perfiles más fáciles de identificar y validar.
- Moderación mediante reportes y herramientas administrativas.
- Un entorno más seguro y transparente para todas las partes involucradas.

# Funcionalidades Principales

## Gestión de usuarios

- Registro, inicio de sesión y edición de información personal.
- Visualización de perfiles de otros usuarios.
- Control individual de datos: cada persona solo puede modificar su propio perfil.

## Publicaciones

- Crear publicaciones con información detallada de la propiedad.
- Editar únicamente sus publicaciones.
- Visualizar todas las publicaciones disponibles en un listado general.

## Sistema de reportes

- Cualquier usuario puede denunciar publicaciones falsas o que infrinjan reglas.
- El administrador recibe y gestiona los reportes.
- El administrador puede cambiar el estado de una publicación (activa, suspendida, en revisión).

# Roles y Permisos

## Usuarios (Compradores y Vendedores)

- Crear publicaciones.
- Ver sus propias publicaciones.
- Ver publicaciones generales de la plataforma.
- Editar únicamente sus publicaciones.
- Ver perfiles de otros usuarios.
- Modificar su información personal.
- Enviar reportes de publicaciones.

## Administrador

- Ver todos los usuarios registrados.
- Ver todas las publicaciones activas o inactivas.
- Revisar publicaciones reportadas.
- Cambiar el estado de publicaciones reportadas.

# Frontend de InmoMarket

La aplicación cuenta con un frontend desarrollado con React, Vite y Tailwind CSS. Incluye:

- Manejo de estado con Zustand.
- Protección de rutas.
- Manejo global de errores.
- Diseño responsive.
- Modo claro y oscuro.
- Arquitectura modular.

## Tecnologías utilizadas

- React 18
- Vite
- Tailwind CSS
- Zustand
- React Router DOM
- Lucide React
- Sonner

# Requisitos Previos

## Software Necesario

- Node.js 18 o superior
- npm 8+ o yarn

Verificar instalación:

```
node -v
npm -v
```

## Dependencias principales (instaladas automáticamente)

- React
- Vite
- Tailwind CSS
- Zustand
- React Router DOM
- Sonner
- Lucide React

# Instalación Paso a Paso

### 1. Clonar el repositorio

```
git clone <url-del-repositorio>
cd inmomarket-frontend
```

### 2. Instalar dependencias

```
npm install
```

### 3. Crear archivo de entorno

```
cp .env.example .env
```

### 4. Configurar la URL del backend

```
VITE_API_BASE_URL=https://web-production-06592e.up.railway.app
```

# Ejecución

### Modo desarrollo

```
npm run dev
```

### Build de producción

```
npm run build
```

### Vista previa del build

```
npm run preview
```

# Variables de Entorno (.env.example)

```
VITE_API_BASE_URL=https://web-production-06592e.up.railway.app
```

# Estructura del Proyecto

```
src/
├── components/
│   ├── ui/
│   ├── ProtectedRoute.jsx
│   └── ErrorBoundary.jsx
├── pages/
├── stores/
├── services/
└── contexts/
```

# Autenticación

```javascript
import { useAuthStore } from '@/stores/useAuthStore';
const { token, login, logout } = useAuthStore();
```

# Protección de Rutas

- Las rutas públicas redirigen al inicio si el usuario ya está autenticado.
- Las rutas privadas requieren un token válido.

# Contribución

- Fork del repositorio
- Crear rama para nueva funcionalidad
- Commits
- Push
- Pull Request
