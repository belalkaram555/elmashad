
import { useMemo } from 'react';
import { CartItem, AppSettings } from '../../../types';

export const useCartCalculation = (cart: CartItem[], settings: AppSettings, orderType: string) => {
  const calculation = useMemo(() => {
    const grossTotal = cart.reduce((sum, item) => sum + (item.totalItemPrice * item.quantity), 0);
    const serviceCharge = 0;
    const tax = 0;
    const subtotal = grossTotal;
    const total = grossTotal;

    return {
      subtotal,
      serviceCharge,
      tax,
      total,
      itemCount: cart.reduce((sum, i) => sum + i.quantity, 0)
    };
  }, [cart]);

  return calculation;
};
