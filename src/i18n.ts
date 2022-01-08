import i18n from 'i18next';

import { initReactI18next } from 'react-i18next';
import i18n_german from './locales/de/translation.json';

const resources = {
  de: {
    translation: i18n_german,
  },
  en: {
    translation: i18n_german,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'de',
  fallbackLng: 'en',
  debug: true,
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
