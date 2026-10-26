'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import type { Product } from '@/data/products';
import type { EventItem } from '@/data/events';
import type { FundraiserCampaign } from '@/data/fundraisers';
import { SHIPPING_AVAILABLE, bagSize, sizePrice } from '@/lib/shop';
import { getUpcomingEvents, pickupLabel } from '@/lib/events';
import { getOpenFundraisers } from '@/lib/fundraisers';
import { useHydrated } from '@/lib/useHydrated';

export interface CartItem {
  product: Product;
  size: string;
  quantity: number;
  unitPrice: number;
}

export type FulfillmentMethod = 'shipping' | 'pickup';

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  isDrawerOpen: boolean;
  fulfillmentMethod: FulfillmentMethod;
  selectedPickupEvent: string;
  /** true once the shopper has picked a market themselves */
  pickupChosen: boolean;
  selectedFundraiserCode: string;
  /** Site data, loaded on the server (src/app/layout.tsx) and edited in the admin dashboard. */
  products: Product[];
  events: EventItem[];
  /** only campaigns that haven't ended */
  fundraisers: FundraiserCampaign[];
  openDrawer: () => void;
  closeDrawer: () => void;
  setFulfillmentMethod: (method: FulfillmentMethod) => void;
  setSelectedPickupEvent: (eventTitle: string) => void;
  setSelectedFundraiserCode: (code: string) => void;
  selectPickupForEvent: (eventTitle: string) => void;
  selectFundraiser: (code: string) => void;
  addItem: (product: Product, size: string, quantity: number) => void;
  updateQuantity: (productId: string, size: string, delta: number) => void;
  removeItem: (productId: string, size: string) => void;
  clearCart: () => void;
}

export { FREE_AZ_SHIPPING_THRESHOLD, SHIPPING_AVAILABLE } from '@/lib/shop';

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
  products: Product[];
  events: EventItem[];
  fundraisers: FundraiserCampaign[];
}

// Holds the shopper's bag and choices. The catalog, events and fundraisers come in as props from
// the server, so every visitor sees what the owners last saved (nothing is kept in the browser).
export function CartProvider({ children, products, events, fundraisers }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [fulfillmentMethod, setFulfillmentMethod] = useState<FulfillmentMethod>(
    SHIPPING_AVAILABLE ? 'shipping' : 'pickup'
  );
  // The market the shopper picked themselves ('' until they pick one).
  const [chosenPickupEvent, setSelectedPickupEvent] = useState<string>('');
  const [selectedFundraiserCode, setSelectedFundraiserCode] = useState<string>('');
  // Ended campaigns drop out once the page is in the browser (pages are prerendered at build time).
  const hydrated = useHydrated();
  const openFundraisers = hydrated ? getOpenFundraisers(fundraisers) : fundraisers;

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  const selectPickupForEvent = (eventLabel: string) => {
    setFulfillmentMethod('pickup');
    setSelectedPickupEvent(eventLabel);
  };

  const selectFundraiser = (code: string) => {
    setSelectedFundraiserCode(code);
  };

  const addItem = (product: Product, size: string, quantity: number) => {
    const unitPrice = sizePrice(product, bagSize(size));

    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.size === size
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }
      return [...prev, { product, size, quantity, unitPrice }];
    });
  };

  const updateQuantity = (productId: string, size: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.product.id === productId && item.size === size
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (productId: string, size: string) => {
    setItems((prev) =>
      prev.filter((item) => !(item.product.id === productId && item.size === size))
    );
  };

  const clearCart = () => setItems([]);

  // Until the shopper picks a market, pickup defaults to the next upcoming one (never a past date).
  const pickupChosen = chosenPickupEvent !== '';
  const nextPickup = getUpcomingEvents(events).find((e) => e.pickupAvailable !== false);
  const selectedPickupEvent = pickupChosen ? chosenPickupEvent : nextPickup ? pickupLabel(nextPickup) : '';

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        subtotal,
        isDrawerOpen,
        fulfillmentMethod,
        selectedPickupEvent,
        pickupChosen,
        selectedFundraiserCode,
        products,
        events,
        fundraisers: openFundraisers,
        openDrawer,
        closeDrawer,
        setFulfillmentMethod,
        setSelectedPickupEvent,
        setSelectedFundraiserCode,
        selectPickupForEvent,
        selectFundraiser,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
