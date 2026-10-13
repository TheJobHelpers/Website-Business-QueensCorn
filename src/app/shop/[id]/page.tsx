import Link from 'next/link';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import ProductCard from '@/components/ProductCard';
import { getSiteData } from '@/server/repositories';
import { Check } from 'lucide-react';
import ProductActions from './ProductActions';
import styles from './ProductDetail.module.css';

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // The saved catalog (edited in the admin dashboard); hidden flavors are not in it.
  const { products } = await getSiteData();
  const product = products.find((p) => p.id === id);
  if (!product) notFound();
  const relatedProducts = products.filter((p) => p.id !== product.id).slice(0, 3);

  return (
    <main className={styles.page}>
      <div className="main-container">
        <div className={styles.breadcrumb}>
          <Link href="/shop">&larr; Back to All Products</Link>
        </div>

        <div className={styles.grid}>
          <div className={styles.imageSection}>
            <div className={`${styles.imageWrapper} img-wrapper-treatment`}>
              <Image 
                src={product.image} 
                alt={product.name} 
                fill 
                sizes="(max-width: 1024px) 100vw, 50vw"
                className={`${styles.image} img-treatment`}
                priority
              />
            </div>
          </div>

          <div className={styles.contentSection}>
            <span className={styles.categoryBadge}>{product.category} Flavor</span>
            <h1 className={styles.name}>{product.name}</h1>
            <p className={styles.price}>{product.price}</p>
            
            <div className={styles.description}>
              <p>{product.description}</p>
            </div>

            <ProductActions product={product} />

            <div className={styles.extraInfo}>
              <div className={styles.infoItem}>
                <Check size={15} style={{ color: '#F5BA31', flexShrink: 0 }} /> Handcrafted in Arizona
              </div>
              <div className={styles.infoItem}>
                <Check size={15} style={{ color: '#F5BA31', flexShrink: 0 }} /> A+ BBB Rated Quality
              </div>
              <div className={styles.infoItem}>
                <Check size={15} style={{ color: '#F5BA31', flexShrink: 0 }} /> 100% Pure Corn Oil — No Cheap Blends
              </div>
            </div>
          </div>
        </div>

        <section className={styles.related}>
          <h2 className={styles.relatedTitle}>You May Also Like</h2>
          <div className={styles.relatedGrid}>
            {relatedProducts.map(p => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
