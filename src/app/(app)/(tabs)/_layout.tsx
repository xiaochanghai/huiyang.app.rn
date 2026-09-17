import { Tabs } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/tabs';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCurrentOrder } from '@/features/mall/hooks';
import { accent, paths } from '@/features/mall/ui';

const tabs = [
  {
    name: 'pages/home/index',
    path: paths.home,
    tx: 'mall.tabs.home',
    icon: require('../../../../assets/mall/tabbar/home.png'),
    selected: require('../../../../assets/mall/tabbar/home-selected.png'),
  },
  {
    name: 'pages/product/category/index',
    path: paths.category,
    tx: 'mall.tabs.category',
    icon: require('../../../../assets/mall/tabbar/category.png'),
    selected: require('../../../../assets/mall/tabbar/category-selected.png'),
  },
  {
    name: 'pages/shopping-cart/index',
    path: paths.cart,
    tx: 'mall.tabs.cart',
    icon: require('../../../../assets/mall/tabbar/cart.png'),
    selected: require('../../../../assets/mall/tabbar/cart-selected.png'),
  },
  {
    name: 'pages/user-center/index',
    path: paths.profile,
    tx: 'mall.tabs.profile',
    icon: require('../../../../assets/mall/tabbar/user.png'),
    selected: require('../../../../assets/mall/tabbar/user-selected.png'),
  },
] as const;

export default function MallTabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs tabBar={(props) => <MallTabBar {...props} />}>
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: t(tab.tx),
            headerShadowVisible: false,
            animation: 'none',
          }}
        />
      ))}
    </Tabs>
  );
}

function MallTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { t } = useTranslation();
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
            accessibilityLabel={options.tabBarAccessibilityLabel || t(tab.tx)}
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
              {t(tab.tx)}
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
