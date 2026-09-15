import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { a, AuthFrame } from '@/features/mall/auth-frame';
import { Button, Field, paths, s } from '@/features/mall/ui';

export default function RegisterScreen() {
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
      <View className={a.heading}>
        <Text className={a.title}>账号注册</Text>
        <Text className={a.subtitle}>Registro de cuenta</Text>
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
      <Text className={a.link} onPress={() => router.replace(paths.login)}>
        已有账号？去登录{'\n'}¿Ya tienes cuenta? Inicia sesión
      </Text>
    </AuthFrame>
  );
}
