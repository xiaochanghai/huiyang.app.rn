import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, Text, View } from 'react-native';

import { useSelectedLanguage } from '@/lib/i18n';
import { languageOptions } from '@/lib/i18n/resources';

export const LanguageSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage } = useSelectedLanguage();
  const { t } = useTranslation();
  const selected = languageOptions.find((option) => option.value === language);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${t('settings.language')}: ${selected?.label}`}
        accessibilityState={{ expanded: isOpen }}
        onPress={() => setIsOpen(true)}
        className="min-h-11 flex-row items-center self-end rounded-lg px-3 py-2"
      >
        <Text className="text-[14px] text-[#666]">{selected?.label} ▾</Text>
      </Pressable>
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <View className="flex-1 justify-center bg-black/40 px-6">
          <Pressable
            accessibilityLabel={t('common.cancel')}
            accessibilityRole="button"
            onPress={() => setIsOpen(false)}
            className="absolute inset-0"
          />
          <View accessibilityViewIsModal className="rounded-2xl bg-white p-5">
            <Text className="mb-3 text-[18px] font-semibold text-[#222]">
              {t('settings.language')}
            </Text>
            {languageOptions.map((option) => (
              <Pressable
                key={option.value}
                accessibilityRole="radio"
                accessibilityState={{ checked: language === option.value }}
                className="min-h-12 flex-row items-center justify-between py-3"
                onPress={() => {
                  setIsOpen(false);
                  if (option.value !== language) setLanguage(option.value);
                }}
              >
                <Text className="text-[16px] text-[#222]">{option.label}</Text>
                {language === option.value && (
                  <Text className="text-[18px] text-[#ff6b4a]">✓</Text>
                )}
              </Pressable>
            ))}
            <Pressable
              accessibilityRole="button"
              onPress={() => setIsOpen(false)}
              className="min-h-11 items-center justify-center"
            >
              <Text className="text-[14px] text-[#666]">
                {t('common.cancel')}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
};
