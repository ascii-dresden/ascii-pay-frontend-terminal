import { ApolloClient } from '@apollo/client';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { GET_ACCOUNT_BY_ACCESS_TOKEN, GET_PRODUCT, TRANSACTION } from '../graphql';
import { AppDispatch, RootState } from '../store';
import { StampType } from '../types/graphql-global';
import { getAccountByAccessToken, getAccountByAccessTokenVariables } from '../__generated__/getAccountByAccessToken';
import { getProduct, getProductVariables } from '../__generated__/getProduct';
import { transaction, transactionVariables } from '../__generated__/transaction';
import { calcAlternativeStamps, calculateTotal, trimPrefix } from './paymentSliceHelper';
import {
  PaymentItem,
  PaymentAccount,
  PaymentState,
  PaymentPayment,
  PAYMENT_ERROR_TIMEOUT,
  initialState,
  NotificationColor,
  NotificationType,
  NOTIFICATION_TIMEOUT,
  PaymentProduct,
  PAYMENT_INPROGRESS_TIMEOUT,
  PAYMENT_SUCCESS_TIMEOUT,
  PAYMENT_WAITING_TIMEOUT,
  SCREENSAVER_TIMEOUT,
  Notification,
} from './paymentSliceModel';

async function onReceiveAccountAccessToken(
  accessToken: string,
  state: PaymentState,
  apollo: ApolloClient<object>
): Promise<{
  account: PaymentAccount | null;
  payment?: PaymentPayment;
}> {
  if (state.payment && state.payment.type === 'InProgress') {
    const payment = state.payment;
    const variables: transactionVariables = {
      accountAccessToken: accessToken,
      stopIfStampPaymentIsPossible: payment.stopIfStampPaymentIsPossible,
      transactionItems: state.payment.items.map((i) => {
        return {
          price: -i.price,
          couldBePaidWithStamps: i.couldBePaidWithStamps,
          payWithStamps: i.payWithStamps,
          giveStamps: i.giveStamps,
          productId: i.product?.id,
        };
      }),
    };

    let result = await apollo.mutate<transaction, transactionVariables>({
      mutation: TRANSACTION,
      variables,
    });

    if (result.errors || !result.data) {
      return {
        account: null,
        payment: {
          type: 'Error',
          message: 'Could not execute transaction!',
          timeout: Date.now() + PAYMENT_ERROR_TIMEOUT,
          stopIfStampPaymentIsPossible: payment.stopIfStampPaymentIsPossible,
          total: payment.total,
          coffeeStamps: payment.coffeeStamps,
          bottleStamps: payment.bottleStamps,
        },
      };
    } else {
      let data = result.data;

      if (data.transaction.error) {
        let account = {
          id: data.transaction.account.id,
          name: data.transaction.account.name,
          credit: data.transaction.account.credit,
          coffeeStamps: data.transaction.account.coffeeStamps,
          bottleStamps: data.transaction.account.bottleStamps,
          minimumCredit: data.transaction.account.minimumCredit,
          useDigitalStamps: data.transaction.account.useDigitalStamps,
        };
        let alternativeItems = calcAlternativeStamps(payment.items, account);

        return {
          account: account,
          payment: {
            type: 'ReacalculateStamps',
            timeout: Date.now() + PAYMENT_WAITING_TIMEOUT,
            stopIfStampPaymentIsPossible: payment.stopIfStampPaymentIsPossible,
            accountAccessToken: data.transaction.accountAccessToken ?? '',
            total: payment.total,
            coffeeStamps: payment.coffeeStamps,
            bottleStamps: payment.bottleStamps,
            items: payment.items,
            withStamps: {
              ...calculateTotal(alternativeItems),
              items: alternativeItems,
            },
          },
        };
      } else {
        return {
          account: {
            id: data.transaction.account.id,
            name: data.transaction.account.name,
            credit: data.transaction.account.credit,
            coffeeStamps: data.transaction.account.coffeeStamps,
            bottleStamps: data.transaction.account.bottleStamps,
            minimumCredit: data.transaction.account.minimumCredit,
            useDigitalStamps: data.transaction.account.useDigitalStamps,
          },
          payment: {
            type: 'Success',
            timeout: Date.now() + PAYMENT_SUCCESS_TIMEOUT,
            stopIfStampPaymentIsPossible: payment.stopIfStampPaymentIsPossible,
            total: payment.total,
            coffeeStamps: payment.coffeeStamps,
            bottleStamps: payment.bottleStamps,
          },
        };
      }
    }
  } else {
    const variables: getAccountByAccessTokenVariables = {
      accountAccessToken: accessToken,
    };
    let result = await apollo.query<getAccountByAccessToken, getAccountByAccessTokenVariables>({
      query: GET_ACCOUNT_BY_ACCESS_TOKEN,
      variables,
    });
    if (result.errors || !result.data) {
      return {
        account: null,
      };
    } else {
      let data = result.data;
      return {
        account: {
          id: data.getAccountByAccessToken.id,
          name: data.getAccountByAccessToken.name,
          credit: data.getAccountByAccessToken.credit,
          coffeeStamps: data.getAccountByAccessToken.coffeeStamps,
          bottleStamps: data.getAccountByAccessToken.bottleStamps,
          minimumCredit: data.getAccountByAccessToken.minimumCredit,
          useDigitalStamps: data.getAccountByAccessToken.useDigitalStamps,
        },
      };
    }
  }
}

export const receiveAccountAccessToken = createAsyncThunk<
  {
    account: PaymentAccount | null;
    payment?: PaymentPayment;
  },
  {
    apollo: ApolloClient<object>;
    accessToken: string;
  },
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>('payment/receiveAccessToken', async (query, thunkApi) => {
  const state = thunkApi.getState().payment;

  return await onReceiveAccountAccessToken(query.accessToken, state, query.apollo);
});

async function onProductScanned(
  product_id: string,
  state: PaymentState,
  apollo: ApolloClient<object>
): Promise<PaymentProduct | null> {
  if (state.payment) {
    return null;
  }

  let result = await apollo.query<getProduct, getProductVariables>({
    query: GET_PRODUCT,
    variables: {
      product_id: product_id,
    },
  });

  if (result.errors || !result.data) {
    return null;
  } else {
    let data = result.data.getProduct;

    return {
      id: data.id,
      name: data.name,
      image: data.image,
      price: data.price,
      payWithStamps: StampType.NONE,
      couldBePaidWithStamps: data.payWithStamps,
      giveStamps: data.giveStamps,
    };
  }
}

export const productScanned = createAsyncThunk<
  PaymentProduct | null,
  {
    apollo: ApolloClient<object>;
    product_id: string;
  },
  {
    dispatch: AppDispatch;
    state: RootState;
  }
>('payment/productScanned', async (query, thunkApi) => {
  const state = thunkApi.getState().payment;

  return await onProductScanned(query.product_id, state, query.apollo);
});

export const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    setKeypadValue: (state, action: PayloadAction<number>) => {
      state.keypadValue = action.payload;
    },
    submitKeypadValue: (state, action: PayloadAction<[number, string]>) => {
      state.keypadValue = 0;
      const items = state.storedPaymentItems.slice();
      items.push({
        price: action.payload[0],
        payWithStamps: StampType.NONE,
        couldBePaidWithStamps: StampType.NONE,
        giveStamps: StampType.NONE,
        product: null,
        nameHint: action.payload[1],
      });
      state.storedPaymentItems = items;

      const total = calculateTotal(items);
      state.paymentTotal = total.total;
      state.paymentCoffeeStamps = total.coffeeStamps;
      state.paymentBottleStamps = total.bottleStamps;
    },
    addProduct: (state, action: PayloadAction<PaymentProduct>) => {
      const items = state.storedPaymentItems.slice();
      items.push({
        price: action.payload.price,
        payWithStamps: action.payload.payWithStamps,
        couldBePaidWithStamps: action.payload.couldBePaidWithStamps,
        giveStamps: action.payload.giveStamps,
        product: action.payload,
      });
      state.storedPaymentItems = items;

      const total = calculateTotal(items);
      state.paymentTotal = total.total;
      state.paymentCoffeeStamps = total.coffeeStamps;
      state.paymentBottleStamps = total.bottleStamps;
    },
    addPaymentItem: (state, action: PayloadAction<PaymentItem>) => {
      const items = state.storedPaymentItems.slice();
      items.push(action.payload);
      state.storedPaymentItems = items;

      const total = calculateTotal(items);
      state.paymentTotal = total.total;
      state.paymentCoffeeStamps = total.coffeeStamps;
      state.paymentBottleStamps = total.bottleStamps;
    },
    removePaymentItemAtIndex: (state, action: PayloadAction<number>) => {
      const items = state.storedPaymentItems.slice();
      items.splice(action.payload, 1);
      state.storedPaymentItems = items;

      const total = calculateTotal(items);
      state.paymentTotal = total.total;
      state.paymentCoffeeStamps = total.coffeeStamps;
      state.paymentBottleStamps = total.bottleStamps;
    },
    clearPaymentItems: (state) => {
      state.storedPaymentItems = [];
      const total = calculateTotal([]);
      state.paymentTotal = total.total;
      state.paymentCoffeeStamps = total.coffeeStamps;
      state.paymentBottleStamps = total.bottleStamps;
    },
    setPaymentItemStamps: (
      state,
      action: PayloadAction<{
        index: number;
        payWithStamps: StampType;
        giveStamps: StampType;
      }>
    ) => {
      const items = state.storedPaymentItems.slice();
      items[action.payload.index].payWithStamps = action.payload.payWithStamps;
      items[action.payload.index].giveStamps = action.payload.giveStamps;
      state.storedPaymentItems = items;

      const total = calculateTotal(items);
      state.paymentTotal = total.total;
      state.paymentCoffeeStamps = total.coffeeStamps;
      state.paymentBottleStamps = total.bottleStamps;
    },
    setScreensaver: (state, action: PayloadAction<boolean>) => {
      state.screensaver = action.payload;
      if (!action.payload) {
        state.screensaverTimeout = Date.now() + SCREENSAVER_TIMEOUT;
      }
    },
    showNotification: (
      state,
      action: PayloadAction<{
        type: NotificationType;
        title: string;
        color?: NotificationColor;
        description?: string;
      }>
    ) => {
      let list = state.notifications.slice();
      list.push({
        type: action.payload.type,
        title: action.payload.title,
        color: action.payload.color ?? NotificationColor.INFO,
        description: action.payload.description ?? '',
        timeout: Date.now() + NOTIFICATION_TIMEOUT,
      });
      state.notifications = list;
    },
    hideNotification: (state, action: PayloadAction<Notification>) => {
      const index = state.notifications.findIndex(
        (n) =>
          n.color === action.payload.color &&
          n.type === action.payload.type &&
          n.title === action.payload.title &&
          n.description === action.payload.description &&
          n.timeout === action.payload.timeout
      );
      if (index >= 0) {
        let list = state.notifications.slice();
        list.splice(index, 1);
        state.notifications = list;
      }
    },
    removeAccount: (state) => {
      state.scannedAccount = null;
    },
    payment: (state) => {
      if (state.payment) return;
      if (state.storedPaymentItems.length <= 0) return;

      state.payment = {
        type: 'Waiting',
        timeout: Date.now() + PAYMENT_WAITING_TIMEOUT,
        stopIfStampPaymentIsPossible: true,
        total: state.paymentTotal,
        coffeeStamps: state.paymentCoffeeStamps,
        bottleStamps: state.paymentBottleStamps,
        items: state.storedPaymentItems,
      };
    },
    paymentProceedWithStamps: (state) => {
      if (state.payment?.type !== 'ReacalculateStamps') return;

      state.payment = {
        type: 'Waiting',
        timeout: Date.now() + PAYMENT_WAITING_TIMEOUT,
        stopIfStampPaymentIsPossible: false,
        total: state.payment.withStamps.total,
        coffeeStamps: state.payment.withStamps.coffeeStamps,
        bottleStamps: state.payment.withStamps.bottleStamps,
        items: state.payment.withStamps.items,
      };
    },
    paymentProceedWithoutStamps: (state) => {
      if (state.payment?.type !== 'ReacalculateStamps') return;

      state.payment = {
        type: 'Waiting',
        timeout: Date.now() + PAYMENT_WAITING_TIMEOUT,
        stopIfStampPaymentIsPossible: false,
        total: state.payment.total,
        coffeeStamps: state.payment.coffeeStamps,
        bottleStamps: state.payment.bottleStamps,
        items: state.payment.items,
      };
    },
    cancelPayment: (state) => {
      state.payment = null;
    },
    checkTimeouts: (state) => {
      const now = Date.now();

      if (!state.screensaver && state.screensaverTimeout < now) {
        state.screensaver = true;
      }

      if (state.payment && state.payment.timeout < now) {
        state.payment = null;
      }

      if (state.notifications.length > 0) {
        state.notifications = state.notifications.filter((n) => n.timeout >= now);
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(receiveAccountAccessToken.fulfilled, (state, action) => {
      state.scannedAccount = action.payload.account;

      if (action.payload.payment) {
        state.payment = action.payload.payment;

        if (state.payment.type === 'Success') {
          state.keypadValue = 0;
          state.storedPaymentItems = [];
          const total = calculateTotal([]);
          state.paymentTotal = total.total;
          state.paymentCoffeeStamps = total.coffeeStamps;
          state.paymentBottleStamps = total.bottleStamps;
        }
      }
    });
    builder.addCase(receiveAccountAccessToken.rejected, (state, action) => {
      if (state.payment) {
        let errorMessage = trimPrefix(action.error.message || '', 'Transaction error: ');
        state.payment = {
          type: 'Error',
          timeout: Date.now() + PAYMENT_ERROR_TIMEOUT,
          stopIfStampPaymentIsPossible: state.payment.stopIfStampPaymentIsPossible,
          total: state.payment.total,
          coffeeStamps: state.payment.coffeeStamps,
          bottleStamps: state.payment.bottleStamps,
          message: errorMessage,
        };
      }
    });
    builder.addCase(receiveAccountAccessToken.pending, (state) => {
      if (state.payment?.type === 'Waiting') {
        state.payment = {
          type: 'InProgress',
          timeout: Date.now() + PAYMENT_INPROGRESS_TIMEOUT,
          stopIfStampPaymentIsPossible: state.payment.stopIfStampPaymentIsPossible,
          total: state.payment.total,
          coffeeStamps: state.payment.coffeeStamps,
          bottleStamps: state.payment.bottleStamps,
          items: state.payment.items,
        };
      }
    });
    builder.addCase(productScanned.fulfilled, (state, action) => {
      if (action.payload) {
        const items = state.storedPaymentItems.slice();
        items.push({
          price: action.payload.price,
          payWithStamps: action.payload.payWithStamps,
          couldBePaidWithStamps: StampType.NONE,
          giveStamps: action.payload.giveStamps,
          product: action.payload,
        });
        state.storedPaymentItems = items;

        const total = calculateTotal(items);
        state.paymentTotal = total.total;
        state.paymentCoffeeStamps = total.coffeeStamps;
        state.paymentBottleStamps = total.bottleStamps;
      }
    });
  },
});

export const {
  setKeypadValue,
  submitKeypadValue,
  addProduct,
  addPaymentItem,
  removePaymentItemAtIndex,
  clearPaymentItems,
  setPaymentItemStamps,
  setScreensaver,
  showNotification,
  hideNotification,
  removeAccount,
  payment,
  paymentProceedWithStamps,
  paymentProceedWithoutStamps,
  cancelPayment,
  checkTimeouts,
} = paymentSlice.actions;
export default paymentSlice.reducer;
