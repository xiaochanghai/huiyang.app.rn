import { Tabs } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/tabs';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCurrentOrder } from '@/features/mall/hooks';
import { accent, paths } from '@/features/mall/ui';

const tabs = [
  {
    name: 'pages/home/index',
    path: paths.home,
    title: '首页',
    es: 'Inicio',
    icon: require('../../../../assets/mall/tabbar/home.png'),
    selected: require('../../../../assets/mall/tabbar/home-selected.png'),
  },
  {
    name: 'pages/product/category/index',
    path: paths.category,
    title: '分类',
    es: 'Categorías',
    icon: require('../../../../assets/mall/tabbar/category.png'),
    selected: require('../../../../assets/mall/tabbar/category-selected.png'),
  },
  {
    name: 'pages/shopping-cart/index',
    path: paths.cart,
    title: '订单',
    es: 'Carrito',
    icon: require('../../../../assets/mall/tabbar/cart.png'),
    selected: require('../../../../assets/mall/tabbar/cart-selected.png'),
  },
  {
    name: 'pages/user-center/index',
    path: paths.profile,
    title: '我的',
    es: 'Mi cuenta',
    icon: require('../../../../assets/mall/tabbar/user.png'),
    selected: require('../../../../assets/mall/tabbar/user-selected.png'),
  },
] as const;

export default function MallTabLayout() {
  return (
    <Tabs tabBar={(props) => <MallTabBar {...props} />}>
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: `${tab.title} (${tab.es})`,
            headerShadowVisible: false,
            animation: 'none',
          }}
        />
      ))}
    </Tabs>
  );
}

function MallTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const order = useCurrentOrder();
  const count =
    order.data?.xsddmxList?.reduce(
      (total, item) => total + Number(item.sl || 0),
      0
    ) || 0;

  return (
    <View style={[styles.tabs, { paddingBottom: insets.bottom }]}>
      {state.routes.map((route, index) => {
        const tab = tabs.find((item) => item.name === route.name);
        if (!tab) return null;
        const active = state.index === index;
        const { options } = descriptors[route.key];

        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityLabel={
              options.tabBarAccessibilityLabel || `${tab.title} ${tab.es}`
            }
            accessibilityState={{ selected: active }}
            onLongPress={() =>
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              })
            }
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!active && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            }}
            style={styles.tab}
          >
            <View>
              <Image
                source={active ? tab.selected : tab.icon}
                style={styles.icon}
              />
              {tab.path === paths.cart && count > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {count > 99 ? '99+' : count}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.title, active && { color: accent }]}>
              {tab.title}
            </Text>
            <Text style={[styles.subtitle, active && { color: accent }]}>
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
    minHeight: 58,
    flexDirection: 'row',
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
  icon: { width: 24, height: 24 },
  title: { marginTop: 3, fontSize: 11, color: '#999' },
  subtitle: { fontSize: 8, color: '#999' },
  badge: {
    position: 'absolute',
    right: -12,
    top: -4,
    minWidth: 16,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: accent,
    paddingHorizontal: 4,
  },
  badgeText: { fontSize: 9, color: '#fff' },
});
