import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, RefreshControl, ScrollView, Text, View } from 'react-native';

import { NavHeader } from '@/components/ui/nav-header';
import { type Shop, useMallSession } from '@/features/mall/api';
import { useMallQuery } from '@/features/mall/hooks';
import { accent, Button, paths, s, Status } from '@/features/mall/ui';

const fields = [
  ['mall.profile.fields.customer_name', 'khmc'],
  ['mall.profile.fields.tax_id', 'sh'],
  ['mall.profile.fields.shop_name', 'dpmc'],
  ['mall.profile.fields.shop_code', 'dpbm'],
  ['mall.profile.fields.phone', 'dpdh'],
  ['mall.profile.fields.email', 'dpdzyx'],
  ['mall.profile.fields.address', 'dpdz'],
  ['mall.profile.fields.registration_date', 'djrq'],
  ['mall.profile.fields.last_order_date', 'zhxdrq'],
] as const;
export default function UserCenterTabScreen() {
  const { t } = useTranslation();
  const query = useMallQuery<{ khdpList?: Shop[] }>(
    'shop',
    '/xcx/Yw/Dpxx',
    undefined,
    'GET'
  );
  const [confirm, setConfirm] = useState(false);
  const shop = query.data?.khdpList?.[0];
  const client = useQueryClient();
  const logout = () => {
    setConfirm(false);
    useMallSession.getState().logout();
    client.removeQueries({ queryKey: ['mall'] });
    router.replace(paths.login);
  };
  return (
    <View className={s.page}>
      <NavHeader title={t('mall.tabs.profile')} leftShown={false} />
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={query.isRefetching}
            onRefresh={() => query.refetch()}
            tintColor={accent}
          />
        }
        contentContainerClassName="pb-[25px]"
      >
        <Status
          loading={query.isPending}
          error={query.error}
          retry={() => query.refetch()}
        />
        <View className={s.card}>
          {fields.map(([tx, key]) => (
            <View
              key={key}
              className={`${s.row} ${s.divider} justify-between gap-2`}
            >
              <Text className="shrink text-[14px] font-medium">{t(tx)}</Text>
              <Text
                numberOfLines={2}
                className={`max-w-[48%] text-right text-[#666] ${key === 'dpdzyx' ? 'text-[11px]' : 'text-[13px]'}`}
              >
                {shop?.[key] || '-'}
              </Text>
            </View>
          ))}
        </View>
        <View className="mt-3 px-4">
          <Button
            title={`${t('mall.profile.order_list')}　›`}
            onPress={() => router.push(paths.orders)}
          />
          <Button
            title={t('mall.profile.change_password')}
            muted
            onPress={() => router.push(paths.password)}
            outline
          />
          <Button
            title={t('mall.profile.logout')}
            onPress={() => setConfirm(true)}
            outline
          />
        </View>
      </ScrollView>
      <Modal
        visible={confirm}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirm(false)}
      >
        <View className="flex-1 justify-center bg-[#0005] p-[30px]">
          <View className="rounded-xl bg-white p-5">
            <Text className="mb-3 text-[16px] font-semibold">
              {t('mall.profile.logout')}
            </Text>
            <Text className="leading-[22px]">
              {t('mall.profile.logout_confirm')}
            </Text>
            <Button title={t('common.confirm')} onPress={logout} />
            <Button
              title={t('common.cancel')}
              onPress={() => setConfirm(false)}
              outline
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
