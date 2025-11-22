import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useUserProfileStore } from '@/stores/useUserProfileStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/page-header';
import {
Mail,
Phone,
User,
Calendar,
Building2,
ArrowLeft,
Shield,
ShieldOff
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

export default function UserProfile() {
const { userId } = useParams();
const navigate = useNavigate();
const { token } = useAuthStore();
const { profile, loading, error, fetchUserProfile, clearProfile } = useUserProfileStore();
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
const loadProfile = async () => {
if (!userId) {
toast.error('ID de usuario no válido');
navigate('/');
return;
}

try {
setIsLoading(true);
await fetchUserProfile(token, userId);
} catch (error) {
console.error('Error loading profile:', error);
if (error.response?.status === 404) {
toast.error('Usuario no encontrado');
navigate('/');
} else {
toast.error('Error al cargar el perfil del usuario');
}
} finally {
setIsLoading(false);
}
};

loadProfile();

// Limpiar el perfil al desmontar el componente
return () => {
clearProfile();
};
}, [userId, token, fetchUserProfile, clearProfile, navigate]);

if (isLoading || loading) {
return (
<div className="min-h-screen pt-[--header-height] bg-background">
<div className="container mx-auto py-8 px-4">
<div className="max-w-4xl mx-auto">
<Skeleton className="h-8 w-48 mb-6" />
<Card>
<CardHeader>
<div className="flex items-center gap-4">
<Skeleton className="h-20 w-20 rounded-full" />
<div className="space-y-2 flex-1">
<Skeleton className="h-6 w-48" />
<Skeleton className="h-4 w-32" />
</div>
</div>
</CardHeader>
<CardContent>
<div className="space-y-4">
<Skeleton className="h-4 w-full" />
<Skeleton className="h-4 w-3/4" />
<Skeleton className="h-4 w-1/2" />
</div>
</CardContent>
</Card>
</div>
</div>
</div>
);
}

if (error || !profile) {
return (
<div className="min-h-screen pt-[--header-height] bg-background">
<div className="container mx-auto py-8 px-4">
<div className="max-w-4xl mx-auto">
<Card className="border-destructive/50 bg-destructive/10">
<CardHeader>
<CardTitle className="text-destructive">Error al cargar el perfil</CardTitle>
<CardDescription>{error || 'No se pudo cargar el perfil del usuario'}</CardDescription>
</CardHeader>
<CardContent>
<div className="flex gap-4">
<Button variant="outline" onClick={() => navigate(-1)}>
<ArrowLeft className="h-4 w-4 mr-2" />
Volver
</Button>
<Button onClick={() => window.location.reload()}>
Reintentar
</Button>
</div>
</CardContent>
</Card>
</div>
</div>
</div>
);
}

const getInitials = (name) => {
if (!name) return 'U';
const parts = name.split(' ');
if (parts.length >= 2) {
return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
return name.substring(0, 2).toUpperCase();
};

return (
<div className="min-h-screen pt-[--header-height] bg-background">
<div className="container mx-auto py-8 px-4">
<div className="max-w-4xl mx-auto">
{/* Header */}
<div className="mb-6">
<Button
variant="ghost"
onClick={() => navigate(-1)}
className="mb-4"
>
<ArrowLeft className="h-4 w-4 mr-2" />
Volver
</Button>
<PageHeader
title="Perfil de Usuario"
description="Información de contacto del vendedor"
/>
</div>

{/* Profile Card */}
<Card>
<CardHeader>
<div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
<Avatar className="h-24 w-24">
<AvatarImage
src={profile.profilePicture || '/placeholder.svg'}
alt={profile.name}
/>
<AvatarFallback className="text-2xl">
{getInitials(profile.name)}
</AvatarFallback>
</Avatar>
<div className="flex-1">
<div className="flex items-center gap-3 mb-2">
<CardTitle className="text-2xl">{profile.name}</CardTitle>
{profile.totalPublications > 0 && (
<Badge variant="secondary" className="flex items-center gap-1">
<Building2 className="h-3 w-3" />
{profile.totalPublications} {profile.totalPublications === 1 ? 'publicación' : 'publicaciones'}
</Badge>
)}
</div>
{profile.bio && (
<CardDescription className="text-base mt-2">
{profile.bio}
</CardDescription>
)}
{profile.joinDate && (
<div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
<Calendar className="h-4 w-4" />
<span>
Miembro desde {format(new Date(profile.joinDate), 'MMMM yyyy', { locale: es })}
</span>
</div>
)}
</div>
</div>
</CardHeader>
<CardContent>
<div className="space-y-6">
{/* Contact Information */}
<div>
<h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
<User className="h-5 w-5" />
Información de Contacto
</h3>
<div className="space-y-3">
{/* Email - Solo si está autorizado */}
{profile.showEmail && profile.email ? (
<div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
<Mail className="h-5 w-5 text-muted-foreground" />
<div className="flex-1">
<p className="text-sm font-medium text-muted-foreground">Correo electrónico</p>
<a
href={`mailto:${profile.email}`}
className="text-sm text-primary hover:underline"
>
{profile.email}
</a>
</div>
<Shield className="h-4 w-4 text-green-600" title="Contacto autorizado" />
</div>
) : (
<div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 opacity-60">
<Mail className="h-5 w-5 text-muted-foreground" />
<div className="flex-1">
<p className="text-sm font-medium text-muted-foreground">Correo electrónico</p>
<p className="text-sm text-muted-foreground">No disponible</p>
</div>
<ShieldOff className="h-4 w-4 text-muted-foreground" title="Contacto no autorizado" />
</div>
)}

{/* Phone - Solo si está autorizado */}
{profile.showPhone && profile.phone ? (
<div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
<Phone className="h-5 w-5 text-muted-foreground" />
<div className="flex-1">
<p className="text-sm font-medium text-muted-foreground">Teléfono</p>
<a
href={`tel:${profile.phone}`}
className="text-sm text-primary hover:underline"
>
{profile.phone}
</a>
</div>
<Shield className="h-4 w-4 text-green-600" title="Contacto autorizado" />
</div>
) : (
<div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 opacity-60">
<Phone className="h-5 w-5 text-muted-foreground" />
<div className="flex-1">
<p className="text-sm font-medium text-muted-foreground">Teléfono</p>
<p className="text-sm text-muted-foreground">No disponible</p>
</div>
<ShieldOff className="h-4 w-4 text-muted-foreground" title="Contacto no autorizado" />
</div>
)}
</div>
</div>

{/* Note about privacy */}
<div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
<p className="text-sm text-blue-800 dark:text-blue-200">
<strong>Nota:</strong> Solo se muestran los datos de contacto que el usuario ha autorizado compartir públicamente.
</p>
</div>
</div>
</CardContent>
</Card>

{/* Publicaciones del usuario */}
{profile.totalPublications > 0 && (
<Card className="mt-6">
<CardHeader>
<CardTitle className="flex items-center gap-2">
<Building2 className="h-5 w-5" />
Publicaciones del vendedor
</CardTitle>
<CardDescription>
Este vendedor tiene {profile.totalPublications} {profile.totalPublications === 1 ? 'publicación activa' : 'publicaciones activas'}
</CardDescription>
</CardHeader>
<CardContent>
<Link to={`/publications?userId=${profile.id}`}>
<Button variant="outline" className="w-full sm:w-auto">
Ver todas las publicaciones
</Button>
</Link>
</CardContent>
</Card>
)}
</div>
</div>
</div>
);
}

import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useUserProfileStore } from '@/stores/useUserProfileStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/page-header';
import {
Mail,
Phone,
User,
Calendar,
Building2,
ArrowLeft,
Shield,
ShieldOff
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

export default function UserProfile() {
const { userId } = useParams();
const navigate = useNavigate();
const { token } = useAuthStore();
const { profile, loading, error, fetchUserProfile, clearProfile } = useUserProfileStore();
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
const loadProfile = async () => {
if (!userId) {
toast.error('ID de usuario no válido');
navigate('/');
return;
}

try {
setIsLoading(true);
await fetchUserProfile(token, userId);
} catch (error) {
console.error('Error loading profile:', error);
if (error.response?.status === 404) {
toast.error('Usuario no encontrado');
navigate('/');
} else {
toast.error('Error al cargar el perfil del usuario');
}
} finally {
setIsLoading(false);
}
};

loadProfile();

// Limpiar el perfil al desmontar el componente
return () => {
clearProfile();
};
}, [userId, token, fetchUserProfile, clearProfile, navigate]);

if (isLoading || loading) {
return (
<div className="min-h-screen pt-[--header-height] bg-background">
<div className="container mx-auto py-8 px-4">
<div className="max-w-4xl mx-auto">
<Skeleton className="h-8 w-48 mb-6" />
<Card>
<CardHeader>
<div className="flex items-center gap-4">
<Skeleton className="h-20 w-20 rounded-full" />
<div className="space-y-2 flex-1">
<Skeleton className="h-6 w-48" />
<Skeleton className="h-4 w-32" />
</div>
</div>
</CardHeader>
<CardContent>
<div className="space-y-4">
<Skeleton className="h-4 w-full" />
<Skeleton className="h-4 w-3/4" />
<Skeleton className="h-4 w-1/2" />
</div>
</CardContent>
</Card>
</div>
</div>
</div>
);
}

if (error || !profile) {
return (
<div className="min-h-screen pt-[--header-height] bg-background">
<div className="container mx-auto py-8 px-4">
<div className="max-w-4xl mx-auto">
<Card className="border-destructive/50 bg-destructive/10">
<CardHeader>
<CardTitle className="text-destructive">Error al cargar el perfil</CardTitle>
<CardDescription>{error || 'No se pudo cargar el perfil del usuario'}</CardDescription>
</CardHeader>
<CardContent>
<div className="flex gap-4">
<Button variant="outline" onClick={() => navigate(-1)}>
<ArrowLeft className="h-4 w-4 mr-2" />
Volver
</Button>
<Button onClick={() => window.location.reload()}>
Reintentar
</Button>
</div>
</CardContent>
</Card>
</div>
</div>
</div>
);
}

const getInitials = (name) => {
if (!name) return 'U';
const parts = name.split(' ');
if (parts.length >= 2) {
return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
return name.substring(0, 2).toUpperCase();
};

return (
<div className="min-h-screen pt-[--header-height] bg-background">
<div className="container mx-auto py-8 px-4">
<div className="max-w-4xl mx-auto">
{/* Header */}
<div className="mb-6">
<Button
variant="ghost"
onClick={() => navigate(-1)}
className="mb-4"
>
<ArrowLeft className="h-4 w-4 mr-2" />
Volver
</Button>
<PageHeader
title="Perfil de Usuario"
description="Información de contacto del vendedor"
/>
</div>

{/* Profile Card */}
<Card>
<CardHeader>
<div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
<Avatar className="h-24 w-24">
<AvatarImage
src={profile.profilePicture || '/placeholder.svg'}
alt={profile.name}
/>
<AvatarFallback className="text-2xl">
{getInitials(profile.name)}
</AvatarFallback>
</Avatar>
<div className="flex-1">
<div className="flex items-center gap-3 mb-2">
<CardTitle className="text-2xl">{profile.name}</CardTitle>
{profile.totalPublications > 0 && (
<Badge variant="secondary" className="flex items-center gap-1">
<Building2 className="h-3 w-3" />
{profile.totalPublications} {profile.totalPublications === 1 ? 'publicación' : 'publicaciones'}
</Badge>
)}
</div>
{profile.bio && (
<CardDescription className="text-base mt-2">
{profile.bio}
</CardDescription>
)}
{profile.joinDate && (
<div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
<Calendar className="h-4 w-4" />
<span>
Miembro desde {format(new Date(profile.joinDate), 'MMMM yyyy', { locale: es })}
</span>
</div>
)}
</div>
</div>
</CardHeader>
<CardContent>
<div className="space-y-6">
{/* Contact Information */}
<div>
<h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
<User className="h-5 w-5" />
Información de Contacto
</h3>
<div className="space-y-3">
{/* Email - Solo si está autorizado */}
{profile.showEmail && profile.email ? (
<div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
<Mail className="h-5 w-5 text-muted-foreground" />
<div className="flex-1">
<p className="text-sm font-medium text-muted-foreground">Correo electrónico</p>
<a
href={`mailto:${profile.email}`}
className="text-sm text-primary hover:underline"
>
{profile.email}
</a>
</div>
<Shield className="h-4 w-4 text-green-600" title="Contacto autorizado" />
</div>
) : (
<div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 opacity-60">
<Mail className="h-5 w-5 text-muted-foreground" />
<div className="flex-1">
<p className="text-sm font-medium text-muted-foreground">Correo electrónico</p>
<p className="text-sm text-muted-foreground">No disponible</p>
</div>
<ShieldOff className="h-4 w-4 text-muted-foreground" title="Contacto no autorizado" />
</div>
)}

{/* Phone - Solo si está autorizado */}
{profile.showPhone && profile.phone ? (
<div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
<Phone className="h-5 w-5 text-muted-foreground" />
<div className="flex-1">
<p className="text-sm font-medium text-muted-foreground">Teléfono</p>
<a
href={`tel:${profile.phone}`}
className="text-sm text-primary hover:underline"
>
{profile.phone}
</a>
</div>
<Shield className="h-4 w-4 text-green-600" title="Contacto autorizado" />
</div>
) : (
<div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 opacity-60">
<Phone className="h-5 w-5 text-muted-foreground" />
<div className="flex-1">
<p className="text-sm font-medium text-muted-foreground">Teléfono</p>
<p className="text-sm text-muted-foreground">No disponible</p>
</div>
<ShieldOff className="h-4 w-4 text-muted-foreground" title="Contacto no autorizado" />
</div>
)}
</div>
</div>

{/* Note about privacy */}
<div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
<p className="text-sm text-blue-800 dark:text-blue-200">
<strong>Nota:</strong> Solo se muestran los datos de contacto que el usuario ha autorizado compartir públicamente.
</p>
</div>
</div>
</CardContent>
</Card>

{/* Publicaciones del usuario */}
{profile.totalPublications > 0 && (
<Card className="mt-6">
<CardHeader>
<CardTitle className="flex items-center gap-2">
<Building2 className="h-5 w-5" />
Publicaciones del vendedor
</CardTitle>
<CardDescription>
Este vendedor tiene {profile.totalPublications} {profile.totalPublications === 1 ? 'publicación activa' : 'publicaciones activas'}
</CardDescription>
</CardHeader>
<CardContent>
<Link to={`/publications?userId=${profile.id}`}>
<Button variant="outline" className="w-full sm:w-auto">
Ver todas las publicaciones
</Button>
</Link>
</CardContent>
</Card>
)}
</div>
</div>
</div>
);
}