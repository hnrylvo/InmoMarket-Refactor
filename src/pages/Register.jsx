import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { FcGoogle } from "react-icons/fc"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import { authService } from "@/services/authService"

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const validatePhone = (phone) => {
    if (!phone) return true; // Phone is optional
    return /^\+?[1-9]\d{1,14}$/.test(phone);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error("Por favor completa todos los campos");
      setIsLoading(false);
      return;
    }

    if (!validateEmail(formData.email)) {
      toast.error("Por favor ingresa un email válido");
      setIsLoading(false);
      return;
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      toast.error("Por favor ingresa un número de teléfono válido");
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      setIsLoading(false);
      return;
    }

    try {
      await authService.signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phone || undefined
      });

      toast.success("¡Registro exitoso!");
      navigate("/login");
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || "Error al registrar usuario");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-white dark:bg-zinc-900 text-black dark:text-white">
      {/* Left Section: Register Form */}
      <div className="flex flex-1 items-center justify-center bg-gray-100 dark:bg-zinc-800 p-4">
        <Card className="w-full max-w-md p-6 bg-white dark:bg-zinc-900">
          <h2 className="text-2xl font-bold mb-4">Regístrate</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Nombre completo</Label>
              <Input 
                type="text" 
                name="name"
                placeholder="Juan Perez" 
                value={formData.name}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>
            <div>
              <Label>Correo</Label>
              <Input 
                type="email" 
                name="email"
                placeholder="you@example.com" 
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>
            <div>
              <Label>Contraseña</Label>
              <Input 
                type="password" 
                name="password"
                placeholder="••••••••" 
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>
            <div>
              <Label>Repetir Contraseña</Label>
              <Input 
                type="password" 
                name="confirmPassword"
                placeholder="••••••••" 
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>
            <div>
              <Label>Número</Label>
              <Input 
                type="text" 
                name="phone"
                placeholder="+xxxxxxxxxx" 
                value={formData.phone}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="terms" 
                className="h-4 w-4" 
                required
                disabled={isLoading}
              />
              <Label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-300">
                Acepto los{" "}
                <a href="/terms" className="text-blue-500 dark:text-blue-400">
                  términos y condiciones
                </a>
              </Label>
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Registrando..." : "Registrar"}
            </Button>
          </form>
        </Card>
      </div>

      {/* Right Section: Logo and Info */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white dark:bg-zinc-900 p-4">
        <div className="bg-transparent dark:bg-white rounded-full p-4 mb-4">
          <img
            src="/images/inmomarket-logo-nobg.png"
            alt="InmoMarket Logo"
            className="w-24 h-24 md:w-32 md:h-32"
          />
        </div>
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">
            El mejor lugar para encontrar o vender tu casa.
          </p>
        </div>
      </div>
    </div>
  )
}
