'use client';

import { useState } from 'react';
import styles from './ProductDetail.module.css';

export default function ProductActions() {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <>
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
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)}>+</button>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.buyBtn}>Buy Now</button>
        <button 
          className={`${styles.cartBtn} ${added ? styles.added : ''}`}
          onClick={handleAddToCart}
        >
          {added ? 'Added to Cart!' : 'Add to Cart'}
        </button>
      </div>
    </>
  );
}
