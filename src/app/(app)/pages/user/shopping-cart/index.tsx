import React from 'react';
import { View } from 'react-native';

import { useCurrentOrder } from '@/features/mall/hooks';
import { OrderBody } from '@/features/mall/order-body';
import { Header, s, Status } from '@/features/mall/ui';

export default function CartScreen() {
  const query = useCurrentOrder();
  return (
    <View style={s.page}>
      <Header title="订单 (Carrito)" />
      <Status
        loading={query.isPending}
        error={query.error}
        retry={() => query.refetch()}
      />
      {query.data && (
        <OrderBody
          key={query.data.xsddList?.[0]?.xshth || 'empty'}
          data={query.data}
          refresh={() => query.refetch()}
          refreshing={query.isRefetching}
        />
      )}
    </View>
  );
}
