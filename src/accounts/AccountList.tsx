import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_ACCOUNTS } from '../graphql';
import { getAccounts } from '../__generated__/getAccounts';
import './AccountList.scss';

export default function AccountList(props: { id: string | null; onSelect: (id: string) => void }) {
  const { loading, error, data } = useQuery<getAccounts>(GET_ACCOUNTS, {
    fetchPolicy: 'network-only',
  });

  if (loading) {
    return <></>;
  }

  if (error) {
    return <></>;
  }

  if (!data) {
    return <></>;
  }

  let sortedData = data.getAccounts.slice();
  sortedData.sort((a, b) => a.element.name.localeCompare(b.element.name));

  const accountList = sortedData.map((it: any) => (
    <div key={it.element.id} className={it.element.id === props.id ? 'active' : ''}>
      <span onClick={() => props.onSelect(it.element.id)}>{it.element.name}</span>
    </div>
  ));

  return <div className="account-list">{accountList}</div>;
}
