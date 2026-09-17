import { useIsMutating, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { QuantityDraftContext, QuantityDrafts } from './quantity-drafts';
import { accent, Button, paths, Quantity, s, Status } from './ui';

export function OrderBody({
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
  const { t } = useTranslation();
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
      setError(
        cause instanceof Error ? cause.message : t('mall.cart.save_failed')
      )
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
      setError(
        cause instanceof Error ? cause.message : t('mall.cart.submit_failed')
      );
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
            <View className={s.row} style={o.top}>
              <View className={s.flex}>
                <Text style={o.customer}>
                  {String(order.kh_sw || order.kh || '')}
                </Text>
                <Text className={s.hint}>
                  {t('mall.cart.tax_id')} {String(order.khsh || '')}
                </Text>
              </View>
              <Text style={o.shopCode}>{String(order.dp || order.xshth)}</Text>
            </View>
            <View style={{ padding: 12 }}>
              <View
                className={s.row}
                style={{ justifyContent: 'space-between', marginBottom: 8 }}
              >
                <Text style={o.small}>
                  {t('mall.cart.region')}:{' '}
                  {String(order.dq_sw || order.dq || '-')}
                </Text>
                <Text style={o.small}>
                  {t('mall.cart.postal_code')}:{' '}
                  {String(order.lsyb || order.yb || '-')}
                </Text>
              </View>
              <Text style={[o.small, { marginBottom: 12 }]}>
                {t('mall.cart.address')}: {String(order.khdz || '-')}
              </Text>
              <Text style={o.small}>{t('mall.cart.temporary_address')}</Text>
              <TextInput
                accessibilityLabel={t('mall.cart.temporary_address')}
                editable={!readOnly && !busy}
                value={address}
                onChangeText={setAddress}
                onBlur={saveOnBlur}
                placeholder={t('mall.cart.temporary_address_placeholder')}
                maxLength={200}
                style={o.address}
              />
              <Text style={o.small}>{t('mall.cart.remark')}</Text>
              <TextInput
                accessibilityLabel={t('mall.cart.remark')}
                editable={!readOnly && !busy}
                value={remark}
                onChangeText={setRemark}
                onBlur={saveOnBlur}
                placeholder={t('mall.cart.remark_placeholder')}
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
                <Text style={o.small}>{t('mall.cart.total')}</Text>
                <Text style={o.totalValue}>{money(order.jezj)}</Text>
              </View>
              <View>
                <Text style={o.small}>
                  {expanded
                    ? `${t('mall.cart.collapse')} ⌄`
                    : `${t('mall.cart.view_more')} ›`}
                </Text>
              </View>
            </Pressable>
          </View>
        )}
        {!!error && (
          <Text
            accessibilityRole="alert"
            className={s.error}
            style={{ margin: 12 }}
          >
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
                <View className={s.flex}>
                  <Text
                    numberOfLines={2}
                    style={{ fontSize: 13, marginBottom: 12 }}
                  >
                    {item.wlmc}
                  </Text>
                  <View
                    className={s.row}
                    style={{ justifyContent: 'space-between', gap: 10 }}
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
        {!order && !items.length && <Status empty={t('mall.cart.empty')} />}
      </ScrollView>
      {!readOnly && (
        <View style={o.submit}>
          <Button
            title={
              busy ? t('mall.cart.submitting') : t('mall.cart.submit_order')
            }
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
  const { t } = useTranslation();
  const fields = [
    ['mall.cart.summary.subtotal', order.bhshj],
    [
      'mall.cart.summary.tax',
      Number(order.sjhj || 0) + Number(order.tssjhj || 0),
    ],
    ['mall.cart.summary.sugar_tax', order.tshj],
    ['mall.cart.summary.surcharge', order.fjs],
    ['mall.cart.summary.discount', order.yhhj],
  ] as const;
  return (
    <View style={o.summary}>
      {fields.map(([tx, value]) => (
        <View key={tx} style={{ width: '47%', paddingVertical: 9 }}>
          <Text style={{ fontSize: 12 }}>{t(tx)}</Text>
          <Text style={{ marginTop: 5, fontSize: 12, textAlign: 'right' }}>
            {money(value)}
          </Text>
        </View>
      ))}
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
