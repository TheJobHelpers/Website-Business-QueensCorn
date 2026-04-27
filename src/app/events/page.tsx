import Image from 'next/image';
import ScrollReveal from '@/components/ScrollReveal';
import styles from './EventsPage.module.css';

const EVENTS = [
  {
    month: 'Feb',
    day: '21',
    year: '2026',
    title: "Desert West Farmer's Market",
    desc: 'Join us at the Estrella Mountain Community College for a great location with hundreds of vendors.',
    time: '9:00 am - 1:00 pm',
    location: 'Avondale, AZ 85392'
  },
  {
    month: 'Feb',
    day: '28',
    year: '2026',
    title: 'Oro Valley Fine Art & Wine Festival',
    desc: 'Located south of Tucson against the Sonoran Desert. Featuring fine arts and signature wines.',
    time: '11:00 am - 5:00 pm',
    location: 'James Kreigh Park, Valley, AZ'
  },
  {
    month: 'Mar',
    day: '07-08',
    year: '2026',
    title: 'High Street Arts Festival',
    desc: 'Artists, more artists, and premium wine tasting. A perfect weekend for the whole family.',
    time: '10:00 am - 5:00 pm',
    location: 'Desert Ridge Marketplace'
  },
  {
    month: 'Mar',
    day: '07-08',
    year: '2026',
    title: 'Litchfield Park Spring Art and Wine Festival',
    desc: 'Located in the beautiful new Litchfield Square Park. Come browse and enjoy a delicious bag of kettle corn.',
    time: '10:00 am - 4:00 pm',
    location: 'Litchfield Park Square'
  },
  {
    month: 'Mar',
    day: '14',
    year: '2026',
    title: "Desert West Farmer's Market",
    desc: 'A return to the Estrella Mountain Community College. Partnering with dozens of local creators.',
    time: '9:00 am - 1:00 pm',
    location: 'Avondale, AZ 85392'
  }
];

export default function EventsPage() {
  return (
    <main className={styles.page}>
      <div className="main-container">
        
        {/* Header */}
        <header className={styles.header}>
          <ScrollReveal>
            <span className={styles.label}>Where to find us</span>
            <h1 className={styles.title}>Upcoming Events</h1>
          </ScrollReveal>
        </header>

        {/* Events List */}
        <div className={styles.eventsContainer}>
          {EVENTS.map((event, i) => (
            <ScrollReveal key={i} delay={i} type={i % 2 === 0 ? 'slide-right' : 'slide-left'}>
              <div className={styles.eventCard}>
                <div className={styles.dateBlock}>
                  <span className={styles.month}>{event.month}</span>
                  <span className={styles.day}>{event.day}</span>
                  <span className={styles.year}>{event.year}</span>
                </div>
                
                <div className={styles.infoBlock}>
                  <h3 className={styles.eventTitle}>{event.title}</h3>
                  <p className={styles.eventDesc}>{event.desc}</p>
                </div>
                
                <div className={styles.locationBlock}>
                  <span className={styles.time}>{event.time}</span>
                  <span className={styles.address}>{event.location}</span>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Photo Gallery */}
        <section className={styles.gallerySection}>
          <ScrollReveal>
            <div style={{ textAlign: 'center' }}>
              <span className={styles.label}>Captured Moments</span>
              <h2 className={styles.title}>Event Gallery</h2>
            </div>
          </ScrollReveal>

          <div className={styles.galleryGrid}>
            <ScrollReveal delay={1}>
              <div className={styles.galleryItem}>
                <Image src="/our-story-team.webp" alt="Event setup" fill className="object-cover" />
              </div>
            </ScrollReveal>
            <ScrollReveal delay={2}>
              <div className={styles.galleryItem}>
                <Image src="/story-market.png" alt="Market stand" fill className="object-cover" />
              </div>
            </ScrollReveal>
            <ScrollReveal delay={3}>
              <div className={styles.galleryItem}>
                <Image src="/process-paddle.png" alt="Popping fresh" fill className="object-cover" />
              </div>
            </ScrollReveal>
          </div>
        </section>

      </div>
    </main>
  );
}
