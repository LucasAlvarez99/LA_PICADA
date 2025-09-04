import React, { useEffect } from "react";
import { CheckCircle, X, MessageCircle } from "lucide-react";

interface OrderSuccessProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
}

export const OrderSuccess: React.FC<OrderSuccessProps> = ({
  isOpen,
  onClose,
  orderNumber,
}) => {
  // Cierre automático después de 5 segundos
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 text-center relative animate-fadeIn">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 hover:bg-gray-100 rounded-full"
        >
          <X size={20} />
        </button>

        {/* Ícono */}
        <CheckCircle size={64} className="text-green-600 mx-auto mb-4" />

        {/* Mensaje principal */}
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          ¡Pedido enviado con éxito!
        </h2>
        <p className="text-gray-600 mb-4">
          Tu pedido{" "}
          <span className="font-semibold text-gray-900">#{orderNumber}</span>{" "}
          fue enviado a nuestro WhatsApp.
        </p>

        {/* Nota de recordatorio */}
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4 text-sm mb-6">
          <p>
            📲 Revisa la conversación en WhatsApp y envía el comprobante de pago
            para que podamos comenzar la preparación de tu pedido.
          </p>
        </div>

        {/* Botón manual */}
        <button
          onClick={onClose}
          className="flex items-center justify-center w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          <MessageCircle size={20} className="mr-2" />
          Volver a la Tienda
        </button>
      </div>
    </div>
  );
};