import { useIsMutating, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Image,
  LayoutAnimation,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  imageSource,
  money,
  type Order,
  type OrderData,
  request,
  useMallSession,
} from './api';
import { useCurrentOrder, useMallQuery } from './hooks';
import { QuantityDraftContext, QuantityDrafts } from './quantity-drafts';
import { accent, Button, Header, paths, Quantity, s, Status } from './ui';

export function CartScreen() {
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
function OrderBody({
  data,
  readOnly = false,
  refresh,
  refreshing = false,
}: {
  data: OrderData;
  readOnly?: boolean;
  refresh: () => void;
  refreshing?: boolean;
}) {
  const order = data.xsddList?.[0];
  const items = data.xsddmxList || [];
  const [address, setAddress] = useState(order?.lsdz || '');
  const [remark, setRemark] = useState(String(order?.bz || order?.khbz || ''));
  const [expanded, setExpanded] = useState(readOnly);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const saving = useRef<Promise<unknown> | null>(null);
  const submitting = useRef(false);
  const [quantityDrafts] = useState(() => new QuantityDrafts());
  const lastSaved = useRef({ address, remark });
  const shop = useMallSession((state) => state.shop);
  const quantityBusy = useIsMutating({ mutationKey: ['mall-quantity'] }) > 0;
  const client = useQueryClient();
  const save = async () => {
    if (readOnly || !order) return;
    if (saving.current) await saving.current;
    if (
      lastSaved.current.address === address &&
      lastSaved.current.remark === remark
    )
      return;
    const pending = request('/xcx/Yw/Ddxg', {
      xsddList: [{ dpbm: shop, xshth: order.xshth, lsdz: address, bz: remark }],
    });
    saving.current = pending;
    try {
      await pending;
      lastSaved.current = { address, remark };
      setError('');
    } finally {
      if (saving.current === pending) saving.current = null;
    }
  };
  const saveOnBlur = () => {
    save().catch((cause) =>
      setError(cause instanceof Error ? cause.message : '订单信息保存失败')
    );
  };
  const submit = async () => {
    if (submitting.current || quantityBusy || !order || !items.length) return;
    submitting.current = true;
    setBusy(true);
    setError('');
    try {
      await quantityDrafts.flush();
      await save();
      await request('/xcx/Yw/Ddtj', {
        xsddList: [{ xshth: order.xshth, dpbm: shop }],
      });
      await client.invalidateQueries({ queryKey: ['mall'] });
      router.push(paths.orders);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '提交失败');
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  };
  return (
    <QuantityDraftContext.Provider value={quantityDrafts}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={accent}
          />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {order && (
          <View style={o.orderCard}>
            <View style={[s.row, o.top]}>
              <View style={s.flex}>
                <Text style={o.customer}>
                  {String(order.kh_sw || order.kh || '')}
                </Text>
                <Text style={s.hint}>税号 {String(order.khsh || '')}</Text>
              </View>
              <Text style={o.shopCode}>{String(order.dp || order.xshth)}</Text>
            </View>
            <View style={{ padding: 12 }}>
              <View
                style={[
                  s.row,
                  { justifyContent: 'space-between', marginBottom: 8 },
                ]}
              >
                <Text style={o.small}>
                  地区 Zona: {String(order.dq_sw || order.dq || '-')}
                </Text>
                <Text style={o.small}>
                  邮编 Cód. post. {String(order.lsyb || order.yb || '-')}
                </Text>
              </View>
              <Text style={[o.small, { marginBottom: 12 }]}>
                地址 Dir.: {String(order.khdz || '-')}
              </Text>
              <Text style={o.small}>临时地址 Dir. temp.</Text>
              <TextInput
                accessibilityLabel="临时送货地址"
                editable={!readOnly && !busy}
                value={address}
                onChangeText={setAddress}
                onBlur={saveOnBlur}
                placeholder="请输入临时送货地址"
                maxLength={200}
                style={o.address}
              />
              <Text style={o.small}>备注 Observaciones</Text>
              <TextInput
                accessibilityLabel="订单备注"
                editable={!readOnly && !busy}
                value={remark}
                onChangeText={setRemark}
                onBlur={saveOnBlur}
                placeholder="请输入订单备注"
                maxLength={200}
                multiline
                style={[o.address, { minHeight: 46, textAlignVertical: 'top' }]}
              />
            </View>
            {expanded && <OrderSummary order={order} />}
            <Pressable
              onPress={() => {
                LayoutAnimation.configureNext(
                  LayoutAnimation.Presets.easeInEaseOut
                );
                setExpanded(!expanded);
              }}
              style={o.total}
            >
              <View>
                <Text style={o.small}>金额总计 Tot. imp.</Text>
                <Text style={o.totalValue}>{money(order.jezj)}</Text>
              </View>
              <View>
                <Text style={o.small}>
                  {expanded ? '收起 ⌄' : '查看更多订单信息 ›'}
                </Text>
                {!expanded && <Text style={s.hint}>Ver más pedidos</Text>}
              </View>
            </Pressable>
          </View>
        )}
        {!!error && (
          <Text accessibilityRole="alert" style={[s.error, { margin: 12 }]}>
            {error}
          </Text>
        )}
        {!!items.length && (
          <View style={{ margin: 8, backgroundColor: '#fff', borderRadius: 8 }}>
            {items.map((item) => (
              <View style={o.item} key={`${item.bh}-${item.wlbm}`}>
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: paths.detail,
                      params: { id: item.wlbm },
                    })
                  }
                >
                  <Image
                    source={imageSource(item.cpft || item.cpct)}
                    style={o.image}
                    resizeMode="contain"
                  />
                </Pressable>
                <View style={s.flex}>
                  <Text
                    numberOfLines={2}
                    style={{ fontSize: 13, marginBottom: 12 }}
                  >
                    {item.wlmc}
                  </Text>
                  <View
                    style={[
                      s.row,
                      { justifyContent: 'space-between', gap: 10 },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: '500',
                        color: '#ff4039',
                      }}
                    >
                      {money(Number(item.zhj) > 0 ? item.zhj : item.dj)}
                    </Text>
                    {readOnly ? (
                      <Text>× {item.sl}</Text>
                    ) : (
                      <View
                        style={{ width: 118 }}
                        pointerEvents={busy ? 'none' : 'auto'}
                      >
                        <Quantity code={item.wlbm} quantity={item.sl} />
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
        {!order && !items.length && <Status empty="当前暂无订单" />}
      </ScrollView>
      {!readOnly && (
        <View style={o.submit}>
          <Button
            title={busy ? '提交中...' : '提交订单'}
            subtitle="ENVIAR PEDIDO"
            radius={14}
            disabled={busy || quantityBusy || !items.length || !order}
            onPress={submit}
          />
        </View>
      )}
    </QuantityDraftContext.Provider>
  );
}
function OrderSummary({ order }: { order: Order }) {
  const fields = [
    ['税前合计', 'Base', order.bhshj],
    ['税金', 'IVA', Number(order.sjhj || 0) + Number(order.tssjhj || 0)],
    ['糖税金额', 'IBEE', order.tshj],
    ['附加税', 'Imp. Equiv', order.fjs],
    ['优惠合计', 'Tot. desc.', order.yhhj],
  ];
  return (
    <View style={o.summary}>
      {fields.map(([cn, es, value]) => (
        <View key={String(cn)} style={{ width: '47%', paddingVertical: 9 }}>
          <Text style={{ fontSize: 12 }}>{cn}</Text>
          <View
            style={[s.row, { justifyContent: 'space-between', marginTop: 5 }]}
          >
            <Text style={s.hint}>{es}</Text>
            <Text style={{ fontSize: 12 }}>{money(value)}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}
export function OrdersScreen() {
  const shop = useMallSession((state) => state.shop);
  const query = useMallQuery<OrderData>('orders', '/xcx/Yw/Ddlb', {
    xsddList: [{ dpbm: shop }],
  });
  return (
    <View style={s.page}>
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
            style={[
              s.card,
              s.row,
              { padding: 16, justifyContent: 'space-between' },
            ]}
          >
            <View style={s.flex}>
              <Text style={s.muted}>销售合同号 / N.º pedido</Text>
              <Text
                style={{ fontWeight: '600', fontSize: 16, marginVertical: 7 }}
              >
                {order.xshth}
              </Text>
              <Text style={s.muted}>{order.pcczsj}</Text>
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
export function OrderDetailScreen() {
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
    <View style={s.page}>
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
const o = StyleSheet.create({
  orderCard: {
    margin: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  top: {
    padding: 12,
    minHeight: 56,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#ececec',
  },
  customer: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
  shopCode: {
    position: 'absolute',
    top: 0,
    right: 0,
    color: '#fff',
    backgroundColor: '#ff694d',
    borderBottomLeftRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 10,
    fontSize: 11,
  },
  small: { fontSize: 11, color: '#666' },
  address: {
    padding: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: '#f6f6f6',
    borderRadius: 8,
    fontSize: 11,
    marginTop: 6,
    marginBottom: 10,
    color: '#333',
  },
  total: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#f5f5f5',
    padding: 12,
  },
  totalValue: {
    color: '#ff3f37',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  summary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  item: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#eee',
  },
  image: { width: 72, height: 72, backgroundColor: '#f8f8f8', borderRadius: 5 },
  submit: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    backgroundColor: '#fff',
    borderTopColor: '#eee',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
