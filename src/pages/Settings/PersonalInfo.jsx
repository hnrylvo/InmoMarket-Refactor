import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/useAuthStore";
import { userService } from "@/services/userService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

const PersonalInfo = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [removeProfilePicture, setRemoveProfilePicture] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const fileInputRef = useRef(null);
  const { token, login } = useAuthStore();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await userService.getProfile(token);
        setProfile(data);
        setEditedProfile(data);
        setPreviewUrl(data.profilePicture);
      } catch (error) {
        toast.error("Error al cargar el perfil.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProfile();
    }
  }, [token]);

  const handleEditToggle = () => {
    if (isEditing) {
      setEditedProfile(profile);
      setProfilePictureFile(null);
      setRemoveProfilePicture(false);
      setPreviewUrl(profile.profilePicture);
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePictureFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setRemoveProfilePicture(false);
    }
  };

  const handleSave = async () => {
    const formData = new FormData();
    formData.append("name", editedProfile.name);
    formData.append("email", editedProfile.email);
    formData.append("phoneNumber", editedProfile.phoneNumber);
    formData.append("removeProfilePicture", removeProfilePicture);
    if (profilePictureFile) {
      formData.append("profilePicture", profilePictureFile);
    }

    try {
      setLoading(true);
      const updatedProfile = await userService.updateProfile(token, formData);
      setProfile(updatedProfile);
      setEditedProfile(updatedProfile);
      setPreviewUrl(updatedProfile.profilePicture);
      
      // Update zustand store
      const oldState = useAuthStore.getState();
      login(oldState.token, { ...oldState, ...updatedProfile});

      setIsEditing(false);
      setProfilePictureFile(null);
      toast.success("Perfil actualizado con éxito.");
    } catch (error) {
      toast.error("Error al actualizar el perfil.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return (
        <Card>
          <CardHeader className="flex flex-row items-center space-x-4">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-full" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-full" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-full" />
            </div>
          </CardContent>
        </Card>
    );
  }

  if (!profile) {
    return <div>No se encontraron datos del perfil.</div>;
  }
  
  const readOnlyFields = {
    "Miembro desde": new Date(profile.createdAt).toLocaleDateString(),
    "Última actualización": new Date(profile.updatedAt).toLocaleDateString(),
  }

  return (
    <div className="space-y-6">
       <Card>
        <CardHeader>
            <div className="flex justify-between items-start">
                <div className="flex items-center space-x-4">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={previewUrl} alt={profile.name} />
                        <AvatarFallback>{profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                    </Avatar>
                     <div>
                        <CardTitle className="text-2xl">{profile.name}</CardTitle>
                        <p className="text-muted-foreground">{profile.email}</p>
                    </div>
                </div>
                {!isEditing && <Button onClick={handleEditToggle}>Editar Perfil</Button>}
            </div>
        </CardHeader>
        <CardContent className="space-y-4">
            {isEditing ? (
                <>
                    <div className="space-y-2">
                        <Label htmlFor="profilePicture">Foto de perfil</Label>
                        <Input id="profilePicture" type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="hidden"/>
                        <Button onClick={() => fileInputRef.current.click()} variant="outline">Cambiar foto</Button>
                        <div className="flex items-center space-x-2 mt-2">
                            <Switch id="removeProfilePicture" checked={removeProfilePicture} onCheckedChange={setRemoveProfilePicture} />
                            <Label htmlFor="removeProfilePicture">Eliminar foto de perfil</Label>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre</Label>
                        <Input id="name" name="name" value={editedProfile.name || ""} onChange={handleInputChange} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="email">Correo electrónico</Label>
                        <Input id="email" name="email" type="email" value={editedProfile.email || ""} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Número de teléfono</Label>
                        <Input id="phoneNumber" name="phoneNumber" value={editedProfile.phoneNumber || ""} onChange={handleInputChange} />
                    </div>
                </>
            ) : (
                <>
                    <div>
                        <Label>Nombre</Label>
                        <p className="text-sm text-foreground">{profile.name}</p>
                    </div>
                    <div>
                        <Label>Correo electrónico</Label>
                        <p className="text-sm text-foreground">{profile.email}</p>
                    </div>
                     <div>
                        <Label>Número de teléfono</Label>
                        <p className="text-sm text-foreground">{profile.phoneNumber || "No proporcionado"}</p>
                    </div>
                </>
            )}
            {Object.entries(readOnlyFields).map(([label, value]) => (
                <div key={label}>
                    <Label>{label}</Label>
                    <p className="text-sm text-muted-foreground">{value}</p>
                </div>
            ))}
        </CardContent>
        {isEditing && (
            <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleEditToggle} disabled={loading}>Cancelar</Button>
                <Button onClick={handleSave} disabled={loading}>
                    {loading ? "Guardando..." : "Guardar Cambios"}
                </Button>
            </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default PersonalInfo;
