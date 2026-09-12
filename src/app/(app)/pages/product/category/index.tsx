import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';

import {
  type CategoryData,
  imageSource,
  useMallSession,
} from '@/features/mall/api';
import { useMallQuery } from '@/features/mall/hooks';
import { accent, Header, s, Status } from '@/features/mall/ui';

import { c, openTag, RemoteImage } from '@/features/mall/catalog-ui';

export default function CategoryScreen() {
  const shop = useMallSession((state) => state.shop);
  const query = useMallQuery<CategoryData>('categories', '/xcx/Yw/Cxall');
  const [selected, setSelected] = useState('');
  const current =
    query.data?.cpdlList?.find((item) => item.bm === selected) ||
    query.data?.cpdlList?.[0];
  const tagQuery = useMallQuery<CategoryData>(
    'category-tags',
    '/xcx/Yw/Cxdl',
    { dpbm: shop, cpdl: current?.bm, qswz: 0 },
    'POST',
    !!current
  );
  const tags = tagQuery.data?.cpbqList || [];
  return (
    <View style={s.page}>
      <Header title="分类 (Categorías)" />
      <View style={[s.row, { flex: 1, alignItems: 'stretch' }]}>
        <ScrollView
          style={{ width: 95, flexGrow: 0, backgroundColor: '#f5f5f5' }}
        >
          {query.data?.cpdlList?.map((item) => (
            <Pressable
              key={item.bm}
              onPress={() => setSelected(item.bm)}
              style={[c.category, current?.bm === item.bm && c.selected]}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: current?.bm === item.bm ? accent : '#666',
                  textAlign: 'center',
                }}
              >
                {item.cpdl}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        <ScrollView
          style={{ flex: 1, backgroundColor: '#fff' }}
          contentContainerStyle={{ padding: 12 }}
        >
          {!!(current?.dlct || current?.dlft) && (
            <RemoteImage uri={current.dlct || current.dlft} />
          )}
          <Text style={[c.title, { marginTop: 12 }]}>
            {current?.cpdl || '产品标签'}
          </Text>
          <Text style={[s.hint, { marginBottom: 20 }]}>
            选择产品标签 · Selecciona una etiqueta
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {tags.map((tag) => (
              <Pressable
                key={tag.bm}
                onPress={() => openTag(tag)}
                style={{ width: '29%', alignItems: 'center' }}
              >
                {tag.bqft ? (
                  <Image
                    source={imageSource(tag.bqft)}
                    style={{ width: 56, height: 56 }}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={{ width: 56, height: 56 }} />
                )}
                <Text
                  style={{
                    fontSize: 12,
                    textAlign: 'center',
                    marginVertical: 8,
                  }}
                >
                  {tag.cpbq}
                </Text>
              </Pressable>
            ))}
          </View>
          <Status
            loading={query.isPending || (!!current && tagQuery.isPending)}
            error={query.error || tagQuery.error}
            retry={() => {
              query.refetch();
              if (current) tagQuery.refetch();
            }}
            empty={!tags.length ? '暂无产品标签' : undefined}
          />
        </ScrollView>
      </View>
    </View>
  );
}
