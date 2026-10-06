'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ScrollReveal from '@/components/ScrollReveal';
import { FundraiserCampaign } from '@/data/fundraisers';
import { useCart } from '@/context/CartContext';
import { Check } from 'lucide-react';
import styles from './Fundraising.module.css';

const STEPS = [
  {
    num: '01',
    title: 'Register Your Cause',
    desc: 'Apply in two minutes. We create your dedicated campaign card and tracking code inside our portal—zero upfront cost or minimums.',
  },
  {
    num: '02',
    title: 'Share Across Arizona',
    desc: 'Supporters order handcrafted kettle corn online using your code, choosing 1–2 day Arizona USPS shipping or free Farmers’ Market pickup.',
  },
  {
    num: '03',
    title: 'Earn 50% Profit',
    desc: 'We pop every bag fresh to order and send your organization 50% of all attributed sales as soon as your campaign wraps up.',
  },
];

export default function FundraisingPage() {
  const router = useRouter();
  const { fundraisers, selectFundraiser, selectedFundraiserCode } = useCart();
  const [participants, setParticipants] = useState(25);
  const [bagsPerPerson, setBagsPerPerson] = useState(12);

  const avgBagPrice = 10; // Medium Family Bag ($10)
  const totalSales = participants * bagsPerPerson * avgBagPrice;
  const organizationProfit = totalSales * 0.5;

  const handleSupportCampaign = (campaign: FundraiserCampaign) => {
    selectFundraiser(campaign.code);
    router.push('/shop#flavor-grid');
  };

  return (
    <main className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className="main-container">
          <ScrollReveal>
            <div className={styles.heroContent}>
              <span className={styles.label}>50% Profit Back to Your Cause</span>
              <h1 className={styles.title}>
                The Queen&apos;s Corn <span className="text-accent">Fundraising</span>
              </h1>
              <p className={styles.description}>
                Arizona schools, youth sports teams, and community clubs earn a full 50%
                on every bag sold. Hand-stirred fresh in Marana and shipped statewide
                or picked up at our weekend markets.
              </p>
              <div className={styles.heroActions}>
                <Link
                  href="/contact?subject=Fundraising"
                  className={`${styles.primaryBtn} shimmer-btn`}
                >
                  Start a Fundraiser
                </Link>
                <a href="#active-campaigns" className={styles.secondaryBtn}>
                  Support an Active Cause
                </a>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <div className="main-container">
        {/* 3-Step How It Works */}
        <section className={styles.stepsSection}>
          <div className={styles.stepsGrid}>
            {STEPS.map((step, idx) => (
              <ScrollReveal key={step.num} delay={idx + 1} type="fade-up">
                <div className={styles.stepCard}>
                  <span className={styles.stepNum}>{step.num}</span>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDesc}>{step.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* Interactive Profit Calculator */}
        <section className={styles.calculatorSection}>
          <ScrollReveal type="fade-up">
            <div className={styles.calculatorCard}>
              <div className={styles.calcInfo}>
                <span className={styles.label}>Estimate Your Payout</span>
                <h2 className={styles.calcTitle}>Fundraiser Profit Calculator</h2>
                <p className={styles.calcSubtitle}>
                  Use the sliders to see how much your school, sports team, or band
                  can raise with our $10 Medium Family Bags at a 50% giveback rate.
                </p>

                <div className={styles.sliderGroup}>
                  <div className={styles.sliderHeader}>
                    <label htmlFor="participants-slider">Number of Participants</label>
                    <span className={styles.sliderValue}>{participants} members</span>
                  </div>
                  <input
                    id="participants-slider"
                    type="range"
                    min={5}
                    max={150}
                    step={5}
                    value={participants}
                    onChange={(e) => setParticipants(Number(e.target.value))}
                    className={styles.rangeInput}
                  />
                </div>

                <div className={styles.sliderGroup}>
                  <div className={styles.sliderHeader}>
                    <label htmlFor="bags-slider">Avg. Bags Sold per Person ($10 Bag)</label>
                    <span className={styles.sliderValue}>{bagsPerPerson} bags</span>
                  </div>
                  <input
                    id="bags-slider"
                    type="range"
                    min={4}
                    max={50}
                    step={2}
                    value={bagsPerPerson}
                    onChange={(e) => setBagsPerPerson(Number(e.target.value))}
                    className={styles.rangeInput}
                  />
                </div>
              </div>

              <div className={styles.calcResult}>
                <span className={styles.resultLabel}>Estimated 50% Organization Profit</span>
                <div className={styles.resultAmount}>
                  ${organizationProfit.toLocaleString()}
                </div>
                <div className={styles.resultMeta}>
                  <span>Total Bag Sales: ${totalSales.toLocaleString()}</span>
                  <span>•</span>
                  <span>{(participants * bagsPerPerson).toLocaleString()} Bags Popped Fresh</span>
                </div>
                <Link
                  href={`/contact?subject=Fundraising&goal=${organizationProfit}`}
                  className={`${styles.primaryBtn} shimmer-btn`}
                  style={{ width: '100%', textAlign: 'center' }}
                >
                  Apply to Raise ${organizationProfit.toLocaleString()}
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* Active Arizona Fundraisers */}
        <section id="active-campaigns" className={styles.campaignsSection}>
          <ScrollReveal>
            <div className={styles.sectionHeader}>
              <span className={styles.label}>Live Community Campaigns</span>
              <h2 className={styles.sectionTitle}>Support an Active Arizona Fundraiser</h2>
              <p className={styles.sectionSubtitle}>
                Click &ldquo;Shop &amp; Support&rdquo; on any campaign below—your Queen&apos;s Corn Bag will
                automatically credit 50% of your order to that organization at checkout.
              </p>
            </div>
          </ScrollReveal>

          <div className={styles.campaignsGrid}>
            {fundraisers.map((campaign, idx) => {
              const percent = Math.min(
                100,
                Math.round((campaign.raisedAmount / campaign.goalAmount) * 100)
              );
              const isSelected = selectedFundraiserCode === campaign.code;

              return (
                <ScrollReveal key={campaign.id} delay={(idx % 3) + 1} type="fade-up">
                  <div
                    className={`${styles.campaignCard} ${
                      isSelected ? styles.campaignCardActive : ''
                    }`}
                  >
                    <div className={styles.campaignTop}>
                      <span className={styles.campaignCategory}>{campaign.category}</span>
                      <span className={styles.campaignLocation}>{campaign.location}</span>
                    </div>

                    <h3 className={styles.campaignTitle}>{campaign.organization}</h3>
                    <p className={styles.campaignDesc}>{campaign.description}</p>

                    <div className={styles.progressBox}>
                      <div className={styles.progressNumbers}>
                        <span>
                          <strong>${campaign.raisedAmount.toLocaleString()}</strong> raised
                        </span>
                        <span>Goal: ${campaign.goalAmount.toLocaleString()} ({percent}%)</span>
                      </div>
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressBarFill}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    <div className={styles.campaignMeta}>
                      <span>
                        Code: <strong className={styles.codeBadge}>{campaign.code}</strong>
                      </span>
                      <span>Ends {campaign.endDate}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSupportCampaign(campaign)}
                      className={`${styles.supportBtn} shimmer-btn`}
                    >
                      {isSelected ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <Check size={16} /> Supporting ({campaign.code}) — Shop Flavors
                        </span>
                      ) : (
                        'Shop & Support (50% Giveback)'
                      )}
                    </button>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
