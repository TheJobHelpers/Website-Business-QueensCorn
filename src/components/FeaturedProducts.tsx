import ProductCard from './ProductCard';
import styles from './FeaturedProducts.module.css';
import ScrollReveal from './ScrollReveal';
import Link from 'next/link';
import { ArrowRight, Flame } from 'lucide-react';
import { FEATURED_PRODUCTS } from '@/data/products';

export default function FeaturedProducts() {
  return (
    <section className={styles.section} id="featured-flavors">
      <div className="main-container">
        <ScrollReveal>
          <div className={styles.header}>
            <span className={styles.label}>
              <Flame size={14} /> The Queen&apos;s Signature Batch
            </span>
            <h2 className={styles.title}>Most Loved Arizona Flavors</h2>
            <p className={styles.subtitle}>
              Hand-stirred in small copper kettle batches with monster mushroom kernels and real ingredients.
            </p>
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
          <Link href="/shop" className={styles.viewAllBtn}>
            <span>Explore All Gourmet Flavors</span>
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  );
}
