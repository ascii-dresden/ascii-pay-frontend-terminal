import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import './i18n';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { ApolloClient, ApolloProvider, createHttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { Provider } from 'react-redux';
import { store } from './store';
import Keyboard from './components/Keyboard';
import Screensaver from './components/Screensaver';
import { AsciiPayAuthenticationClient } from './ascii-pay-authentication-client';
import { setScreensaver } from './payment/paymentSlice';
import NotificationManager from './components/NotificationManager';
import ConnectionIndicator from './components/ConnectionIndicator';
import { BackgroundMode } from '@awesome-cordova-plugins/background-mode';

export const SERVER_URI = 'https://pay.ascii.coffee';
export const PROXY_URI = 'ws://10.3.141.1:9001/';

// export const SERVER_URI = 'http://secure-pay.ascii.local';
// export const PROXY_URI = 'ws://127.0.0.1:9001/';

const httpLink = createHttpLink({
  uri: SERVER_URI + '/api/v1/graphql',
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

document.body.dataset['theme'] = localStorage.getItem('dark-mode') === 'true' ? 'dark' : 'light';
document.body.dataset['highlight'] = localStorage.getItem('highlight-color') || 'blue';

const authClient = new AsciiPayAuthenticationClient(PROXY_URI);
(document as any).authClient = authClient;

document.body.addEventListener('click', () => {
  store.dispatch(setScreensaver(false));
});

document.addEventListener(
  'deviceready',
  function () {
    BackgroundMode.enable();
    BackgroundMode.excludeFromTaskList();
    BackgroundMode.overrideBackButton();
    // BackgroundMode.disableWebViewOptimizations();
    // BackgroundMode.disableBatteryOptimizations();
  },
  false
);

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <ApolloProvider client={apolloClient}>
        <ConnectionIndicator authClient={authClient} />
        <Keyboard />
        <App authClient={authClient} />
        <Screensaver />
        <NotificationManager />
      </ApolloProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
