import React, { useState } from 'react';
import Footer from "../components/Footer";
import { Header } from '../components/Header';
import { ProductCard } from '../components/ProductCard';
import { Cart } from '../components/Cart';
import { Checkout } from '../components/Checkout';
import { OrderSuccess } from '../components/OrderSuccess';
import { useCart } from '../hooks/useCart';
import { useProducts } from '../hooks/useProducts';
import { Gift, Star, Clock, Percent } from 'lucide-react';

function Promos() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderSuccessOpen, setIsOrderSuccessOpen] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  
  const {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    getTotalPrice,
    getTotalItems,
    clearCart
  } = useCart();

  const { products, loading } = useProducts();

  // Filtrar solo productos en promoción
  const promoProducts = products.filter(product => product.category === 'promo');

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderComplete = (orderData: any) => {
    const orderNum = `LP${Date.now().toString().slice(-6)}`;
    setOrderNumber(orderNum);
    clearCart();
    setIsCheckoutOpen(false);
    setIsOrderSuccessOpen(true);
    console.log('Nuevo pedido promo:', { ...orderData, orderNumber: orderNum });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        cartItemCount={getTotalItems()} 
        onCartClick={() => setIsCartOpen(true)} 
      />
      
      {/* Hero Section Promociones */}
      <div className="bg-gradient-to-r from-orange-800 to-red-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-white bg-opacity-20 p-4 rounded-full">
              <Gift size={48} />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Promociones Especiales</h1>
          <p className="text-xl text-orange-100 mb-6 max-w-2xl mx-auto">
            Ofertas irresistibles y combos únicos. 
            ¡Aprovecha estos precios especiales por tiempo limitado!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white bg-opacity-10 p-6 rounded-lg">
              <Percent size={32} className="mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Descuentos Únicos</h3>
              <p className="text-orange-100 text-sm">Hasta 30% off en productos seleccionados</p>
            </div>
            <div className="bg-white bg-opacity-10 p-6 rounded-lg">
              <Star size={32} className="mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Combos Premium</h3>
              <p className="text-orange-100 text-sm">Packs especiales con productos complementarios</p>
            </div>
            <div className="bg-white bg-opacity-10 p-6 rounded-lg">
              <Clock size={32} className="mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Tiempo Limitado</h3>
              <p className="text-orange-100 text-sm">Ofertas que cambian semanalmente</p>
            </div>
          </div>
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Ofertas Activas</h2>
          <p className="text-gray-600 mb-6">
            Combos y promociones especiales con precios únicos
          </p>
        </div>
        
        {loading && (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Cargando promociones...</p>
          </div>
        )}

        {!loading && promoProducts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promoProducts.map((product) => (
              <div key={product.id} className="relative">
                {/* Badge de promoción */}
                <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold z-10">
                  PROMO
                </div>
                <ProductCard
                  product={product}
                  onAddToCart={addToCart}
                />
              </div>
            ))}
          </div>
        )}

        {!loading && promoProducts.length === 0 && (
          <div className="text-center py-12">
            <Gift size={64} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">No hay promociones disponibles</p>
            <p className="text-gray-400">Las promociones se cargarán desde el panel administrativo</p>
          </div>
        )}
      </main>

      <Cart
        cartItems={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onClearCart={clearCart}
        totalPrice={getTotalPrice()}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={handleCheckout}
      />

      <Checkout
        cartItems={cartItems}
        totalPrice={getTotalPrice()}
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderComplete={handleOrderComplete}
      />

      <OrderSuccess
        isOpen={isOrderSuccessOpen}
        onClose={() => setIsOrderSuccessOpen(false)}
        orderNumber={orderNumber}
      /> 
      {/* Footer */}
      <Footer />
    </div>
   
  );
}

export default Promos;