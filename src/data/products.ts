import type { Product } from '../types';

export const products: Product[] = [
  {
    id: 1,
    name: 'Jamón Serrano',
    price: 2850,
    image: 'https://images.pexels.com/photos/4109743/pexels-photo-4109743.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Jamón serrano de primera calidad, curado 18 meses',
    unit: 'kg',
    category: 'jamones',
    stock: 50
  },
  {
    id: 2,
    name: 'Salame Milano',
    price: 1950,
    image: 'https://images.pexels.com/photos/5474640/pexels-photo-5474640.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Salame tradicional italiano con especias selectas',
    unit: 'kg',
    category: 'embutidos',
    stock: 30
  },
  {
    id: 3,
    name: 'Mortadela Italiana',
    price: 1200,
    image: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Mortadela con pistachos, sabor auténtico italiano',
    unit: 'kg',
    category: 'embutidos',
    stock: 25
  },
  {
    id: 4,
    name: 'Queso Manchego',
    price: 3200,
    image: 'https://images.pexels.com/photos/773253/pexels-photo-773253.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Queso manchego curado 12 meses, intenso sabor',
    unit: 'kg',
    category: 'quesos',
    stock: 15
  },
  {
    id: 5,
    name: 'Chorizo Español',
    price: 1800,
    image: 'https://images.pexels.com/photos/4518697/pexels-photo-4518697.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Chorizo español dulce, perfecto para tapas',
    unit: 'kg',
    category: 'embutidos',
    stock: 40
  },
  {
    id: 6,
    name: 'Panceta Ahumada',
    price: 1650,
    image: 'https://images.pexels.com/photos/4518840/pexels-photo-4518840.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Panceta ahumada en casa, sabor intenso',
    unit: 'kg',
    category: 'otros',
    stock: 20
  },

  // 🔹 Productos Mayoristas
  {
    id: 7,
    name: 'Hormas de Queso Cremoso (Mayorista)',
    price: 14500,
    image: 'https://images.pexels.com/photos/196643/pexels-photo-196643.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Horma de queso cremoso de 5kg, ideal para revendedores',
    unit: 'horma',
    category: 'mayorista',
    stock: 10
  },
  {
    id: 8,
    name: 'Pallet de Salame (Mayorista)',
    price: 95000,
    image: 'https://images.pexels.com/photos/65175/pexels-photo-65175.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Pallet completo de salames surtidos, más de 50 unidades',
    unit: 'pallet',
    category: 'mayorista',
    stock: 5
  },

  // 🔹 Productos en Promoción
  {
    id: 9,
    name: 'Combo Picada Familiar (Promo)',
    price: 4990,
    image: 'https://images.pexels.com/photos/59942/pexels-photo-59942.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Incluye jamón cocido, salame, queso tybo y aceitunas',
    unit: 'combo',
    category: 'promo',
    stock: 20
  },
  {
    id: 10,
    name: 'Dúo de Quesos + Vino (Promo)',
    price: 7200,
    image: 'https://images.pexels.com/photos/434258/pexels-photo-434258.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Queso gouda, queso azul y vino tinto Malbec',
    unit: 'pack',
    category: 'promo',
    stock: 15
  }
];