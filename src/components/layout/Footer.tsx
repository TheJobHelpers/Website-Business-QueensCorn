import Image from 'next/image';
import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className="main-container">
        <div className={styles.grid}>
          
          {/* Brand Column */}
          <div className={styles.brandCol}>
            <div className={styles.logoBox}>
              <Image 
                src="/logo.webp" 
                alt="The Queen's Corn" 
                width={80} 
                height={80} 
                className={styles.logo}
              />
            </div>
            <p className={styles.brandDescription}>
              Creating smiles one kernel at a time. Arizona&apos;s favorite handcrafted 
              kettle corn, popped with love and stirred with a hickory wooden paddle.
            </p>
          </div>

          {/* Quick Links */}
          <div className={styles.column}>
            <h3>Navigation</h3>
            <Link href="/">Home</Link>
            <Link href="/shop">Shop Flavors</Link>
            <Link href="/events">Events Schedule</Link>
            <Link href="/story">Our Story</Link>
            <Link href="/contact">Contact Us</Link>
          </div>

          {/* Contact & Booking */}
          <div className={styles.column}>
            <h3>Direct Contact</h3>
            <p className={styles.info}>
              Marana, Arizona<br />
              Serving the Southwest
            </p>
            <a href="tel:6236921811" className={styles.contactLink}>(623) 692-1811</a>
            <a href="mailto:thequeenscornaz@gmail.com" className={styles.contactLink}>thequeenscornaz@gmail.com</a>
            
            <Link href="/contact" className={styles.bookBtn}>
              Book an Event
            </Link>
          </div>

          {/* Connect & Trust */}
          <div className={styles.column}>
            <h3>Trust & Connect</h3>
            <div className={styles.bbbContainer}>
              <Image 
                src="/bbb.png" 
                alt="BBB Accredited Business A+ Rating" 
                width={180} 
                height={45} 
                className={styles.bbbImage}
              />
            </div>
            
            <div className={styles.socials}>
              <a href="#" className={styles.socialIcon} aria-label="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                <span>Facebook</span>
              </a>
              <a href="#" className={styles.socialIcon} aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                <span>Instagram</span>
              </a>
            </div>
          </div>

        </div>

        <div className={styles.bottom}>
          <p>&copy; {currentYear} The Queen&apos;s Corn. All Rights Reserved.</p>
          <div className={styles.legal}>
            <Link href="#">Privacy Policy</Link>
            <Link href="#">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
