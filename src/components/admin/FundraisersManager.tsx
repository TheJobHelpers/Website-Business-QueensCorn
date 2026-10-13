'use client';

import { useState, type FormEvent } from 'react';
import { Plus } from 'lucide-react';
import { deleteFundraiserAction, saveFundraiserAction } from '@/app/actions/fundraisers';
import Button from '@/components/ui/Button';
import type { FundraiserCampaign } from '@/data/fundraisers';
import { ConfirmButton, Field, NoticeBar, PageHeader } from './ui';
import { useAdminAction } from './useAdminAction';
import styles from './admin.module.css';

interface FundraiserForm {
  organization: string;
  category: string;
  location: string;
  code: string;
  goalAmount: string;
  raisedAmount: string;
  endDate: string;
  description: string;
}

const EMPTY: FundraiserForm = {
  organization: '',
  category: '',
  location: '',
  code: '',
  goalAmount: '',
  raisedAmount: '0',
  endDate: '',
  description: '',
};

/** "Nov 15, 2026" → "2026-11-15" for the date field ('' if it cannot be read) */
function toISODate(text: string): string {
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

const toForm = (f: FundraiserCampaign): FundraiserForm => ({
  organization: f.organization,
  category: f.category,
  location: f.location,
  code: f.code,
  goalAmount: String(f.goalAmount),
  raisedAmount: String(f.raisedAmount),
  endDate: toISODate(f.endDate),
  description: f.description,
});

const money = (amount: number) => `$${amount.toLocaleString('en-US')}`;

// Fundraisers screen: the campaigns on the public Fundraising page and in the cart's
// "support a fundraiser" list.
export default function FundraisersManager({ fundraisers }: { fundraisers: FundraiserCampaign[] }) {
  const { pending, notice, clearNotice, run } = useAdminAction();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<FundraiserForm>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const open = (id: string, values: FundraiserForm) => {
    setEditing(id);
    setForm(values);
    setErrors({});
    clearNotice();
  };
  const close = () => setEditing(null);
  const set = <K extends keyof FundraiserForm>(key: K, value: FundraiserForm[K]) => setForm((f) => ({ ...f, [key]: value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    run(() => saveFundraiserAction(editing === 'new' ? null : editing, form), { onSuccess: close, onError: setErrors });
  };

  return (
    <>
      <PageHeader
        title="Fundraisers"
        text="Groups raising money with The Queen's Corn. Each one keeps 50% of the orders placed with its code."
        action={
          editing === null && (
            <Button variant="red" size="sm" onClick={() => open('new', EMPTY)}>
              <Plus size={16} aria-hidden="true" /> Add campaign
            </Button>
          )
        }
      />
      <NoticeBar notice={notice} onClose={clearNotice} />

      {editing !== null && (
        <form className={styles.card} onSubmit={submit} noValidate>
          <h2 className={styles.cardTitle}>{editing === 'new' ? 'New campaign' : 'Edit campaign'}</h2>
          <div className={styles.formGrid}>
            <Field id="f-org" label="Group name" error={errors.organization} wide>
              <input id="f-org" value={form.organization} onChange={(e) => set('organization', e.target.value)} maxLength={100} required />
            </Field>
            <Field id="f-category" label="Kind of group" hint="For example: Youth Athletics" error={errors.category}>
              <input id="f-category" value={form.category} onChange={(e) => set('category', e.target.value)} maxLength={60} required />
            </Field>
            <Field id="f-location" label="Town" error={errors.location}>
              <input id="f-location" value={form.location} onChange={(e) => set('location', e.target.value)} maxLength={80} required />
            </Field>
            <Field id="f-code" label="Code" hint="What supporters type at checkout. Letters and numbers only." error={errors.code}>
              <input id="f-code" value={form.code} onChange={(e) => set('code', e.target.value.toUpperCase())} maxLength={20} autoCapitalize="characters" required />
            </Field>
            <Field id="f-end" label="End date" error={errors.endDate}>
              <input id="f-end" type="date" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} required />
            </Field>
            <Field id="f-goal" label="Goal ($)" error={errors.goalAmount}>
              <input id="f-goal" type="number" inputMode="decimal" min={1} step={1} value={form.goalAmount} onChange={(e) => set('goalAmount', e.target.value)} required />
            </Field>
            <Field id="f-raised" label="Raised so far ($)" hint="Update this as orders come in." error={errors.raisedAmount}>
              <input id="f-raised" type="number" inputMode="decimal" min={0} step={1} value={form.raisedAmount} onChange={(e) => set('raisedAmount', e.target.value)} required />
            </Field>
            <Field id="f-desc" label="What the money is for" hint="One sentence. Optional." error={errors.description} wide>
              <textarea id="f-desc" rows={2} value={form.description} onChange={(e) => set('description', e.target.value)} maxLength={300} />
            </Field>
          </div>
          <div className={styles.formActions}>
            <Button type="submit" variant="red" size="sm" disabled={pending}>
              {pending ? 'Saving…' : editing === 'new' ? 'Add campaign' : 'Save changes'}
            </Button>
            <Button variant="ghost" size="sm" onClick={close} disabled={pending}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <section className={styles.card} aria-labelledby="campaigns-title">
        <div className={styles.cardHead}>
          <h2 id="campaigns-title" className={styles.cardTitle}>
            Campaigns <span className={styles.count}>{fundraisers.length}</span>
          </h2>
          <a href="/fundraising#active-campaigns" target="_blank" rel="noopener noreferrer" className={styles.linkBtn}>
            See the Fundraising page
          </a>
        </div>

        {fundraisers.length === 0 ? (
          <p className={styles.empty}>No campaigns. The Fundraising page says none are running right now.</p>
        ) : (
          <ul className={styles.rows}>
            {fundraisers.map((campaign) => {
              const percent = Math.min(100, Math.round((campaign.raisedAmount / campaign.goalAmount) * 100));
              return (
                <li key={campaign.id} className={styles.row}>
                  <div className={styles.rowMain}>
                    <h3 className={styles.rowTitle}>
                      {campaign.organization}
                      <span className={styles.tag}>{campaign.code}</span>
                    </h3>
                    <p className={styles.rowMeta}>
                      <span>{campaign.category}</span>
                      <span>{campaign.location}</span>
                      <span>Ends {campaign.endDate}</span>
                    </p>
                    <div className={styles.progress}>
                      <div className={styles.progressBar}>
                        <i style={{ width: `${percent}%` }} />
                      </div>
                      <span>
                        {money(campaign.raisedAmount)} of {money(campaign.goalAmount)} · {percent}%
                      </span>
                    </div>
                  </div>
                  <div className={styles.rowControls}>
                    <button type="button" className={styles.linkBtn} onClick={() => open(campaign.id, toForm(campaign))}>
                      Edit
                    </button>
                    <ConfirmButton
                      label="Delete"
                      confirmLabel="Yes, delete"
                      disabled={pending}
                      onConfirm={() => run(() => deleteFundraiserAction(campaign.id), { onSuccess: () => editing === campaign.id && close() })}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
