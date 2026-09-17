import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { FontAwesome } from '@/components/ui/icons';
import { NavHeader } from '@/components/ui/nav-header';
import {
  imageSource,
  money,
  type Product,
  useMallSession,
} from '@/features/mall/api';
import { useMallQuery } from '@/features/mall/hooks';
import { accent, paths, Quantity, s, Status } from '@/features/mall/ui';

export default function DetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const shop = useMallSession((state) => state.shop);
  const query = useMallQuery<{ cpxxList?: Product[] }>(
    'detail',
    '/xcx/Yw/Cpxq',
    { dpbm: shop, wlbm: id },
    'POST',
    !!id
  );
  const { width } = useWindowDimensions();
  const [slide, setSlide] = useState(0);
  const product = query.data?.cpxxList?.[0];
  const images = product?.cpgdtList?.length
    ? [...product.cpgdtList]
        .sort((a, b) => a.bh - b.bh)
        .map((item) => item.cpgdt)
        .filter(Boolean)
    : [product?.cpft];
  const rate = Number.parseFloat(product?.zkl_sw || '');
  const discount = Number.isFinite(rate)
    ? rate > 0
    : !!product && Number(product.zhj) < Number(product.dj);
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <NavHeader title={product?.wlmc || '商品详情'} />
      <ScrollView contentContainerStyle={{ paddingBottom: 25 }}>
        <Status
          loading={!!id && query.isPending}
          error={query.error}
          retry={() => query.refetch()}
          empty={
            !id
              ? '商品信息不完整'
              : !product && !query.isPending
                ? '未查询到商品详情'
                : undefined
          }
        />
        {product && (
          <>
            <View>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(event) =>
                  setSlide(
                    Math.round(event.nativeEvent.contentOffset.x / width)
                  )
                }
              >
                {images.map((uri, index) => (
                  <Image
                    key={`${uri}-${index}`}
                    source={imageSource(uri)}
                    style={{ width, height: 220 }}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
              {images.length > 1 && (
                <View
                  style={{
                    position: 'absolute',
                    bottom: 10,
                    flexDirection: 'row',
                    gap: 5,
                    alignSelf: 'center',
                  }}
                >
                  {images.map((_, index) => (
                    <View
                      key={index}
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: 3,
                        backgroundColor: index === slide ? accent : '#ccc',
                      }}
                    />
                  ))}
                </View>
              )}
            </View>
            <View style={{ padding: 16 }}>
              <Text
                style={{ fontSize: 20, fontWeight: '600', marginBottom: 10 }}
              >
                {product.wlmc}
              </Text>
              <Text className={s.muted}>
                商品编号 (Cód. prod.) · {product.wlbm}　{product.gystm}
              </Text>
              <View className={s.row} style={{ paddingTop: 18 }}>
                <Meta
                  title="税率 (T. impuesto)"
                  value={product.iva_sw || '-'}
                />
                <Meta
                  title="折扣率 (T. descuento)"
                  value={product.zkl_sw || '-'}
                />
                <View
                  style={{
                    flex: 1.2,
                    alignItems: 'flex-end',
                    borderLeftWidth: 1,
                    borderColor: '#f0f0f0',
                  }}
                >
                  {discount && (
                    <Text className={s.oldPrice}>单价 {money(product.dj)}</Text>
                  )}
                  <Text className={s.hint}>{discount ? '折后价' : '单价'}</Text>
                  <Text
                    style={{ color: accent, fontSize: 20, fontWeight: '700' }}
                  >
                    {money(discount ? product.zhj : product.dj)}
                  </Text>
                </View>
              </View>
            </View>
            <View
              className={s.row}
              style={[
                {
                  marginHorizontal: 12,
                  padding: 12,
                  borderRadius: 8,
                  backgroundColor: '#f8f8f8',
                },
              ]}
            >
              {[
                ['税金', 'IVA', product.sj],
                ['糖税', 'IBEE', product.tsje],
                ['税后价', 'P. imp.', product.shj],
              ].map(([cn, es, value]) => (
                <View
                  key={String(cn)}
                  style={{ flex: 1, alignItems: 'center', gap: 5 }}
                >
                  <Text style={{ fontSize: 12 }}>{cn}</Text>
                  <Text className={s.hint}>{es}</Text>
                  <Text style={{ fontSize: 13 }}>{money(value)}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
      <View
        className={s.row}
        style={[
          {
            minHeight: 60,
            paddingHorizontal: 16,
            borderTopWidth: 1,
            borderColor: '#f0f0f0',
            gap: 12,
          },
        ]}
      >
        <Pressable
          accessibilityLabel="订单"
          onPress={() => router.navigate(paths.cart)}
          style={{ alignItems: 'center', padding: 8 }}
        >
          <FontAwesome name="shopping-cart" size={24} color={accent} />
          <Text style={{ color: accent, fontSize: 10 }}>订单</Text>
        </Pressable>
        {!!product?.wlsl && (
          <Text style={{ fontSize: 18, color: '#ff3b30', fontWeight: '600' }}>
            {money(Number(product.shj || 0) * product.wlsl)}
          </Text>
        )}
        {product && (
          <View style={{ width: 134, marginLeft: 'auto' }}>
            <Quantity code={product.wlbm} quantity={product.wlsl || 0} />
          </View>
        )}
      </View>
    </View>
  );
}
function Meta({ title, value }: { title: string; value: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 5 }}>
      <Text style={{ color: '#999', fontSize: 9 }}>{title}</Text>
      <Text style={{ fontSize: 14, fontWeight: '700' }}>{value}</Text>
    </View>
  );
}
