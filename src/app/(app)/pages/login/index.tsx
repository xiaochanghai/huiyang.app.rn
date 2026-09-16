import { useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { LanguageSelector } from '@/components/language-selector';
import { request, useMallSession } from '@/features/mall/api';
import { a, AuthFrame } from '@/features/mall/auth-frame';
import { Button, Checkbox, Field, paths, s } from '@/features/mall/ui';
import { getItem, setItem } from '@/lib/storage';

export default function LoginScreen() {
  const { t } = useTranslation();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const [username, setUsername] = useState(
    () => getItem<string>('mall-username') || ''
  );
  const [password, setPassword] = useState(
    () => getItem<string>('mall-password') || ''
  );
  const [rememberUser, setRememberUser] = useState(
    () => !!getItem<string>('mall-username')
  );
  const [rememberPassword, setRememberPassword] = useState(
    () => !!getItem<string>('mall-password')
  );
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const login = useMallSession((state) => state.login);
  const client = useQueryClient();
  const submit = async () => {
    if (busy) return;
    if (!username.trim() || !password) {
      setError(t('login.credentials_required'));
      return;
    }
    setBusy(true);
    setError('');
    try {
      const data = await request<{
        Token: string;
        UserId: string;
        UserInfo?: { UserId: string };
      }>('/xcx/Authorize/Login', {
        UserAccount: username.trim(),
        PassWord: password,
      });
      const shop = data.UserId || data.UserInfo?.UserId;
      if (!data.Token || !shop) throw new Error(t('login.invalid_response'));
      client.removeQueries({ queryKey: ['mall'] });
      setItem('mall-username', rememberUser ? username.trim() : '');
      setItem('mall-password', rememberPassword ? password : '');
      login({ token: data.Token, shop });
      const destination = Object.values(paths).find(
        (path) =>
          path.replace('/(app)', '') === returnTo?.split('?')[0] &&
          path !== paths.login &&
          path !== paths.register
      );
      router.replace(
        destination
          ? {
              pathname: destination,
              params: Object.fromEntries(
                new URLSearchParams(returnTo?.split('?')[1] || '')
              ),
            }
          : paths.home
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('login.failed'));
    } finally {
      setBusy(false);
    }
  };
  return (
    <AuthFrame>
      <View className="mb-5">
        <LanguageSelector />
      </View>
      <View className={a.heading}>
        <Text className={a.title}>{t('login.welcome')}</Text>
        <Text className={a.description}>{t('login.description')}</Text>
      </View>
      <Field
        placeholder={t('login.account')}
        value={username}
        onChangeText={setUsername}
        autoComplete="username"
      />
      <Field
        placeholder={t('login.password')}
        password
        value={password}
        onChangeText={setPassword}
        onSubmitEditing={submit}
        autoComplete="current-password"
      />
      <View
        className={s.row}
        style={{
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 22,
        }}
      >
        <Checkbox
          title={t('login.remember_username')}
          value={rememberUser}
          onPress={() => {
            setRememberUser(!rememberUser);
            if (rememberUser) {
              setRememberPassword(false);
              setItem('mall-username', '');
              setItem('mall-password', '');
            }
          }}
        />
        <Checkbox
          title={t('login.remember_password')}
          value={rememberPassword}
          onPress={() => {
            setRememberPassword(!rememberPassword);
            if (!rememberPassword) setRememberUser(true);
            else setItem('mall-password', '');
          }}
        />
      </View>
      {!!error && (
        <Text accessibilityRole="alert" className={s.error}>
          {error}
        </Text>
      )}
      <Button
        title={t(busy ? 'login.login_loading' : 'login.login_button')}
        gradient
        onPress={submit}
        disabled={busy}
      />
      <Text onPress={() => router.push(paths.register)} className={a.link}>
        {t('login.register')}
      </Text>
    </AuthFrame>
  );
}
