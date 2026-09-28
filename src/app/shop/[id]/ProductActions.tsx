'use client';

import { useState } from 'react';
import { Product } from '@/data/products';
import { useCart } from '@/context/CartContext';
import styles from './ProductDetail.module.css';

export default function ProductActions({ product }: { product: Product }) {
  const [size, setSize] = useState('Small (Individual)');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem, openDrawer } = useCart();

  const handleAddToCart = () => {
    addItem(product, size, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addItem(product, size, quantity);
    openDrawer();
  };

  return (
    <>
      <div className={styles.options}>
        <div className={styles.optionGroup}>
          <label htmlFor="size-select">Size</label>
          <select
            id="size-select"
            className={styles.select}
            value={size}
            onChange={(e) => setSize(e.target.value)}
          >
            <option value="Small (Individual)">Small (Individual) — $6.00</option>
            <option value="Medium (Family)">Medium (Family) — $10.00</option>
            <option value="Large (Party)">Large (Party) — $15.00</option>
          </select>
        </div>

        <div className={styles.optionGroup}>
          <label>Quantity</label>
          <div className={styles.quantity}>
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span>{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={`${styles.buyBtn} shimmer-btn`}
          onClick={handleBuyNow}
        >
          Buy Now
        </button>
        <button 
          type="button"
          className={`${styles.cartBtn} ${added ? styles.added : ''}`}
          onClick={handleAddToCart}
        >
          {added ? "✓ Added to Queen's Bag" : 'Add to Cart'}
        </button>
      </div>
    </>
  );
}
