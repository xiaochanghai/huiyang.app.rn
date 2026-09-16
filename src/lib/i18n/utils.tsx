import type TranslateOptions from 'i18next';
import i18n from 'i18next';
import memoize from 'lodash.memoize';
import { useCallback } from 'react';

import { storage, useMMKVString } from '../storage';
import { type Language, resolveLanguage, type resources } from './resources';
import type { RecursiveKeyOf } from './types';

type DefaultLocale = typeof resources.en.translation;
export type TxKeyPath = RecursiveKeyOf<DefaultLocale>;

export const LOCAL = 'local';

export const getLanguage = () => resolveLanguage(storage.getString(LOCAL));

export const translate = memoize(
  (key: TxKeyPath, options = undefined) =>
    i18n.t(key, options) as unknown as string,
  (key: TxKeyPath, options: typeof TranslateOptions) =>
    `${i18n.resolvedLanguage || i18n.language}:${key}:${JSON.stringify(options)}`
);

export const changeLanguage = (lang: Language) => i18n.changeLanguage(lang);

export const useSelectedLanguage = () => {
  const [language, setLang] = useMMKVString(LOCAL, storage);

  const setLanguage = useCallback(
    (lang: Language) => {
      setLang(lang);
      void changeLanguage(lang);
    },
    [setLang]
  );

  return { language: resolveLanguage(language), setLanguage };
};
