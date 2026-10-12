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

// The owners' flavor list (2026-10-12). Ids of flavors that already existed are unchanged.
// Flavors without their own photo yet borrow the closest existing one (marked below).
export const ALL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Sweet & Salty',
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
    name: 'Caramel Cheddar',
    price: '$6.00',
    image: '/flavor-caramel-cheddar.png',
    category: 'Savory',
    taste: { label: 'Sweet', level: 4 },
    description: 'The ultimate gourmet mix—a harmonious marriage of sweet amber caramel and sharp cheddar.',
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
    name: 'Cheddar with Smoked Jalapeño',
    price: '$6.00',
    image: '/flavor-jalapeno-real.png', // photo of the earlier Jalapeño flavor, until a new one is made
    category: 'Spicy',
    taste: { label: 'Heat', level: 3 },
    description: 'Savory cheddar kettle corn with a smoky jalapeño kick.',
    featured: true,
  },
  {
    id: '9',
    name: 'Cinnamon Apple',
    price: '$6.00',
    image: '/flavor-mix-real.png', // Caramel Apple photo, until a new one is made
    category: 'Sweet',
    taste: { label: 'Sweet', level: 4 },
    description: 'Warm cinnamon and crisp apple over hand-stirred kettle corn.',
  },
  {
    id: '8',
    name: 'Patriot (Red-White-Blue)',
    price: '$6.00',
    image: '/flavor-patriot-real.png',
    category: 'Seasonal',
    taste: { label: 'Sweet', level: 3 },
    description: "A vibrant red, white, and blue kettle corn medley crafted by The Queen's Corn to celebrate in style.",
  },
  {
    id: '10',
    name: 'Nacho Cheddar',
    price: '$6.00',
    image: '/flavor-cheddar-real.png', // Cheddar photo, until a new one is made
    category: 'Savory',
    taste: { label: 'Cheddar', level: 4 },
    description: 'Cheddar kettle corn with a bold nacho seasoning.',
  },
  {
    id: '11',
    name: 'BBQ Cheddar',
    price: '$6.00',
    image: '/flavor-cheddar-real.png', // Cheddar photo, until a new one is made
    category: 'Savory',
    taste: { label: 'Cheddar', level: 4 },
    description: 'Cheddar kettle corn with a smoky-sweet barbecue seasoning.',
  },
];

const byId = (id: string) => ALL_PRODUCTS.find((p) => p.id === id)!;

export const FEATURED_PRODUCTS: Product[] = [
  byId('6'), // Caramel Cheddar
  byId('1'), // Sweet & Salty
  byId('4'), // Cheddar with Smoked Jalapeño
  byId('2'), // Caramel
];

export const CATEGORIES = ['All Flavors', 'Sweet', 'Savory', 'Spicy', 'Seasonal'] as const;
