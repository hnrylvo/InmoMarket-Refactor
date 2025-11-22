import { Link } from "react-router-dom"

export default function Footer() {
  return (
    <footer className="bg-green-50 dark:bg-secondary text-secondary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-green-800 dark:text-secondary-foreground">InmoMarket</h3>
            <p className="text-green-600 dark:text-muted-foreground text-sm">
              Tu aliado confiable en el mercado inmobiliario.
            </p>
            <p className="text-xs text-green-500 dark:text-muted-foreground/70">
              © 2025 InmoMarket. Todos los derechos reservados.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-green-800 dark:text-secondary-foreground">Navegación</h4>
            <ul className="space-y-2 text-sm text-green-600 dark:text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-green-800 dark:hover:text-foreground transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/publications" className="hover:text-green-800 dark:hover:text-foreground transition-colors">
                  Explorar Propiedades
                </Link>
              </li>
              <li>
                <Link to="/my-publications/create" className="hover:text-green-800 dark:hover:text-foreground transition-colors">
                  Publicar Propiedad
                </Link>
              </li>
              <li>
                <Link to="/favorites" className="hover:text-green-800 dark:hover:text-foreground transition-colors">
                  Favoritos
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-green-800 dark:text-secondary-foreground">Cuenta</h4>
            <ul className="space-y-2 text-sm text-green-600 dark:text-muted-foreground">
              <li>
                <Link to="/settings" className="hover:text-green-800 dark:hover:text-foreground transition-colors">
                  Configuraciones
                </Link>
              </li>
              <li>
                <Link to="/notifications" className="hover:text-green-800 dark:hover:text-foreground transition-colors">
                  Notificaciones
                </Link>
              </li>
              <li>
                <Link to="/visits" className="hover:text-green-800 dark:hover:text-foreground transition-colors">
                  Visitas
                </Link>
              </li>
              <li>
                <Link to="/reportes" className="hover:text-green-800 dark:hover:text-foreground transition-colors">
                  Reportes
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
