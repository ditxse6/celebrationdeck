import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '../i18n';

const OTHER = '__other__';

/**
 * Language dropdown. Lists available UI languages plus an "Other languages…"
 * entry that opens the (no-auth) contributor page in a new tab.
 */
export default function LanguageSelector() {
  const { i18n, t } = useTranslation();

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === OTHER) {
      window.open('/other-languages', '_blank', 'noopener');
      // Reset the select back to the active language.
      e.target.value = i18n.resolvedLanguage ?? 'en';
      return;
    }
    void i18n.changeLanguage(value);
  };

  return (
    <select
      aria-label={t('language.label')}
      value={i18n.resolvedLanguage}
      onChange={onChange}
      style={{ width: 'auto', padding: '6px 10px', borderRadius: 8 }}
    >
      {SUPPORTED_LANGUAGES.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.label}
        </option>
      ))}
      <option value={OTHER}>{t('language.other')}</option>
    </select>
  );
}
