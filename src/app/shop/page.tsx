'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import ScrollReveal from '@/components/ScrollReveal';
import { CATEGORIES } from '@/data/products';
import { useCart } from '@/context/CartContext';
import styles from './Shop.module.css';

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState<string>('All Flavors');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const {
    products,
    fundraisers,
    fulfillmentMethod,
    selectedPickupEvent,
    selectedFundraiserCode,
    setFulfillmentMethod,
    setSelectedFundraiserCode,
  } = useCart();

  const activeFundraiser = fundraisers.find(
    (f) => f.code === selectedFundraiserCode
  );

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'All Flavors') return products;
    return products.filter(p => p.category === activeCategory);
  }, [activeCategory, products]);

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

      <div id="flavor-grid" className="main-container">
        {/* Active Context Banner (Fundraiser or Market Pickup) */}
        {(activeFundraiser || fulfillmentMethod === 'pickup') && (
          <div className={styles.contextBanner}>
            {activeFundraiser && (
              <div className={styles.contextItem}>
                <span>
                  🎗️ Supporting <strong>{activeFundraiser.organization}</strong> (50% Giveback • Code: {activeFundraiser.code})
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedFundraiserCode('')}
                  className={styles.clearContextBtn}
                >
                  Clear
                </button>
              </div>
            )}
            {fulfillmentMethod === 'pickup' && (
              <div className={styles.contextItem}>
                <span>
                  🎪 Free Market Pickup Selected: <strong>{selectedPickupEvent}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setFulfillmentMethod('shipping')}
                  className={styles.clearContextBtn}
                >
                  Switch to AZ Shipping
                </button>
              </div>
            )}
          </div>
        )}

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
            <ScrollReveal key={`${activeCategory}-${product.id}`} delay={(i % 3) + 1} type="fade-up">
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

        {/* Arizona Shipping, Market Pickup & Fundraising Card */}
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
                <h2 className={styles.orderingTitle}>Arizona Shipping, Market Pickup &amp; 50% Fundraising</h2>
                <p className={styles.orderingText}>
                  Enjoy 1–2 day USPS Ground Advantage shipping across Arizona (free on orders $35+), 
                  reserve bags for free pickup at our weekend Farmers&apos; Markets, or partner with 
                  us to raise 50% profit for your school or team.
                </p>
                <div className={styles.orderingActions}>
                  <Link href="/fundraising" className={`${styles.primaryBtn} shimmer-btn`}>
                    Explore 50% Fundraising
                  </Link>
                  <Link href="/events" className={styles.secondaryBtn}>
                    View Market Pickup Dates
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

      </div>
    </main>
  );
}
