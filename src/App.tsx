import { useState, useMemo } from 'react';
import { Header } from './components/Header';
import Footer from "./components/Footer";
import { ProductCard } from './components/ProductCard';
import { Cart } from './components/Cart';
import { Checkout } from './components/Checkout';
import { OrderSuccess } from './components/OrderSuccess';
import { CategoryFilter } from './components/CategoryFilter';
import { useCart } from './hooks/useCart';
import { useProducts } from './hooks/useProducts';

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderSuccessOpen, setIsOrderSuccessOpen] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
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

  // Obtener categorías únicas (sin mayorista/promo)
  const categories = useMemo(() => {
    if (!products || products.length === 0) return [];
    const uniqueCategories = [...new Set(products.map(product => product.category))];
    return uniqueCategories.filter(cat => cat !== 'mayorista' && cat !== 'promo');
  }, [products]);

  // Filtrar productos por categoría
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (selectedCategory === 'all') {
      return products.filter(p => p.category !== 'mayorista' && p.category !== 'promo');
    }
    return products.filter(product => product.category === selectedCategory);
  }, [selectedCategory, products]);

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderComplete = (orderData: any) => {
    // Generar número de pedido único
    const orderNum = `LP${Date.now().toString().slice(-6)}`;
    setOrderNumber(orderNum);
    
    // Limpiar carrito
    clearCart();
    
    // Mostrar confirmación
    setIsCheckoutOpen(false);
    setIsOrderSuccessOpen(true);
    
    // Aquí podrías enviar el pedido a tu backend/Supabase
    console.log('Nuevo pedido:', { ...orderData, orderNumber: orderNum });
  };

  const handleOrderSuccessClose = () => {
    setIsOrderSuccessOpen(false);
    setOrderNumber('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        cartItemCount={getTotalItems()} 
        onCartClick={() => setIsCartOpen(true)} 
      />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Nuestros Productos</h2>
          <p className="text-gray-600 mb-6">
            Descubre nuestra selección premium de fiambres y embutidos artesanales
          </p>
          
          {categories.length > 0 && (
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          )}
        </div>
        
        {/* Mensajes según estado */}
        {loading && (
          <p className="text-center text-gray-500">Cargando productos...</p>
        )}

        {!loading && filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No hay productos disponibles</p>
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
        onClose={handleOrderSuccessClose}
        orderNumber={orderNumber}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;