'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, ArrowUpRight, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  id: string;
  name: string;
  price: string;
  image: string;
  description?: string;
  category?: 'Sweet' | 'Savory' | 'Spicy' | 'Seasonal';
}

export default function ProductCard({
  id,
  name,
  price,
  image,
  description,
  category = 'Sweet',
}: ProductCardProps) {
  const { addItem, openDrawer } = useCart();
  const [added, setAdded] = useState(false);

  const handleQuickAdd = () => {
    addItem(
      {
        id,
        name,
        price,
        image,
        category,
        description: description || '',
      },
      'Medium (Family)',
      1
    );
    setAdded(true);
    openDrawer();
    setTimeout(() => setAdded(false), 1400);
  };

  // Determine dynamic badge & meters based on flavor name
  const isBestSeller = name.includes('Cheddar') && name.includes('Caramel');
  const isSpicy = name.toLowerCase().includes('jalapeño') || category === 'Spicy';
  const isClassic = name.toLowerCase().includes('regular') || name.toLowerCase().includes('sweet & salty');

  const badgeText = isBestSeller
    ? '#1 Best Seller'
    : isSpicy
    ? 'Desert Heat'
    : isClassic
    ? 'Original Kettle'
    : category === 'Savory'
    ? 'Aged Cheddar'
    : 'Artisan Glaze';

  return (
    <div className={styles.card}>
      <Link href={`/shop/${id}`} className={styles.imageFrame}>
        <span className={styles.tasteBadge}>{badgeText}</span>
        <Image
          src={image}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={styles.image}
        />
      </Link>

      <div className={styles.info}>
        <div className={styles.header}>
          <Link href={`/shop/${id}`}>
            <h3 className={styles.name}>{name}</h3>
          </Link>
          <span className={styles.price}>{price}</span>
        </div>

        {description && <p className={styles.description}>{description}</p>}

        {/* Dynamic Taste Profile Meters */}
        <div className={styles.tasteBox}>
          <div className={styles.tasteRow}>
            <span>{isSpicy ? 'Savory Sharpness' : 'Sweetness'}</span>
            <div className={styles.tasteMeter}>
              <div
                className={styles.tasteBarGold}
                style={{ width: isSpicy ? '90%' : isBestSeller ? '85%' : '75%' }}
              />
            </div>
          </div>
          <div className={styles.tasteRow}>
            <span>{isSpicy ? 'Jalapeño Kick' : isBestSeller ? 'Sharp Cheddar' : 'Sea Salt Crunch'}</span>
            <div className={styles.tasteMeter}>
              <div
                className={isSpicy ? styles.tasteBarSage : styles.tasteBarRed}
                style={{ width: isSpicy ? '70%' : isBestSeller ? '90%' : '80%' }}
              />
            </div>
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className={styles.cardFooter}>
          <button
            type="button"
            onClick={handleQuickAdd}
            className={`${styles.quickAddBtn} ${added ? styles.quickAddBtnSuccess : ''}`}
          >
            {added ? (
              <>
                <Check size={14} />
                <span>Added to Bag!</span>
              </>
            ) : (
              <>
                <ShoppingBag size={14} />
                <span>+ Quick Add</span>
              </>
            )}
          </button>
          <Link href={`/shop/${id}`} className={styles.detailsBtn} title="View bag sizes & details">
            <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}
