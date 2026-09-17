import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { FontAwesome } from '@/components/ui/icons';
import { NavHeader } from '@/components/ui/nav-header';
import {
  type HomeData,
  imageSource,
  type Tag,
  useMallSession,
} from '@/features/mall/api';
import { openTag, RemoteImage } from '@/features/mall/catalog-ui';
import { useMallQuery } from '@/features/mall/hooks';
import { accent, paths, ProductGrid, Status } from '@/features/mall/ui';

export default function HomeTabScreen() {
  const query = useMallQuery<HomeData>('home', '/xcx/Yw/Cxsy', {
    dpbm: useMallSession((state) => state.shop),
    cpbq: '',
    qswz: 0,
    sxlx: 0,
  });
  const [keyword, setKeyword] = useState('');
  const data = query.data;
  const sections = data?.cpbqsyList?.length
    ? data.cpbqsyList
    : data?.cpxxsyList?.length
      ? [{ bm: '', cpbq: '', cpxxsyList: data.cpxxsyList }]
      : [];
  const search = () => {
    if (keyword.trim())
      router.push({
        pathname: paths.products,
        params: { keyword: keyword.trim() },
      });
  };
  return (
    <View className="flex-1 bg-white">
      <NavHeader title="首页 (Inicio)" leftShown={false} />
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={query.isRefetching}
            onRefresh={() => query.refetch()}
            tintColor={accent}
          />
        }
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-6"
      >
        <View className="bg-white px-4 pb-4 pt-2">
          <View className="min-h-[52px] flex-row items-center gap-2 rounded-xl bg-neutral-100 pl-3 pr-1">
            <FontAwesome name="search" size={18} color="#8b8b8b" />
            <TextInput
              accessibilityLabel="搜索商品"
              placeholder="搜索商品 / Buscar artículos"
              value={keyword}
              onChangeText={setKeyword}
              onSubmitEditing={search}
              returnKeyType="search"
              placeholderTextColor="#8b8b8b"
              autoCorrect={false}
              autoCapitalize="none"
              className="h-12 min-w-0 flex-1 py-0 text-[14px] text-[#222]"
            />
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="搜索商品"
              activeOpacity={0.75}
              className="min-h-11 min-w-[60px] items-center justify-center rounded-[9px] px-3.5"
              style={{ backgroundColor: accent }}
              onPress={search}
            >
              <Text className="text-[14px] font-semibold text-white">搜索</Text>
            </TouchableOpacity>
          </View>
        </View>
        {!!data?.cpbqsygdtList?.length && (
          <Banner tags={data.cpbqsygdtList.filter((tag) => !!tag.bqsygdt)} />
        )}
        {data?.cpbqsyctList?.map((tag) => (
          <Pressable
            key={tag.bm}
            onPress={() => openTag(tag)}
            className="mx-4 mb-1 mt-4 overflow-hidden rounded-lg"
          >
            <RemoteImage uri={tag.bqsyct} />
          </Pressable>
        ))}
        <View className="flex-row flex-wrap bg-white px-4 pb-4 pt-3">
          {data?.cpbqsyftList?.map((tag) => (
            <Pressable
              key={tag.bm}
              onPress={() => openTag(tag)}
              className="w-1/3 px-1"
            >
              <Image
                source={imageSource(tag.bqft)}
                className="aspect-square w-full"
                resizeMode="contain"
              />
            </Pressable>
          ))}
        </View>
        {sections.map((section, index) => (
          <View key={section.bm || index} className="pb-4">
            {!!section.cpbq && (
              <View className="mb-1 flex-row items-center justify-between gap-3 border-b border-gray-200 px-4  pb-1 pt-2">
                <Text className="flex-1 text-[18px] font-bold text-[#222]">
                  {section.cpbq}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`查看更多${section.cpbq}`}
                  onPress={() => openTag(section)}
                  className="min-h-11 justify-center pl-2"
                >
                  <Text
                    className="text-[13px] font-medium"
                    style={{ color: accent }}
                  >
                    更多 &gt;
                  </Text>
                </Pressable>
              </View>
            )}
            {section.cpxxsyList?.length ? (
              <ProductGrid products={section.cpxxsyList} />
            ) : (
              <Status empty="暂无商品" />
            )}
          </View>
        ))}
        <Status
          loading={query.isPending}
          error={query.error}
          retry={() => query.refetch()}
          empty={!sections.length ? '暂无商品' : undefined}
        />
      </ScrollView>
    </View>
  );
}
function Banner({ tags }: { tags: Tag[] }) {
  const [width, setWidth] = useState(0);
  const ref = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (tags.length < 2) return;
    const timer = setInterval(
      () => setIndex((current) => (current + 1) % tags.length),
      4000
    );
    return () => clearInterval(timer);
  }, [tags.length]);
  useEffect(
    () => ref.current?.scrollTo({ x: index * width, animated: true }),
    [index, width]
  );
  return (
    <View
      className="bg-[#1b130d]"
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    >
      <ScrollView
        ref={ref}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) =>
          width > 0 &&
          setIndex(
            Math.min(
              tags.length - 1,
              Math.max(0, Math.round(event.nativeEvent.contentOffset.x / width))
            )
          )
        }
      >
        {tags.map((tag) => (
          <Pressable key={tag.bm} onPress={() => openTag(tag)}>
            <Image
              source={imageSource(tag.bqsygdt)}
              className="bg-[#1b130d]"
              style={{
                width,
                height: width * (187 / 485),
              }}
              resizeMode="contain"
            />
          </Pressable>
        ))}
      </ScrollView>
      <View className="absolute bottom-2.5 flex-row gap-[5px] self-center">
        {tags.map((tag, i) => (
          <View
            key={tag.bm}
            className={`h-[5px] rounded-[3px] ${
              index === i ? 'w-4 bg-white' : 'w-[5px] bg-[#ffffff80]'
            }`}
          />
        ))}
      </View>
    </View>
  );
}
