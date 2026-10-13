'use client';

import ProductCard from './ProductCard';
import Button from './ui/Button';
import { useCart } from '@/context/CartContext';
import { featuredProducts } from '@/data/products';
import { BAG_SIZES, formatPrice, sizePrice } from '@/lib/shop';
import styles from './FeaturedProducts.module.css';

// Landing blueprint section 4: show sizes and prices up front, 2 cards per row on phones.

export default function FeaturedProducts() {
  // The owners choose these in the admin dashboard (Flavors > On homepage).
  const { products } = useCart();
  // The lowest price of each size across the shop ("from" when flavors differ).
  const sizes = BAG_SIZES.map((size) => {
    const prices = products.map((p) => sizePrice(p, size));
    const lowest = prices.length > 0 ? Math.min(...prices) : null;
    return { name: size.label, price: lowest === null ? '' : `${prices.some((x) => x !== lowest) ? 'from ' : ''}${formatPrice(lowest)}` };
  });

  return (
    <section className="v3-section" id="featured-flavors" aria-labelledby="flavors-title">
      <div className="main-container">
        <header className={styles.header}>
          <div>
            <span className="v3-eyebrow">Our flavors</span>
            <h2 id="flavors-title" className="v3-title">
              The ones people come back for
            </h2>
            <p className="v3-lede">Every flavor comes in three sizes.</p>
          </div>
          <ul className={styles.sizes} aria-label="Bag sizes and prices">
            {sizes.map((s) => (
              <li key={s.name}>
                {s.name}
                <b>{s.price}</b>
              </li>
            ))}
          </ul>
        </header>

        <div className={`${styles.grid} fx-stagger`}>
          {featuredProducts(products).map((p) => (
            <ProductCard key={p.id} {...p} />
          ))}
        </div>

        <div className={styles.more}>
          <Button href="/shop" variant="ghost">
            See all {products.length} flavors
          </Button>
        </div>
      </div>
    </section>
  );
}
