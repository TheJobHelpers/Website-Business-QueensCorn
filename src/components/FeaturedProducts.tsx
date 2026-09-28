import ProductCard from './ProductCard';
import styles from './FeaturedProducts.module.css';
import ScrollReveal from './ScrollReveal';
import Link from 'next/link';
import { FEATURED_PRODUCTS } from '@/data/products';

export default function FeaturedProducts() {
  return (
    <section className={styles.section}>
      <div className="main-container">
        <ScrollReveal>
          <div className={styles.header}>
            <span className={styles.label}>The Queen&apos;s Selection</span>
            <h2 className={styles.title}>Featured Flavors</h2>
            <p className={styles.subtitle}>Our most popular handcrafted kettle corn creations, popped fresh in Arizona.</p>
          </div>
        </ScrollReveal>

        <div className={styles.grid}>
          {FEATURED_PRODUCTS.map((p, i) => (
            <ScrollReveal key={p.id} delay={i + 1}>
              <ProductCard {...p} />
            </ScrollReveal>
          ))}
        </div>
        <div className={styles.footer}>
          <Link href="/shop">
            <button className={`${styles.viewAllBtn} shimmer-btn`}>View All Products</button>
          </Link>
        </div>
      </div>
    </section>
  );
}
