import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { request, useMallSession } from '@/features/mall/api';
import { a, AuthFrame } from '@/features/mall/auth-frame';
import { Button, Field, paths, s } from '@/features/mall/ui';
import { setItem } from '@/lib/storage';

export default function PasswordScreen() {
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
      <View className={a.heading}>
        <Text className={a.title}>修改密码</Text>
        <Text className={a.subtitle}>Modificación de contraseña</Text>
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
