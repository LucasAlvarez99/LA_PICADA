import React, { useState } from 'react';
import Footer from "../components/Footer";
import { Header } from '../components/Header';
import { ProductCard } from '../components/ProductCard';
import { Cart } from '../components/Cart';
import { Checkout } from '../components/Checkout';
import { OrderSuccess } from '../components/OrderSuccess';
import { useCart } from '../hooks/useCart';
import { useProducts } from '../hooks/useProducts';
import { Truck, Users, Package } from 'lucide-react';

function Mayorista() {
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

  // Filtrar solo productos mayoristas
  const mayoristaProducts = products.filter(product => product.category === 'mayorista');

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
    console.log('Nuevo pedido mayorista:', { ...orderData, orderNumber: orderNum });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        cartItemCount={getTotalItems()} 
        onCartClick={() => setIsCartOpen(true)} 
      />
      
      {/* Hero Section Mayorista */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-white bg-opacity-20 p-4 rounded-full">
              <Truck size={48} />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Ventas Mayoristas</h1>
          <p className="text-xl text-blue-100 mb-6 max-w-2xl mx-auto">
            Precios especiales para revendedores, restaurantes y comercios. 
            Calidad premium en grandes volúmenes.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white bg-opacity-10 p-6 rounded-lg">
              <Users size={32} className="mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Para Comercios</h3>
              <p className="text-blue-100 text-sm">Abastece tu negocio con productos de calidad</p>
            </div>
            <div className="bg-white bg-opacity-10 p-6 rounded-lg">
              <Package size={32} className="mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Grandes Volúmenes</h3>
              <p className="text-blue-100 text-sm">Hormas completas y pallets disponibles</p>
            </div>
            
          </div>
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Productos Mayoristas</h2>
          <p className="text-gray-600 mb-6">
            Productos especiales para revendedores y comercios
          </p>
        </div>
        
        {loading && (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Cargando productos mayoristas...</p>
          </div>
        )}

        {!loading && mayoristaProducts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mayoristaProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        )}

        {!loading && mayoristaProducts.length === 0 && (
          <div className="text-center py-12">
            <Package size={64} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">No hay productos mayoristas disponibles</p>
            <p className="text-gray-400">Los productos se cargarán desde el panel administrativo</p>
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

export default Mayorista;