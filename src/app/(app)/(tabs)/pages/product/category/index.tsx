import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';

import { NavHeader } from '@/components/ui/nav-header';
import {
  type CategoryData,
  imageSource,
  useMallSession,
} from '@/features/mall/api';
import { openTag, RemoteImage } from '@/features/mall/catalog-ui';
import { useMallQuery } from '@/features/mall/hooks';
import { accent, Status } from '@/features/mall/ui';

export default function CategoryTabScreen() {
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
    <View className="flex-1 bg-neutral-100">
      <NavHeader title="分类 (Categorías)" leftShown={false} />
      <View className="flex-1 flex-row items-stretch">
        <ScrollView className="w-[95px] grow-0 bg-neutral-100">
          {query.data?.cpdlList?.map((item) => (
            <Pressable
              key={item.bm}
              onPress={() => setSelected(item.bm)}
              className={`min-h-[55px] justify-center border-l-[3px] border-l-transparent p-2.5 ${current?.bm === item.bm ? 'bg-white' : ''}`}
              style={
                current?.bm === item.bm
                  ? { borderLeftColor: accent }
                  : undefined
              }
            >
              <Text
                className="text-center text-[13px] text-[#666]"
                style={current?.bm === item.bm ? { color: accent } : undefined}
              >
                {item.cpdl}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        <ScrollView className="flex-1 bg-white" contentContainerClassName="p-3">
          {!!(current?.dlct || current?.dlft) && (
            <RemoteImage uri={current.dlct || current.dlft} />
          )}
          <Text className="mt-3 text-[16px] font-semibold text-[#1a1a1a]">
            {current?.cpdl || '产品标签'}
          </Text>
          <Text className="mb-5 mt-[3px] text-[10px] text-[#b5adaa]">
            选择产品标签 · Selecciona una etiqueta
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {tags.map((tag) => (
              <Pressable
                key={tag.bm}
                onPress={() => openTag(tag)}
                className="w-[29%] items-center"
              >
                {tag.bqft ? (
                  <Image
                    source={imageSource(tag.bqft)}
                    className="size-14"
                    resizeMode="contain"
                  />
                ) : (
                  <View className="size-14" />
                )}
                <Text className="my-2 text-center text-[12px]">{tag.cpbq}</Text>
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
