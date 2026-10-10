'use client';

import { useState } from 'react';
import Button from './ui/Button';
import styles from './FundraisingBand.module.css';

// Landing blueprint section 6. Uses the Family bag ($10) and the 50% giveback from /fundraising.
const FAMILY_BAG_PRICE = 10;
const GIVEBACK = 0.5;

export default function FundraisingBand() {
  const [bags, setBags] = useState(100);
  const raised = bags * FAMILY_BAG_PRICE * GIVEBACK;

  return (
    <section className="v3-section" aria-labelledby="fundraising-title">
      <div className="main-container">
        <div className={styles.band}>
          <div className={styles.copy}>
            <span className="v3-eyebrow">For schools &amp; teams</span>
            <h2 id="fundraising-title" className={styles.title}>
              Your team keeps <em>50%</em> of every sale.
            </h2>
            <p className={styles.text}>
              Share your group&apos;s code, we pop every order fresh, and your team gets half of
              every sale when the campaign ends.
            </p>
            <div className={styles.actions}>
              <Button href={`/contact?subject=Fundraising&goal=${raised}`} variant="dark">
                Start a fundraiser
              </Button>
              <Button href="/fundraising" variant="ghost">
                How it works
              </Button>
            </div>
          </div>

          <div className={styles.calc}>
            <label htmlFor="fundraiser-bags" className={styles.calcLabel}>
              Family bags your group sells
            </label>
            <output htmlFor="fundraiser-bags" className={styles.bags}>
              {bags}
            </output>
            <input
              id="fundraiser-bags"
              type="range"
              min={25}
              max={500}
              step={25}
              value={bags}
              onChange={(e) => setBags(Number(e.target.value))}
              className={styles.range}
            />
            <p className={styles.eq}>
              {bags} × ${FAMILY_BAG_PRICE} × 50% =
            </p>
            <p className={styles.result} aria-live="polite">
              ${raised.toLocaleString('en-US')}
              <span>for your team</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
