import { router } from 'expo-router';
import React from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { money, type OrderData, useMallSession } from '@/features/mall/api';
import { useMallQuery } from '@/features/mall/hooks';
import { accent, Header, s, Status } from '@/features/mall/ui';

export default function OrdersScreen() {
  const shop = useMallSession((state) => state.shop);
  const query = useMallQuery<OrderData>('orders', '/xcx/Yw/Ddlb', {
    xsddList: [{ dpbm: shop }],
  });
  return (
    <View className={s.page}>
      <Header title="订单列表 (Lista de pedidos)" back />
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={query.isRefetching}
            onRefresh={() => query.refetch()}
            tintColor={accent}
          />
        }
      >
        <Status
          loading={query.isPending}
          error={query.error}
          retry={() => query.refetch()}
          empty={
            !query.data?.xsddList?.length
              ? '暂无历史订单\nNo hay pedidos'
              : undefined
          }
        />
        {query.data?.xsddList?.map((order) => (
          <Pressable
            key={order.xshth}
            onPress={() =>
              router.push({
                pathname: '/(app)/sub-pages/order/order-detail',
                params: { id: order.xshth },
              })
            }
            className={`${s.card} ${s.row}`}
            style={{ padding: 16, justifyContent: 'space-between' }}
          >
            <View className={s.flex}>
              <Text className={s.muted}>销售合同号 / N.º pedido</Text>
              <Text
                style={{ fontWeight: '600', fontSize: 16, marginVertical: 7 }}
              >
                {order.xshth}
              </Text>
              <Text className={s.muted}>{order.pcczsj}</Text>
            </View>
            <Text style={{ color: accent, fontSize: 17, fontWeight: '600' }}>
              {money(order.jezj)}　›
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
