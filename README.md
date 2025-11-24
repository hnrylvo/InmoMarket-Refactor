InmoMarket – Plataforma Web para Compra y Venta de Propiedades (Frontend)

InmoMarket es una plataforma web diseñada para facilitar la compraventa de bienes raíces mediante un marketplace digital moderno, accesible y sencillo de utilizar. Surge como respuesta a la falta de un espacio confiable donde compradores y vendedores puedan interactuar sin intermediarios, evitando así los riesgos asociados al uso de redes sociales o grupos informales.

El objetivo principal es ofrecer una plataforma organizada donde cada usuario pueda gestionar sus propiedades, editar su información personal y consultar publicaciones de otros, mientras que el administrador tiene la capacidad de supervisar, moderar y mantener el orden dentro del sistema. Con esto se busca mejorar la transparencia, la seguridad y la eficiencia del proceso inmobiliario.

¿Para quién está pensada?

Personas que desean vender una propiedad sin depender de agentes, comisiones o plataformas que cobren por publicar.

Usuarios interesados en comprar, que quieran explorar opciones de forma rápida, comparar información y contactar directamente con los vendedores.

Administradores que requieren una herramienta clara para supervisar publicaciones, reportes y perfiles dentro del sistema.

¿Qué problema resuelve?

El uso de redes sociales para la compra y venta de propiedades presenta varios inconvenientes: información dispersa, publicaciones inexactas o engañosas, perfiles poco confiables y falta de moderación. Esto dificulta la experiencia tanto para compradores como para vendedores.

InmoMarket soluciona estos problemas al proporcionar:

Un sistema centralizado y ordenado para gestionar publicaciones.

Control total del usuario sobre su información y su contenido.

Perfiles más fáciles de identificar y validar.

Moderación mediante reportes y herramientas administrativas.

Un entorno más seguro y transparente para todas las partes involucradas.

Funcionalidades Principales
Gestión de usuarios

Registro, inicio de sesión y edición de información personal.

Visualización de perfiles de otros usuarios.

Control individual de datos: cada persona solo puede modificar su propio perfil.

Publicaciones

Crear publicaciones con información detallada de la propiedad.

Editar únicamente las publicaciones propias.

Visualizar todas las publicaciones disponibles en la plataforma mediante un listado general.

Sistema de reportes

Cualquier usuario puede denunciar una publicación por información falsa o por infringir las reglas.

El administrador recibe y gestiona todos los reportes.

El administrador puede modificar el estado de una publicación (activa, suspendida, en revisión).

Roles y Permisos
Usuarios (Compradores y Vendedores)

Crear publicaciones.

Ver sus propias publicaciones.

Ver publicaciones generales de la plataforma.

Editar únicamente sus publicaciones.

Ver perfiles de otros usuarios.

Modificar su información personal.

Enviar reportes de publicaciones.

Administrador

Ver todos los usuarios registrados.

Ver todas las publicaciones activas o inactivas.

Revisar todas las publicaciones reportadas.

Cambiar el estado de las publicaciones reportadas según corresponda.

InmoMarket Frontend

La aplicación cuenta con un frontend desarrollado con React, Vite y Tailwind CSS. Se implementaron buenas prácticas en el manejo del estado, la autenticación y la organización del código, garantizando una experiencia fluida tanto en escritorio como en dispositivos móviles.

Características del Frontend

Autenticación unificada mediante Zustand.

Protección de rutas con redirecciones automáticas según el estado del usuario.

Manejo de errores mediante ErrorBoundary.

Diseño totalmente responsive.

Soporte para modo claro y oscuro.

Arquitectura modular basada en componentes independientes.

Tecnologías utilizadas

React 18

Vite

Tailwind CSS

Zustand

React Router DOM

Lucide React

Sonner

Requisitos Previos
Software Necesario

Node.js 18 o superior

npm 8+ o yarn

Verificar instalación:

node -v
npm -v

Dependencias principales (instaladas automáticamente)

React

Vite

Tailwind CSS

Zustand

React Router DOM

Sonner

Lucide React

Instalación Paso a Paso

Clonar el repositorio:

git clone <url-del-repositorio>
cd inmomarket-frontend


Instalar dependencias:

npm install


Crear archivo de entorno:

cp .env.example .env


Configurar la URL del backend en .env:

VITE_API_BASE_URL= https://web-production-06592e.up.railway.app

Ejecución
Modo desarrollo
npm run dev


La aplicación abrirá en:

http://localhost:5173

Build de producción
npm run build

Vista previa del build
npm run preview

Variables de Entorno (.env.example)
# URL base del backend de la API
VITE_API_BASE_URL=https://web-production-06592e.up.railway.app


Explicación:

VITE_API_BASE_URL: Punto base donde el frontend realiza las solicitudes HTTP al backend (autenticación, publicaciones, perfiles, etc.).

Estructura del Proyecto
src/
├── components/
│   ├── ui/
│   ├── ProtectedRoute.jsx
│   └── ErrorBoundary.jsx
├── pages/
├── stores/
├── services/
└── contexts/

Autenticación

La autenticación se maneja mediante Zustand con persistencia en localStorage:

import { useAuthStore } from '@/stores/useAuthStore';
const { token, login, logout } = useAuthStore();

Protección de Rutas

Las rutas públicas (por ejemplo /login o /register) redirigen al inicio si el usuario ya está autenticado.

Las rutas privadas requieren un token válido para ingresar.

Contribución

Fork del repositorio

Crear rama con la nueva funcionalidad

Realizar los commits

Subir la rama

Abrir un Pull Request
