import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './TermsOfService.module.css';

export const metadata: Metadata = {
  title: "Terms of Service | The Queen's Corn",
  description: "Terms of Service for The Queen's Corn: ordering, market pickup, payments, warranties and purchase policies.",
};

const TOC_ITEMS = [
  { id: 'terms-of-use', title: 'Terms of Use', num: '01' },
  { id: 'privacy-policy', title: 'Privacy & Your Information', num: '02' },
  { id: 'shipping-delivery', title: 'Orders & Market Pickup', num: '03' },
  { id: 'online-payments', title: 'Online Payments & Order Records', num: '04' },
  { id: 'sales-tax', title: 'Sales Tax', num: '05' },
  { id: 'warranties', title: 'Warranties & Disclaimers', num: '06' },
  { id: 'return-policy', title: 'Return & Payment Policy', num: '07' },
  { id: 'miscellaneous', title: 'Governing Law & Miscellaneous', num: '08' },
];

export default function TermsOfServicePage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        
        {/* Header */}
        <header className={styles.header}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <span className={styles.breadcrumbCurrent}>Terms of Service</span>
          </nav>

          <span className={styles.label}>Legal Agreements & Policies</span>
          <h1 className={styles.title}>Terms of Service</h1>
          <p className={styles.subtitle}>
            Please review these terms and conditions carefully before placing an order or using our online store and services.
          </p>

          <div className={styles.metaBadge}>
            <span className={styles.metaDot}></span>
            <span>Effective &amp; Current | The Queen&apos;s Corn (Arizona, USA)</span>
          </div>
        </header>

        {/* Quick Navigation / Table of Contents */}
        <aside className={styles.tocCard} aria-labelledby="toc-heading">
          <div id="toc-heading" className={styles.tocTitle}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
            <span>Table of Contents</span>
          </div>
          <div className={styles.tocGrid}>
            {TOC_ITEMS.map((item) => (
              <a key={item.id} href={`#${item.id}`} className={styles.tocLink}>
                <span className={styles.tocNum}>{item.num}.</span>
                <span>{item.title}</span>
              </a>
            ))}
          </div>
        </aside>

        {/* Legal Sections List */}
        <div className={styles.sectionsList}>

          {/* 1. Terms of Use */}
          <section id="terms-of-use" className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionBadge}>01</span>
              <h2 className={styles.sectionTitle}>Terms of Use</h2>
            </div>
            <div className={styles.contentBody}>
              <p>
                This site may contain other proprietary notices and copyright information, the terms of which must be observed and followed. 
                Information on this site may contain technical inaccuracies or typographical errors.
              </p>
              <p>
                Information, including product pricing and availability, may be changed or updated without prior notice. 
                <strong>The Queen&apos;s Corn</strong> and its subsidiaries reserve the right to refuse service, terminate accounts, and/or cancel orders in their sole discretion, including, without limitation, if The Queen&apos;s Corn believes that customer conduct violates applicable law or is harmful to the interests of The Queen&apos;s Corn and its subsidiaries.
              </p>
            </div>
          </section>

          {/* 2. Privacy */}
          <section id="privacy-policy" className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionBadge}>02</span>
              <h2 className={styles.sectionTitle}>Privacy &amp; Your Information</h2>
            </div>
            <div className={styles.contentBody}>
              <p>
                How we collect, use and protect your information is set out in our <Link href="/privacy-policy">Privacy Policy</Link>, which
                forms part of these terms. By placing an order you agree to your information being handled as that policy describes.
              </p>
              <p>
                In short: we use the details you give at checkout only to prepare your order, send your receipt and help you with it. We do
                not sell your information or use it for advertising.
              </p>
            </div>
          </section>

          {/* 3. Orders and pickup */}
          <section id="shipping-delivery" className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionBadge}>03</span>
              <h2 className={styles.sectionTitle}>Orders &amp; Market Pickup</h2>
            </div>
            <div className={styles.contentBody}>
              <p>
                Orders placed on this Website are prepared fresh and collected in person at the market or event you choose when you order.
                Pickup is free.
              </p>
              <div className={styles.clauseList}>
                <div className={styles.clauseItem}>
                  <div className={styles.clauseTitle}>
                    <span>Collecting your order</span>
                  </div>
                  <p className={styles.clauseDesc}>
                    Bring your order confirmation, or give the name the order was placed under, to The Queen&apos;s Corn stand during the
                    event&apos;s opening hours. If you cannot make it, contact us before the event and we will arrange another pickup or a
                    refund.
                  </p>
                </div>
                <div className={styles.clauseItem}>
                  <div className={styles.clauseTitle}>
                    <span>Shipping</span>
                  </div>
                  <p className={styles.clauseDesc}>
                    We do not ship orders at this time. When shipping becomes available, these terms will be updated with where we ship and
                    what it costs.
                  </p>
                </div>
              </div>
              <p>
                <strong>Events can change:</strong> if a market is cancelled or we cannot attend, we will contact you to arrange another
                pickup or a full refund.
              </p>
            </div>
          </section>

          {/* 4. Online payments and order records */}
          <section id="online-payments" className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionBadge}>04</span>
              <h2 className={styles.sectionTitle}>Online Payments &amp; Order Records</h2>
            </div>
            <div className={styles.contentBody}>
              <p>
                Payment is taken on a secure checkout page operated by Shopify. Your card details are entered there and are handled by
                Shopify&apos;s payment system; they never pass through this Website and The Queen&apos;s Corn cannot see them.
              </p>
              <p>
                Your order and the contact details you give at checkout are kept in our Shopify account and used as described in our{' '}
                <Link href="/privacy-policy">Privacy Policy</Link>. Prices shown on this Website and at checkout are in U.S. dollars.
              </p>
              <p>
                <strong>Fundraisers:</strong> when you choose a fundraising group, half of your order&apos;s merchandise total goes to that
                group. The group is told how much was raised, not who ordered.
              </p>
            </div>
          </section>

          {/* 5. Sales Tax */}
          <section id="sales-tax" className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionBadge}>05</span>
              <h2 className={styles.sectionTitle}>Sales Tax</h2>
            </div>
            <div className={styles.contentBody}>
              <p>
                Where sales tax applies, it is calculated at checkout at the rate for the place where the order is collected and is shown
                before you pay.
              </p>
            </div>
          </section>

          {/* 6. Warranties */}
          <section id="warranties" className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionBadge}>06</span>
              <h2 className={styles.sectionTitle}>Warranties &amp; Disclaimers</h2>
            </div>
            <div className={styles.contentBody}>
              <p>
                The Content included in this Website has been compiled from a variety of sources and is subject to change without notice as are any products, programs, offerings, or technical information described in this Website.
              </p>
              <p>
                The Queen&apos;s Corn makes no representation or warranty whatsoever regarding the completeness, quality, or adequacy of the Website or Content, or the suitability, functionality, or operation of this Website or its Content. By using this Website, you assume the risk that the Content on this Website may be inaccurate, incomplete, offensive, or may not meet your needs and requirements.
              </p>

              <div className={styles.disclaimerBox}>
                <div className={styles.disclaimerHeader}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  <span>Disclaimer of Warranties &amp; Limitation of Liability</span>
                </div>
                <p className={styles.capsBlock}>
                  THE QUEEN&apos;S CORN SPECIFICALLY DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NONINFRINGEMENT WITH RESPECT TO THESE WEB PAGES AND CONTENT. IN NO EVENT WILL THE QUEEN&apos;S CORN BE LIABLE FOR ANY SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES EVEN IF COMPANY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
                </p>
              </div>

              <div className={styles.clauseList}>
                <div className={styles.clauseItem}>
                  <div className={styles.clauseTitle}>State Law Variations &amp; &quot;As Is&quot; Server Provisions</div>
                  <p className={styles.clauseDesc}>
                    The information and content on this server is provided &quot;as is&quot; with no warranty of any kind, either express or implied, including but not limited to the implied warranties of merchantability, fitness for a particular purpose, and non-infringement. Any warranty that is provided in connection with any of the products and services described on this Website is provided by the advertiser or manufacturer only, and not by The Queen&apos;s Corn.
                  </p>
                </div>

                <div className={styles.clauseItem}>
                  <div className={styles.clauseTitle}>Product References &amp; Advertisers</div>
                  <p className={styles.clauseDesc}>
                    The references and descriptions of products or services within the Website materials are provided &quot;as is&quot; without any warranty of any kind, either express or implied. The Queen&apos;s Corn is not liable for any damages, including any consequential damages, of any kind that may result to the user from the use of the materials on this Website or of any of the products or services described hereon.
                  </p>
                </div>

                <div className={styles.clauseItem}>
                  <div className={styles.clauseTitle}>Accuracy &amp; Third-Party Content</div>
                  <p className={styles.clauseDesc}>
                    A possibility exists that the server materials could include inaccuracies or errors. Additionally, a possibility exists that unauthorized additions, deletions, and alterations could be made by third parties to the server materials. Although The Queen&apos;s Corn tries to ensure the integrity and the accurateness of the server materials, it makes no guarantees about their correctness or accuracy. Before relying on any representation made in any of the server materials, check with the advertiser of the product or service to ensure that the information you are relying upon is correct.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 7. Return Policy */}
          <section id="return-policy" className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionBadge}>07</span>
              <h2 className={styles.sectionTitle}>Return &amp; Payment Policy</h2>
            </div>
            <div className={styles.contentBody}>
              <p>
                You may purchase merchandise from this Website by using any one of the payment options accepted at checkout, including major credit/debit cards and supported digital payment processors.
              </p>
              <p>
                The Queen&apos;s Corn reserves the right to change its payment procedures, fees, or accepted payment providers at any time without prior notice to you.
              </p>
              <p>
                Because our kettle corn is a fresh, handcrafted artisanal food product popped in small batches, please contact us as soon as you collect it at <a href="mailto:thequeenscornaz@gmail.com" style={{ color: 'var(--primary)', fontWeight: 600 }}>thequeenscornaz@gmail.com</a> if your order is damaged or not as it should be. We take pride in our product and will promptly address your concerns.
              </p>
            </div>
          </section>

          {/* 8. Miscellaneous */}
          <section id="miscellaneous" className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionBadge}>08</span>
              <h2 className={styles.sectionTitle}>Governing Law &amp; Miscellaneous</h2>
            </div>
            <div className={styles.contentBody}>
              <div className={styles.clauseList}>
                <div className={styles.clauseItem}>
                  <div className={styles.clauseTitle}>Void Where Prohibited</div>
                  <p className={styles.clauseDesc}>
                    Although the information on this Website is accessible worldwide, not all products or services discussed in this Website are available to all persons or in all geographic locations or jurisdictions. The Queen&apos;s Corn and advertisers each reserve the right to limit the provision of their products or services to any person, geographic area, or jurisdiction they so desire and to limit the quantities of any products or services that they provide. Any offer for any product or service made in the materials on this Website is void where prohibited.
                  </p>
                </div>

                <div className={styles.clauseItem}>
                  <div className={styles.clauseTitle}>Governing Law &amp; Jury Trial Waiver</div>
                  <p className={styles.clauseDesc}>
                    In the event of litigation, both parties agree that the Law of the State of business registration of <strong>The Queen&apos;s Corn (State of Arizona)</strong> shall apply and both parties shall consent to the jurisdiction of said State&apos;s courts, or in the event of diversity of citizenship, the United States District Court for the District of Arizona. Both parties expressly waive a trial by jury.
                  </p>
                </div>

                <div className={styles.clauseItem}>
                  <div className={styles.clauseTitle}>Entire Agreement &amp; Severability</div>
                  <p className={styles.clauseDesc}>
                    The Terms and Conditions constitute the entire agreement between you and The Queen&apos;s Corn with respect to this Website. The Terms and Conditions supersede all prior or contemporaneous communications and proposals, whether electronic, oral, or written between you and The Queen&apos;s Corn with respect to this Website. No modification of the Terms and Conditions shall be effective unless it is authorized by The Queen&apos;s Corn. If any provision of the Terms and Conditions is found to be contrary to law, then such provision(s) shall be constructed in a manner to closely reflect, as much as possible, the intentions of the parties, with the other provisions remaining in full force and effect.
                  </p>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* Customer Support & Contact Box */}
        <div className={styles.supportCard}>
          <h2 className={styles.supportTitle}>Questions Regarding Our Terms?</h2>
          <p className={styles.supportDesc}>
            If you have any questions or require clarification concerning our terms, market pickup, or wholesale orders, our team is always ready to assist you.
          </p>
          <div className={styles.contactGrid}>
            <div className={styles.contactItem}>
              <span className={styles.contactLabel}>Phone Support</span>
              <a href="tel:6236921811" className={styles.contactValue}>(623) 692-1811</a>
            </div>
            <div className={styles.contactItem}>
              <span className={styles.contactLabel}>Direct Email</span>
              <a href="mailto:thequeenscornaz@gmail.com" className={styles.contactValue}>thequeenscornaz@gmail.com</a>
            </div>
            <div className={styles.contactItem}>
              <span className={styles.contactLabel}>Business Headquarters</span>
              <span className={styles.contactValue}>Marana, Arizona, USA</span>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
