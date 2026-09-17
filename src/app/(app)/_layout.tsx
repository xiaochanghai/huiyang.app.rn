import {
  Redirect,
  router,
  Stack,
  useGlobalSearchParams,
  usePathname,
} from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useMallSession } from '@/features/mall/api';
import { useCurrentOrder } from '@/features/mall/hooks';
import { accent, paths } from '@/features/mall/ui';

const tabs = [
  {
    path: paths.home,
    suffix: '/pages/home',
    title: '首页',
    es: 'Inicio',
    icon: require('../../../assets/mall/tabbar/home.png'),
    selected: require('../../../assets/mall/tabbar/home-selected.png'),
  },
  {
    path: paths.category,
    suffix: '/pages/product/category',
    title: '分类',
    es: 'Categorías',
    icon: require('../../../assets/mall/tabbar/category.png'),
    selected: require('../../../assets/mall/tabbar/category-selected.png'),
  },
  {
    path: paths.cart,
    suffix: '/pages/user/shopping-cart',
    title: '订单',
    es: 'Carrito',
    icon: require('../../../assets/mall/tabbar/cart.png'),
    selected: require('../../../assets/mall/tabbar/cart-selected.png'),
  },
  {
    path: paths.profile,
    suffix: '/pages/user/user-center',
    title: '我的',
    es: 'Mi cuenta',
    icon: require('../../../assets/mall/tabbar/user.png'),
    selected: require('../../../assets/mall/tabbar/user-selected.png'),
  },
] as const;

export default function MallLayout() {
  const pathname = usePathname().replace(/\/index$/, '');
  const params = useGlobalSearchParams();
  const { hydrate, ready, token } = useMallSession();
  useEffect(() => {
    hydrate();
  }, [hydrate]);
  const isPublic =
    pathname === '/pages/login' || pathname === '/sub-pages/user/register';
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
  const showTabs = tabs.some((tab) => pathname === tab.suffix);
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: '#fff' }}
      edges={isPublic ? ['bottom'] : ['top', 'bottom']}
    >
      <StatusBar style="dark" />
      <View style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            // headerShown: false,
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: '#fff' },
          }}
        >
          {tabs.map((tab) => (
            <Stack.Screen
              key={tab.path}
              name={`${tab.suffix.slice(1)}/index`}
              options={{ animation: 'none' }}
            />
          ))}
        </Stack>
      </View>
      {showTabs && <MallTabs pathname={pathname} />}
    </SafeAreaView>
  );
}
function MallTabs({ pathname }: { pathname: string }) {
  const order = useCurrentOrder();
  const count =
    order.data?.xsddmxList?.reduce(
      (total, item) => total + Number(item.sl || 0),
      0
    ) || 0;
  return (
    <View style={styles.tabs}>
      {tabs.map((tab) => {
        const active = pathname === tab.suffix;
        return (
          <Pressable
            key={tab.path}
            accessibilityRole="tab"
            accessibilityLabel={tab.title + ' ' + tab.es}
            accessibilityState={{ selected: active }}
            onPress={() => {
              if (!active) router.navigate(tab.path);
            }}
            style={styles.tab}
          >
            <View>
              <Image
                source={active ? tab.selected : tab.icon}
                style={{ width: 24, height: 24 }}
              />
              {tab.path === paths.cart && count > 0 && (
                <View style={styles.badge}>
                  <Text style={{ fontSize: 9, color: '#fff' }}>
                    {count > 99 ? '99+' : count}
                  </Text>
                </View>
              )}
            </View>
            <Text
              style={{
                fontSize: 11,
                color: active ? accent : '#999',
                marginTop: 3,
              }}
            >
              {tab.title}
            </Text>
            <Text style={{ fontSize: 8, color: active ? accent : '#999' }}>
              {tab.es}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    minHeight: 58,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
  },
  badge: {
    position: 'absolute',
    right: -12,
    top: -4,
    backgroundColor: accent,
    borderRadius: 8,
    paddingHorizontal: 4,
    minWidth: 16,
    alignItems: 'center',
  },
});
