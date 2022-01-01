import React from 'react';
import { useHistory } from 'react-router-dom';
import { MdLocalAtm, MdPeople, MdSettings, MdShoppingCart } from 'react-icons/md';
import './StartPage.scss';
import SidebarPage, { SidebarAction } from './components/SidebarPage';
import { setScreensaver } from './payment/paymentSlice';
import { useAppDispatch } from './store';
import ClockIcon from './components/ClockIcon';

const useDate = () => {
  const locale = 'en';
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
  const wish = `Guten ${(hour < 12 && 'Morgen') || (hour < 17 && 'Tag') || 'Abend'}`;

  return {
    date: `${date} ${time}`,
    wish,
  };
};

export default function StartPage() {
  const history = useHistory();
  const handleOpenPayment = () => history.push('/payment');
  const handleOpenAccounts = () => history.push('/accounts');
  const handleOpenRegister = () => history.push('/register');
  const handleOpenSettings = () => history.push('/settings');

  const dispatch = useAppDispatch();
  const { date, wish } = useDate();

  const sidebarActions: SidebarAction[] = [
    {
      title: 'Enable screensaver',
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
            <span>Bezahlen</span>
          </div>
          <div className="start-page-entry" onClick={handleOpenRegister}>
            <MdLocalAtm />
            <span>Kasse zählen</span>
          </div>
          <div className="start-page-entry" onClick={handleOpenAccounts}>
            <MdPeople />
            <span>Kontoverwaltung</span>
          </div>
          <div className="start-page-entry" onClick={handleOpenSettings}>
            <MdSettings />
            <span>Einstellungen</span>
          </div>
        </div>
      </div>
    </SidebarPage>
  );
}
