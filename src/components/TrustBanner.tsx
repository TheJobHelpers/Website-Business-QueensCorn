import { ShieldCheck, Calendar, Award, Heart } from 'lucide-react';
import styles from './TrustBanner.module.css';

export default function TrustBanner() {
  const STAMPS = [
    {
      icon: ShieldCheck,
      color: '#F5BA31',
      title: '100% Non-GMO Corn',
      sub: 'Monster mushroom kernels for maximum crunch',
    },
    {
      icon: Calendar,
      color: '#F5BA31',
      title: 'Popped Fresh in Arizona',
      sub: 'Handcrafted daily for local weekend markets',
    },
    {
      icon: Award,
      color: '#F5BA31',
      title: 'BBB A+ Accredited',
      sub: 'Verified local Arizona small business',
    },
    {
      icon: Heart,
      color: '#D9232A',
      title: '50% School Giveback',
      sub: 'Over $34,000 donated to local teams & youth',
    },
  ];

  return (
    <section className={styles.banner}>
      <div className="main-container">
        <div className={styles.content}>
          {STAMPS.map((stamp) => {
            const Icon = stamp.icon;
            return (
              <div key={stamp.title} className={styles.stampItem}>
                <span className={styles.stampIcon}>
                  <Icon size={24} style={{ color: stamp.color }} />
                </span>
                <div className={styles.stampText}>
                  <span className={styles.stampTitle}>{stamp.title}</span>
                  <span className={styles.stampSub}>{stamp.sub}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
