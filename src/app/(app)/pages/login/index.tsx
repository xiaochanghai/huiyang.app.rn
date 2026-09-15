import { useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { request, useMallSession } from '@/features/mall/api';
import { a, AuthFrame } from '@/features/mall/auth-frame';
import { Button, Checkbox, Field, paths, s } from '@/features/mall/ui';
import { getItem, setItem } from '@/lib/storage';

export default function LoginScreen() {
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
      setError('请输入账号和密码');
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
      if (!data.Token || !shop)
        throw new Error('登录响应中缺少 Token 或店铺编号');
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
      setError(cause instanceof Error ? cause.message : '登录失败，请重试');
    } finally {
      setBusy(false);
    }
  };
  return (
    <AuthFrame>
      <View className={a.heading}>
        <Text className={a.title}>欢迎回来</Text>
        <Text className={a.subtitle}>Bienvenido de vuelta</Text>
        <Text className={a.description}>登录账号，开启便捷下单体验</Text>
        <Text className={a.descriptionEs}>
          Inicia sesión, pide de forma fácil.
        </Text>
      </View>
      <Field
        placeholder="请输入账号"
        hint="Introduce tu cuenta"
        value={username}
        onChangeText={setUsername}
        autoComplete="username"
      />
      <Field
        placeholder="请输入密码"
        hint="Por favor, introduce tu contraseña"
        password
        value={password}
        onChangeText={setPassword}
        onSubmitEditing={submit}
        autoComplete="current-password"
      />
      <View
        className={s.row}
        style={{ justifyContent: 'space-between', marginBottom: 22 }}
      >
        <Checkbox
          title="记住用户名"
          subtitle="Recordar usuario"
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
          title="记住密码"
          subtitle="Recordar contraseña"
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
        title={busy ? '登录中...' : '登 录'}
        subtitle="ENTRAR"
        gradient
        onPress={submit}
        disabled={busy}
      />
      <Text onPress={() => router.push(paths.register)} className={a.link}>
        账号注册 / Registro de cuenta
      </Text>
    </AuthFrame>
  );
}
