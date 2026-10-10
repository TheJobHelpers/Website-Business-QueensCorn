import Button from './ui/Button';
import styles from './QuestionsBand.module.css';

// Landing blueprint section 9: catch the big orders that need a person, not a cart.
export default function QuestionsBand() {
  return (
    <section className="v3-section" aria-labelledby="questions-title">
      <div className="main-container">
        <div className={styles.band}>
          <div>
            <h2 id="questions-title" className={styles.title}>
              Big order or a question?
            </h2>
            <p className={styles.text}>
              Weddings, company gifts, school events: talk to Bob &amp; Reina directly.
            </p>
          </div>
          <div className={styles.actions}>
            <a href="tel:+16236921811" className={styles.phone}>
              (623) 692-1811
            </a>
            <Button href="/contact" variant="red">
              Send us a message
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
