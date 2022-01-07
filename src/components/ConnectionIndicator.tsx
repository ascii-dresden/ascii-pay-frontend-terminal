import React, { useState } from 'react';
import { AsciiPayAuthenticationClient, WebSocketMessageHandler } from '../ascii-pay-authentication-client';
import './ConnectionIndicator.scss';

export default function ConnectionIndicator(props: { authClient: AsciiPayAuthenticationClient }) {
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

  let message = isConnected ? 'NFC Terminal verbunden!' : 'NFC Terminal nicht verbunden!';
  let className = isConnected ? 'connected' : 'disconnected';
  return (
    <div className={'connection-indicator ' + className}>
      <div>
        <span>{message}</span>
      </div>
    </div>
  );
}
