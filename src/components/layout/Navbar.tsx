'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''} ${isOpen ? styles.menuOpen : ''}`}>
      <div className={styles.container}>
        {/* Left: Logo */}
        <Link href="/" className={styles.logoWrapper} onClick={closeMenu}>
          <div className={styles.logoBox}>
            <Image 
              src="/logo.webp" 
              alt="The Queen's Corn" 
              width={80} 
              height={80} 
              className={styles.logo}
              priority
            />
          </div>
        </Link>

        {/* Center: Nav Links (Desktop) */}
        <div className={styles.links}>
          <Link href="/" className={styles.link}>Home</Link>
          <Link href="/shop" className={styles.link}>Shop</Link>
          <Link href="/events" className={styles.link}>Events</Link>
          <Link href="/story" className={styles.link}>Our Story</Link>
          <Link href="/contact" className={styles.link}>Contact</Link>
        </div>

        {/* Right: Actions */}
        <div className={styles.actions}>
          <Link href="/shop" className={styles.cartIcon} aria-label="Cart">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <span className={styles.cartBadge}>0</span>
          </Link>
          
          <Link href="/shop" className={styles.desktopOnly}>
            <button className={`${styles.orderBtn} shimmer-btn`}>Order Now</button>
          </Link>

          {/* Mobile Toggle */}
          <button 
            className={`${styles.mobileToggle} ${isOpen ? styles.toggleActive : ''}`} 
            onClick={toggleMenu}
            aria-label="Menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`${styles.mobileMenu} ${isOpen ? styles.mobileMenuVisible : ''}`}>
        <div className={styles.mobileLinks}>
          <Link href="/" className={styles.mobileLink} onClick={closeMenu}>Home</Link>
          <Link href="/shop" className={styles.mobileLink} onClick={closeMenu}>Shop</Link>
          <Link href="/events" className={styles.mobileLink} onClick={closeMenu}>Events</Link>
          <Link href="/story" className={styles.mobileLink} onClick={closeMenu}>Our Story</Link>
          <Link href="/contact" className={styles.mobileLink} onClick={closeMenu}>Contact</Link>
          
          <div className={styles.mobileActions}>
            <Link href="/shop" onClick={closeMenu}>
              <button className={`${styles.orderBtn} shimmer-btn`}>Order Now</button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
