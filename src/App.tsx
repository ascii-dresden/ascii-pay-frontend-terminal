import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import AccountsPage from './accounts/AccountsPage';
import './App.scss';
import { AsciiPayAuthenticationClient, WebSocketMessageHandler } from './ascii-pay-authentication-client';
import PaymentPage from './payment/PaymentPage';
import { checkTimeouts, NotificationColor, NotificationType, showNotification } from './payment/paymentSlice';
import RegisterPage from './register/RegisterPage';
import SettingsPage from './SettingsPage';
import StartPage from './StartPage';
import { useAppDispatch } from './store';
import { AndroidFullScreen } from '@ionic-native/android-full-screen';
import { useTranslation } from 'react-i18next';

export default function App(props: { authClient: AsciiPayAuthenticationClient }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  (async () => {
    try {
      if (await AndroidFullScreen.isImmersiveModeSupported()) {
        await AndroidFullScreen.immersiveMode();
      }
    } catch {
      console.log('Cannot enter fullscreen mode!');
    }
  })();

  const onresize = () => {
    const scale = Math.min(window.innerWidth / 800, window.innerHeight / 480);
    document.documentElement.style.fontSize = Math.round(16 * scale) + 'px';
  };

  onresize();
  useEffect(() => {
    window.addEventListener('resize', onresize);
    return () => {
      window.removeEventListener('resize', onresize);
    };
  }, []);

  React.useEffect(() => {
    const timer = setInterval(() => dispatch(checkTimeouts()));
    return () => {
      clearInterval(timer);
    };
  }, [dispatch]);

  const handler: WebSocketMessageHandler = {
    onFoundUnknownBarcode(code: string) {
      dispatch(
        showNotification({
          type: NotificationType.QR,
          title: t('notification.onFoundUnknownBarcode'),
          description: code,
        })
      );
    },
    onFoundAccountNumber(accountNumber: string) {
      dispatch(
        showNotification({
          type: NotificationType.QR,
          title: t('notification.onFoundAccountNumber'),
          description: accountNumber,
        })
      );
    },
    onFoundUnknownNfcCard(id: string, name: string) {
      dispatch(
        showNotification({
          type: NotificationType.NFC,
          title: t('notification.onFoundUnknownNfcCard'),
          description: name,
        })
      );
    },
    onFoundProductId(product_id: string) {
      dispatch(
        showNotification({
          type: NotificationType.GENERAL,
          title: t('notification.onFoundProductId'),
        })
      );
    },
    onFoundAccountAccessToken(accessToken: string) {
      dispatch(
        showNotification({
          type: NotificationType.GENERAL,
          title: t('notification.onFoundAccountAccessToken'),
        })
      );
    },
    onNfcCardRemoved() {
      dispatch(
        showNotification({
          type: NotificationType.NFC,
          title: t('notification.onNfcCardRemoved'),
        })
      );
    },
    onStatusInformation(status) {
      dispatch(
        showNotification({
          type: NotificationType.GENERAL,
          title: t('notification.onStatusInformation'),
        })
      );
    },
    onError(source: string, message: string) {
      dispatch(
        showNotification({
          type: NotificationType.GENERAL,
          color: NotificationColor.ERROR,
          title: source,
          description: message,
        })
      );
    },
  };

  React.useEffect(() => {
    props.authClient.addFallbackEventHandler(handler);
    return () => props.authClient.addFallbackEventHandler(handler);
    // eslint-disable-next-line
  }, [props.authClient]);

  return (
    <Router basename="">
      <Switch>
        <Route path="/payment">
          <PaymentPage authClient={props.authClient} />
        </Route>
        <Route path="/register">
          <RegisterPage />
        </Route>
        <Route path="/accounts">
          <AccountsPage authClient={props.authClient} />
        </Route>
        <Route path="/settings">
          <SettingsPage authClient={props.authClient} />
        </Route>
        <Route path="">
          <StartPage authClient={props.authClient} />
        </Route>
      </Switch>
    </Router>
  );
}
