import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, RefreshControl, ScrollView, Text, View } from 'react-native';

import { NavHeader } from '@/components/ui/nav-header';
import { type Shop, useMallSession } from '@/features/mall/api';
import { useMallQuery } from '@/features/mall/hooks';
import { accent, Button, paths, s, Status } from '@/features/mall/ui';

const fields = [
  ['客户名称', 'Nombre del cliente', 'khmc'],
  ['公司税号', 'NIF de la empresa', 'sh'],
  ['店铺名称', 'Nombre de tienda', 'dpmc'],
  ['店铺编号', 'Código de tienda', 'dpbm'],
  ['联系电话', 'Teléfono', 'dpdh'],
  ['邮箱', 'Correo electrónico', 'dpdzyx'],
  ['店铺地址', 'Dirección de tienda', 'dpdz'],
  ['登记日期', 'Fecha de registro', 'djrq'],
  ['最后下单日期', 'Último pedido', 'zhxdrq'],
] as const;
export default function UserCenterTabScreen() {
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
      <NavHeader title="我的 (Mi cuenta)" leftShown={false} />
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
          {fields.map(([cn, es, key]) => (
            <View
              key={key}
              className={`${s.row} ${s.divider} justify-between gap-2`}
            >
              <View
                className={`shrink flex-wrap items-baseline gap-1 ${key === 'dpdz' ? 'flex-col' : 'flex-row'}`}
              >
                <Text className="text-[14px] font-medium">{cn}</Text>
                <Text className="text-[10px] text-[#999]">{es}</Text>
              </View>
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
            title="订单列表　›"
            subtitle="LISTA DE PEDIDOS"
            onPress={() => router.push(paths.orders)}
          />
          <Button
            title="修改密码"
            subtitle="CAMBIAR CONTRASEÑA"
            muted
            onPress={() => router.push(paths.password)}
            outline
          />
          <Button
            title="退出登录"
            subtitle="CERRAR SESIÓN"
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
              退出登录 (Cerrar sesión)
            </Text>
            <Text className="leading-[22px]">
              确认退出当前账号？{'\n'}¿Confirmas que deseas cerrar sesión?
            </Text>
            <Button title="确认 / Confirmar" onPress={logout} />
            <Button
              title="取消 / Cancelar"
              onPress={() => setConfirm(false)}
              outline
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
