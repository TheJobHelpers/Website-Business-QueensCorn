'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ALL_PRODUCTS, Product } from '@/data/products';
import { UPCOMING_EVENTS, EventItem } from '@/data/events';
import { ACTIVE_FUNDRAISERS, FundraiserCampaign } from '@/data/fundraisers';
import {
  fetchServerEvents,
  addServerEvent,
  deleteServerEvent,
  toggleServerEventPickup,
  resetServerEvents,
} from '@/app/actions/events';

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
  selectedFundraiserCode: string;
  products: Product[];
  events: EventItem[];
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
  // Admin Portal Actions
  addEvent: (event: Omit<EventItem, 'id'>) => void;
  deleteEvent: (id: string) => void;
  toggleEventPickup: (id: string) => void;
  addFundraiser: (campaign: Omit<FundraiserCampaign, 'id'>) => void;
  updateFundraiserRaised: (id: string, newAmount: number) => void;
  deleteFundraiser: (id: string) => void;
  updateProductPrice: (id: string, newPrice: string) => void;
  syncProducts: (newProducts: Product[]) => void;
  resetStoreData: () => void;
}

const SIZE_PRICES: Record<string, number> = {
  'Small (Individual)': 6,
  'Medium (Family)': 10,
  'Large (Party)': 15,
};

export const FREE_AZ_SHIPPING_THRESHOLD = 35;

const STORAGE_KEYS = {
  PRODUCTS: 'queens_corn_products_v1',
  EVENTS: 'queens_corn_events_v1',
  FUNDRAISERS: 'queens_corn_fundraisers_v1',
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [fulfillmentMethod, setFulfillmentMethod] = useState<FulfillmentMethod>('shipping');
  const [products, setProducts] = useState<Product[]>(ALL_PRODUCTS);
  const [events, setEvents] = useState<EventItem[]>(UPCOMING_EVENTS);
  const [fundraisers, setFundraisers] = useState<FundraiserCampaign[]>(ACTIVE_FUNDRAISERS);
  const [selectedPickupEvent, setSelectedPickupEvent] = useState<string>(
    `${UPCOMING_EVENTS[0].title} (${UPCOMING_EVENTS[0].month} ${UPCOMING_EVENTS[0].day})`
  );
  const [selectedFundraiserCode, setSelectedFundraiserCode] = useState<string>('');

  // Hydrate owner-edited store data from localStorage and sync latest events from server DB
  useEffect(() => {
    try {
      const savedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      const savedEvents = localStorage.getItem(STORAGE_KEYS.EVENTS);
      const savedFundraisers = localStorage.getItem(STORAGE_KEYS.FUNDRAISERS);

      if (savedProducts) setProducts(JSON.parse(savedProducts));
      if (savedEvents) setEvents(JSON.parse(savedEvents));
      if (savedFundraisers) setFundraisers(JSON.parse(savedFundraisers));
    } catch {
      // Ignore storage errors
    }

    // Always fetch latest synced events from server database
    fetchServerEvents().then((serverEvents) => {
      if (serverEvents && serverEvents.length > 0) {
        setEvents(serverEvents);
        try {
          localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(serverEvents));
        } catch {
          // Ignore storage errors
        }
      }
    }).catch(() => {});
  }, []);

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
    const basePrice = parseFloat(product.price.replace(/[^0-9.]/g, '')) || 6;
    const sizeMultiplier =
      size === 'Large (Party)' ? 15 / 6 : size === 'Medium (Family)' ? 10 / 6 : 1;
    const unitPrice = Math.round((basePrice * sizeMultiplier || SIZE_PRICES[size] || 6) * 100) / 100;

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

  // Admin Portal Actions
  const addEvent = (event: Omit<EventItem, 'id'>) => {
    setEvents((prev) => {
      const next = [{ ...event, id: `evt-${Date.now()}` }, ...prev];
      try {
        localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
    // Persist to server database
    addServerEvent(event).then((created) => {
      if (created) {
        setEvents((prev) => prev.map((e, idx) => (idx === 0 ? created : e)));
      }
    }).catch(() => {});
  };

  const deleteEvent = (id: string) => {
    setEvents((prev) => {
      const next = prev.filter((e) => e.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
    // Persist to server database
    deleteServerEvent(id).catch(() => {});
  };

  const toggleEventPickup = (id: string) => {
    setEvents((prev) => {
      const next = prev.map((e) =>
        e.id === id ? { ...e, pickupAvailable: !e.pickupAvailable } : e
      );
      try {
        localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
    // Persist to server database
    toggleServerEventPickup(id).catch(() => {});
  };

  const addFundraiser = (campaign: Omit<FundraiserCampaign, 'id'>) => {
    setFundraisers((prev) => {
      const next = [{ ...campaign, id: `fund-${Date.now()}` }, ...prev];
      localStorage.setItem(STORAGE_KEYS.FUNDRAISERS, JSON.stringify(next));
      return next;
    });
  };

  const updateFundraiserRaised = (id: string, newAmount: number) => {
    setFundraisers((prev) => {
      const next = prev.map((f) =>
        f.id === id ? { ...f, raisedAmount: Math.max(0, newAmount) } : f
      );
      localStorage.setItem(STORAGE_KEYS.FUNDRAISERS, JSON.stringify(next));
      return next;
    });
  };

  const deleteFundraiser = (id: string) => {
    setFundraisers((prev) => {
      const next = prev.filter((f) => f.id !== id);
      localStorage.setItem(STORAGE_KEYS.FUNDRAISERS, JSON.stringify(next));
      return next;
    });
  };

  const updateProductPrice = (id: string, newPrice: string) => {
    const formatted = newPrice.startsWith('$') ? newPrice : `$${newPrice}`;
    setProducts((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, price: formatted } : p));
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(next));
      return next;
    });
  };

  const syncProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(newProducts));
  };

  const resetStoreData = () => {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.EVENTS);
    localStorage.removeItem(STORAGE_KEYS.FUNDRAISERS);
    setProducts(ALL_PRODUCTS);
    setEvents(UPCOMING_EVENTS);
    setFundraisers(ACTIVE_FUNDRAISERS);
    resetServerEvents().catch(() => {});
  };

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
        selectedFundraiserCode,
        products,
        events,
        fundraisers,
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
        addEvent,
        deleteEvent,
        toggleEventPickup,
        addFundraiser,
        updateFundraiserRaised,
        deleteFundraiser,
        updateProductPrice,
        syncProducts,
        resetStoreData,
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
