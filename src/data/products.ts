export interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  category: 'Sweet' | 'Savory' | 'Spicy' | 'Seasonal';
  description: string;
  featured?: boolean;
  /** One taste meter on the card (1–5 kernels). Owners can tune these. */
  taste?: { label: string; level: number };
}

export const ALL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Regular Sweet & Salty',
    price: '$6.00',
    image: '/flavor-regular-real.png',
    category: 'Sweet',
    taste: { label: 'Sweet', level: 3 },
    description: 'Our signature blend of sweet and salty perfection, hand-stirred in pure corn oil in Arizona.',
  },
  {
    id: '2',
    name: 'Caramel',
    price: '$6.00',
    image: '/flavor-caramel-real.png',
    category: 'Sweet',
    taste: { label: 'Sweet', level: 5 },
    description: 'Deep, glossy amber glaze with a rich buttery finish coating every single kernel.',
    featured: true,
  },
  {
    id: '3',
    name: 'Cheddar',
    price: '$6.00',
    image: '/flavor-cheddar-real.png',
    category: 'Savory',
    taste: { label: 'Cheddar', level: 5 },
    description: 'Bursting with bold, savory aged cheddar cheese for a rich flavor explosion.',
    featured: true,
  },
  {
    id: '4',
    name: 'Jalapeño',
    price: '$6.00',
    image: '/flavor-jalapeno-real.png',
    category: 'Spicy',
    taste: { label: 'Heat', level: 3 },
    description: 'Hand-stirred kettle corn with a fiery, savory jalapeño kick balanced with sweet crunch.',
    featured: true,
  },
  {
    id: '5',
    name: 'Caramel Apple',
    price: '$6.00',
    image: '/flavor-mix-real.png',
    category: 'Sweet',
    taste: { label: 'Sweet', level: 4 },
    description: 'Crisp, tart green apple meets rich, buttery caramel for a year-round festival favorite.',
  },
  {
    id: '6',
    name: 'Caramel & Cheddar',
    price: '$6.00',
    image: '/flavor-caramel-cheddar.png',
    category: 'Savory',
    taste: { label: 'Sweet', level: 4 },
    description: 'The ultimate gourmet mix—a harmonious marriage of sweet amber caramel and sharp cheddar.',
  },
  {
    id: '7',
    name: 'Holiday Mix',
    price: '$6.00',
    image: '/flavor-mix.png',
    category: 'Seasonal',
    taste: { label: 'Spice', level: 3 },
    description: 'A festive seasonal celebration blending warm cinnamon, crisp apple, and classic sweet & salty.',
  },
  {
    id: '8',
    name: 'Patriot Mix',
    price: '$6.00',
    image: '/flavor-patriot-real.png',
    category: 'Seasonal',
    taste: { label: 'Sweet', level: 3 },
    description: "A vibrant red, white, and blue kettle corn medley crafted by The Queen's Corn to celebrate in style.",
  },
];

export const FEATURED_PRODUCTS: Product[] = [
  ALL_PRODUCTS[5], // Caramel & Cheddar
  ALL_PRODUCTS[0], // Regular Sweet & Salty
  ALL_PRODUCTS[3], // Jalapeño
  ALL_PRODUCTS[1], // Caramel
];

export const CATEGORIES = ['All Flavors', 'Sweet', 'Savory', 'Spicy', 'Seasonal'] as const;
