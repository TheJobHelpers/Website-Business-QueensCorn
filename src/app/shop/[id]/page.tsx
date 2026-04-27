import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import ProductCard from '@/components/ProductCard';
import styles from './ProductDetail.module.css';

// This would normally come from a database/CMS
const ALL_PRODUCTS = [
  { id: '1', name: 'Regular Sweet & Salty', price: '$6.00', image: '/product-placeholder.png', description: 'Our signature blend of sweet and salty perfection. Handcrafted in Arizona.' },
  { id: '2', name: 'Caramel', price: '$6.00', image: '/product-placeholder.png', description: 'Rich, buttery caramel coating every single kernel for a decadent treat.' },
  { id: '3', name: 'Cheddar', price: '$6.00', image: '/product-placeholder.png', description: 'Authentic sharp cheddar cheese coating for a savory explosion of flavor.' },
  { id: '4', name: 'Jalapeno', price: '$6.00', image: '/product-placeholder.png', description: 'A spicy kick of jalapeno balanced with our classic kettle corn base.' },
  { id: '5', name: 'Caramel Apple', price: '$6.00', image: '/product-placeholder.png', description: 'The perfect autumn treat, available year-round. Tart apple meets sweet caramel.' },
  { id: '6', name: 'Caramel & Cheddar', price: '$6.00', image: '/product-placeholder.png', description: 'The ultimate Chicago-style mix. A harmonious blend of sweet and savory.' },
  { id: '7', name: 'Holiday Mix', price: '$6.00', image: '/product-placeholder.png', description: 'Usually saved for the Christmas Holidays is a group of flavors festive to the season. Cinnamon, Apple, and regular sweet and salty.' },
  { id: '8', name: 'Patriot Mix', price: '$6.00', image: '/product-placeholder.png', description: 'A festive red, white, and blue mix to celebrate the spirit of royalty.' },
];

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = ALL_PRODUCTS.find(p => p.id === id) || ALL_PRODUCTS[0];
  const relatedProducts = ALL_PRODUCTS.filter(p => p.id !== id).slice(0, 3);

  return (
    <main className={styles.page}>
      <Navbar />
      
      <div className="main-container">
        <div className={styles.breadcrumb}>
          <Link href="/shop">&larr; Back to All Products</Link>
        </div>

        <div className={styles.grid}>
          <div className={styles.imageSection}>
            <div className={styles.imageWrapper}>
              <Image 
                src={product.image} 
                alt={product.name} 
                fill 
                sizes="(max-width: 1024px) 100vw, 50vw"
                className={styles.image}
              />
            </div>
          </div>

          <div className={styles.contentSection}>
            <h1 className={styles.name}>{product.name}</h1>
            <p className={styles.price}>{product.price}</p>
            
            <div className={styles.description}>
              <p>{product.description}</p>
            </div>

            <div className={styles.options}>
              <div className={styles.optionGroup}>
                <label>Size</label>
                <select className={styles.select}>
                  <option>Small (Individual)</option>
                  <option>Medium (Family)</option>
                  <option>Large (Party)</option>
                </select>
              </div>

              <div className={styles.optionGroup}>
                <label>Quantity</label>
                <div className={styles.quantity}>
                  <button>-</button>
                  <span>1</span>
                  <button>+</button>
                </div>
              </div>
            </div>

            <div className={styles.actions}>
              <button className={styles.buyBtn}>Buy Now</button>
              <button className={styles.cartBtn}>Add to Cart</button>
            </div>

            <div className={styles.extraInfo}>
              <div className={styles.infoItem}>
                <span>✓</span> Handcrafted in Arizona
              </div>
              <div className={styles.infoItem}>
                <span>✓</span> A+ BBB Rated Quality
              </div>
            </div>
          </div>
        </div>

        <section className={styles.related}>
          <h2 className={styles.relatedTitle}>You May Also Like</h2>
          <div className={styles.relatedGrid}>
            {relatedProducts.map(p => (
              <ProductCard key={p.id} name={p.name} price={p.price} image={p.image} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
