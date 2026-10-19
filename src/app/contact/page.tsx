'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { CalendarDays, HeartHandshake, Mail, MapPin, Package, Phone } from 'lucide-react';
import Button from '@/components/ui/Button';
import { SHIPPING_AVAILABLE } from '@/lib/shop';
import styles from './Contact.module.css';

// Contact page, design system v3.1. The two direct ways to reach the owners sit in the header;
// below, the form and the side column are the same height and use the same type sizes.
const EMAIL = 'thequeenscornaz@gmail.com';
const PHONE = '(623) 692-1811';
const PHONE_HREF = 'tel:+16236921811';

// `value` is what links elsewhere on the site pass as ?subject= (keep these stable).
const SUBJECTS = [
  { value: 'General Inquiry', label: 'General question' },
  { value: '50% School / Team Fundraising', label: 'Fundraising for a school or team' },
  { value: 'Event Booking', label: 'Book us for an event' },
  { value: 'Market Pickup Order', label: 'Market pickup order' },
  ...(SHIPPING_AVAILABLE ? [{ value: 'Arizona Shipping Order', label: 'Arizona shipping order' }] : []),
  { value: 'Wholesale Request', label: 'Big order or wholesale' },
];

// One-tap starts for the three most common reasons to write.
const SHORTCUTS = [
  { subject: 'Event Booking', icon: CalendarDays, title: 'Book us for an event', text: 'Parties, school fairs, company days.' },
  { subject: '50% School / Team Fundraising', icon: HeartHandshake, title: 'Start a fundraiser', text: 'Your group keeps 50% of every sale.' },
  { subject: 'Wholesale Request', icon: Package, title: 'Place a big order', text: 'Weddings, gifts and bulk bags.' },
];

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState(SUBJECTS[0].value);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  // Links from the cart, fundraising and shop pages arrive with ?subject= (and sometimes more).
  useEffect(() => {
    queueMicrotask(() => {
      const params = new URLSearchParams(window.location.search);
      const paramSubject = params.get('subject');
      const paramGoal = params.get('goal');
      const paramFundraiser = params.get('fundraiser');

      if (paramSubject === 'Fundraising') {
        setSubject('50% School / Team Fundraising');
        if (paramGoal) {
          setMessage(
            `Hi Bob & Reina! We would love to set up a 50% Giveback Popcorn Fundraiser with an estimated goal of $${Number(
              paramGoal
            ).toLocaleString()}.`
          );
        }
      } else if (paramSubject && SUBJECTS.some((s) => s.value === paramSubject)) {
        setSubject(paramSubject);
        if (paramFundraiser) {
          setMessage(`Supporting Fundraiser Code: ${paramFundraiser}\n\n`);
        }
      }
    });
  }, []);

  // The site has no mail server yet, so the message is handed to the visitor's own email app,
  // addressed and filled in. They press send there.
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const body = `${message.trim()}\n\nFrom: ${name.trim()}\nReply to: ${email.trim()}`;
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(
      `${subject} (from ${name.trim()})`
    )}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  const pickShortcut = (value: string) => {
    setSubject(value);
    setSent(false);
    document.getElementById('message')?.focus();
  };

  return (
    <main className={styles.page}>
      <div className="main-container">
        {/* Header: what to write about, and the two direct lines */}
        <header className={`${styles.head} enter`}>
          <div className={styles.intro}>
            <span className={styles.eyebrow}>Contact</span>
            <h1 className={styles.title}>
              Talk to <em>Bob &amp; Reina.</em>
            </h1>
            <p className={styles.lede}>Questions, big orders, event bookings and fundraisers: send a message or call.</p>
          </div>
          <div className={styles.direct}>
            <a href={PHONE_HREF} className={styles.directLink}>
              <Phone size={20} aria-hidden="true" />
              <span>
                <small>Call</small>
                {PHONE}
              </span>
            </a>
            <a href={`mailto:${EMAIL}`} className={styles.directLink}>
              <Mail size={20} aria-hidden="true" />
              <span>
                <small>Email</small>
                {EMAIL}
              </span>
            </a>
          </div>
        </header>

        <div className={styles.grid}>
          {/* The form */}
          <section className={styles.card} aria-labelledby="form-title">
            <h2 id="form-title" className={styles.cardTitle}>
              Send a message
            </h2>

            {sent ? (
              <div className={styles.sent} role="status">
                <h3>Almost done: press send in your email app</h3>
                <p>
                  Your email app should have opened with the message filled in and addressed to us. Press send
                  there and it is on its way.
                </p>
                <p>
                  Nothing opened? Email <a href={`mailto:${EMAIL}`}>{EMAIL}</a> or call{' '}
                  <a href={PHONE_HREF}>{PHONE}</a>.
                </p>
                <Button variant="ghost" size="sm" onClick={() => setSent(false)}>
                  Back to the form
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label htmlFor="name">Your name</label>
                    <input
                      type="text"
                      id="name"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label htmlFor="subject">What is it about?</label>
                  <select id="subject" value={subject} onChange={(e) => setSubject(e.target.value)}>
                    {SUBJECTS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={`${styles.field} ${styles.grow}`}>
                  <label htmlFor="message">Your message</label>
                  <textarea
                    id="message"
                    placeholder="Tell us about your event, fundraiser or order: the date, the place and how many people."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" variant="red" fullWidth>
                  Send message
                </Button>
                <p className={styles.note}>This opens your email app with the message ready to send.</p>
              </form>
            )}
          </section>

          {/* Side column: shortcuts, then where we are */}
          <div className={styles.side}>
            <section className={styles.card} aria-labelledby="shortcuts-title">
              <h2 id="shortcuts-title" className={styles.cardTitle}>
                Most people write about
              </h2>
              <ul className={styles.shortcuts}>
                {SHORTCUTS.map(({ subject: value, icon: Icon, title, text }) => (
                  <li key={value}>
                    <button
                      type="button"
                      className={`${styles.shortcut} ${subject === value ? styles.shortcutOn : ''}`}
                      aria-pressed={subject === value}
                      onClick={() => pickShortcut(value)}
                    >
                      <span className={styles.shortcutIcon} aria-hidden="true">
                        <Icon size={20} />
                      </span>
                      <span>
                        <b>{title}</b>
                        {text}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            <section className={`${styles.card} ${styles.where}`} aria-labelledby="where-title">
              <h2 id="where-title" className={styles.cardTitle}>
                Where we are
              </h2>
              <p className={styles.place}>
                <MapPin size={18} aria-hidden="true" />
                Based in Marana, Arizona
              </p>
              <p>You will find the stand at markets and festivals across the state.</p>
              <Button href="/events" variant="ghost" size="sm">
                See upcoming events
              </Button>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
