import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Header } from './ui';

export function AuthFrame({
  children,
  back,
  compact,
}: {
  children: React.ReactNode;
  back?: boolean;
  compact?: boolean;
}) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-white"
    >
      <LinearGradient
        colors={['#fff2ef', '#fff8f6', '#ffffff']}
        style={[StyleSheet.absoluteFill, { height: '65%' }]}
      />
      <SafeAreaView edges={['top']} className="flex-1">
        {back && <Header title="" back />}
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerClassName={`grow px-[22px] pb-6 ${compact ? 'pt-5' : 'pt-[70px]'}`}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
export const a = {
  heading: 'mb-7',
  title: 'text-[27px] font-bold text-[#1a1a1a] tracking-[1px]',
  subtitle: 'mt-[3px] text-[14px] text-[#b5adaa]',
  description: 'mt-[18px] text-[13px] text-[#555]',
  descriptionEs: 'mt-0.5 text-[11px] text-[#c5bdba]',
  link: 'py-[18px] text-center text-[12px] leading-5 text-[#999]',
  agreement: 'mt-auto flex-row items-center pt-[30px]',
};
