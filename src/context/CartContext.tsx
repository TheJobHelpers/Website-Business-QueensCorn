'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from '@/data/products';
import { UPCOMING_EVENTS } from '@/data/events';

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

const SIZE_PRICES: Record<string, number> = {
  'Small (Individual)': 6,
  'Medium (Family)': 10,
  'Large (Party)': 15,
};

export const FREE_AZ_SHIPPING_THRESHOLD = 35;

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [fulfillmentMethod, setFulfillmentMethod] = useState<FulfillmentMethod>('shipping');
  const [selectedPickupEvent, setSelectedPickupEvent] = useState<string>(
    `${UPCOMING_EVENTS[0].title} (${UPCOMING_EVENTS[0].month} ${UPCOMING_EVENTS[0].day})`
  );
  const [selectedFundraiserCode, setSelectedFundraiserCode] = useState<string>('');

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
    const unitPrice = SIZE_PRICES[size] ?? 6;
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
