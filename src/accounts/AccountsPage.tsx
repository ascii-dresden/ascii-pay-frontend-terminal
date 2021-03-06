import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import React, { useState } from 'react';
import { MdExitToApp, MdPeople, MdShowChart } from 'react-icons/md';
import { useHistory } from 'react-router-dom';
import { AsciiPayAuthenticationClient } from '../ascii-pay-authentication-client';
import Sidebar, { SidebarAction } from '../components/SidebarPage';
import { GET_ACCOUNT, LOGOUT } from '../graphql';
import { AccountOutput } from '../model';
import { logout } from '../__generated__/logout';
import AccountDetails from './AccountDetails';
import AccountList from './AccountList';
import AccountOverview from './AccountOverview';
import './AccountsPage.scss';
import Login from './Login';
import { useTranslation } from 'react-i18next';

enum Mode {
  SELF,
  LIST,
}

export default function AccountsPage(props: { authClient: AsciiPayAuthenticationClient }) {
  const { t } = useTranslation();
  const client = useApolloClient();
  const history = useHistory();

  const [mode, setMode] = useState(Mode.SELF);

  const handleGoBack = () => {
    logoutFunction().catch(() => {
      // login failed
    });
    history.goBack();
  };

  const { loading, error, data } = useQuery(GET_ACCOUNT, {
    fetchPolicy: 'network-only',
  });

  const [logoutFunction, { data: logoutData }] = useMutation<logout>(LOGOUT);
  let [accountId, setAccountId] = useState(null as string | null);

  if (loading) {
    return <Sidebar defaultAction={handleGoBack}></Sidebar>;
  }

  if (error) {
    return (
      <Sidebar defaultAction={handleGoBack}>
        <Login authClient={props.authClient} />
      </Sidebar>
    );
  }

  if (logoutData) {
    localStorage['token'] = '';
    client.refetchQueries({
      include: [GET_ACCOUNT],
    });
  }

  const account = data.getAccount as AccountOutput;
  const logout = () => {
    logoutFunction().catch(() => {
      // login failed
    });
  };

  const actions: SidebarAction[] = [
    {
      title: t('account.overview'),
      element: <MdShowChart />,
      action: () => setMode(Mode.SELF),
      active: mode === Mode.SELF,
    },
    {
      title: t('account.accountList'),
      element: <MdPeople />,
      action: () => setMode(Mode.LIST),
      active: mode === Mode.LIST,
    },
  ];

  let content;
  switch (mode) {
    case Mode.SELF:
      content = <AccountOverview />;
      break;
    case Mode.LIST:
      content = (
        <>
          <AccountList id={accountId} onSelect={(id) => setAccountId(id)} />
          {accountId ? <AccountDetails id={accountId} authClient={props.authClient} /> : <></>}
        </>
      );
      break;
  }

  return (
    <Sidebar defaultAction={handleGoBack} content={actions}>
      <div className="logged-account-header">
        <span>{account.name}</span>
        <span>{account.permission}</span>
        <div onClick={logout}>
          <MdExitToApp />
        </div>
      </div>
      {content}
    </Sidebar>
  );
}
