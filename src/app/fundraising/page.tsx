'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import QuestionsBand from '@/components/QuestionsBand';
import type { FundraiserCampaign } from '@/data/fundraisers';
import { useCart, SHIPPING_AVAILABLE } from '@/context/CartContext';
import styles from './Fundraising.module.css';

// Fundraising page, design system v3.1. In order: the offer, how it works, what a group
// could raise (calculator), the campaigns running now, and who to ask.
const FAMILY_BAG_PRICE = 10;
const GIVEBACK = 0.5;

const FACTS = ['No upfront cost', 'No minimum order', 'Paid when your campaign ends'];

const STEPS = [
  {
    title: 'Tell us about your group',
    text: 'Send us a short message. We set up your campaign and give your group its own code.',
  },
  {
    title: 'Share your code',
    text: SHIPPING_AVAILABLE
      ? 'Supporters order online with your code and choose Arizona shipping or free market pickup.'
      : 'Supporters order online with your code and collect it free at a market. Arizona shipping is coming soon.',
  },
  {
    title: 'Your group gets 50%',
    text: 'We pop every bag fresh to order and send your group half of its sales when the campaign ends.',
  },
];

const money = (amount: number) => `$${amount.toLocaleString('en-US')}`;

export default function FundraisingPage() {
  const router = useRouter();
  const { fundraisers, selectFundraiser, selectedFundraiserCode } = useCart();
  const [members, setMembers] = useState(25);
  const [bagsEach, setBagsEach] = useState(12);

  const bags = members * bagsEach;
  const raised = bags * FAMILY_BAG_PRICE * GIVEBACK;

  const support = (campaign: FundraiserCampaign) => {
    selectFundraiser(campaign.code);
    router.push('/shop#flavor-grid');
  };

  return (
    <main className={styles.page}>
      <div className="main-container">
        {/* 1. The offer */}
        <header className={`${styles.head} enter`}>
          <Image src="/our-story-team.webp" alt="" fill priority sizes="100vw" className={`${styles.headBg} fx-parallax`} />
          <div className={styles.intro}>
            <span className={styles.eyebrow}>Fundraising</span>
            <h1 className={styles.title}>
              Your team keeps <em>50%</em> of every sale.
            </h1>
            <p className={styles.lede}>
              For Arizona schools, youth sports teams and community clubs. Your supporters get fresh kettle
              corn, and your group gets half of what they spend.
            </p>
            <div className={styles.headActions}>
              <Button href="/contact?subject=Fundraising" variant="red">
                Start a fundraiser
              </Button>
              <Button href="#active-campaigns" variant="light">
                Support a team
              </Button>
            </div>
          </div>
          <ul className={styles.facts}>
            {FACTS.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
        </header>

        {/* 2. How it works */}
        <section className={styles.section} aria-labelledby="how-title">
          <span className="v3-eyebrow">How it works</span>
          <h2 id="how-title" className="v3-title">
            Three steps from sign-up to payout
          </h2>
          <ol className={`${styles.steps} fx-stagger`}>
            {STEPS.map((step, i) => (
              <li key={step.title} className={styles.step}>
                <span className={styles.stepNo}>{i + 1}</span>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* 3. What your group could raise */}
        <section className={`${styles.calc} fx-zoom`} aria-labelledby="calc-title">
          <div className={styles.calcCopy}>
            <span className="v3-eyebrow">Estimate your payout</span>
            <h2 id="calc-title" className={styles.calcTitle}>
              What could your group raise?
            </h2>
            <p className={styles.calcText}>
              Move the sliders. The estimate uses our ${FAMILY_BAG_PRICE} Family bag and the 50% your group keeps.
            </p>

            <div className={styles.slider}>
              <label htmlFor="members-slider">
                People selling <output htmlFor="members-slider">{members}</output>
              </label>
              <input
                id="members-slider"
                type="range"
                min={5}
                max={150}
                step={5}
                value={members}
                onChange={(e) => setMembers(Number(e.target.value))}
              />
            </div>

            <div className={styles.slider}>
              <label htmlFor="bags-slider">
                Bags each person sells <output htmlFor="bags-slider">{bagsEach}</output>
              </label>
              <input
                id="bags-slider"
                type="range"
                min={4}
                max={50}
                step={2}
                value={bagsEach}
                onChange={(e) => setBagsEach(Number(e.target.value))}
              />
            </div>
          </div>

          <div className={styles.result}>
            <span className={styles.resultLabel}>Your group keeps</span>
            <p className={styles.resultAmount} aria-live="polite">
              {money(raised)}
            </p>
            <p className={styles.resultEq}>
              {bags.toLocaleString('en-US')} bags × ${FAMILY_BAG_PRICE} × 50%
            </p>
            <Button href={`/contact?subject=Fundraising&goal=${raised}`} variant="red" fullWidth>
              Start a fundraiser
            </Button>
          </div>
        </section>

        {/* 4. Campaigns running now */}
        <section id="active-campaigns" className={styles.section} aria-labelledby="campaigns-title">
          <span className="v3-eyebrow">Running now</span>
          <h2 id="campaigns-title" className="v3-title">
            Support a team
          </h2>
          <p className="v3-lede">
            Choose a campaign and shop as usual. Half of your order goes to that group at checkout.
          </p>

          {fundraisers.length === 0 ? (
            <p className={styles.empty}>No campaigns are running right now. Yours could be the first.</p>
          ) : (
            <ul className={`${styles.campaigns} fx-stagger`}>
              {fundraisers.map((campaign) => {
                const percent = Math.min(100, Math.round((campaign.raisedAmount / campaign.goalAmount) * 100));
                const isSelected = selectedFundraiserCode === campaign.code;

                return (
                  <li key={campaign.id} className={`${styles.campaign} ${isSelected ? styles.campaignOn : ''}`}>
                    <div className={styles.campaignTop}>
                      <span className={styles.category}>{campaign.category}</span>
                      <span className={styles.location}>{campaign.location}</span>
                    </div>
                    <h3 className={styles.campaignTitle}>{campaign.organization}</h3>
                    <p className={styles.campaignText}>{campaign.description}</p>

                    <div className={styles.progress}>
                      <div className={styles.progressNumbers}>
                        <span>
                          <strong>{money(campaign.raisedAmount)}</strong> raised
                        </span>
                        <span>
                          of {money(campaign.goalAmount)} · {percent}%
                        </span>
                      </div>
                      <div
                        className={styles.progressBar}
                        role="progressbar"
                        aria-valuenow={percent}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${campaign.organization}: ${percent}% of goal raised`}
                      >
                        <i style={{ width: `${percent}%` }} />
                      </div>
                    </div>

                    <div className={styles.campaignMeta}>
                      <span>
                        Code <strong className={styles.code}>{campaign.code}</strong>
                      </span>
                      <span>Ends {campaign.endDate}</span>
                    </div>

                    <Button variant={isSelected ? 'kettle' : 'dark'} size="sm" fullWidth onClick={() => support(campaign)}>
                      {isSelected ? 'Supporting ✓ · Shop flavors' : 'Shop & support'}
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {/* 5. Who to ask */}
      <QuestionsBand />
    </main>
  );
}
