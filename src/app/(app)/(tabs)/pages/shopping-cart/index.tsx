import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { NavHeader } from '@/components/ui/nav-header';
import { useCurrentOrder } from '@/features/mall/hooks';
import { OrderBody } from '@/features/mall/order-body';
import { s, Status } from '@/features/mall/ui';

export default function ShoppingCartTabScreen() {
  const { t } = useTranslation();
  const query = useCurrentOrder();
  return (
    <View className={s.page}>
      <NavHeader title={t('mall.tabs.cart')} leftShown={false} />
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
