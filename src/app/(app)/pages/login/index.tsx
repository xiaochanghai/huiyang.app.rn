import { useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { getItem, setItem } from '@/lib/storage';

import { request, useMallSession } from '@/features/mall/api';
import { Button, Checkbox, Field, paths, s } from '@/features/mall/ui';

import { AuthFrame, a } from '@/features/mall/auth-frame';

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
  const [agreement, setAgreement] = useState(false);
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
    if (!agreement) {
      setError('请阅读并同意用户协议和隐私政策');
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
      <View style={a.heading}>
        <Text style={a.title}>欢迎回来</Text>
        <Text style={a.subtitle}>Bienvenido de vuelta</Text>
        <Text style={a.description}>登录账号，开启便捷下单体验</Text>
        <Text style={a.descriptionEs}>Inicia sesión, pide de forma fácil.</Text>
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
        style={[s.row, { justifyContent: 'space-between', marginBottom: 22 }]}
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
        <Text accessibilityRole="alert" style={s.error}>
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
      <Text onPress={() => router.push(paths.register)} style={a.link}>
        账号注册 / Registro de cuenta
      </Text>
      <View style={a.agreement}>
        <Checkbox
          value={agreement}
          onPress={() => setAgreement(!agreement)}
          title=""
        />
        <Text style={{ flex: 1, color: '#aaa', fontSize: 11 }}>
          登录即代表您同意
          <Text
            style={{ color: '#4d8eff' }}
            onPress={() => router.push('/user-agreement')}
          >
            《用户协议》
          </Text>
          和
          <Text
            style={{ color: '#4d8eff' }}
            onPress={() => router.push('/privacy-policy')}
          >
            《隐私政策》
          </Text>
        </Text>
      </View>
    </AuthFrame>
  );
}
