import { StampType } from '../types/graphql-global';
import { PaymentItem, PaymentAccount } from './paymentSliceModel';

export function paymentItemEqual(a: PaymentItem, b: PaymentItem): boolean {
  if (a.price !== b.price) return false;
  if (a.payWithStamps !== b.payWithStamps) return false;
  if (a.couldBePaidWithStamps !== b.couldBePaidWithStamps) return false;
  if (a.giveStamps !== b.giveStamps) return false;
  if (a.product?.id !== b.product?.id) return false;
  if (a.nameHint !== b.nameHint) return false;
  if (a.colorHint !== b.colorHint) return false;

  return true;
}

export function groupPaymentItems(items: PaymentItem[]): Map<PaymentItem, number> {
  let map = new Map<PaymentItem, number>();

  for (let item of items) {
    let found = false;
    for (let [key, value] of map) {
      if (paymentItemEqual(item, key)) {
        found = true;
        map.set(key, value + 1);
        break;
      }
    }

    if (!found) {
      map.set(item, 1);
    }
  }

  return map;
}

export function trimPrefix(str: string, prefix: string) {
  if (str.startsWith(prefix)) {
    return str.slice(prefix.length);
  } else {
    return str;
  }
}

export function calculateTotal(storedPaymentItems: PaymentItem[]) {
  const total = storedPaymentItems.reduce((previous, current) => previous + current.price, 0);
  const coffeeStamps = storedPaymentItems.reduce((previous, current) => {
    if (current.payWithStamps === StampType.COFFEE) {
      return previous - 10;
    } else if (current.giveStamps === StampType.COFFEE) {
      return previous + 1;
    } else {
      return previous;
    }
  }, 0);
  const bottleStamps = storedPaymentItems.reduce((previous, current) => {
    if (current.payWithStamps === StampType.BOTTLE) {
      return previous - 10;
    } else if (current.giveStamps === StampType.BOTTLE) {
      return previous + 1;
    } else {
      return previous;
    }
  }, 0);

  return {
    total,
    coffeeStamps,
    bottleStamps,
  };
}

export function calcAlternativeStamps(
  current: {
    total: number;
    coffeeStamps: number;
    bottleStamps: number;
    items: PaymentItem[];
  },
  account: PaymentAccount
): {
  total: number;
  coffeeStamps: number;
  bottleStamps: number;
  items: PaymentItem[];
} {
  let newItems = current.items.slice();

  let maxPrice: number = 0;
  let maxIndex: number = -1;
  for (let i = 0; i < newItems.length; i++) {
    let item = newItems[i];

    if (item.payWithStamps !== StampType.NONE) {
      continue;
    }

    switch (item.couldBePaidWithStamps) {
      case StampType.COFFEE:
        if (account.coffeeStamps >= 10 && item.price > maxPrice) {
          maxIndex = i;
          maxPrice = item.price;
        }
        break;
      case StampType.BOTTLE:
        if (account.bottleStamps >= 10 && item.price > maxPrice) {
          maxIndex = i;
          maxPrice = item.price;
        }
        break;
    }
  }

  if (maxIndex >= 0) {
    let item = newItems[maxIndex];

    let newItem: PaymentItem = {
      ...item,
      price: 0,
      payWithStamps: item.couldBePaidWithStamps,
      giveStamps: StampType.NONE,
    };

    newItems.splice(maxIndex, 1, newItem);
  }

  let total = calculateTotal(newItems);

  return {
    total: total.total,
    coffeeStamps: total.coffeeStamps,
    bottleStamps: total.bottleStamps,
    items: newItems,
  };
}
