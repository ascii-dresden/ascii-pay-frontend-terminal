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

export function calculateTotal(items: PaymentItem[]): {
  total: number;
  coffeeStamps: number;
  bottleStamps: number;
} {
  let helper = TransactionHelper.fromItems(items);

  return {
    total: helper.price,
    coffeeStamps: helper.coffeeStamps,
    bottleStamps: helper.bottleStamps,
  };
}

class TransactionHelper {
  price: number;
  coffeeStamps: number;
  bottleStamps: number;

  constructor(price: number = 0, coffee_stamps: number = 0, bottle_stamps: number = 0) {
    this.price = price;
    this.coffeeStamps = coffee_stamps;
    this.bottleStamps = bottle_stamps;
  }

  static fromItems(items: PaymentItem[]) {
    let helper = new TransactionHelper();
    for (let item of items) {
      helper.addItem(item);
    }
    return helper;
  }

  addItem(item: PaymentItem) {
    switch (item.payWithStamps) {
      case StampType.NONE:
        this.price += item.price;

        switch (item.giveStamps) {
          case StampType.COFFEE:
            this.coffeeStamps += 1;
            break;
          case StampType.BOTTLE:
            this.bottleStamps += 1;
            break;
        }
        break;
      case StampType.COFFEE:
        this.coffeeStamps -= 10;
        break;
      case StampType.BOTTLE:
        this.bottleStamps -= 10;
        break;
    }
  }

  removeItem(item: PaymentItem) {
    switch (item.payWithStamps) {
      case StampType.NONE:
        this.price -= item.price;

        switch (item.giveStamps) {
          case StampType.COFFEE:
            this.coffeeStamps -= 1;
            break;
          case StampType.BOTTLE:
            this.bottleStamps -= 1;
            break;
        }
        break;
      case StampType.COFFEE:
        this.coffeeStamps += 10;
        break;
      case StampType.BOTTLE:
        this.bottleStamps += 10;
        break;
    }
  }

  clone(): TransactionHelper {
    return new TransactionHelper(this.price, this.coffeeStamps, this.bottleStamps);
  }

  checkIfItemCouldBePaidWithStamps(account: PaymentAccount, item: PaymentItem): boolean {
    switch (item.couldBePaidWithStamps) {
      case StampType.COFFEE:
        if (account.coffeeStamps + this.coffeeStamps >= 10) {
          return true;
        }
        break;
      case StampType.BOTTLE:
        if (account.bottleStamps + this.bottleStamps >= 10) {
          return true;
        }
        break;
    }

    return false;
  }

  findItemsThatCouldBePaidWithStamps(account: PaymentAccount, items: PaymentItem[]): PaymentItem[] {
    let result: PaymentItem[] = [];

    for (let item of items) {
      let helper = this.clone();
      helper.removeItem(item);

      if (helper.checkIfItemCouldBePaidWithStamps(account, item)) {
        result.push(item);
      }
    }

    return result;
  }

  checkIfCouldBeAppliedToAccount(account: PaymentAccount): boolean {
    if (account.credit + this.price < account.minimumCredit) {
      return false;
    }

    if (account.useDigitalStamps) {
      if (account.coffeeStamps + this.coffeeStamps < 0) {
        return false;
      }

      if (account.bottleStamps + this.bottleStamps < 0) {
        return false;
      }
    }

    return true;
  }
}

export function calcAlternativeStamps(items: PaymentItem[], account: PaymentAccount): PaymentItem[] {
  let helper = TransactionHelper.fromItems(items);

  let removableItems = helper.findItemsThatCouldBePaidWithStamps(account, items);

  let maxPrice: number = 0;
  let maxIndex: number = -1;

  for (let i = 0; i < removableItems.length; i++) {
    let item = removableItems[i];
    if (item.price > maxPrice) {
      maxPrice = item.price;
      maxIndex = i;
    }
  }

  if (maxIndex < 0) {
    return items;
  }

  let newItems = items.slice();
  let removeItem = removableItems[maxIndex];

  let removeIndex = items.indexOf(removeItem);

  newItems.splice(removeIndex, 1, {
    ...removeItem,
    price: 0,
    payWithStamps: removeItem.couldBePaidWithStamps,
    couldBePaidWithStamps: StampType.NONE,
    giveStamps: StampType.NONE,
  });

  return calcAlternativeStamps(newItems, account);
}
