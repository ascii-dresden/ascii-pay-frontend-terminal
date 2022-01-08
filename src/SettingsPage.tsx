import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import './SettingsPage.scss';
import SidebarPage from './components/SidebarPage';
import { AsciiPayAuthenticationClient, WebSocketMessageHandler } from './ascii-pay-authentication-client';
import { useTranslation } from 'react-i18next';

const colors = ['teal', 'green', 'blue', 'purple', 'yellow', 'orange', 'red'];

export const useWindowSize = () => {
  function getSize() {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }

  const [windowSize, setWindowSize] = useState(getSize);

  useEffect(() => {
    function handleResize() {
      setWindowSize(getSize());
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

export default function SettingsPage(props: { authClient: AsciiPayAuthenticationClient }) {
  const { t } = useTranslation();
  const history = useHistory();
  const handleGoBack = () => history.goBack();

  const [darkMode, setDarkMode] = React.useState(localStorage.getItem('dark-mode') === 'true');
  React.useEffect(() => {
    document.body.dataset['theme'] = darkMode ? 'dark' : 'light';
    localStorage.setItem('dark-mode', darkMode.toString());
  }, [darkMode]);

  const [highlightColor, setHighlightColor] = React.useState(localStorage.getItem('highlight-color') || 'blue');
  React.useEffect(() => {
    document.body.dataset['highlight'] = highlightColor;
    localStorage.setItem('highlight-color', highlightColor);
  }, [highlightColor]);

  const windowSize = useWindowSize();

  const [statusInformation, setStatusInformation] = React.useState('');
  const handler: WebSocketMessageHandler = {
    onStatusInformation(status: string) {
      setStatusInformation(status);
      return true;
    },
  };

  React.useEffect(() => {
    props.authClient.addEventHandler(handler);
    props.authClient.requestStatusInformation();
    return () => props.authClient.removeEventHandler(handler);
    // eslint-disable-next-line
  }, [props.authClient]);

  const hightlightViews = colors.map((c) => (
    <div
      key={c}
      className={'color-' + c + (c === highlightColor ? ' active' : '')}
      onClick={() => setHighlightColor(c)}
    ></div>
  ));

  return (
    <SidebarPage defaultAction={handleGoBack}>
      <div className="settings">
        <span>{t('settingsPage.name')}</span>
        <div className="settings-columns">
          <div>
            <div>
              <span>{t('settingsPage.theme')}</span>
              <div className="settings-item settings-theme">
                <div
                  data-name={t('settingsPage.themeLight')}
                  className={'theme-light' + (!darkMode ? ' active' : '')}
                  onClick={() => setDarkMode(false)}
                >
                  <img src="/favicon.svg" alt="" />
                </div>
                <div
                  data-name={t('settingsPage.themeDark')}
                  className={'theme-dark' + (darkMode ? ' active' : '')}
                  onClick={() => setDarkMode(true)}
                >
                  <img src="/favicon.svg" alt="" />
                </div>
              </div>
            </div>
            <div>
              <span>{t('settingsPage.highlightColor')}</span>
              <div className="settings-item settings-highlight-color">{hightlightViews}</div>
            </div>
            <div>
              <span>{t('settingsPage.actions')}</span>
              <div className="settings-item settings-actions form">
                <button onClick={() => window.location.reload()}>{t('settingsPage.reload')}</button>
                <button onClick={() => props.authClient.requestReboot()}>{t('settingsPage.restart')}</button>
              </div>
            </div>
          </div>
          <div>
            <div>
              <span>{t('settingsPage.windowSize')}</span>
              <div>
                {windowSize.width}x{windowSize.height}
              </div>
              <span>{t('settingsPage.terminal')}</span>
              <div className="settings-item settings-proxy-status">
                <code>{statusInformation}</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarPage>
  );
}
