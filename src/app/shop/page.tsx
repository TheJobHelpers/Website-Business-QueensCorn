'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import ScrollReveal from '@/components/ScrollReveal';
import styles from './Shop.module.css';

const ALL_PRODUCTS = [
  { id: '1', name: 'Regular Sweet & Salty', price: '$6.00', image: '/flavor-regular-real.png', category: 'Sweet' },
  { id: '2', name: 'Caramel', price: '$6.00', image: '/flavor-caramel-real.png', category: 'Sweet' },
  { id: '3', name: 'Cheddar', price: '$6.00', image: '/flavor-cheddar-real.png', category: 'Savory' },
  { id: '4', name: 'Jalapeno', price: '$6.00', image: '/flavor-jalapeno-real.png', category: 'Spicy' },
  { id: '5', name: 'Caramel Apple', price: '$6.00', image: '/flavor-mix-real.png', category: 'Sweet' },
  { id: '6', name: 'Caramel & Cheddar', price: '$6.00', image: '/flavor-mix-real.png', category: 'Savory' },
  { id: '7', name: 'Holiday Mix', price: '$6.00', image: '/flavor-mix-real.png', category: 'Seasonal' },
  { id: '8', name: 'Patriot Mix', price: '$6.00', image: '/flavor-patriot-real.png', category: 'Seasonal' },
];

const CATEGORIES = ['All Flavors', 'Sweet', 'Savory', 'Spicy', 'Seasonal'];

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState('All Flavors');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'All Flavors') return ALL_PRODUCTS;
    return ALL_PRODUCTS.filter(p => p.category === activeCategory);
  }, [activeCategory]);

  return (
    <main className={styles.shopPage}>
      
      {/* Branded Editorial Shop Header */}
      <section className={styles.hero}>
        <div className={styles.heroGlow}></div>
        <div className="main-container">
          <ScrollReveal>
            <div className={styles.heroContent}>
              <span className={styles.label}>Handcrafted Excellence</span>
              <h1 className={styles.title}>The Flavor Vault</h1>
              <p className={styles.description}>
                Every kernel reigns supreme. Discover our collection of 
                small-batch kettle corn, hand-stirred with a hickory paddle 
                and polished with pure ingredients.
              </p>
            </div>
          </ScrollReveal>
        </div>
        
      </section>

      <div className="main-container">
        {/* Mobile Filter Selector - Custom Premium Dropdown */}
        <div className={styles.mobileFilter}>
          <div 
            className={`${styles.customSelect} ${isDropdownOpen ? styles.customSelectOpen : ''}`}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span>{activeCategory}</span>
            <div className={`${styles.selectIcon} ${isDropdownOpen ? styles.rotate : ''}`}>
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          
          {isDropdownOpen && (
            <>
              <div className={styles.dropdownOverlay} onClick={() => setIsDropdownOpen(false)} />
              <ul className={styles.dropdownList}>
                {CATEGORIES.map(cat => (
                  <li 
                    key={cat} 
                    className={`${styles.dropdownItem} ${activeCategory === cat ? styles.activeItem : ''}`}
                    onClick={() => {
                      setActiveCategory(cat);
                      setIsDropdownOpen(false);
                    }}
                  >
                    {cat}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>


        {/* Desktop Filter Bar */}
        <div className={styles.filterBar}>
          {CATEGORIES.map(cat => (
            <button 
              key={cat}
              className={`${styles.filterBtn} ${activeCategory === cat ? styles.filterBtnActive : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className={styles.grid}>
          {filteredProducts.map((product, i) => (
            <ScrollReveal key={`${activeCategory}-${product.id}`} delay={i * 0.1} type="fade-up">
              <ProductCard {...product} />
            </ScrollReveal>
          ))}

          {/* Interstitial 1 - Only show when viewing all or sweet */}
          {(activeCategory === 'All Flavors' || activeCategory === 'Sweet') && (
            <div className={styles.interstitial}>
              <ScrollReveal>
                <div className={styles.interstitialContent}>
                  <h3>Authentic Kettle Corn</h3>
                  <p>Pure ingredients. No machines. Just a wooden paddle and a whole lot of love.</p>
                </div>
              </ScrollReveal>
            </div>
          )}
        </div>

        {/* Branded Delivery/Coming Soon Section */}
        <ScrollReveal type="fade-up">
          <div className={styles.orderingCard}>
            <div className={styles.orderingGrid}>
              <div className={`${styles.orderingImage} img-wrapper-treatment`}>
                <Image 
                  src="/flavor-mix-real.png" 
                  alt="Assorted Kettle Corn" 
                  width={400} 
                  height={400} 
                  className={`${styles.productImg} img-treatment`}
                />
              </div>
              <div className={styles.orderingContent}>
                <h2 className={styles.orderingTitle}>Online Ordering Coming Soon</h2>
                <p className={styles.orderingText}>
                  We&apos;re working on bringing more of our handcrafted kettle corn flavors to Grubhub soon. 
                  In the meantime, explore our flavors below or reach out to book The Queen&apos;s Corn 
                  for your next event.
                </p>
                <div className={styles.orderingActions}>
                  <button 
                    className={`${styles.primaryBtn} shimmer-btn`}
                    onClick={() => document.getElementById('flavor-grid')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Explore Flavors
                  </button>
                  <Link href="/contact" className={styles.secondaryBtn}>
                    Book an Event
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Anchor point for the grid */}
        <div id="flavor-grid" style={{ paddingTop: '4rem' }}></div>

      </div>
    </main>
  );
}
