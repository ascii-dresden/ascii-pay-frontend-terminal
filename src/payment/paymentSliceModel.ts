import { StampType } from '../types/graphql-global';

export interface PaymentAccount {
  id: UUID;
  name: string;
  credit: number;
  coffeeStamps: number;
  bottleStamps: number;
}
export interface PaymentProduct {
  id: UUID;
  name: string;
  image: string | null;
  price: number;
  payWithStamps: StampType;
  couldBePaidWithStamps: StampType;
  giveStamps: StampType;
}
export interface PaymentItem {
  price: number;
  payWithStamps: StampType;
  couldBePaidWithStamps: StampType;
  giveStamps: StampType;
  product: PaymentProduct | null;
  nameHint?: string;
  colorHint?: string;
}

export interface PaymentPaymentWaiting {
  type: 'Waiting';
  timeout: number;
  stopIfStampPaymentIsPossible: boolean;
  total: number;
  coffeeStamps: number;
  bottleStamps: number;
  items: PaymentItem[];
}

export interface PaymentPaymentRecalculateStamps {
  type: 'ReacalculateStamps';
  timeout: number;
  stopIfStampPaymentIsPossible: boolean;
  accountAccessToken: string;
  total: number;
  coffeeStamps: number;
  bottleStamps: number;
  items: PaymentItem[];
  withStamps: {
    total: number;
    coffeeStamps: number;
    bottleStamps: number;
    items: PaymentItem[];
  };
}

export interface PaymentPaymentInProgress {
  type: 'InProgress';
  timeout: number;
  stopIfStampPaymentIsPossible: boolean;
  total: number;
  coffeeStamps: number;
  bottleStamps: number;
  items: PaymentItem[];
}
export interface PaymentPaymentError {
  type: 'Error';
  timeout: number;
  stopIfStampPaymentIsPossible: boolean;
  total: number;
  coffeeStamps: number;
  bottleStamps: number;
  message: string;
}
export interface PaymentPaymentSuccess {
  type: 'Success';
  timeout: number;
  stopIfStampPaymentIsPossible: boolean;
  total: number;
  coffeeStamps: number;
  bottleStamps: number;
}
export type PaymentPayment =
  | PaymentPaymentWaiting
  | PaymentPaymentInProgress
  | PaymentPaymentRecalculateStamps
  | PaymentPaymentError
  | PaymentPaymentSuccess;

export enum NotificationType {
  GENERAL,
  NFC,
  QR,
}
export enum NotificationColor {
  INFO,
  WARN,
  ERROR,
}
export interface Notification {
  type: NotificationType;
  color: NotificationColor;
  title: string;
  description: string;
  timeout: number;
}

export interface PaymentState {
  screensaver: boolean;
  screensaverTimeout: number;
  keypadValue: number;
  storedPaymentItems: PaymentItem[];
  scannedAccount: PaymentAccount | null;
  paymentTotal: number;
  paymentCoffeeStamps: number;
  paymentBottleStamps: number;
  payment: PaymentPayment | null;
  notifications: Notification[];
}

export const initialState: PaymentState = {
  screensaver: true,
  screensaverTimeout: 0,
  keypadValue: 0,
  storedPaymentItems: [],
  scannedAccount: null,
  paymentTotal: 0,
  paymentCoffeeStamps: 0,
  paymentBottleStamps: 0,
  payment: null,
  notifications: [],
};

export const SCREENSAVER_TIMEOUT = 300_000;
export const NOTIFICATION_TIMEOUT = 5_000;
export const PAYMENT_WAITING_TIMEOUT = 30_000;
export const PAYMENT_INPROGRESS_TIMEOUT = 3_000;
export const PAYMENT_ERROR_TIMEOUT = 5_000;
export const PAYMENT_SUCCESS_TIMEOUT = 2_000;
