import ScrollReveal from './ScrollReveal';
import styles from './Testimonials.module.css';

const REVIEWS = [
  {
    text: "The absolute best kettle corn in Arizona. You can really taste the difference that hand-stirring makes. Every kernel is perfectly coated!",
    author: "Sarah Jenkins",
    role: "Local Customer",
    context: "Arizona Native"
  },
  {
    text: "We hire The Queen's Corn for our corporate events and they are always the highlight. Professional, friendly, and the aroma is incredible.",
    author: "Mark Thompson",
    role: "Event Coordinator",
    context: "Corporate Events"
  },
  {
    text: "My kids won't eat any other popcorn now. The Cheddar and Jalapeno mix is our family favorite. Truly a happy place for snacks!",
    author: "Elena Rodriguez",
    role: "Family Customer",
    context: "Weekly Regular"
  }
];

export default function Testimonials() {
  return (
    <section className={styles.section}>
      <div className="main-container">
        <header className={styles.header}>
          <ScrollReveal>
            <span className={styles.label}>Royal Praise</span>
            <h2 className={styles.title}>What Our Community Says</h2>
            <p className={styles.tagline}>Loved at markets, events, and family gatherings across Arizona.</p>
          </ScrollReveal>
        </header>

        <div className={styles.grid}>
          {REVIEWS.map((review, i) => (
            <ScrollReveal key={i} delay={i} type="fade-up">
              <div className={styles.card}>
                <div className={styles.stars}>
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={styles.star}>★</span>
                  ))}
                </div>
                <p className={styles.text}>{review.text}</p>
                <div className={styles.author}>
                  <div className={styles.authorInfo}>
                    <h4>{review.author}</h4>
                    <div className={styles.authorMeta}>
                      <span className={styles.role}>{review.role}</span>
                      <span className={styles.context}>• {review.context}</span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
