import Link from 'next/link';
import Image from 'next/image';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  id: string;
  name: string;
  price: string;
  image: string;
  description?: string;
}

export default function ProductCard({ id, name, price, image, description }: ProductCardProps) {
  return (
    <div className={`${styles.card} hover-lift`}>
      <Link href={`/shop/${id}`}>
        <div className={styles.imageWrapper}>
          <Image 
            src={image} 
            alt={name} 
            fill 
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={styles.image}
          />
        </div>
      </Link>
      <div className={styles.info}>
        <div className={styles.header}>
          <Link href={`/shop/${id}`}>
            <h3 className={styles.name}>{name}</h3>
          </Link>
          <p className={styles.price}>{price}</p>
        </div>
        
        {description && <p className={styles.description}>{description}</p>}
        
        <Link href={`/shop/${id}`}>
          <button className={`${styles.viewBtn} shimmer-btn`}>Shop This Flavor</button>
        </Link>
      </div>
    </div>
  );
}
