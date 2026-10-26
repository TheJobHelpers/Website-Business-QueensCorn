'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart, FREE_AZ_SHIPPING_THRESHOLD, SHIPPING_AVAILABLE } from '@/context/CartContext';
import { startCheckoutAction } from '@/app/actions/checkout';
import { getUpcomingEvents, pickupLabel } from '@/lib/events';
import { X, Check, Truck, Calendar, Heart } from 'lucide-react';
import styles from './CartDrawer.module.css';

const CLOSE_MS = 220;

export default function CartDrawer() {
  const router = useRouter();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  // true while the drawer plays its closing animation, just before it unmounts
  const [isClosing, setIsClosing] = useState(false);
  const {
    items,
    totalItems,
    subtotal,
    isDrawerOpen,
    fulfillmentMethod,
    selectedPickupEvent,
    selectedFundraiserCode,
    events,
    fundraisers,
    closeDrawer,
    setFulfillmentMethod,
    setSelectedPickupEvent,
    setSelectedFundraiserCode,
    updateQuantity,
    removeItem,
  } = useCart();

  if (!isDrawerOpen) return null;

  // Slide out first, then unmount (CLOSE_MS matches the closing animation in the CSS).
  const requestClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      closeDrawer();
      setIsClosing(false);
    }, CLOSE_MS);
  };

  const remainingForFreeShipping = Math.max(0, FREE_AZ_SHIPPING_THRESHOLD - subtotal);
  const shippingProgress = Math.min(100, (subtotal / FREE_AZ_SHIPPING_THRESHOLD) * 100);
  const activeFundraiser = fundraisers.find((f) => f.code === selectedFundraiserCode);
  const markets = getUpcomingEvents(events).filter((evt) => evt.pickupAvailable !== false);

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    setCheckoutError('');
    try {
      const result = await startCheckoutAction({
        lines: items.map((item) => ({ productId: item.product.id, size: item.size, quantity: item.quantity })),
        fulfillmentMethod,
        pickupEvent: fulfillmentMethod === 'pickup' ? selectedPickupEvent : '',
        fundraiserCode: activeFundraiser?.code ?? '',
      });

      if (result.ok) {
        window.location.href = result.url;
        return;
      }
      if (result.reason === 'problem') {
        setCheckoutError(result.error);
        return;
      }

      // No Shopify store connected yet: orders are taken by message.
      closeDrawer();
      const params = new URLSearchParams();
      params.set('subject', fulfillmentMethod === 'pickup' ? 'Market Pickup Order' : 'Arizona Shipping Order');
      if (activeFundraiser) {
        params.set('fundraiser', activeFundraiser.code);
      }
      router.push(`/contact?${params.toString()}`);
    } catch {
      setCheckoutError('Checkout is not available right now. Please try again in a moment.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className={`${styles.backdrop} ${isClosing ? styles.closing : ''}`} onClick={requestClose}>
      <aside
        className={styles.drawer}
        onClick={(e) => e.stopPropagation()}
        aria-label="Shopping Cart"
      >
        <div className={styles.header}>
          <div>
            <span className={styles.eyebrow}>The Queen&apos;s Corn</span>
            <h2 className={styles.title}>Your Queen&apos;s Bag ({totalItems})</h2>
          </div>
          <button
            className={styles.closeBtn}
            onClick={requestClose}
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Free AZ Shipping Progress Banner */}
        {SHIPPING_AVAILABLE && items.length > 0 && fulfillmentMethod === 'shipping' && (
          <div className={styles.shippingBanner}>
            <div className={styles.shippingText}>
              {remainingForFreeShipping === 0 ? (
                <span className={styles.unlockedText}>
                  <Check size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '4px' }} />
                  Unlocked Free Arizona Shipping (1–2 Day USPS)!
                </span>
              ) : (
                <span>
                  Add <strong>${remainingForFreeShipping.toFixed(2)}</strong> more for{' '}
                  <strong>Free AZ Shipping</strong>
                </span>
              )}
            </div>
            <div className={styles.progressTrack}>
              <div
                className={styles.progressFill}
                style={{ width: `${shippingProgress}%` }}
              />
            </div>
          </div>
        )}

        {items.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>Your bag is currently empty.</p>
            <p className={styles.emptySubtitle}>
              Explore our small-batch, hand-stirred kettle corn flavors or support an active Arizona fundraiser.
            </p>
            <div className={styles.emptyActions}>
              <Link href="/shop" onClick={closeDrawer} className={styles.exploreBtn}>
                Explore Flavors
              </Link>
              <Link href="/fundraising" onClick={closeDrawer} className={styles.fundraiserLink}>
                View Active Fundraisers &rarr;
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.itemList}>
              {items.map((item) => (
                <div
                  key={`${item.product.id}-${item.size}`}
                  className={styles.item}
                >
                  <div className={styles.itemImage}>
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      sizes="72px"
                      className={styles.img}
                    />
                  </div>
                  <div className={styles.itemDetails}>
                    <div className={styles.itemTop}>
                      <h4>{item.product.name}</h4>
                      <button
                        className={styles.removeBtn}
                        onClick={() => removeItem(item.product.id, item.size)}
                        aria-label={`Remove ${item.product.name}`}
                      >
                        Remove
                      </button>
                    </div>
                    <span className={styles.itemSize}>{item.size}</span>
                    <div className={styles.itemBottom}>
                      <div className={styles.qtyControl}>
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.size, -1)
                          }
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.size, 1)
                          }
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <span className={styles.itemPrice}>
                        ${(item.unitPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.footer}>
              {/* Fulfillment Method Selector */}
              <div className={styles.controlGroup}>
                <span className={styles.controlLabel}>Fulfillment Method</span>
                <div className={styles.toggleRow}>
                  <button
                    type="button"
                    className={`${styles.toggleBtn} ${
                      fulfillmentMethod === 'shipping' ? styles.toggleBtnActive : ''
                    }`}
                    onClick={() => setFulfillmentMethod('shipping')}
                    disabled={!SHIPPING_AVAILABLE}
                  >
                    <Truck size={15} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '6px' }} />
                    {SHIPPING_AVAILABLE ? 'Ship in AZ (1–2 Days)' : 'Shipping · Coming soon'}
                  </button>
                  <button
                    type="button"
                    className={`${styles.toggleBtn} ${
                      fulfillmentMethod === 'pickup' ? styles.toggleBtnActive : ''
                    }`}
                    onClick={() => setFulfillmentMethod('pickup')}
                  >
                    <Calendar size={15} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '6px' }} />
                    Free Market Pickup
                  </button>
                </div>

                {fulfillmentMethod === 'pickup' && (
                  <select
                    className={styles.drawerSelect}
                    value={selectedPickupEvent}
                    onChange={(e) => setSelectedPickupEvent(e.target.value)}
                    aria-label="Select Farmers Market Pickup Location"
                  >
                    {markets.length === 0 && <option value="">No markets scheduled yet</option>}
                    {markets.map((evt) => {
                      const label = pickupLabel(evt);
                      return (
                        <option key={evt.id} value={label}>
                          {label} — {evt.location}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>

              {/* Fundraiser Attribution Selector */}
              <div className={styles.controlGroup}>
                <span className={styles.controlLabel}>
                  <Heart size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '6px', color: '#D9232A' }} />
                  Support an Arizona Fundraiser (50% Giveback)
                </span>
                <select
                  className={styles.drawerSelect}
                  value={selectedFundraiserCode}
                  onChange={(e) => setSelectedFundraiserCode(e.target.value)}
                  aria-label="Select a Fundraiser to Support"
                >
                  <option value="">None — Standard Order</option>
                  {fundraisers.map((fund) => (
                    <option key={fund.id} value={fund.code}>
                      {fund.organization} (Code: {fund.code})
                    </option>
                  ))}
                </select>
                {activeFundraiser && (
                  <p className={styles.fundraiserCredit}>
                    <Check size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '4px' }} />
                    <strong>${(subtotal * 0.5).toFixed(2)} (50%)</strong> of your order goes directly to{' '}
                    <strong>{activeFundraiser.organization}</strong>!
                  </p>
                )}
              </div>

              <div className={styles.summaryRow}>
                <span>
                  {fulfillmentMethod === 'pickup'
                    ? 'Subtotal (Free Market Pickup)'
                    : !SHIPPING_AVAILABLE
                    ? 'Subtotal'
                    : remainingForFreeShipping === 0
                    ? 'Subtotal (Free AZ Shipping)'
                    : 'Subtotal (Est. +$4.95 USPS AZ)'}
                </span>
                <span className={styles.subtotal}>${subtotal.toFixed(2)}</span>
              </div>

              {checkoutError && (
                <p className={styles.checkoutError} role="alert">
                  {checkoutError}
                </p>
              )}

              <button
                type="button"
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className={`${styles.checkoutBtn} shimmer-btn`}
              >
                {isCheckingOut
                  ? 'Preparing checkout...'
                  : 'Proceed to Checkout →'}
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
