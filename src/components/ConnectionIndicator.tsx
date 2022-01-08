import React, { useState } from 'react';
import { AsciiPayAuthenticationClient, WebSocketMessageHandler } from '../ascii-pay-authentication-client';
import './ConnectionIndicator.scss';
import { useTranslation } from 'react-i18next';

export default function ConnectionIndicator(props: { authClient: AsciiPayAuthenticationClient }) {
  const { t } = useTranslation();
  let [isConnected, setIsConnected] = useState(props.authClient.connected);

  const handler: WebSocketMessageHandler = {
    onConnectionStateChange(connected: boolean) {
      setIsConnected(connected);
    },
  };

  React.useEffect(() => {
    props.authClient.addFallbackEventHandler(handler);
    return () => props.authClient.addFallbackEventHandler(handler);
    // eslint-disable-next-line
  }, [props.authClient]);

  let message = isConnected ? t('general.terminalConnected') : t('general.terminalDisconnected');
  let className = isConnected ? 'connected' : 'disconnected';
  return (
    <div className={'connection-indicator ' + className}>
      <div>
        <span>{message}</span>
      </div>
    </div>
  );
}
