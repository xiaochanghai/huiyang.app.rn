import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { type OrderData, useMallSession } from '@/features/mall/api';
import { useMallQuery } from '@/features/mall/hooks';
import { OrderBody } from '@/features/mall/order-body';
import { Header, s, Status } from '@/features/mall/ui';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const shop = useMallSession((state) => state.shop);
  const query = useMallQuery<OrderData>(
    'order-detail',
    '/xcx/Yw/Ddck',
    { xsddList: [{ dpbm: shop, xshth: id }] },
    'POST',
    !!id
  );
  return (
    <View className={s.page}>
      <Header title="订单详情 (Detalle del pedido)" back />
      <Status
        loading={query.isPending}
        error={query.error}
        retry={() => query.refetch()}
      />
      {query.data && (
        <OrderBody
          key={id}
          data={query.data}
          readOnly
          refresh={() => query.refetch()}
          refreshing={query.isRefetching}
        />
      )}
    </View>
  );
}
