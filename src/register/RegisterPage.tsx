import React from 'react';
import { MdDone, MdEuroSymbol, MdLocalAtm, MdMailOutline } from 'react-icons/md';
import { useHistory } from 'react-router-dom';
import Sidebar, { SidebarAction } from '../components/SidebarPage';
import { useAppDispatch, useAppSelector } from '../store';
import CoinBox from './CoinBox';
import Envelope from './Envelope';
import NoteBox from './NoteBox';
import './RegisterPage.scss';
import { RegisterMode, setRegisterMode, toggleResultMode } from './registerSlice';
import { useTranslation } from 'react-i18next';

export default function RegisterPage() {
  const { t } = useTranslation();
  const history = useHistory();
  const handleGoBack = () => history.goBack();

  const registerMode = useAppSelector((state) => state.register.registerMode);
  const previous = useAppSelector((state) => state.register.previous);
  const dispatch = useAppDispatch();

  let content: any | null = null;
  switch (registerMode) {
    case RegisterMode.COINS:
      content = <CoinBox />;
      break;
    case RegisterMode.NOTES:
      content = <NoteBox />;
      break;
    case RegisterMode.RESULT:
      content = <Envelope />;
      break;
  }

  const sidebarContent: SidebarAction[] = [
    {
      title: t('register.enterCoins'),
      element: <MdEuroSymbol />,
      action: () => dispatch(setRegisterMode(RegisterMode.COINS)),
      active: registerMode === RegisterMode.COINS,
    },
    {
      title: t('register.enterNotes'),
      element: <MdLocalAtm />,
      action: () => dispatch(setRegisterMode(RegisterMode.NOTES)),
      active: registerMode === RegisterMode.NOTES,
    },
    {
      title: t('register.overview'),
      element: <MdMailOutline />,
      action: () => dispatch(setRegisterMode(RegisterMode.RESULT)),
      active: registerMode === RegisterMode.RESULT,
    },
    {
      title: t('register.calculate'),
      element: <MdDone />,
      action: () => dispatch(toggleResultMode()),
      active: !!previous,
      bottom: true,
    },
  ];

  return (
    <Sidebar defaultAction={handleGoBack} content={sidebarContent}>
      {content}
    </Sidebar>
  );
}
