import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, Calendar, Settings } from 'lucide-react';
import { ProductForm } from '../components/ProductForm';
import { productService } from '../services/productService';
import type { Product } from '../types';

function AdminPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [formLoading, setFormLoading] = useState(false);

  // Cargar productos
  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getProducts();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Crear nuevo producto
  const handleCreateProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setFormLoading(true);
      await productService.createProduct(productData);
      await loadProducts(); // Recargar lista
      setShowForm(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al crear producto');
    } finally {
      setFormLoading(false);
    }
  };

  // Actualizar producto existente
  const handleUpdateProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    if (!editingProduct) return;
    
    try {
      setFormLoading(true);
      await productService.updateProduct(editingProduct.id, productData);
      await loadProducts(); // Recargar lista
      setEditingProduct(undefined);
      setShowForm(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al actualizar producto');
    } finally {
      setFormLoading(false);
    }
  };

  // Eliminar producto
  const handleDeleteProduct = async (id: number, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar "${name}"?`)) {
      return;
    }

    try {
      await productService.deleteProduct(id);
      await loadProducts(); // Recargar lista
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar producto');
    }
  };

  // Abrir formulario para editar
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  // Cerrar formulario
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(undefined);
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header simplificado para admin */}
      <header className="bg-gray-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings size={32} className="text-blue-400" />
              <div>
                <h1 className="text-2xl font-bold">Panel Administrativo</h1>
                <p className="text-gray-300 text-sm">Gestión de productos</p>
              </div>
            </div>
            
            <nav className="flex space-x-4">
              <a href="/" className="hover:text-blue-400 transition-colors">Ver Tienda</a>
              <a href="/mayorista" className="hover:text-blue-400 transition-colors">Mayorista</a>
              <a href="/promos" className="hover:text-blue-400 transition-colors">Promociones</a>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Panel de Administración</h2>
            <p className="text-gray-600">Gestiona el catálogo de productos</p>
          </div>
          
          <button
            onClick={() => setShowForm(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Nuevo Producto
          </button>
        </div>

        {/* Estados de carga y error */}
        {loading && (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Cargando productos...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadProducts}
              className="mt-2 text-red-600 hover:text-red-800 font-medium"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Tabla de productos */}
        {!loading && !error && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-red-600 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left">Producto</th>
                    <th className="px-4 py-3 text-left">Precio</th>
                    <th className="px-4 py-3 text-left">Categoría</th>
                    <th className="px-4 py-3 text-left">Stock</th>
                    <th className="px-4 py-3 text-left">Estado</th>
                    <th className="px-4 py-3 text-left">Creado</th>
                    <th className="px-4 py-3 text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-medium text-gray-800">{product.name}</p>
                            <p className="text-sm text-gray-500 truncate max-w-xs">
                              {product.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-red-600">
                          ${product.price.toLocaleString()}
                        </span>
                        <span className="text-gray-500 text-sm ml-1">
                          / {product.unit}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="capitalize bg-gray-100 px-2 py-1 rounded text-sm">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <Package size={16} className="mr-1 text-gray-400" />
                          <span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                            {product.stock}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-sm ${
                          product.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar size={14} className="mr-1" />
                          {formatDate(product.created_at)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar producto"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id, product.name)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar producto"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {products.length === 0 && !loading && (
              <div className="text-center py-12">
                <Package size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg">No hay productos registrados</p>
                <p className="text-gray-400">Crea tu primer producto usando el botón "Nuevo Producto"</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Formulario Modal */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          onSave={editingProduct ? handleUpdateProduct : handleCreateProduct}
          onCancel={handleCloseForm}
          isLoading={formLoading}
        />
      )}
    </div>
  );
}

export default AdminPanel;