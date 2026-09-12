import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';

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
      style={{ flex: 1, backgroundColor: '#fff' }}
    >
      <LinearGradient
        colors={['#fff2ef', '#fff8f6', '#ffffff']}
        style={[StyleSheet.absoluteFill, { height: '65%' }]}
      />
      {back && <Header title="" back />}
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[a.content, compact && { paddingTop: 20 }]}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
export const a = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 70,
    paddingBottom: 24,
  },
  heading: { marginBottom: 28 },
  title: {
    fontSize: 27,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: 1,
  },
  subtitle: { color: '#b5adaa', fontSize: 14, marginTop: 3 },
  description: { color: '#555', fontSize: 13, marginTop: 18 },
  descriptionEs: { color: '#c5bdba', fontSize: 11, marginTop: 2 },
  link: {
    color: '#999',
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 20,
    paddingVertical: 18,
  },
  agreement: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 30,
  },
});
