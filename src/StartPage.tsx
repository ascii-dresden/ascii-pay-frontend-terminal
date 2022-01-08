import React from 'react';
import { useHistory } from 'react-router-dom';
import { MdLocalAtm, MdPeople, MdSettings, MdShoppingCart } from 'react-icons/md';
import './StartPage.scss';
import SidebarPage, { SidebarAction } from './components/SidebarPage';
import { setScreensaver } from './payment/paymentSlice';
import { useAppDispatch } from './store';
import ClockIcon from './components/ClockIcon';
import { useTranslation } from 'react-i18next';

const useDate = (t: (key: string) => string) => {
  const locale = localStorage.getItem('language') ?? 'de';
  const [today, setDate] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 5 * 1000);
    return () => {
      clearInterval(timer);
    };
  }, []);

  const day = today.toLocaleDateString(locale, { weekday: 'short' });
  const date = `${day} ${today.getDate()}. ${today.toLocaleDateString(locale, { month: 'short' })}`;
  const time = today.toLocaleTimeString(locale, { hour: 'numeric', hour12: false, minute: 'numeric' });

  const hour = today.getHours();
  const wish = t(
    (hour < 12 && 'startPage.greeting.morning') ||
      (hour < 17 && 'startPage.greeting.day') ||
      'startPage.greeting.evening'
  );

  return {
    date: `${date} ${time}`,
    wish,
  };
};

export default function StartPage() {
  const { t } = useTranslation();
  const history = useHistory();
  const handleOpenPayment = () => history.push('/payment');
  const handleOpenAccounts = () => history.push('/accounts');
  const handleOpenRegister = () => history.push('/register');
  const handleOpenSettings = () => history.push('/settings');

  const dispatch = useAppDispatch();
  const { date, wish } = useDate(t);

  const sidebarActions: SidebarAction[] = [
    {
      title: t('general.enableScreensaver'),
      element: <ClockIcon />,
      action: (event) => {
        event.stopPropagation();
        dispatch(setScreensaver(true));
      },
      bottom: true,
    },
  ];

  return (
    <SidebarPage content={sidebarActions}>
      <div className="start-page">
        <div className="start-page-header">
          <span>{wish}</span>
          <span>{date}</span>
        </div>
        <div className="start-page-menu">
          <div className="start-page-entry" onClick={handleOpenPayment}>
            <MdShoppingCart />
            <span>{t('startPage.openPayment')}</span>
          </div>
          <div className="start-page-entry" onClick={handleOpenRegister}>
            <MdLocalAtm />
            <span>{t('startPage.openRegister')}</span>
          </div>
          <div className="start-page-entry" onClick={handleOpenAccounts}>
            <MdPeople />
            <span>{t('startPage.openAccount')}</span>
          </div>
          <div className="start-page-entry" onClick={handleOpenSettings}>
            <MdSettings />
            <span>{t('startPage.openSettings')}</span>
          </div>
        </div>
      </div>
    </SidebarPage>
  );
}
