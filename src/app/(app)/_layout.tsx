import {
  Redirect,
  Stack,
  useGlobalSearchParams,
  usePathname,
} from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { View } from 'react-native';

import { useMallSession } from '@/features/mall/api';
import { paths } from '@/features/mall/ui';

export default function MallLayout() {
  const pathname = usePathname().replace(/\/index$/, '');
  const params = useGlobalSearchParams();
  const { hydrate, ready, token } = useMallSession();
  useEffect(() => {
    hydrate();
  }, [hydrate]);
  const isPublic = pathname === '/sub-pages/user/register';
  if (!ready) return <View style={{ flex: 1, backgroundColor: '#fff' }} />;
  if (!token && !isPublic) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (
        typeof value === 'string' &&
        key !== 'returnTo' &&
        !key.startsWith('__')
      )
        query.set(key, value);
    }
    const returnTo = pathname + (query.size ? '?' + query.toString() : '');
    return <Redirect href={{ pathname: paths.login, params: { returnTo } }} />;
  }
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: '#fff' },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
