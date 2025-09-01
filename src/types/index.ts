export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  unit: string;
  category: string;
  stock: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Customer {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  notes?: string;
  deliveryMethod: 'pickup' | 'delivery';
  deliveryTime?: string;
}

export interface Order {
  id: number;
  customer: Customer;
  items: CartItem[];
  totalAmount: number;
  deliveryFee: number;
  discount: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'confirmed' | 'failed';
  status: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
}