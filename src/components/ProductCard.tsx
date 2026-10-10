'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import type { Product } from '@/data/products';
import Button from './ui/Button';
import styles from './ProductCard.module.css';

// Design System v3: Product card (wiki/design-system/components.css → .pcard)
// No marketing badges here: only confirmed claims (see the design system's Voice rules).
type ProductCardProps = Pick<Product, 'id' | 'name' | 'price' | 'image'> &
  Partial<Pick<Product, 'description' | 'category' | 'taste'>>;

const DEFAULT_SIZE = 'Small (Individual)';

export default function ProductCard({
  id,
  name,
  price,
  image,
  description,
  category = 'Sweet',
  taste,
}: ProductCardProps) {
  const { addItem, openDrawer } = useCart();
  const [added, setAdded] = useState(false);
  const amount = parseFloat(price.replace(/[^0-9.]/g, ''));
  const fromPrice = Number.isFinite(amount) ? `$${amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2)}` : price;
  const level = Math.max(0, Math.min(5, Math.round(taste?.level ?? 0)));

  const handleAdd = () => {
    addItem({ id, name, price, image, category, description: description || '', taste }, DEFAULT_SIZE, 1);
    setAdded(true);
    openDrawer();
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <article className={styles.card}>
      <Link href={`/shop/${id}`} className={styles.photo} tabIndex={-1} aria-hidden="true">
        <Image
          src={image}
          alt=""
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className={styles.image}
        />
      </Link>

      <div className={styles.body}>
        <div className={styles.top}>
          <h3 className={styles.name}>
            <Link href={`/shop/${id}`}>{name}</Link>
          </h3>
          <span className={styles.price}>
            <span className={styles.from}>from</span>
            {fromPrice}
          </span>
        </div>

        <span className={`${styles.tag} ${styles[category.toLowerCase()]}`}>{category}</span>

        {description && <p className={styles.description}>{description}</p>}

        {taste && level > 0 && (
          <div className={styles.meter}>
            <span>{taste.label}</span>
            <span className={styles.kernels} role="img" aria-label={`${taste.label} ${level} of 5`}>
              {Array.from({ length: 5 }, (_, i) => (
                <i key={i} className={i < level ? styles.on : ''} />
              ))}
            </span>
          </div>
        )}

        <Button variant="kettle" size="sm" fullWidth onClick={handleAdd} className={styles.add}>
          {added ? 'Added ✓' : '+ Add to bag'}
        </Button>
      </div>
    </article>
  );
}
