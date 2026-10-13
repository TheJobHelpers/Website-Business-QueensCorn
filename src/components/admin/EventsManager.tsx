'use client';

import { useState, type FormEvent } from 'react';
import { Clock, MapPin, Plus } from 'lucide-react';
import { deleteEventAction, saveEventAction, setEventPickupAction } from '@/app/actions/events';
import Button from '@/components/ui/Button';
import type { EventItem } from '@/data/events';
import { eventDateRange, eventEndDate, weekdayLabel } from '@/lib/events';
import { ConfirmButton, Field, NoticeBar, PageHeader, Switch } from './ui';
import { useAdminAction } from './useAdminAction';
import styles from './admin.module.css';

interface EventForm {
  title: string;
  startDate: string;
  endDate: string;
  time: string;
  location: string;
  desc: string;
  pickupAvailable: boolean;
}

const EMPTY: EventForm = { title: '', startDate: '', endDate: '', time: '', location: '', desc: '', pickupAvailable: true };

const toForm = (event: EventItem): EventForm => {
  const { start, end } = eventDateRange(event);
  return {
    title: event.title,
    startDate: start,
    endDate: end,
    time: event.time,
    location: event.location,
    desc: event.desc,
    pickupAvailable: event.pickupAvailable !== false,
  };
};

// Events screen: what is on the public Events page, the homepage's events band, and the
// pickup list in the shop and cart. `now` comes from the server so both renders agree.
export default function EventsManager({ events, now }: { events: EventItem[]; now: number }) {
  const { pending, notice, clearNotice, run } = useAdminAction();
  /** 'new', an event id, or null when the form is closed */
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<EventForm>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const ends = (event: EventItem) => eventEndDate(event)?.getTime() ?? Infinity;
  const sorted = [...events].sort((a, b) => ends(a) - ends(b));
  const upcoming = sorted.filter((e) => ends(e) >= now);
  const past = sorted.filter((e) => ends(e) < now).reverse();

  const open = (id: string, values: EventForm) => {
    setEditing(id);
    setForm(values);
    setErrors({});
    clearNotice();
  };
  const close = () => setEditing(null);
  const set = <K extends keyof EventForm>(key: K, value: EventForm[K]) => setForm((f) => ({ ...f, [key]: value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    run(() => saveEventAction(editing === 'new' ? null : editing, form), { onSuccess: close, onError: setErrors });
  };

  const row = (event: EventItem, isPast: boolean) => (
    <li key={event.id} className={`${styles.row} ${isPast ? styles.rowMuted : ''}`}>
      <div className={styles.dateStub}>
        <span>{event.month}</span>
        <b>{event.day.replace('-', '–')}</b>
        <span>{weekdayLabel(event)}</span>
      </div>
      <div className={styles.rowMain}>
        <h3 className={styles.rowTitle}>{event.title}</h3>
        <p className={styles.rowMeta}>
          <span>
            <Clock size={14} aria-hidden="true" /> {event.time}
          </span>
          <span>
            <MapPin size={14} aria-hidden="true" /> {event.location}
          </span>
        </p>
        {isPast && <p className={styles.rowNote}>Over: no longer shown on the website.</p>}
      </div>
      <div className={styles.rowControls}>
        {!isPast && (
          <Switch
            label={`Pre-order pickup for ${event.title}`}
            checked={event.pickupAvailable !== false}
            disabled={pending}
            onChange={(next) => run(() => setEventPickupAction(event.id, next))}
          >
            Pickup
          </Switch>
        )}
        <button type="button" className={styles.linkBtn} onClick={() => open(event.id, toForm(event))}>
          Edit
        </button>
        <ConfirmButton
          label="Delete"
          confirmLabel="Yes, delete"
          disabled={pending}
          onConfirm={() => run(() => deleteEventAction(event.id), { onSuccess: () => editing === event.id && close() })}
        />
      </div>
    </li>
  );

  return (
    <>
      <PageHeader
        title="Events"
        text="Markets and festivals where the stand will be. Changes show on the website straight away."
        action={
          editing === null && (
            <Button variant="red" size="sm" onClick={() => open('new', EMPTY)}>
              <Plus size={16} aria-hidden="true" /> Add event
            </Button>
          )
        }
      />
      <NoticeBar notice={notice} onClose={clearNotice} />

      {editing !== null && (
        <form className={styles.card} onSubmit={submit} noValidate>
          <h2 className={styles.cardTitle}>{editing === 'new' ? 'New event' : 'Edit event'}</h2>
          <div className={styles.formGrid}>
            <Field id="ev-title" label="Event name" error={errors.title} wide>
              <input id="ev-title" value={form.title} onChange={(e) => set('title', e.target.value)} maxLength={100} required />
            </Field>
            <Field id="ev-start" label="Start date" error={errors.startDate}>
              <input id="ev-start" type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} required />
            </Field>
            <Field id="ev-end" label="End date" hint="Leave empty for a one-day event." error={errors.endDate}>
              <input id="ev-end" type="date" value={form.endDate} min={form.startDate || undefined} onChange={(e) => set('endDate', e.target.value)} />
            </Field>
            <Field id="ev-time" label="Hours" hint="For example: 9:00 am - 1:00 pm" error={errors.time}>
              <input id="ev-time" value={form.time} onChange={(e) => set('time', e.target.value)} maxLength={60} required />
            </Field>
            <Field id="ev-location" label="Location" hint="Place and town, as shoppers should see it." error={errors.location}>
              <input id="ev-location" value={form.location} onChange={(e) => set('location', e.target.value)} maxLength={140} required />
            </Field>
            <Field id="ev-desc" label="Description" hint="One or two sentences. Optional." error={errors.desc} wide>
              <textarea id="ev-desc" rows={3} value={form.desc} onChange={(e) => set('desc', e.target.value)} maxLength={400} />
            </Field>
            <div className={styles.fieldWide}>
              <Switch label="Shoppers can pre-order for pickup" checked={form.pickupAvailable} onChange={(next) => set('pickupAvailable', next)}>
                Shoppers can pre-order online and pick up at this event
              </Switch>
            </div>
          </div>
          <div className={styles.formActions}>
            <Button type="submit" variant="red" size="sm" disabled={pending}>
              {pending ? 'Saving…' : editing === 'new' ? 'Add event' : 'Save changes'}
            </Button>
            <Button variant="ghost" size="sm" onClick={close} disabled={pending}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <section className={styles.card} aria-labelledby="upcoming-title">
        <div className={styles.cardHead}>
          <h2 id="upcoming-title" className={styles.cardTitle}>
            Upcoming <span className={styles.count}>{upcoming.length}</span>
          </h2>
          <a href="/events" target="_blank" rel="noopener noreferrer" className={styles.linkBtn}>
            See the Events page
          </a>
        </div>
        {upcoming.length === 0 ? (
          <p className={styles.empty}>No upcoming events. The website tells visitors there is nothing on the calendar.</p>
        ) : (
          <ul className={styles.rows}>{upcoming.map((e) => row(e, false))}</ul>
        )}
      </section>

      {past.length > 0 && (
        <section className={styles.card} aria-labelledby="past-title">
          <h2 id="past-title" className={styles.cardTitle}>
            Past <span className={styles.count}>{past.length}</span>
          </h2>
          <ul className={styles.rows}>{past.map((e) => row(e, true))}</ul>
        </section>
      )}
    </>
  );
}
