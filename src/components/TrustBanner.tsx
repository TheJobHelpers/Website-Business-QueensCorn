import { ShieldCheck, Sun, Award, Heart } from 'lucide-react';
import styles from './TrustBanner.module.css';

// Only claims the owners have confirmed belong here (see wiki/design-system, "Voice").
const PROOF_POINTS = [
  {
    icon: ShieldCheck,
    figure: '100%',
    label: 'Non-GMO corn',
    detail: 'Big mushroom kernels for a crunchier pop',
  },
  {
    icon: Sun,
    figure: 'Since 2017',
    label: 'Popped fresh in Arizona',
    detail: 'Hand-stirred at local weekend markets',
  },
  {
    icon: Award,
    figure: 'A+',
    label: 'BBB accredited',
    detail: 'A verified Arizona small business',
  },
  {
    icon: Heart,
    figure: '50%',
    label: 'Back to local schools',
    detail: 'Of every fundraiser sale goes to the team',
  },
];

export default function TrustBanner() {
  return (
    <section className={styles.banner} aria-label="Why people trust The Queen's Corn">
      <div className="main-container">
        <ul className={styles.strip}>
          {PROOF_POINTS.map(({ icon: Icon, figure, label, detail }) => (
            <li key={label} className={styles.item}>
              <span className={styles.label}>
                <Icon size={16} strokeWidth={2.5} aria-hidden="true" className={styles.icon} />
                {label}
              </span>
              <span className={styles.figure}>{figure}</span>
              <span className={styles.detail}>{detail}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
