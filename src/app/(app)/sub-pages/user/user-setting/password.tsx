import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { NavHeader } from '@/components/ui/nav-header';
import { request, useMallSession } from '@/features/mall/api';
import { AuthFrame } from '@/features/mall/auth-frame';
import { Button, Field, paths, s } from '@/features/mall/ui';
import { setItem } from '@/lib/storage';

export default function PasswordScreen() {
  const { t } = useTranslation();
  const [oldPassword, setOld] = useState('');
  const [newPassword, setNew] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const client = useQueryClient();
  const submit = async () => {
    if (busy) return;
    if (!oldPassword) {
      setError(t('mall.password.old_required'));
      return;
    }
    if (newPassword.length < 6) {
      setError(t('mall.password.min_length', { count: 6 }));
      return;
    }
    if (newPassword !== confirm) {
      setError(t('mall.password.mismatch'));
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
      setError(
        cause instanceof Error ? cause.message : t('mall.password.failed')
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <NavHeader title={t('mall.password.title')} />
      <AuthFrame compact>
        <Field
          password
          placeholder={t('mall.password.old_password')}
          value={oldPassword}
          onChangeText={setOld}
        />
        <Field
          password
          placeholder={t('mall.password.new_password')}
          value={newPassword}
          onChangeText={setNew}
        />
        <Field
          password
          placeholder={t('mall.password.confirm_password')}
          value={confirm}
          onChangeText={setConfirm}
          onSubmitEditing={submit}
        />
        {!!error && (
          <Text accessibilityRole="alert" className={s.error}>
            {error}
          </Text>
        )}
        <View style={{ marginTop: 20 }}>
          <Button
            title={
              busy ? t('mall.password.submitting') : t('mall.password.submit')
            }
            onPress={submit}
            disabled={busy}
            outline
          />
        </View>
      </AuthFrame>
    </>
  );
}
