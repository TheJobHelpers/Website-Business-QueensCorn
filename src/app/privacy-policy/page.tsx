import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import styles from '../terms-of-service/TermsOfService.module.css';

export const metadata: Metadata = {
  title: "Privacy Policy | The Queen's Corn",
  description: "What information The Queen's Corn collects when you visit the website or place an order, how it is used, and who handles it.",
};

const EMAIL = 'thequeenscornaz@gmail.com';
const UPDATED = 'October 13, 2026';

// Each section says what the website really does. If the site starts collecting something new
// (accounts, shipping, a newsletter), this page has to change with it.
const SECTIONS: { id: string; title: string; body: ReactNode }[] = [
  {
    id: 'who-we-are',
    title: 'Who We Are',
    body: (
      <>
        <p>
          The Queen&apos;s Corn is a family-run kettle corn business based in Marana, Arizona. This policy covers this website and the
          orders you place through it. It explains what we learn about you, why, and who else handles that information.
        </p>
        <p>
          Questions about your information can be sent to <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
        </p>
      </>
    ),
  },
  {
    id: 'what-we-collect',
    title: 'What We Collect',
    body: (
      <div className={styles.clauseList}>
        <div className={styles.clauseItem}>
          <div className={styles.clauseTitle}>When you browse</div>
          <p className={styles.clauseDesc}>
            You do not need an account to use this website, and we do not ask who you are. We count visits in a way that does not use
            cookies and does not identify you: which pages are viewed, the kind of device, and the site a visitor came from.
          </p>
        </div>
        <div className={styles.clauseItem}>
          <div className={styles.clauseTitle}>When you place an order</div>
          <p className={styles.clauseDesc}>
            Payment happens on a secure checkout page run by Shopify. There you give your name, email address, phone number if you choose,
            any address the checkout asks for, and your payment details. Your order also records what you bought, the market where you
            will pick it up, and the fundraiser you chose to support, if any.
          </p>
        </div>
        <div className={styles.clauseItem}>
          <div className={styles.clauseTitle}>When you contact us</div>
          <p className={styles.clauseDesc}>
            The contact form opens your own email app. We receive whatever you send us: your email address, your name if you include it,
            and your message.
          </p>
        </div>
        <div className={styles.clauseItem}>
          <div className={styles.clauseTitle}>What we never receive</div>
          <p className={styles.clauseDesc}>
            Your card number and security code go straight to Shopify&apos;s payment system. They never pass through this website and we
            cannot see them.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'how-we-use-it',
    title: 'How We Use It',
    body: (
      <>
        <p>We use your information only to run the business you are buying from:</p>
        <p>
          to prepare your order and hand it to the right person at the market; to send your receipt and tell you about a problem with your
          order; to answer your questions; to work out what each fundraising group has earned; to keep the sales records the law requires;
          and to understand, in total numbers, which pages and flavors are popular.
        </p>
        <p>We do not sell your information, and we do not use it for advertising.</p>
      </>
    ),
  },
  {
    id: 'who-handles-it',
    title: 'Who Else Handles It',
    body: (
      <div className={styles.clauseList}>
        <div className={styles.clauseItem}>
          <div className={styles.clauseTitle}>Shopify</div>
          <p className={styles.clauseDesc}>
            Runs the checkout, takes the payment, and keeps our order and customer records. Shopify handles your information under its own
            privacy policy.
          </p>
        </div>
        <div className={styles.clauseItem}>
          <div className={styles.clauseTitle}>Vercel</div>
          <p className={styles.clauseDesc}>
            Hosts this website and provides the cookie-free visit counts. Like any web host, it briefly processes technical details such as
            your IP address in order to deliver the pages.
          </p>
        </div>
        <div className={styles.clauseItem}>
          <div className={styles.clauseTitle}>Our email provider</div>
          <p className={styles.clauseDesc}>Messages you send us are received and stored in our Gmail account.</p>
        </div>
        <div className={styles.clauseItem}>
          <div className={styles.clauseTitle}>Fundraising groups</div>
          <p className={styles.clauseDesc}>
            A group you support is told how much was raised for it. We do not give the group your name, contact details or what you
            bought.
          </p>
        </div>
        <div className={styles.clauseItem}>
          <div className={styles.clauseTitle}>The law</div>
          <p className={styles.clauseDesc}>We may share information when the law requires it, or to protect against fraud.</p>
        </div>
      </div>
    ),
  },
  {
    id: 'order-records',
    title: 'How Order Information Is Kept',
    body: (
      <>
        <p>
          Order and customer records are kept in our Shopify account, which only the owners and the people who maintain this website for
          them can open.
        </p>
        <p>
          This website does not keep its own copy of your order or your contact details. The owners&apos; dashboard on this website reads
          the name on each order, its number, items, total, pickup market and fundraiser choice from Shopify, so that orders can be
          prepared and handed to the right person. It does not read your address, phone number or email address, and it stores none of
          this.
        </p>
        <p>
          We keep order records for as long as tax and bookkeeping rules require, and messages for as long as they are needed to help you.
        </p>
      </>
    ),
  },
  {
    id: 'cookies',
    title: 'Cookies',
    body: (
      <>
        <p>
          The public pages of this website do not set cookies. The only cookie this website uses keeps the owners signed in to their
          dashboard.
        </p>
        <p>Shopify&apos;s checkout page sets its own cookies so that it can remember your order and protect the payment.</p>
      </>
    ),
  },
  {
    id: 'your-choices',
    title: 'Your Choices',
    body: (
      <>
        <p>
          You can ask us what information we hold about you, ask us to correct it, or ask us to delete it. Write to{' '}
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a> and we will answer within 30 days. Some order records must be kept for tax purposes even
          after a deletion request; we will tell you if that applies.
        </p>
        <p>Depending on where you live, the law may give you further rights over your information. We will honor them.</p>
      </>
    ),
  },
  {
    id: 'children',
    title: 'Children',
    body: (
      <p>
        This website is for the general public and is not directed at children under 13. We do not knowingly collect information from
        children. If you believe a child has given us information, contact us and we will remove it.
      </p>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to This Policy',
    body: (
      <p>
        If the way we handle information changes, for example when we begin shipping orders, we will update this page and the date at the
        top before the change takes effect.
      </p>
    ),
  },
];

const number = (index: number) => String(index + 1).padStart(2, '0');

export default function PrivacyPolicyPage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <span className={styles.breadcrumbCurrent}>Privacy Policy</span>
          </nav>

          <span className={styles.label}>Your Information</span>
          <h1 className={styles.title}>Privacy Policy</h1>
          <p className={styles.subtitle}>What we learn about you when you visit or order, what we do with it, and who else handles it.</p>

          <div className={styles.metaBadge}>
            <span className={styles.metaDot}></span>
            <span>Last updated {UPDATED} | The Queen&apos;s Corn (Arizona, USA)</span>
          </div>
        </header>

        <aside className={styles.tocCard} aria-labelledby="toc-heading">
          <div id="toc-heading" className={styles.tocTitle}>
            <span>Table of Contents</span>
          </div>
          <div className={styles.tocGrid}>
            {SECTIONS.map((section, index) => (
              <a key={section.id} href={`#${section.id}`} className={styles.tocLink}>
                <span className={styles.tocNum}>{number(index)}.</span>
                <span>{section.title}</span>
              </a>
            ))}
          </div>
        </aside>

        <div className={styles.sectionsList}>
          {SECTIONS.map((section, index) => (
            <section key={section.id} id={section.id} className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionBadge}>{number(index)}</span>
                <h2 className={styles.sectionTitle}>{section.title}</h2>
              </div>
              <div className={styles.contentBody}>{section.body}</div>
            </section>
          ))}
        </div>

        <div className={styles.supportCard}>
          <h2 className={styles.supportTitle}>Questions About Your Information?</h2>
          <p className={styles.supportDesc}>
            Ask us what we hold about you, or to correct or delete it. See also our <Link href="/terms-of-service">Terms of Service</Link>.
          </p>
          <div className={styles.contactGrid}>
            <div className={styles.contactItem}>
              <span className={styles.contactLabel}>Phone</span>
              <a href="tel:6236921811" className={styles.contactValue}>
                (623) 692-1811
              </a>
            </div>
            <div className={styles.contactItem}>
              <span className={styles.contactLabel}>Email</span>
              <a href={`mailto:${EMAIL}`} className={styles.contactValue}>
                {EMAIL}
              </a>
            </div>
            <div className={styles.contactItem}>
              <span className={styles.contactLabel}>Business</span>
              <span className={styles.contactValue}>Marana, Arizona, USA</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
