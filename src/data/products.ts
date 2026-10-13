export interface Product {
  id: string;
  name: string;
  /** Price of a Small bag, as "$6.00". Family and Party scale from it (see BAG_SIZES). */
  price: string;
  image: string;
  category: 'Sweet' | 'Savory' | 'Spicy' | 'Seasonal';
  description: string;
  /** Shown in the homepage's "The ones people come back for" row (first four). */
  featured?: boolean;
  /** Kept in the catalog but not shown on the site (e.g. a seasonal flavor out of season). */
  hidden?: boolean;
  /** One taste meter on the card (1–5 kernels). Owners can tune these. */
  taste?: { label: string; level: number };
}

export const PRODUCT_IMAGES: Record<string, string> = {
  'Sweet & Salty': '/product-sweet-salty.webp',
  Caramel: '/product-caramel.webp',
  'Caramel Apple': '/product-caramel-apple.webp',
  'Caramel Cheddar': '/product-caramel-cheddar.webp',
  Cheddar: '/product-cheddar.webp',
  'Cheddar with Smoked Jalapeño': '/product-cheddar-smoked-jalapeno.webp',
  'Cinnamon Apple': '/product-cinnamon-apple.webp',
  'Patriot (Red-White-Blue)': '/product-patriot-red-white-blue.webp',
  'Nacho Cheddar': '/product-nacho-cheddar.webp',
  'BBQ Cheddar': '/product-bbq-cheddar.webp',
};

export const CATEGORIES = ['All Flavors', 'Sweet', 'Savory', 'Spicy', 'Seasonal'] as const;

// Photos in /public that a flavor can use. The admin's photo picker lists these.
export const PRODUCT_IMAGE_CHOICES = [
  { src: '/product-sweet-salty.webp', label: 'Sweet & Salty product photo' },
  { src: '/product-caramel.webp', label: 'Caramel product photo' },
  { src: '/product-caramel-apple.webp', label: 'Caramel Apple product photo' },
  { src: '/product-caramel-cheddar.webp', label: 'Caramel Cheddar product photo' },
  { src: '/product-cheddar.webp', label: 'Cheddar product photo' },
  { src: '/product-cheddar-smoked-jalapeno.webp', label: 'Cheddar with Smoked Jalapeño product photo' },
  { src: '/product-cinnamon-apple.webp', label: 'Cinnamon Apple product photo' },
  { src: '/product-patriot-red-white-blue.webp', label: 'Patriot product photo' },
  { src: '/product-nacho-cheddar.webp', label: 'Nacho Cheddar product photo' },
  { src: '/product-bbq-cheddar.webp', label: 'BBQ Cheddar product photo' },
  { src: '/flavor-regular-real.png', label: 'Sweet & Salty bag' },
  { src: '/flavor-caramel-real.png', label: 'Caramel bag' },
  { src: '/flavor-cheddar-real.png', label: 'Cheddar bag' },
  { src: '/flavor-jalapeno-real.png', label: 'Jalapeño bag' },
  { src: '/flavor-mix-real.png', label: 'Caramel Apple bag' },
  { src: '/flavor-caramel-cheddar.png', label: 'Caramel Cheddar bowl' },
  { src: '/flavor-patriot-real.png', label: 'Patriot bag' },
  { src: '/popcorn-scoop-fresh.jpg', label: 'Fresh popcorn with scoop (real photo)' },
] as const;

// The built-in catalog: the owners' flavor list (2026-10-12). The site shows this until the
// owners change something in the admin dashboard; after that the saved catalog is used
// (see src/server/repositories). Ids of flavors that already existed are unchanged.
// Flavors without their own photo yet borrow the closest existing one (marked below).
export const ALL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Sweet & Salty',
    price: '$6.00',
    image: PRODUCT_IMAGES['Sweet & Salty'],
    category: 'Sweet',
    taste: { label: 'Sweet', level: 3 },
    description: 'Our signature blend of sweet and salty perfection, hand-stirred in pure corn oil in Arizona.',
    featured: true,
  },
  {
    id: '2',
    name: 'Caramel',
    price: '$6.00',
    image: PRODUCT_IMAGES.Caramel,
    category: 'Sweet',
    taste: { label: 'Sweet', level: 5 },
    description: 'Deep, glossy amber glaze with a rich buttery finish coating every single kernel.',
    featured: true,
  },
  {
    id: '5',
    name: 'Caramel Apple',
    price: '$6.00',
    image: PRODUCT_IMAGES['Caramel Apple'],
    category: 'Sweet',
    taste: { label: 'Sweet', level: 4 },
    description: 'Crisp, tart green apple meets rich, buttery caramel for a year-round festival favorite.',
  },
  {
    id: '6',
    name: 'Caramel Cheddar',
    price: '$6.00',
    image: PRODUCT_IMAGES['Caramel Cheddar'],
    category: 'Savory',
    taste: { label: 'Sweet', level: 4 },
    description: 'The ultimate gourmet mix—a harmonious marriage of sweet amber caramel and sharp cheddar.',
    featured: true,
  },
  {
    id: '3',
    name: 'Cheddar',
    price: '$6.00',
    image: PRODUCT_IMAGES.Cheddar,
    category: 'Savory',
    taste: { label: 'Cheddar', level: 5 },
    description: 'Bursting with bold, savory aged cheddar cheese for a rich flavor explosion.',
  },
  {
    id: '4',
    name: 'Cheddar with Smoked Jalapeño',
    price: '$6.00',
    image: PRODUCT_IMAGES['Cheddar with Smoked Jalapeño'],
    category: 'Spicy',
    taste: { label: 'Heat', level: 3 },
    description: 'Savory cheddar kettle corn with a smoky jalapeño kick.',
    featured: true,
  },
  {
    id: '9',
    name: 'Cinnamon Apple',
    price: '$6.00',
    image: PRODUCT_IMAGES['Cinnamon Apple'],
    category: 'Sweet',
    taste: { label: 'Sweet', level: 4 },
    description: 'Warm cinnamon and crisp apple over hand-stirred kettle corn.',
  },
  {
    id: '8',
    name: 'Patriot (Red-White-Blue)',
    price: '$6.00',
    image: PRODUCT_IMAGES['Patriot (Red-White-Blue)'],
    category: 'Seasonal',
    taste: { label: 'Sweet', level: 3 },
    description: "A vibrant red, white, and blue kettle corn medley crafted by The Queen's Corn to celebrate in style.",
  },
  {
    id: '10',
    name: 'Nacho Cheddar',
    price: '$6.00',
    image: PRODUCT_IMAGES['Nacho Cheddar'],
    category: 'Savory',
    taste: { label: 'Cheddar', level: 4 },
    description: 'Cheddar kettle corn with a bold nacho seasoning.',
  },
  {
    id: '11',
    name: 'BBQ Cheddar',
    price: '$6.00',
    image: PRODUCT_IMAGES['BBQ Cheddar'],
    category: 'Savory',
    taste: { label: 'Cheddar', level: 4 },
    description: 'Cheddar kettle corn with a smoky-sweet barbecue seasoning.',
  },
];

/** The homepage row: flavors marked "featured" (first four), or the first four if none are. */
export function featuredProducts(products: Product[]): Product[] {
  const marked = products.filter((p) => p.featured);
  return (marked.length > 0 ? marked : products).slice(0, 4);
}
