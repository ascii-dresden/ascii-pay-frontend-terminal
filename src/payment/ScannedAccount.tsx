import React from 'react';
import { MdCancel, MdRefresh } from 'react-icons/md';
import { AsciiPayAuthenticationClient } from '../ascii-pay-authentication-client';
import Money from '../components/Money';
import Stamp from '../components/Stamp';
import { useAppDispatch, useAppSelector } from '../store';
import { StampType } from '../types/graphql-global';
import { removeAccount } from './paymentSlice';
import './ScannedAccount.scss';

export default function ScannedAccount(props: { authClient: AsciiPayAuthenticationClient }) {
  const scannedAccount = useAppSelector((state) => state.payment.scannedAccount);
  const dispatch = useAppDispatch();

  const refresh = React.useCallback(() => {
    props.authClient.requestAccountAccessToken();
  }, [props.authClient]);

  if (scannedAccount === null) {
    return (
      <div className="scanned-account">
        <div className="scanned-account-empty">
          <span>Kein Konto erkannt!</span>
          <div className="scanned-account-refresh" onClick={refresh}>
            <MdRefresh />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="scanned-account">
      <div className="scanned-account-name">{scannedAccount.name}</div>
      <div className="scanned-account-tags">
        <Money value={scannedAccount.credit} />
        <Stamp value={scannedAccount.coffeeStamps} type={StampType.COFFEE} />
        <Stamp value={scannedAccount.bottleStamps} type={StampType.BOTTLE} />
      </div>
      <div className="scanned-account-remove" onClick={() => dispatch(removeAccount())}>
        <MdCancel />
      </div>
    </div>
  );
}
