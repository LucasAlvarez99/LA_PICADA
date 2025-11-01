import React, { useState } from 'react';
import { X, MapPin, User, FileText, Truck, Home } from 'lucide-react';
import type { CartItem, Customer } from '../types';

interface CheckoutProps {
  cartItems: CartItem[];
  totalPrice: number;
  isOpen: boolean;
  onClose: () => void;
  onOrderComplete: (orderData: any) => void;
}

export const Checkout: React.FC<CheckoutProps> = ({
  cartItems,
  totalPrice,
  isOpen,
  onClose,
  onOrderComplete
}) => {
  const [step, setStep] = useState(1); // 1: Datos, 2: Entrega, 3: Confirmación
  const [loading, setLoading] = useState(false);
  
  const [customerData, setCustomerData] = useState<Customer>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    notes: '',
    deliveryMethod: 'delivery',
    deliveryTime: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const finalTotal = totalPrice;

  if (!isOpen) return null;

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!customerData.name.trim()) newErrors.name = 'Nombre es obligatorio';
    if (!customerData.email.trim()) newErrors.email = 'Email es obligatorio';
    if (!customerData.phone.trim()) newErrors.phone = 'Teléfono es obligatorio';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (customerData.deliveryMethod === 'delivery') {
      if (!customerData.address.trim()) newErrors.address = 'Dirección es obligatoria para envío';
      if (!customerData.city.trim()) newErrors.city = 'Ciudad es obligatoria para envío';
      if (!customerData.postalCode.trim()) newErrors.postalCode = 'Código postal es obligatorio';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    setErrors({});
  };

  const handleConfirmOrder = async () => {
    setLoading(true);
    try {
      const orderNumber = `LP${Date.now().toString().slice(-6)}`;
      const orderData = {
        orderNumber,
        customer: customerData,
        items: cartItems.map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          unit: item.product.unit
        })),
        total: totalPrice,
        finalTotal,
        status: 'pending'
      };

      onOrderComplete(orderData);

      // =====================
      // 📲 Generar mensaje WhatsApp
      // =====================
      const pedidoListado = cartItems
        .map(item => `- ${item.product.name} x${item.quantity} (${item.product.unit}) $${(item.product.price * item.quantity).toLocaleString()}`)
        .join('\n');

      const mensaje = `Hola ${customerData.name} bienvenido a LA PICADA

DATOS PERSONALES:
Teléfono: ${customerData.phone}
Mail: ${customerData.email}

Forma de entrega: ${customerData.deliveryMethod === "pickup" ? "Retiro en local" : "Domicilio"}
${customerData.deliveryMethod === "delivery" ? `Dirección: ${customerData.address}, ${customerData.city}` : ""}

PEDIDO:
${pedidoListado}

Direccion del Local: Coronel Martiniano Chilavert 6345, C1439 Cdad. Autónoma de Buenos Aires

Datos de transferencia:
Nombre: Ramon Angel Alvarez
Alias: lapicadavillalugano

Enviar comprobante lo más pronto posible y revisar que los datos sean correctos, comenzaremos la preparación en cuanto recibamos el comprobante. Muchas gracias por confiar, saludos cordiales, LA PICADA`;

      const telefonoTienda = "+5491158683127"; // <-- reemplazar por el nro de WhatsApp real con código país sin "+"
      const url = `https://wa.me/${telefonoTienda}?text=${encodeURIComponent(mensaje)}`;
      window.open(url, "_blank");

      // Resetear formulario
      setStep(1);
      setCustomerData({
        name: '', email: '', phone: '', address: '', city: '', postalCode: '',
        notes: '', deliveryMethod: 'delivery', deliveryTime: ''
      });
      setErrors({});
    } catch (error) {
      alert('Error al procesar el pedido. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof Customer, value: string) => {
    setCustomerData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Datos de Contacto';
      case 2: return 'Método de Entrega';
      case 3: return 'Confirmar Pedido';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Finalizar Compra</h2>
            <p className="text-gray-600">Paso {step} de 3 - {getStepTitle()}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* PASO 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <User size={20} className="mr-2 text-red-600" />
                Datos de Contacto
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={customerData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Juan Pérez"
                  />
                  {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    value={customerData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="11 1234-5678"
                  />
                  {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={customerData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="juan@email.com"
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>
            </div>
          )}

          {/* PASO 2 */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Truck size={20} className="mr-2 text-red-600" />
                Método de Entrega
              </h3>
              <div className="space-y-3">
                <div
                  onClick={() => handleInputChange('deliveryMethod', 'pickup')}
                  className={`border-2 rounded-lg p-4 cursor-pointer ${
                    customerData.deliveryMethod === 'pickup'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Home size={24} />
                    <div className="flex-1">
                      <h4 className="font-medium">Retiro en Local</h4>
                      <p className="text-sm text-gray-600">Coronel Martiniano Chilavert 6345, C1439 Cdad. Autónoma de Buenos Aires</p>
                      <p className="text-xs text-green-600 font-medium">Listo en 2-4 horas</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">GRATIS</p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => handleInputChange('deliveryMethod', 'delivery')}
                  className={`border-2 rounded-lg p-4 cursor-pointer ${
                    customerData.deliveryMethod === 'delivery'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Truck size={24} />
                    <div className="flex-1">
                      <h4 className="font-medium">Envío a Domicilio</h4>
                      <p className="text-sm text-gray-600">Entrega en 24-48 horas</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">PROXIMAMENTE</p>
                    </div>
                  </div>
                </div>
              </div>
{/*        {customerData.deliveryMethod === 'delivery' && (
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 flex items-center">
                    <MapPin size={16} className="mr-2" />
                    Dirección de Entrega
                  </h4>
                  <input
                    type="text"
                    value={customerData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg mb-2"
                    placeholder="Av. Corrientes 1234, Piso 5, Depto B"
                  />
                  <input
                    type="text"
                    value={customerData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg mb-2"
                    placeholder="Ciudad"
                  />
                  <input
                    type="text"
                    value={customerData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Código Postal"
                  />
                </div>
              )}

      */}
              <textarea
                value={customerData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Notas adicionales (ej: nombre de la persona que retira)"
              />
            </div>
          )}

          {/* PASO 3 */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <FileText size={20} className="mr-2 text-red-600" />
                Confirmar Pedido
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm text-gray-700">
                <p><strong>Cliente:</strong> {customerData.name} - {customerData.phone}</p>
                <p><strong>Email:</strong> {customerData.email}</p>
                <p><strong>Entrega:</strong> {customerData.deliveryMethod === 'pickup' ? 'Retiro en local' : 'Envío a domicilio'}</p>
                {customerData.deliveryMethod === 'delivery' && (
                  <>
                    <p><strong>Dirección:</strong> {customerData.address}</p>
                    <p><strong>Ciudad:</strong> {customerData.city} - CP {customerData.postalCode}</p>
                  </>
                )}
                {customerData.notes && <p><strong>Notas:</strong> {customerData.notes}</p>}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <h4 className="font-medium text-gray-800">Productos</h4>
                {cartItems.map(item => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span>{item.product.name} x{item.quantity}</span>
                    <span>${(item.product.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span className="text-red-600">${finalTotal.toLocaleString()}</span>
                </div>
              </div>

              <p className="text-sm font-bold text-gray-800 mt-4">
                Cualquier modificación, hacerlo en el mensaje. 
                El pedido comenzará su preparación luego de recibir el comprobante de pago.  
                Gracias por su compra.  
                Saludos, LA PICADA.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between p-6 border-t bg-gray-50">
          {step > 1 && (
            <button
              onClick={handleBack}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
            >
              Volver
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Continuar
            </button>
          ) : (
            <button
              onClick={handleConfirmOrder}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? 'Procesando...' : 'Enviar Pedido'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
