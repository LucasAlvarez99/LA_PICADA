import React from 'react';
import { CheckCircle, Package, Clock, Phone } from 'lucide-react';

interface OrderSuccessProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
}

export const OrderSuccess: React.FC<OrderSuccessProps> = ({
  isOpen,
  onClose,
  orderNumber
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            ¡Pedido Confirmado!
          </h2>
          
          <p className="text-gray-600 mb-6">
            Tu pedido ha sido recibido correctamente
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Número de Pedido:</p>
            <p className="text-xl font-bold text-red-600">#{orderNumber}</p>
          </div>

          <div className="space-y-3 text-left mb-6">
            <div className="flex items-center text-sm text-gray-600">
              <Clock size={16} className="mr-3 text-blue-600" />
              <span>Procesaremos tu pedido en las próximas 2-4 horas</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Package size={16} className="mr-3 text-green-600" />
              <span>Recibirás un email con el estado de tu pedido</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Phone size={16} className="mr-3 text-red-600" />
              <span>Te contactaremos para coordinar la entrega</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Continuar Comprando
          </button>
        </div>
      </div>
    </div>
  );
};