import React, { useState, useEffect } from 'react';
import { X, CreditCard, Banknote, Smartphone, MapPin, User, Mail, Phone, FileText, Truck, Home, Clock, Gift } from 'lucide-react';
import { processTransferPayment, processMercadoPagoPayment, calculateDeliveryFee, calculateDiscount } from '../services/paymentService';
import { sendWhatsAppNotification } from '../services/whatsappService';
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
  const [step, setStep] = useState(1); // 1: Datos, 2: Entrega, 3: Pago, 4: Confirmación
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

  const [paymentMethod, setPaymentMethod] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Cálculos automáticos
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [finalTotal, setFinalTotal] = useState(totalPrice);

  const paymentMethods = [
    { 
      id: 'mercadopago', 
      name: 'MercadoPago', 
      icon: CreditCard, 
      description: 'Tarjeta, transferencia o efectivo',
      popular: true
    },
    { 
      id: 'transferencia', 
      name: 'Transferencia Directa', 
      icon: Smartphone, 
      description: 'Transferencia bancaria inmediata' 
    },
    { 
      id: 'efectivo', 
      name: 'Efectivo', 
      icon: Banknote, 
      description: 'Pago contra entrega' 
    }
  ];

  const deliveryTimes = [
    { value: 'morning', label: 'Mañana (9:00 - 13:00)' },
    { value: 'afternoon', label: 'Tarde (13:00 - 18:00)' },
    { value: 'evening', label: 'Noche (18:00 - 21:00)' },
    { value: 'flexible', label: 'Horario flexible' }
  ];

  // Recalcular totales cuando cambian los datos
  useEffect(() => {
    if (customerData.deliveryMethod === 'delivery' && customerData.city) {
      const fee = calculateDeliveryFee(customerData.city, totalPrice);
      setDeliveryFee(fee);
    } else {
      setDeliveryFee(0);
    }

    const discountAmount = calculateDiscount(totalPrice, cartItems.length);
    setDiscount(discountAmount);
    
    setFinalTotal(totalPrice + deliveryFee - discountAmount);
  }, [customerData.deliveryMethod, customerData.city, totalPrice, cartItems.length, deliveryFee]);

  if (!isOpen) return null;

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!customerData.name.trim()) newErrors.name = 'Nombre es obligatorio';
    if (!customerData.email.trim()) newErrors.email = 'Email es obligatorio';
    if (!customerData.phone.trim()) newErrors.phone = 'Teléfono es obligatorio';

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (customerData.email && !emailRegex.test(customerData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Validar teléfono argentino
    const phoneRegex = /^(\+54|54|0)?[1-9]\d{8,9}$/;
    if (customerData.phone && !phoneRegex.test(customerData.phone.replace(/\s|-/g, ''))) {
      newErrors.phone = 'Teléfono inválido (ej: 11 1234-5678)';
    }

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

  const validateStep3 = () => {
    if (!paymentMethod) {
      setErrors({ payment: 'Selecciona un método de pago' });
      return false;
    }
    setErrors({});
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    } else if (step === 3 && validateStep3()) {
      setStep(4);
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
        deliveryFee,
        discount,
        finalTotal,
        paymentMethod,
        paymentStatus: 'pending'
      };

      // Procesar pago según método
      if (paymentMethod === 'transferencia') {
        const paymentResult = await processTransferPayment({
          amount: finalTotal,
          description: `Pedido #${orderNumber}`,
          customerEmail: customerData.email,
          orderNumber
        });
        
        if (paymentResult.success) {
          // Mostrar datos bancarios y abrir app de transferencia
          alert(paymentResult.instructions);
        }
      } else if (paymentMethod === 'mercadopago') {
        const paymentResult = await processMercadoPagoPayment({
          amount: finalTotal,
          description: `Pedido La Picada #${orderNumber}`,
          customerEmail: customerData.email,
          orderNumber
        });
        
        if (paymentResult.success) {
          // Abrir MercadoPago en nueva ventana
          window.open(paymentResult.checkoutUrl, '_blank');
        }
      }

      // Enviar notificación por WhatsApp
      await sendWhatsAppNotification(orderData);
      
      // Completar pedido
      onOrderComplete({
        ...orderData,
        status: 'pending'
      });
      
      // Reset form
      setStep(1);
      setCustomerData({
        name: '', email: '', phone: '', address: '', city: '', postalCode: '', 
        notes: '', deliveryMethod: 'delivery', deliveryTime: ''
      });
      setPaymentMethod('');
      setErrors({});
      
    } catch (error) {
      alert('Error al procesar el pedido. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof Customer, value: string) => {
    setCustomerData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Datos de Contacto';
      case 2: return 'Método de Entrega';
      case 3: return 'Método de Pago';
      case 4: return 'Confirmar Pedido';
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
            <p className="text-gray-600">Paso {step} de 4 - {getStepTitle()}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center">
            {[1, 2, 3, 4].map((stepNum) => (
              <React.Fragment key={stepNum}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  stepNum <= step ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 4 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    stepNum < step ? 'bg-red-600' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs">
            <span className={step >= 1 ? 'text-red-600 font-medium' : 'text-gray-500'}>
              Contacto
            </span>
            <span className={step >= 2 ? 'text-red-600 font-medium' : 'text-gray-500'}>
              Entrega
            </span>
            <span className={step >= 3 ? 'text-red-600 font-medium' : 'text-gray-500'}>
              Pago
            </span>
            <span className={step >= 4 ? 'text-red-600 font-medium' : 'text-gray-500'}>
              Confirmar
            </span>
          </div>
        </div>

        <div className="p-6">
          {/* PASO 1: Datos del Cliente */}
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
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Juan Pérez"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    value={customerData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="11 1234-5678"
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
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
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="juan@email.com"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
            </div>
          )}

          {/* PASO 2: Método de Entrega */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Truck size={20} className="mr-2 text-red-600" />
                Método de Entrega
              </h3>

              {/* Opciones de entrega */}
              <div className="space-y-3">
                <div
                  onClick={() => handleInputChange('deliveryMethod', 'pickup')}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                    customerData.deliveryMethod === 'pickup'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Home size={24} className={
                      customerData.deliveryMethod === 'pickup' ? 'text-red-600' : 'text-gray-600'
                    } />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">Retiro en Local</h4>
                      <p className="text-sm text-gray-600">Gratis - Av. Corrientes 1234, CABA</p>
                      <p className="text-xs text-green-600 font-medium">Listo en 2-4 horas</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">GRATIS</p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => handleInputChange('deliveryMethod', 'delivery')}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                    customerData.deliveryMethod === 'delivery'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Truck size={24} className={
                      customerData.deliveryMethod === 'delivery' ? 'text-red-600' : 'text-gray-600'
                    } />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">Envío a Domicilio</h4>
                      <p className="text-sm text-gray-600">Entrega en 24-48 horas</p>
                      {totalPrice >= 15000 && (
                        <p className="text-xs text-green-600 font-medium">¡Envío gratis por compra mayor a $15,000!</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">
                        {deliveryFee === 0 ? 'GRATIS' : `$${deliveryFee.toLocaleString()}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Datos de envío (solo si es delivery) */}
              {customerData.deliveryMethod === 'delivery' && (
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 flex items-center">
                    <MapPin size={16} className="mr-2" />
                    Dirección de Entrega
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dirección Completa *
                      </label>
                      <input
                        type="text"
                        value={customerData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                          errors.address ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Av. Corrientes 1234, Piso 5, Depto B"
                      />
                      {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ciudad *
                      </label>
                      <input
                        type="text"
                        value={customerData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                          errors.city ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Buenos Aires"
                      />
                      {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Código Postal *
                      </label>
                      <input
                        type="text"
                        value={customerData.postalCode}
                        onChange={(e) => handleInputChange('postalCode', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                          errors.postalCode ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="1234"
                      />
                      {errors.postalCode && <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>}
                    </div>
                  </div>

                  {/* Horario de entrega */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Horario Preferido
                    </label>
                    <select
                      value={customerData.deliveryTime}
                      onChange={(e) => handleInputChange('deliveryTime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="">Seleccionar horario...</option>
                      {deliveryTimes.map(time => (
                        <option key={time.value} value={time.value}>
                          {time.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Notas adicionales */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas Adicionales
                </label>
                <textarea
                  value={customerData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Instrucciones especiales, referencias del domicilio, etc."
                />
              </div>
            </div>
          )}

          {/* PASO 3: Método de Pago */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <CreditCard size={20} className="mr-2 text-red-600" />
                Método de Pago
              </h3>

              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const IconComponent = method.icon;
                  return (
                    <div
                      key={method.id}
                      onClick={() => {
                        setPaymentMethod(method.id);
                        setErrors(prev => ({ ...prev, payment: '' }));
                      }}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md relative ${
                        paymentMethod === method.id
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {method.popular && (
                        <div className="absolute -top-2 left-4 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                          MÁS ELEGIDO
                        </div>
                      )}
                      <div className="flex items-center space-x-3">
                        <IconComponent size={24} className={
                          paymentMethod === method.id ? 'text-red-600' : 'text-gray-600'
                        } />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800">{method.name}</h4>
                          <p className="text-sm text-gray-600">{method.description}</p>
                        </div>
                        {paymentMethod === method.id && (
                          <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {errors.payment && <p className="text-red-500 text-sm">{errors.payment}</p>}

              {/* Información adicional según método de pago */}
              {paymentMethod === 'transferencia' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <h4 className="font-medium text-blue-800 mb-2">💳 Transferencia Bancaria:</h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p><strong>Banco:</strong> Banco Nación</p>
                    <p><strong>Alias:</strong> FIAMBRES.LA.PICADA</p>
                    <p><strong>CBU:</strong> 0110599520000012345678</p>
                    <p className="text-xs mt-2 text-blue-600">
                      💡 Te redirigiremos a tu app bancaria para transferir automáticamente
                    </p>
                  </div>
                </div>
              )}

              {paymentMethod === 'mercadopago' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <h4 className="font-medium text-blue-800 mb-2">💙 MercadoPago:</h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p>• Tarjeta de débito/crédito</p>
                    <p>• Transferencia desde tu banco</p>
                    <p>• Efectivo (Rapipago, Pago Fácil)</p>
                    <p>• Dinero en cuenta de MercadoPago</p>
                    <p className="text-xs mt-2 text-blue-600">
                      💡 Serás redirigido a MercadoPago para completar el pago
                    </p>
                  </div>
                </div>
              )}

              {paymentMethod === 'efectivo' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                  <h4 className="font-medium text-green-800 mb-2">💵 Pago en Efectivo:</h4>
                  <p className="text-sm text-green-700">
                    El pago se realizará contra entrega. 
                    {customerData.deliveryMethod === 'pickup' 
                      ? ' Paga cuando retires en nuestro local.'
                      : ' Nuestro repartidor cobrará al entregar.'
                    }
                  </p>
                </div>
              )}
            </div>
          )}

          {/* PASO 4: Confirmación */}
          {step === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <FileText size={20} className="mr-2 text-red-600" />
                Confirmar Pedido
              </h3>

              {/* Resumen del Cliente */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                  <User size={16} className="mr-2" />
                  Datos del Cliente
                </h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Nombre:</strong> {customerData.name}</p>
                  <p><strong>Email:</strong> {customerData.email}</p>
                  <p><strong>Teléfono:</strong> {customerData.phone}</p>
                </div>
              </div>

              {/* Método de Entrega */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                  <Truck size={16} className="mr-2" />
                  Entrega
                </h4>
                <div className="text-sm text-gray-600 space-y-1">
                  {customerData.deliveryMethod === 'pickup' ? (
                    <>
                      <p><strong>Método:</strong> Retiro en local</p>
                      <p><strong>Dirección:</strong> Av. Corrientes 1234, CABA</p>
                      <p><strong>Horario:</strong> Lunes a Sábado 9:00 - 19:00</p>
                    </>
                  ) : (
                    <>
                      <p><strong>Método:</strong> Envío a domicilio</p>
                      <p><strong>Dirección:</strong> {customerData.address}</p>
                      <p><strong>Ciudad:</strong> {customerData.city} - CP: {customerData.postalCode}</p>
                      {customerData.deliveryTime && (
                        <p><strong>Horario:</strong> {deliveryTimes.find(t => t.value === customerData.deliveryTime)?.label}</p>
                      )}
                    </>
                  )}
                  {customerData.notes && <p><strong>Notas:</strong> {customerData.notes}</p>}
                </div>
              </div>

              {/* Resumen de Productos */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-3">Productos</h4>
                <div className="space-y-2">
                  {cartItems.map((item) => (
                    <div key={item.product.id} className="flex justify-between text-sm">
                      <span>{item.product.name} x{item.quantity} {item.product.unit}</span>
                      <span className="font-medium">
                        ${(item.product.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  
                  <div className="border-t pt-2 mt-3 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>${totalPrice.toLocaleString()}</span>
                    </div>
                    
                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span className="flex items-center">
                          <Gift size={14} className="mr-1" />
                          Descuento ({cartItems.length >= 5 ? '10%' : '5%'}):
                        </span>
                        <span>-${discount.toLocaleString()}</span>
                      </div>
                    )}
                    
                    {deliveryFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Envío:</span>
                        <span>${deliveryFee.toLocaleString()}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span className="text-red-600">${finalTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Método de Pago */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">Método de Pago</h4>
                <p className="text-sm text-gray-600 capitalize">
                  {paymentMethods.find(m => m.id === paymentMethod)?.name}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer con botones */}
        <div className="flex justify-between p-6 border-t bg-gray-50">
          <div>
            {step > 1 && (
              <button
                onClick={handleBack}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Volver
              </button>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            
            {step < 4 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Continuar
              </button>
            ) : (
              <button
                onClick={handleConfirmOrder}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 flex items-center"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Procesando...
                  </>
                ) : (
                  'Confirmar Pedido'
                )}
              </button>
            )}
          </div>
        </div>

        {/* Resumen flotante del total */}
        {step > 1 && (
          <div className="sticky bottom-0 bg-white border-t p-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">Total a pagar:</span>
              <span className="text-2xl font-bold text-red-600">
                ${finalTotal.toLocaleString()}
              </span>
            </div>
            {discount > 0 && (
              <p className="text-green-600 text-sm text-right">
                ¡Ahorraste ${discount.toLocaleString()}!
              </p>
            )}
          </div>
        )}

        {paymentMethod === "mercadopago" && (
  <button
    onClick={async () => {
      try {
        const response = await fetch("http://localhost:3001/create_preference", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderNumber,
            customerEmail: customerData.email,
            items: cartItems.map((item) => ({
              name: item.name,
              price: item.price,
              quantity: item.quantity,
            })),
          }),
        });

        const data = await response.json();
        if (data.init_point) {
          window.location.href = data.init_point; // redirige al checkout real
        }
      } catch (error) {
        console.error("Error iniciando pago con Mercado Pago:", error);
        alert("Hubo un error con Mercado Pago");
      }
    }}
    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
  >
    Pagar con Mercado Pago
  </button>
)}
      </div>
    </div>
  );
};