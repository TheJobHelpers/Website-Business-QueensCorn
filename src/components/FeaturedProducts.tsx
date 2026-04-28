import ProductCard from './ProductCard';
import styles from './FeaturedProducts.module.css';
import ScrollReveal from './ScrollReveal';
import Link from 'next/link';

const FEATURED_PRODUCTS = [
  { id: '4', name: 'Jalapeno', price: '$6.00', image: '/flavor-jalapeno-real.png', description: 'Hand-stirred kettle corn with a spicy, savory kick.' },
  { id: '2', name: 'Caramel', price: '$6.00', image: '/flavor-caramel-real.png', description: 'Deep, glossy amber glaze with a rich buttery finish.' },
  { id: '3', name: 'Cheddar', price: '$6.00', image: '/flavor-cheddar-real.png', description: 'Bursting with bold, savory aged cheddar flavor.' },
];

export default function FeaturedProducts() {
  return (
    <section className={styles.section}>
      <div className="main-container">
        <ScrollReveal>
          <div className={styles.header}>
            <h2 className={styles.title}>Featured Flavors</h2>
            <p className={styles.subtitle}>Our most popular creations, handcrafted for royalty.</p>
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
            <button className={styles.viewAllBtn}>View All Products</button>
          </Link>
        </div>
      </div>
    </section>
  );
}
