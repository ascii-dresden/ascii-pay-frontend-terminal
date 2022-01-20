import { useApolloClient } from '@apollo/client';
import React, { useState } from 'react';
import { MdApps, MdManageSearch, MdOutlineCalculate } from 'react-icons/md';
import { useHistory } from 'react-router-dom';
import {
  AsciiPayAuthenticationClient,
  WebSocketMessageHandler,
  WebSocketResponse,
} from '../ascii-pay-authentication-client';
import ClockIcon from '../components/ClockIcon';
import Keypad from '../components/Keypad';
import Money from '../components/Money';
import Sidebar, { SidebarAction } from '../components/SidebarPage';
import Stamp from '../components/Stamp';
import { useAppDispatch, useAppSelector } from '../store';
import { StampType } from '../types/graphql-global';
import Basket from './Basket';
import PaymentDialog from './PaymentDialog';
import './PaymentPage.scss';
import {
  cancelPayment,
  payment,
  productScanned,
  receiveAccountAccessToken,
  removeAccount,
  setKeypadValue,
  setScreensaver,
  submitKeypadValue,
} from './paymentSlice';
import ProductList from './ProductList';
import QuickAccess from './QuickAccess';
import ScannedAccount from './ScannedAccount';
import { useTranslation } from 'react-i18next';
import { BackgroundMode } from '@awesome-cordova-plugins/background-mode';

enum Page {
  QUICK,
  KEYPAD,
  PRODUCTS,
}

export default function PaymentPage(props: { authClient: AsciiPayAuthenticationClient }) {
  const { t } = useTranslation();
  const history = useHistory();
  const handleGoBack = () => history.goBack();

  const keypadValue = useAppSelector((state) => state.payment.keypadValue);
  const paymentTotal = useAppSelector((state) => state.payment.paymentTotal);
  const paymentCoffeeStamps = useAppSelector((state) => state.payment.paymentCoffeeStamps);
  const paymentBottleStamps = useAppSelector((state) => state.payment.paymentBottleStamps);
  const storedPaymentItems = useAppSelector((state) => state.payment.storedPaymentItems);
  const paymentPayment = useAppSelector((state) => state.payment.payment);
  const dispatch = useAppDispatch();
  const client = useApolloClient();

  const [activePage, setActivePage] = useState(Page.QUICK);
  const quickActions: SidebarAction[] = [
    {
      title: t('payment.quickAccess'),
      element: <MdApps />,
      action: () => setActivePage(Page.QUICK),
      active: activePage === Page.QUICK,
    },
    {
      title: t('payment.keypad'),
      element: <MdOutlineCalculate />,
      action: () => setActivePage(Page.KEYPAD),
      active: activePage === Page.KEYPAD,
    },
    {
      title: t('payment.productList'),
      element: <MdManageSearch />,
      action: () => setActivePage(Page.PRODUCTS),
      active: activePage === Page.PRODUCTS,
    },
    {
      title: t('general.enableScreensaver'),
      element: <ClockIcon />,
      action: (event) => {
        event.stopPropagation();
        dispatch(setScreensaver(true));
      },
      bottom: true,
    },
  ];

  const payAction = () => {
    if (keypadValue !== 0) {
      dispatch(submitKeypadValue(keypadValue));
    }

    dispatch(payment());
    props.authClient.requestAccountAccessToken();
  };

  const handler: WebSocketMessageHandler = {
    onMessage(_message: WebSocketResponse) {
      BackgroundMode.wakeUp();
      dispatch(setScreensaver(false));
    },
    onFoundAccountAccessToken(accessToken: string) {
      dispatch(
        receiveAccountAccessToken({
          apollo: client,
          accessToken: accessToken,
        })
      );
      return true;
    },
    onNfcCardRemoved() {
      dispatch(removeAccount());
      return true;
    },
    onFoundProductId(product_id: string) {
      dispatch(
        productScanned({
          apollo: client,
          product_id: product_id,
        })
      );
      return true;
    },
  };

  React.useEffect(() => {
    props.authClient.addEventHandler(handler);
    return () => props.authClient.removeEventHandler(handler);
    // eslint-disable-next-line
  }, [props.authClient]);
  React.useEffect(() => {
    props.authClient.requestAccountAccessToken();
  }, [props.authClient]);

  let content;
  switch (activePage) {
    case Page.QUICK:
      content = <QuickAccess />;
      break;
    case Page.KEYPAD:
      content = (
        <Keypad
          value={keypadValue}
          onChange={(value) => dispatch(setKeypadValue(value))}
          onSubmit={(value) => {
            dispatch(submitKeypadValue(value));
          }}
        />
      );
      break;
    case Page.PRODUCTS:
      content = <ProductList />;
      break;
  }

  return (
    <Sidebar defaultAction={handleGoBack} content={quickActions}>
      <div className="payment-page-left">{content}</div>
      <div className="payment-page-right">
        <ScannedAccount authClient={props.authClient} />
        <Basket />
        <div className="payment-page-summary">
          <Money value={paymentTotal} />
          <Stamp value={paymentCoffeeStamps} type={StampType.COFFEE} />
          <Stamp value={paymentBottleStamps} type={StampType.BOTTLE} />
          <span
            onClick={payAction}
            className={storedPaymentItems.length > 0 || keypadValue !== 0 ? 'enabled' : 'disabled'}
          >
            {t('payment.pay')}
          </span>
        </div>
      </div>
      {paymentPayment ? <PaymentDialog payment={paymentPayment} onClose={() => dispatch(cancelPayment())} /> : <></>}
    </Sidebar>
  );
}
