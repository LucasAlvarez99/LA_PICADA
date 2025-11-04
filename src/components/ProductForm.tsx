import React, { useState } from 'react';
import { Save, X, Upload, Image } from 'lucide-react';
import type { Product } from '../types';

interface ProductFormProps {
  product?: Product;
  onSave: (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onSave,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    image: product?.image || '', // Ahora será base64
    unit: product?.unit || 'kg',
    category: product?.category || 'embutidos',
    stock: product?.stock || 0,
    is_active: product?.is_active ?? true
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(product?.image || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [
    { value: 'jamones', label: 'Jamones' },
    { value: 'crudos', label: 'Crudos' },
    //{ value: 'tacho', label: 'Tacho' }, agregar si es necesario
    { value: 'embutidos', label: 'Embutidos' },
    { value: 'encurtidos', label: 'Encurtidos' },
    { value: 'panificados', label: 'Panificados' },
    { value: 'snacks', label: 'Snacks' },
    { value: 'lacteos', label: 'Lácteos' },
    { value: 'dulces', label: 'Dulces' },
    { value: 'congelados', label: 'Congelados' },
    { value: 'bebidas', label: 'Bebidas' },
    { value: 'quesosduros', label: 'Quesos Duros' },
    { value: 'quesosblandos', label: 'Quesos Blados' },
    { value: 'bondiola', label: 'Bondiola' },
    { value: 'lomo', label: 'Lomo' },
    { value: 'matambre', label: 'Matambre' },
    { value: 'panceta', label: 'Panceta' },
    { value: 'pastron', label: 'Pastron' },
    { value: 'salames', label: 'Salames' },
    { value: 'salchichon', label: 'Salchichón' },
    { value: 'quesodecerdo', label: 'Queso de cerdo' },
    { value: 'salamines', label: 'Salamines' },
    { value: 'quesobarras', label: 'Quesos barras' },
    { value: 'roquefort', label: 'Roquefort' },
    { value: 'provoleta', label: 'Provoleta' },
    { value: 'quesossemiblandos', label: 'Quesos semi blandos' },
    { value: 'otros', label: 'Otros' },
    { value: 'mayorista', label: 'Mayorista' },
    { value: 'promo', label: 'Promociones' }
  ];

  const units = [
    { value: 'kg', label: 'Kilogramo' },
    { value: 'g', label: 'Gramo' },
    { value: 'unidad', label: 'Unidad' },
    { value: 'pack', label: 'Pack' },
    { value: 'horma', label: 'Horma' },
    { value: 'pallet', label: 'Pallet' },
    { value: 'combo', label: 'Combo' }
  ];

  // Manejar selección de archivo de imagen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, image: 'Por favor selecciona un archivo de imagen válido' }));
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: 'La imagen debe ser menor a 5MB' }));
      return;
    }

    setImageFile(file);

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      setFormData(prev => ({ ...prev, image: result }));
      // Limpiar error de imagen
      setErrors(prev => ({ ...prev, image: '' }));
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es obligatoria';
    }
    if (formData.price <= 0) {
      newErrors.price = 'El precio debe ser mayor a 0';
    }
    if (!formData.image) {
      newErrors.image = 'La imagen es obligatoria';
    }
    if (formData.stock < 0) {
      newErrors.stock = 'El stock no puede ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error al guardar producto:', error);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-semibold">
            {product ? 'Editar Producto' : 'Nuevo Producto'}
          </h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Producto *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: Jamón Serrano Premium"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Describe las características del producto..."
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          {/* Precio y Unidad */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio *
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => handleChange('price', Number(e.target.value))}
                min="0"
                step="0.01"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unidad
              </label>
              <select
                value={formData.unit}
                onChange={(e) => handleChange('unit', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                {units.map(unit => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Categoría y Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => handleChange('stock', Number(e.target.value))}
                min="0"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                  errors.stock ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0"
              />
              {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock}</p>}
            </div>
          </div>

          {/* Carga de Imagen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Imagen del Producto *
            </label>
            
            <div className="space-y-3">
              {/* Input de archivo */}
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className={`w-full border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors flex flex-col items-center justify-center hover:bg-gray-50 ${
                    errors.image ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <Upload size={32} className="text-gray-400 mb-2" />
                  <p className="text-gray-600 text-center">
                    <span className="font-medium">Haz clic para subir</span> o arrastra una imagen aquí
                  </p>
                  <p className="text-gray-400 text-sm mt-1">PNG, JPG, JPEG hasta 5MB</p>
                </label>
              </div>

              {/* Preview de imagen */}
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview('');
                      setFormData(prev => ({ ...prev, image: '' }));
                      setImageFile(null);
                    }}
                    className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
            
            {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
          </div>

          {/* Estado Activo */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => handleChange('is_active', e.target.checked)}
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
              Producto activo (visible en la tienda)
            </label>
          </div>

          {/* Botones */}
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:bg-gray-400 flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  {product ? 'Actualizar' : 'Crear Producto'}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};