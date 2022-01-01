import { useApolloClient, useQuery } from '@apollo/client';
import React, { useState } from 'react';
import { MdDelete } from 'react-icons/md';
import { AsciiPayAuthenticationClient, WebSocketMessageHandler } from '../ascii-pay-authentication-client';
import Dialog from '../components/Dialog';
import { DELETE_ACCOUNT_NFC_CARD, GET_ACCOUNT, SET_ACCOUNT_NUMBER } from '../graphql';
import { Permission } from '../types/graphql-global';
import { deleteAccountNfcCard, deleteAccountNfcCardVariables } from '../__generated__/deleteAccountNfcCard';
import { getAccount, getAccountVariables, getAccount_getAccount } from '../__generated__/getAccount';
import { setAccountNumber, setAccountNumberVariables } from '../__generated__/setAccountNumber';
import './AccountDetails.scss';

export default function AccountDetails(props: { id: string; authClient: AsciiPayAuthenticationClient }) {
  const client = useApolloClient();

  const { loading, error, data } = useQuery<getAccount, getAccountVariables>(GET_ACCOUNT, {
    fetchPolicy: 'network-only',
    variables: {
      id: props.id,
    },
  });

  const [registerNfc, setRegisterNfc] = useState(
    null as {
      id: string;
      name: string;
    } | null
  );
  const [registerAccountNumber, setRegisterAccountNumber] = useState(null as string | null);

  let account: getAccount_getAccount = {
    __typename: 'AccountOutput',
    id: '',
    credit: 0,
    minimumCredit: 0,
    bottleStamps: 0,
    coffeeStamps: 0,
    name: '',
    mail: '',
    username: '',
    accountNumber: '',
    permission: Permission.DEFAULT,
    useDigitalStamps: false,
    receivesMonthlyReport: false,
    isPasswordSet: false,
    nfcTokens: [],
  };
  if (!loading && !error && data) {
    account = data.getAccount;
  }

  const handler: WebSocketMessageHandler = {
    onFoundUnknownNfcCard(id: string, name: string) {
      setRegisterAccountNumber(null);
      setRegisterNfc({
        id,
        name,
      });
      return true;
    },
    onFoundAccountNumber(accountNumber: string) {
      setRegisterNfc(null);
      setRegisterAccountNumber(accountNumber);
      return true;
    },
    onRegisterNfcCardSuccessful() {
      client.refetchQueries({
        include: [GET_ACCOUNT],
      });
      return true;
    },
    onNfcCardRemoved() {
      setRegisterNfc(null);
      return true;
    },
  };

  React.useEffect(() => {
    props.authClient.addEventHandler(handler);
    props.authClient.requestAccountAccessToken();
    return () => props.authClient.removeEventHandler(handler);
    // eslint-disable-next-line
  }, [props.authClient]);

  let registerAccountNumberCallback = (accountNumber: string) => {
    (async () => {
      try {
        await client.mutate<setAccountNumber, setAccountNumberVariables>({
          mutation: SET_ACCOUNT_NUMBER,
          variables: {
            id: props.id,
            accountNumber,
          },
        });

        client.refetchQueries({
          include: [GET_ACCOUNT],
        });
      } catch (e) {
        console.error(e);
      }
    })();
  };

  let removeNfcToken = (cardId: string) => {
    (async () => {
      try {
        await client.mutate<deleteAccountNfcCard, deleteAccountNfcCardVariables>({
          mutation: DELETE_ACCOUNT_NFC_CARD,
          variables: {
            id: props.id,
            cardId,
          },
        });

        client.refetchQueries({
          include: [GET_ACCOUNT],
        });
      } catch (e) {
        console.error(e);
      }
    })();
  };

  let addView = <></>;
  if (registerNfc && account.id) {
    let action = [
      {
        label: 'Register nfc card',
        action: () => {
          if (account.id) {
            props.authClient.registerNfcCard(account.id);
            setRegisterNfc(null);
          }
        },
      },
      {
        label: 'Cancel',
        action: () => {
          setRegisterNfc(null);
        },
      },
    ];
    addView = (
      <Dialog title="Found new nfc card" actions={action}>
        <div className="form">
          <div>
            <label>NFC Type</label>
            <input readOnly={true} value={registerNfc.name} />
          </div>
          <div>
            <label>NFC ID</label>
            <input readOnly={true} value={registerNfc.id} />
          </div>
        </div>
      </Dialog>
    );
  } else if (registerAccountNumber && account.id) {
    let action = [
      {
        label: 'Register account number',
        action: () => {
          if (account.id) {
            registerAccountNumberCallback(registerAccountNumber);
            setRegisterAccountNumber(null);
          }
        },
      },
      {
        label: 'Cancel',
        action: () => {
          setRegisterAccountNumber(null);
        },
      },
    ];
    addView = (
      <Dialog title="Found account number" actions={action}>
        <div className="form">
          <div>
            <label>Account number</label>
            <input readOnly={true} value={registerAccountNumber} />
          </div>
        </div>
      </Dialog>
    );
  }

  let nfc = account.nfcTokens.map((token) => (
    <div key={token.cardId}>
      <label>NFC Token</label>
      <div className="input-group">
        <input readOnly={true} value={token.name + ": '" + token.cardId + "'"} />
        <button style={{ width: '4rem' }} onClick={() => removeNfcToken(token.cardId)}>
          <MdDelete />
        </button>
      </div>
    </div>
  ));

  return (
    <div className="account-details form">
      <div>
        <label>Name</label>
        <input readOnly={true} value={account.name || ''} />
      </div>
      <div>
        <label>Username</label>
        <input readOnly={true} value={account.username || ''} />
      </div>
      <div>
        <label>Account number</label>
        <input readOnly={true} value={account.accountNumber || ''} />
      </div>
      <div>
        <label>Permission</label>
        <input readOnly={true} value={account.permission || ''} />
      </div>
      {nfc}
      {addView}
    </div>
  );
}
