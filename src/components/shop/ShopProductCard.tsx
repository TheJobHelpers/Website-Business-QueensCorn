'use client';

import { useState, type CSSProperties } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import type { Product } from '@/data/products';
import { productImageFor } from '@/data/product-images';
import { BAG_SIZES, bagPrice, formatPrice } from '@/lib/shop';
import Button from '../ui/Button';
import styles from './ShopProductCard.module.css';

// Shop blueprint section 2 (wiki/design-system/shop-page-blueprint.html#s2): the shop card.
// Photo with the taste tag, name, one line, taste meter, then the three sizes with prices,
// a quantity stepper and "Add · $line-total". The homepage keeps the compact ProductCard.
// `index` staggers the entrance of neighbouring cards (.enter in globals.css).
export default function ShopProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { addItem } = useCart();
  const [sizeIndex, setSizeIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const size = BAG_SIZES[sizeIndex];
  const lineTotal = bagPrice(product.price, size.multiplier) * quantity;
  const level = Math.max(0, Math.min(5, Math.round(product.taste?.level ?? 0)));

  const handleAdd = () => {
    addItem(product, size.key, quantity);
    setAdded(true);
    setQuantity(1);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <article className={`${styles.card} enter`} style={{ '--i': Math.min(index, 7) } as CSSProperties}>
      <Link href={`/shop/${product.id}`} className={styles.photo} tabIndex={-1} aria-hidden="true">
        <Image
          src={productImageFor(product.name, product.image)}
          alt=""
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1100px) 33vw, 25vw"
          className={styles.image}
        />
        <span className={`${styles.tag} ${styles[product.category.toLowerCase()]}`}>{product.category}</span>
      </Link>

      <div className={styles.body}>
        <h3 className={styles.name}>
          <Link href={`/shop/${product.id}`}>{product.name}</Link>
        </h3>
        <p className={styles.description}>{product.description}</p>

        {product.taste && level > 0 && (
          <div className={styles.meter}>
            <span>{product.taste.label}</span>
            <span className={styles.kernels} role="img" aria-label={`${product.taste.label} ${level} of 5`}>
              {Array.from({ length: 5 }, (_, i) => (
                <i key={i} className={i < level ? styles.on : ''} />
              ))}
            </span>
          </div>
        )}

        <div className={styles.sizes} role="radiogroup" aria-label={`Size of ${product.name}`}>
          {BAG_SIZES.map((s, i) => (
            <label key={s.key} className={i === sizeIndex ? styles.sizeOn : ''}>
              <input
                type="radio"
                name={`size-${product.id}`}
                checked={i === sizeIndex}
                onChange={() => setSizeIndex(i)}
              />
              <span className={styles.sizeName}>{s.label}</span>
              <span className={styles.sizePrice}>{formatPrice(bagPrice(product.price, s.multiplier))}</span>
            </label>
          ))}
        </div>

        <div className={styles.addRow}>
          <span className={styles.qty}>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity === 1}
              aria-label="Fewer"
            >
              −
            </button>
            <span aria-live="polite">{quantity}</span>
            <button type="button" onClick={() => setQuantity((q) => Math.min(20, q + 1))} aria-label="More">
              +
            </button>
          </span>
          <Button
            variant="kettle"
            size="sm"
            fullWidth
            onClick={handleAdd}
            aria-label={`Add ${quantity} ${size.label} ${product.name} to bag`}
          >
            {added ? 'Added ✓' : `Add · ${formatPrice(lineTotal)}`}
          </Button>
        </div>
      </div>
    </article>
  );
}
