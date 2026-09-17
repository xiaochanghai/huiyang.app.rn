import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      <NavHeader title={product?.wlmc || t('mall.product_detail.title')} />
      <ScrollView contentContainerStyle={{ paddingBottom: 25 }}>
        <Status
          loading={!!id && query.isPending}
          error={query.error}
          retry={() => query.refetch()}
          empty={
            !id
              ? t('mall.product_detail.incomplete')
              : !product && !query.isPending
                ? t('mall.product_detail.not_found')
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
                {t('mall.product_detail.product_code')} · {product.wlbm}
                {product.gystm}
              </Text>
              <View className={s.row} style={{ paddingTop: 18 }}>
                <Meta
                  title={t('mall.product_detail.tax_rate')}
                  value={product.iva_sw || '-'}
                />
                <Meta
                  title={t('mall.product_detail.discount_rate')}
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
                    <Text className={s.oldPrice}>
                      {t('mall.product_detail.unit_price')} {money(product.dj)}
                    </Text>
                  )}
                  <Text className={s.hint}>
                    {t(
                      discount
                        ? 'mall.product_detail.discounted_price'
                        : 'mall.product_detail.unit_price'
                    )}
                  </Text>
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
              {(
                [
                  ['mall.product_detail.tax', product.sj],
                  ['mall.product_detail.sugar_tax', product.tsje],
                  ['mall.product_detail.price_with_tax', product.shj],
                ] as const
              ).map(([tx, value]) => (
                <View
                  key={String(tx)}
                  style={{ flex: 1, alignItems: 'center', gap: 5 }}
                >
                  <Text style={{ fontSize: 12 }}>{t(tx)}</Text>
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
          accessibilityLabel={t('mall.product_detail.cart')}
          onPress={() => router.navigate(paths.cart)}
          style={{ alignItems: 'center', padding: 8 }}
        >
          <FontAwesome name="shopping-cart" size={24} color={accent} />
          <Text style={{ color: accent, fontSize: 10 }}>
            {t('mall.product_detail.cart')}
          </Text>
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
