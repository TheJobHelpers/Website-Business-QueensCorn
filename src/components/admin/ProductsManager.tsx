'use client';

import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import { deleteProductAction, saveProductAction, setProductFlagAction } from '@/app/actions/products';
import Button from '@/components/ui/Button';
import { PRODUCT_IMAGE_CHOICES, type Product } from '@/data/products';
import { BAG_SIZES, sizePrice } from '@/lib/shop';
import { ConfirmButton, Field, NoticeBar, PageHeader, Switch } from './ui';
import { useAdminAction } from './useAdminAction';
import styles from './admin.module.css';

const TASTES: Product['category'][] = ['Sweet', 'Savory', 'Spicy', 'Seasonal'];
const HOMEPAGE_SPOTS = 4;

interface ProductForm {
  name: string;
  description: string;
  category: Product['category'];
  price: string;
  familyPrice: string;
  partyPrice: string;
  image: string;
  tasteLabel: string;
  tasteLevel: number;
  featured: boolean;
  hidden: boolean;
}

const EMPTY: ProductForm = {
  name: '',
  description: '',
  category: 'Sweet',
  price: '6.00',
  familyPrice: '10.00',
  partyPrice: '15.00',
  image: PRODUCT_IMAGE_CHOICES[0].src,
  tasteLabel: 'Sweet',
  tasteLevel: 3,
  featured: false,
  hidden: false,
};

const PRICE_FIELDS = [
  { key: 'price', label: 'Small' },
  { key: 'familyPrice', label: 'Family' },
  { key: 'partyPrice', label: 'Party' },
] as const;

const toForm = (p: Product): ProductForm => ({
  name: p.name,
  description: p.description,
  category: p.category,
  price: sizePrice(p, BAG_SIZES[0]).toFixed(2),
  familyPrice: sizePrice(p, BAG_SIZES[1]).toFixed(2),
  partyPrice: sizePrice(p, BAG_SIZES[2]).toFixed(2),
  image: p.image,
  tasteLabel: p.taste?.label ?? '',
  tasteLevel: p.taste?.level ?? 0,
  featured: p.featured === true,
  hidden: p.hidden === true,
});

// Flavors screen: the catalog behind the shop, the product pages and the homepage row.
export default function ProductsManager({ products }: { products: Product[] }) {
  const { pending, notice, clearNotice, run } = useAdminAction();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const featuredCount = products.filter((p) => p.featured && !p.hidden).length;
  // the saved photo stays selectable even if it is not one of the listed ones (e.g. from Shopify)
  const photoChoices = PRODUCT_IMAGE_CHOICES.some((c) => c.src === form.image)
    ? PRODUCT_IMAGE_CHOICES
    : [{ src: form.image, label: 'Current photo' }, ...PRODUCT_IMAGE_CHOICES];

  const open = (id: string, values: ProductForm) => {
    setEditing(id);
    setForm(values);
    setErrors({});
    clearNotice();
  };
  const close = () => setEditing(null);
  const set = <K extends keyof ProductForm>(key: K, value: ProductForm[K]) => setForm((f) => ({ ...f, [key]: value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    run(() => saveProductAction(editing === 'new' ? null : editing, form), { onSuccess: close, onError: setErrors });
  };

  return (
    <>
      <PageHeader
        title="Flavors"
        text="Names, prices, photos and what shows on the homepage. Changes show in the shop straight away."
        action={
          editing === null && (
            <Button variant="red" size="sm" onClick={() => open('new', EMPTY)}>
              <Plus size={16} aria-hidden="true" /> Add flavor
            </Button>
          )
        }
      />
      <NoticeBar notice={notice} onClose={clearNotice} />

      {editing !== null && (
        <form className={styles.card} onSubmit={submit} noValidate>
          <h2 className={styles.cardTitle}>{editing === 'new' ? 'New flavor' : 'Edit flavor'}</h2>
          <div className={styles.formGrid}>
            <Field id="p-name" label="Flavor name" error={errors.name}>
              <input id="p-name" value={form.name} onChange={(e) => set('name', e.target.value)} maxLength={60} required />
            </Field>
            <Field id="p-category" label="Taste" hint="The filter it appears under in the shop." error={errors.category}>
              <select id="p-category" value={form.category} onChange={(e) => set('category', e.target.value as Product['category'])}>
                {TASTES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
            {PRICE_FIELDS.map((field) => (
              <Field key={field.key} id={`p-${field.key}`} label={`${field.label} bag price ($)`} error={errors[field.key]}>
                <input
                  id={`p-${field.key}`}
                  type="number"
                  inputMode="decimal"
                  min={0.5}
                  max={500}
                  step={0.01}
                  value={form[field.key]}
                  onChange={(e) => set(field.key, e.target.value)}
                  // typing 7.5 and leaving the box shows 7.50
                  onBlur={(e) => e.target.value !== '' && Number.isFinite(Number(e.target.value)) && set(field.key, Number(e.target.value).toFixed(2))}
                  required
                />
              </Field>
            ))}
            <Field id="p-image" label="Photo" error={errors.image}>
              <div className={styles.photoPick}>
                <span className={styles.thumb}>
                  <Image src={form.image} alt="" fill sizes="56px" />
                </span>
                <select id="p-image" value={form.image} onChange={(e) => set('image', e.target.value)}>
                  {photoChoices.map((c) => (
                    <option key={c.src} value={c.src}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </Field>
            <Field id="p-desc" label="Description" hint="One or two sentences shown on the card and the product page." error={errors.description} wide>
              <textarea id="p-desc" rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} maxLength={300} required />
            </Field>
            <Field id="p-taste-label" label="Taste meter: what it measures" hint='For example "Sweet", "Heat" or "Cheddar". Leave empty for no meter.' error={errors.tasteLabel}>
              <input id="p-taste-label" value={form.tasteLabel} onChange={(e) => set('tasteLabel', e.target.value)} maxLength={20} />
            </Field>
            <Field id="p-taste-level" label={`Taste meter: level (${form.tasteLevel} of 5)`} error={errors.tasteLevel}>
              <input id="p-taste-level" type="range" min={0} max={5} step={1} value={form.tasteLevel} onChange={(e) => set('tasteLevel', Number(e.target.value))} />
            </Field>
            <div className={`${styles.fieldWide} ${styles.switchRow}`}>
              <Switch label="Show on the homepage" checked={form.featured} onChange={(next) => set('featured', next)}>
                Show on the homepage
              </Switch>
              <Switch label="Hide from the website" checked={form.hidden} onChange={(next) => set('hidden', next)}>
                Hide from the website
              </Switch>
            </div>
          </div>
          <div className={styles.formActions}>
            <Button type="submit" variant="red" size="sm" disabled={pending}>
              {pending ? 'Saving…' : editing === 'new' ? 'Add flavor' : 'Save changes'}
            </Button>
            <Button variant="ghost" size="sm" onClick={close} disabled={pending}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <section className={styles.card} aria-labelledby="flavors-title">
        <div className={styles.cardHead}>
          <h2 id="flavors-title" className={styles.cardTitle}>
            All flavors <span className={styles.count}>{products.length}</span>
          </h2>
          <p className={`${styles.cardNote} ${featuredCount > HOMEPAGE_SPOTS ? styles.cardNoteWarn : ''}`}>
            {featuredCount} of {HOMEPAGE_SPOTS} homepage spots used
            {featuredCount > HOMEPAGE_SPOTS && ': only the first four show'}
            {featuredCount === 0 && ': the first four flavors show instead'}
          </p>
        </div>

        {products.length === 0 ? (
          <p className={styles.empty}>No flavors yet. Add the first one.</p>
        ) : (
          <ul className={styles.rows}>
            {products.map((product) => (
              <li key={product.id} className={`${styles.row} ${product.hidden ? styles.rowMuted : ''}`}>
                <span className={styles.thumb}>
                  <Image src={product.image} alt="" fill sizes="56px" />
                </span>
                <div className={styles.rowMain}>
                  <h3 className={styles.rowTitle}>
                    {product.name}
                    <span className={styles.tag}>{product.category}</span>
                    {product.hidden && <span className={`${styles.tag} ${styles.tagMuted}`}>Hidden</span>}
                    {product.shopifyId && <span className={`${styles.tag} ${styles.tagMuted}`}>In Shopify</span>}
                  </h3>
                  <p className={styles.rowMeta}>
                    <span>
                      {BAG_SIZES.map((s) => `${s.label} ${`$${sizePrice(product, s).toFixed(2)}`}`).join(' · ')}
                    </span>
                  </p>
                </div>
                <div className={styles.rowControls}>
                  <Switch
                    label={`Show ${product.name} on the homepage`}
                    checked={product.featured === true}
                    disabled={pending}
                    onChange={(next) => run(() => setProductFlagAction(product.id, 'featured', next))}
                  >
                    Homepage
                  </Switch>
                  <Switch
                    label={`Hide ${product.name} from the website`}
                    checked={product.hidden === true}
                    disabled={pending}
                    onChange={(next) => run(() => setProductFlagAction(product.id, 'hidden', next))}
                  >
                    Hidden
                  </Switch>
                  <button type="button" className={styles.linkBtn} onClick={() => open(product.id, toForm(product))}>
                    Edit
                  </button>
                  {!product.hidden && (
                    <a href={`/shop/${product.id}`} target="_blank" rel="noopener noreferrer" className={styles.linkBtn}>
                      View
                    </a>
                  )}
                  <ConfirmButton
                    label="Delete"
                    confirmLabel="Yes, delete"
                    disabled={pending}
                    onConfirm={() => run(() => deleteProductAction(product.id), { onSuccess: () => editing === product.id && close() })}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
