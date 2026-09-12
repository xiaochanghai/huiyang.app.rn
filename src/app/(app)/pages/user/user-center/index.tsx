import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, RefreshControl, ScrollView, Text, View } from 'react-native';

import { type Shop, useMallSession } from '@/features/mall/api';
import { useMallQuery } from '@/features/mall/hooks';
import { accent, Button, Header, paths, s, Status } from '@/features/mall/ui';

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
export default function ProfileScreen() {
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
    <View style={s.page}>
      <Header title="我的 (Mi cuenta)" />
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={query.isRefetching}
            onRefresh={() => query.refetch()}
            tintColor={accent}
          />
        }
        contentContainerStyle={{ paddingBottom: 25 }}
      >
        <Status
          loading={query.isPending}
          error={query.error}
          retry={() => query.refetch()}
        />
        <View style={s.card}>
          {fields.map(([cn, es, key]) => (
            <View
              key={key}
              style={[
                s.row,
                s.divider,
                { justifyContent: 'space-between', gap: 8 },
              ]}
            >
              <View
                style={{
                  flexShrink: 1,
                  flexDirection: key === 'dpdz' ? 'column' : 'row',
                  alignItems: 'baseline',
                  gap: 4,
                  flexWrap: 'wrap',
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '500' }}>{cn}</Text>
                <Text style={{ color: '#999', fontSize: 10 }}>{es}</Text>
              </View>
              <Text
                numberOfLines={2}
                style={{
                  fontSize: key === 'dpdzyx' ? 11 : 13,
                  color: '#666',
                  textAlign: 'right',
                  maxWidth: '48%',
                }}
              >
                {shop?.[key] || '-'}
              </Text>
            </View>
          ))}
        </View>
        <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
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
        <View
          style={{
            flex: 1,
            backgroundColor: '#0005',
            justifyContent: 'center',
            padding: 30,
          }}
        >
          <View
            style={{ backgroundColor: '#fff', borderRadius: 12, padding: 20 }}
          >
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
              退出登录 (Cerrar sesión)
            </Text>
            <Text style={{ lineHeight: 22 }}>
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
