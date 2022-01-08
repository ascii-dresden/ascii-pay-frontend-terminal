import i18n from 'i18next';

import { initReactI18next } from 'react-i18next';
import i18n_german from './locales/de/translation.json';
import i18n_english from './locales/en/translation.json';

const resources = {
  de: {
    translation: i18n_german,
  },
  en: {
    translation: i18n_english,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem('language') ?? 'de',
  fallbackLng: 'en',
  debug: true,
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
