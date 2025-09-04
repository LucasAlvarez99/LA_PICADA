import React from 'react';
import { ShoppingCart, Beef } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface HeaderProps {
  cartItemCount: number;
  onCartClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ cartItemCount, onCartClick }) => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-red-800 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          
          {/* Logo y título */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity">
            <Beef size={32} className="text-yellow-400" />
            <div>
              <h1 className="text-2xl font-bold">La Picada</h1>
              <p className="text-red-200 text-sm">Los mejores fiambres y embutidos</p>
            </div>
          </Link>

          {/* Links de navegación */}
          <nav className="hidden md:flex space-x-6 text-lg font-medium">
            <Link 
              to="/" 
              className={`hover:text-yellow-400 transition-colors ${
                isActive('/') ? 'text-yellow-400 border-b-2 border-yellow-400 pb-1' : ''
              }`}
            >
              Inicio
            </Link>
            <Link 
              to="/mayorista" 
              className={`hover:text-yellow-400 transition-colors ${
                isActive('/mayorista') ? 'text-yellow-400 border-b-2 border-yellow-400 pb-1' : ''
              }`}
            >
              Mayorista
            </Link>
            <Link 
              to="/promos" 
              className={`hover:text-yellow-400 transition-colors ${
                isActive('/promos') ? 'text-yellow-400 border-b-2 border-yellow-400 pb-1' : ''
              }`}
            >
              Promociones
            </Link>
          </nav>
          
          {/* Botón carrito */}
          <button
            onClick={onCartClick}
            className="relative bg-red-700 hover:bg-red-600 p-3 rounded-lg transition-colors"
          >
            <ShoppingCart size={24} />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-yellow-400 text-red-800 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>

        {/* Navegación móvil */}
        <nav className="md:hidden mt-4 flex space-x-4 text-sm">
          <Link 
            to="/" 
            className={`hover:text-yellow-400 transition-colors ${
              isActive('/') ? 'text-yellow-400' : ''
            }`}
          >
            Inicio
          </Link>
          <Link 
            to="/mayorista" 
            className={`hover:text-yellow-400 transition-colors ${
              isActive('/mayorista') ? 'text-yellow-400' : ''
            }`}
          >
            Mayorista
          </Link>
          <Link 
            to="/promos" 
            className={`hover:text-yellow-400 transition-colors ${
              isActive('/promos') ? 'text-yellow-400' : ''
            }`}
          >
            Promos
          </Link>
        </nav>
      </div>
    </header>
  );
};