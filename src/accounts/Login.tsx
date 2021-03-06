import { useApolloClient, useMutation } from '@apollo/client';
import React, { useCallback, useState } from 'react';
import { SiContactlesspayment } from 'react-icons/si';
import { AsciiPayAuthenticationClient, WebSocketMessageHandler } from '../ascii-pay-authentication-client';
import { GET_ACCOUNT, LOGIN } from '../graphql';
import { login, loginVariables } from '../__generated__/login';
import './Login.scss';
import { useTranslation } from 'react-i18next';

export default function Login(props: { authClient: AsciiPayAuthenticationClient }) {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [mutateFunction, { data, loading, error }] = useMutation<login, loginVariables>(LOGIN);
  const client = useApolloClient();

  const onLogin = useCallback(
    (username, password) => {
      mutateFunction({
        variables: {
          username: username,
          password: password,
          accountAccessToken: null,
        },
      }).catch(() => {
        // login failed
      });
    },
    [mutateFunction]
  );

  if (data) {
    localStorage['token'] = data.login.token;
    client.refetchQueries({
      include: [GET_ACCOUNT],
    });
  }

  const handler: WebSocketMessageHandler = {
    onFoundAccountAccessToken(access_token: string) {
      mutateFunction({
        variables: {
          username: null,
          password: null,
          accountAccessToken: access_token,
        },
      }).catch(() => {
        // login failed
      });
      return true;
    },
  };

  React.useEffect(() => {
    props.authClient.addEventHandler(handler);
    props.authClient.requestAccountAccessToken();
    return () => props.authClient.removeEventHandler(handler);
    // eslint-disable-next-line
  }, [props.authClient]);

  const usernameInput = React.useRef<HTMLInputElement>(null);
  const passwordInput = React.useRef<HTMLInputElement>(null);

  let errorView = <></>;
  if (error) {
    errorView = <div className="login-error">{t('account.loginFailed')}</div>;
  }

  return (
    <div className="login">
      <span>{t('account.loginMessage')}</span>
      <div className="login-split" data-or={t('general.or')}>
        <div className="form">
          <div>
            <label>{t('account.username')}</label>
            <input
              ref={usernameInput}
              placeholder={t('account.username')}
              inputMode="none"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label>{t('account.password')}</label>
            <input
              ref={passwordInput}
              placeholder={t('account.password')}
              inputMode="none"
              type="password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            disabled={loading}
            onClick={() => onLogin(usernameInput.current?.value ?? username, passwordInput.current?.value ?? password)}
          >
            {t('account.login')}
          </button>
          {errorView}
        </div>
        <div>
          <SiContactlesspayment />
        </div>
      </div>
    </div>
  );
}
