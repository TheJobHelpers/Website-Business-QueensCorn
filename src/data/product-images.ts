const PRODUCT_IMAGES: Record<string, string> = {
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

/** Use the matching branded product photo, falling back for products without one. */
export function productImageFor(name: string, fallback: string): string {
  return PRODUCT_IMAGES[name] ?? fallback;
}
