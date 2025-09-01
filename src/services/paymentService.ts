interface PaymentData {
  amount: number;
  description: string;
  customerEmail: string;
  orderNumber: string;
}

export async function processTransferPayment(paymentData: PaymentData) {
  // Datos bancarios del negocio
  const bankData = {
    bank: "Mercado pago",
    cvu: "0000003100013871174110",
    alias: "lalvarez99.mp",
    holder: "Lucas Francisco Hector Alvarez Bernardez"
  };

  // Generar link de transferencia (algunos bancos lo soportan)
  const transferData = {
    amount: paymentData.amount,
    description: `Pedido #${paymentData.orderNumber} - La Picada`,
    cvu: bankData.cvu,
    alias: bankData.alias
  };

  // URL para apps bancarias (ejemplo genérico)
  const transferUrl = `https://link.mercadopago.com.ar/transfer?amount=${transferData.amount}&description=${encodeURIComponent(transferData.description)}&cbu=${transferData.cvu}`;

  return {
    success: true,
    bankData,
    transferUrl,
    instructions: `
      Para completar tu pago por transferencia:
      
      1. Abre tu app bancaria
      2. Transfiere $${paymentData.amount.toLocaleString()} a:
         • Alias: ${bankData.alias}
         • CVU: ${bankData.cvu}
      3. Usa como referencia: Pedido #${paymentData.orderNumber}
      4. Envía el comprobante por WhatsApp
    `
  };
}

export async function processMercadoPagoPayment(paymentData: PaymentData) {
  // En un entorno real, aquí integrarías con la API de MercadoPago
  const mpData = {
    preferenceId: `MP-${paymentData.orderNumber}-${Date.now()}`,
    amount: paymentData.amount,
    description: paymentData.description
  };

  // URL simulada de MercadoPago (en producción sería real)
  const checkoutUrl = `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${mpData.preferenceId}`;

  return {
    success: true,
    checkoutUrl,
    preferenceId: mpData.preferenceId,
    instructions: `
      Serás redirigido a MercadoPago para completar el pago de $${paymentData.amount.toLocaleString()}.
      
      Métodos disponibles:
      • Tarjeta de débito/crédito
      • Transferencia bancaria
      • Efectivo (Rapipago, Pago Fácil)
    `
  };
}

export function calculateDeliveryFee(city: string, totalAmount: number): number {
  // Envío gratis para compras mayores a $15,000
  if (totalAmount >= 15000) {
    return 0;
  }

  // Tarifas por zona (ejemplo)
  const deliveryRates: Record<string, number> = {
    'capital federal': 800,
    'buenos aires': 1200,
    'caba': 800,
    'zona norte': 1000,
    'zona oeste': 1200,
    'zona sur': 1000,
    'default': 1500
  };

  const cityLower = city.toLowerCase();
  return deliveryRates[cityLower] || deliveryRates.default;
}

export function calculateDiscount(totalAmount: number, itemCount: number): number {
  // Descuento por cantidad
  if (itemCount >= 5) {
    return Math.floor(totalAmount * 0.1); // 10% descuento
  }
  if (itemCount >= 3) {
    return Math.floor(totalAmount * 0.05); // 5% descuento
  }
  
  return 0;
}