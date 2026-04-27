import styles from './TrustBanner.module.css';

export default function TrustBanner() {
  return (
    <section className={styles.banner}>
      <div className="main-container">
        <div className={styles.content}>
          <div className={styles.item}>
            <span className={styles.label}>Location</span>
            <span className={styles.value}>Arizona, USA</span>
          </div>
          <div className={styles.divider}></div>
          <div className={styles.item}>
            <span className={styles.label}>BBB Rating</span>
            <span className={styles.value}>A+ Certified</span>
          </div>
          <div className={styles.divider}></div>
          <div className={styles.item}>
            <span className={styles.label}>Quality</span>
            <span className={styles.value}>100% Handcrafted</span>
          </div>
        </div>
      </div>
    </section>
  );
}
