import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en/common.json';

/**
 * Available UI languages. Adding a language = add a locale file under
 * src/locales/{lang}/common.json and register it here. No other code changes.
 * Only UI strings are translated; user/admin-entered data is used as-is.
 */
export const SUPPORTED_LANGUAGES = [{ code: 'en', label: 'English' }] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]['code'];

export const resources = {
  en: { common: en },
} as const;

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGUAGES.map((l) => l.code),
    defaultNS: 'common',
    ns: ['common'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'celebrationdeck.lang',
    },
  });

export default i18n;
