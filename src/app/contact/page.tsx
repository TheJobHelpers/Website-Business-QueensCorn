import ScrollReveal from '@/components/ScrollReveal';
import styles from './Contact.module.css';

export default function ContactPage() {
  return (
    <main className={styles.contactPage}>
      <div className="main-container">
        
        {/* Hero Section */}
        <div className={styles.hero}>
          <ScrollReveal type="fade-up">
            <span className={styles.label}>Get in Touch</span>
            <h1 className={styles.title}>Connect with the <br /> <span className="text-accent">Royal Kettle</span></h1>
          </ScrollReveal>
        </div>

        <div className={styles.grid}>
          {/* Left: Contact Form */}
          <ScrollReveal type="slide-right">
            <div className={styles.formContainer}>
              <form>
                <div className={styles.formGroup}>
                  <label htmlFor="name">Your Name</label>
                  <input type="text" id="name" className={styles.input} placeholder="Queen of Hearts" />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="email">Email Address</label>
                  <input type="email" id="email" className={styles.input} placeholder="hello@royalcorn.com" />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="subject">Subject</label>
                  <select id="subject" className={styles.input}>
                    <option>General Inquiry</option>
                    <option>Event Booking</option>
                    <option>Wholesale Request</option>
                    <option>Flavor Suggestion</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="message">How can we make you smile?</label>
                  <textarea id="message" className={styles.textarea} placeholder="Tell us about your event or craving..."></textarea>
                </div>

                <button type="submit" className={`${styles.submitBtn} shimmer-btn`}>
                  Send Message
                </button>
              </form>
            </div>
          </ScrollReveal>

          {/* Right: Contact Info */}
          <ScrollReveal type="slide-left">
            <div className={styles.infoColumn}>
              
              <div className={styles.infoBlock}>
                <h3>Direct Line</h3>
                <a href="tel:6236921811">(623) 692-1811</a>
              </div>

              <div className={styles.infoBlock}>
                <h3>Digital Mail</h3>
                <a href="mailto:thequeenscornaz@gmail.com">thequeenscornaz@gmail.com</a>
              </div>

              <div className={styles.infoBlock}>
                <h3>The Castle</h3>
                <p>Marana, Arizona <br /> Serving the Southwest</p>
              </div>

              <div className={styles.infoBlock}>
                <h3>Social Presence</h3>
                <div className={styles.socials}>
                  <a href="#" className={styles.socialLink} aria-label="Facebook">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                  </a>
                  <a href="#" className={styles.socialLink} aria-label="Instagram">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  </a>
                </div>
              </div>

            </div>
          </ScrollReveal>
        </div>

      </div>
    </main>
  );
}
