import { Phone, Mail, MapPin, Instagram } from "lucide-react";

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-200 py-10 mt-12">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center md:items-start">
        
        {/* Sección de contacto */}
        <div className="space-y-3 mb-8 md:mb-0">
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-red-500" />
            <span>+54 9 11 2345-6789</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-red-500" />
            <span>lapicada@gmail.com</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-500" />
            <span>Av. Siempre Viva 123, Buenos Aires</span>
          </div>
          <div className="flex items-center gap-2">
            <Instagram className="w-5 h-5 text-red-500" />
            <a
              href="https://www.instagram.com/lapicada_villalugano/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              @lapicada
            </a>
          </div>
        </div>

        {/* Logo y créditos */}
        <div className="text-center md:text-right">
          <div className="flex flex-col items-center md:items-end">
            {/* Logo placeholder */}
            <div className="flex items-center gap-2 mb-2">
              <img
                src="/logo.png" // 👈 después reemplazamos con tu logo de queso
                alt="La Picada"
                className="w-12 h-12"
              />
              <span className="text-2xl font-bold">LA PICADA</span>
            </div>
            <p className="text-sm">
              © {new Date().getFullYear()} Todos los derechos reservados.{" "}
              <a
                href="https://www.linkedin.com/in/lucas-alvarez-bernardez/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-400 hover:underline"
              >
                Desarrollado por Lucas Alvarez
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;