import ca from '@/translations/ca.json';
import en from '@/translations/en.json';
import es from '@/translations/es.json';
import fr from '@/translations/fr.json';
import zh from '@/translations/zh.json';

export const resources = {
  zh: { translation: zh },
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
  ca: { translation: ca },
};

export type Language = keyof typeof resources;
export const DEFAULT_LANGUAGE: Language = 'es';
export const languageOptions: { value: Language; label: string }[] = [
  { value: 'zh', label: '中文' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'ca', label: 'Català' },
];
export const resolveLanguage = (value?: string): Language =>
  languageOptions.find((option) => option.value === value)?.value ??
  DEFAULT_LANGUAGE;
