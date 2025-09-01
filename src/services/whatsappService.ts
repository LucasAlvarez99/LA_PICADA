interface OrderData {
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    deliveryMethod: 'pickup' | 'delivery';
    deliveryTime?: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    unit: string;
  }>;
  total: number;
  deliveryFee: number;
  discount: number;
  finalTotal: number;
  paymentMethod: string;
  paymentStatus: string;
}

export async function sendWhatsAppNotification(orderData: OrderData) {
  const message = formatOrderMessage(orderData);
  
  // Número de WhatsApp del negocio (reemplaza con tu número)
  const businessPhone = "5491125925851"; // Formato: código país + número sin +
  
  // URL de WhatsApp Web/API
  const whatsappUrl = `https://wa.me/${businessPhone}?text=${encodeURIComponent(message)}`;
  
  try {
    // En un entorno real, aquí usarías una API de WhatsApp Business
    // Por ahora, abrimos WhatsApp Web con el mensaje pre-cargado
    window.open(whatsappUrl, '_blank');
    
    console.log('📱 Mensaje de WhatsApp enviado:', message);
    return { success: true };
  } catch (error) {
    console.error('❌ Error enviando WhatsApp:', error);
    return { success: false, error };
  }
}

function formatOrderMessage(order: OrderData): string {
  const deliveryText = order.customer.deliveryMethod === 'pickup' 
    ? '🏪 *RETIRO EN LOCAL*' 
    : `🚚 *ENVÍO A DOMICILIO*\n📍 ${order.customer.address}, ${order.customer.city}`;

  const timeText = order.customer.deliveryTime 
    ? `⏰ *Horario preferido:* ${order.customer.deliveryTime}\n` 
    : '';

  const discountText = order.discount > 0 
    ? `💰 Descuento: -$${order.discount.toLocaleString()}\n` 
    : '';

  const deliveryFeeText = order.deliveryFee > 0 
    ? `🚚 Envío: $${order.deliveryFee.toLocaleString()}\n` 
    : '';

  return `🛒 *NUEVO PEDIDO - LA PICADA*

📋 *Orden:* #${order.orderNumber}

👤 *CLIENTE:*
• Nombre: ${order.customer.name}
• Teléfono: ${order.customer.phone}
• Email: ${order.customer.email}

${deliveryText}
${timeText}

💳 *PAGO:* ${getPaymentMethodText(order.paymentMethod)}
📊 *Estado:* ${order.paymentStatus === 'pending' ? 'Pendiente de confirmación' : 'Confirmado'}

🛍️ *PRODUCTOS:*
${order.items.map(item => 
  `• ${item.quantity}x ${item.name} - $${(item.price * item.quantity).toLocaleString()}`
).join('\n')}

💰 *RESUMEN:*
Subtotal: $${order.total.toLocaleString()}
${discountText}${deliveryFeeText}*TOTAL: $${order.finalTotal.toLocaleString()}*

---
⚡ Pedido generado automáticamente`;
}

function getPaymentMethodText(method: string): string {
  switch (method) {
    case 'efectivo':
      return '💵 Efectivo (contra entrega)';
    case 'transferencia':
      return '🏦 Transferencia bancaria';
    case 'tarjeta':
      return '💳 Tarjeta de débito/crédito';
    case 'mercadopago':
      return '💙 MercadoPago';
    default:
      return method;
  }
}