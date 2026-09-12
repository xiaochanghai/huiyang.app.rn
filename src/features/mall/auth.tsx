import { useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { getItem, setItem } from '@/lib/storage';

import { request, useMallSession } from './api';
import { Button, Checkbox, Field, Header, paths, s } from './ui';

export function LoginScreen() {
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

export function RegisterScreen() {
  const [form, setForm] = useState({
    customerName: '',
    taxId: '',
    phone: '',
    email: '',
  });
  const [message, setMessage] = useState('');
  const fields = [
    ['customerName', '客户名称', 'Introduce tu cuenta'],
    ['taxId', '税号', 'NIF'],
    ['phone', '电话', 'Teléfono'],
    ['email', '邮箱', 'Correo electrónico'],
  ] as const;
  const submit = () => {
    if (Object.values(form).some((value) => !value.trim())) {
      setMessage('请填写客户名称、税号、电话和邮箱');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setMessage('请输入有效的邮箱地址');
      return;
    }
    setMessage(
      '暂未开放在线注册，请联系工作人员开通账号。\nEl registro en línea aún no está disponible.'
    );
  };
  return (
    <AuthFrame back>
      <View style={a.heading}>
        <Text style={a.title}>账号注册</Text>
        <Text style={a.subtitle}>Registro de cuenta</Text>
      </View>
      {fields.map(([key, title, hint]) => (
        <Field
          key={key}
          placeholder={title}
          hint={hint}
          value={form[key]}
          keyboardType={
            key === 'phone'
              ? 'phone-pad'
              : key === 'email'
                ? 'email-address'
                : 'default'
          }
          onChangeText={(value) => setForm({ ...form, [key]: value })}
        />
      ))}
      <View style={{ marginTop: 15 }}>
        <Button title="提交" subtitle="ENVIAR" onPress={submit} gradient />
      </View>
      {!!message && (
        <Text accessibilityRole="alert" style={s.error}>
          {message}
        </Text>
      )}
      <Text style={a.link} onPress={() => router.replace(paths.login)}>
        已有账号？去登录{'\n'}¿Ya tienes cuenta? Inicia sesión
      </Text>
    </AuthFrame>
  );
}

export function PasswordScreen() {
  const [oldPassword, setOld] = useState('');
  const [newPassword, setNew] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const client = useQueryClient();
  const submit = async () => {
    if (busy) return;
    if (!oldPassword) {
      setError('请输入旧密码');
      return;
    }
    if (newPassword.length < 6) {
      setError('新密码长度不能少于 6 位');
      return;
    }
    if (newPassword !== confirm) {
      setError('两次输入的密码不一致');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await request(
        '/xcx/Authorize/RestPassword',
        { oldPassword, newPassword },
        'PUT'
      );
      setItem('mall-password', '');
      useMallSession.getState().logout();
      client.removeQueries({ queryKey: ['mall'] });
      router.replace(paths.login);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '修改失败');
    } finally {
      setBusy(false);
    }
  };
  return (
    <AuthFrame back compact>
      <View style={a.heading}>
        <Text style={a.title}>修改密码</Text>
        <Text style={a.subtitle}>Modificación de contraseña</Text>
      </View>
      <Field
        password
        placeholder="输入旧密码"
        hint="Introducir contraseña anterior"
        value={oldPassword}
        onChangeText={setOld}
      />
      <Field
        password
        placeholder="输入新密码"
        hint="Introducir nueva contraseña"
        value={newPassword}
        onChangeText={setNew}
      />
      <Field
        password
        placeholder="确认新密码"
        hint="Confirmar nueva contraseña"
        value={confirm}
        onChangeText={setConfirm}
        onSubmitEditing={submit}
      />
      {!!error && (
        <Text accessibilityRole="alert" style={s.error}>
          {error}
        </Text>
      )}
      <View style={{ marginTop: 20 }}>
        <Button
          title={busy ? '提交中...' : '确认修改'}
          subtitle="CONF. MODIF."
          onPress={submit}
          disabled={busy}
          outline
        />
      </View>
    </AuthFrame>
  );
}
function AuthFrame({
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
const a = StyleSheet.create({
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
