import styles from './Testimonials.module.css';

// Landing blueprint section 8. REAL reviews only: copied word for word, with permission,
// and linked to where they were posted. The section stays hidden while this list is empty.
// (The previous three reviews were placeholders and have been removed.)
interface Review {
  quote: string;
  name: string;
  source: 'Google' | 'Facebook' | 'Yelp' | 'In person';
  url?: string;
  context?: string; // e.g. "Desert West Farmers' Market" or "Fundraiser organizer"
}

const REVIEWS: Review[] = [];

export default function Testimonials() {
  if (REVIEWS.length === 0) {
    return null;
  }

  return (
    <section className="v3-section" aria-labelledby="reviews-title">
      <div className="main-container">
        <header className={styles.header}>
          <span className="v3-eyebrow">From our customers</span>
          <h2 id="reviews-title" className="v3-title">
            What people say at the stand
          </h2>
        </header>

        <ul className={styles.grid}>
          {REVIEWS.slice(0, 3).map((r) => (
            <li key={r.name + r.quote.slice(0, 12)} className={styles.card}>
              <span className={styles.stars} aria-label="5 out of 5 stars">
                ★★★★★
              </span>
              <blockquote className={styles.quote}>{r.quote}</blockquote>
              <p className={styles.who}>
                <strong>{r.name}</strong>
                {r.context && <span> · {r.context}</span>}
              </p>
              {r.url ? (
                <a href={r.url} className={styles.source} target="_blank" rel="noopener noreferrer">
                  {r.source} review
                </a>
              ) : (
                <span className={styles.source}>{r.source}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
