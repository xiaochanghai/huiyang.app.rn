import { router } from 'expo-router';
import { Search } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  type HomeData,
  imageSource,
  type Tag,
  useMallSession,
} from '@/features/mall/api';
import { openTag, RemoteImage } from '@/features/mall/catalog-ui';
import { useMallQuery } from '@/features/mall/hooks';
import { accent, Header, paths, ProductGrid, Status } from '@/features/mall/ui';

export default function HomeScreen() {
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
    <View style={home.page}>
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
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <Header title="首页 (Inicio)" />
        <View style={home.searchArea}>
          <View style={home.search}>
            <Search size={18} color="#8b8b8b" />
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
              style={home.searchInput}
            />
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="搜索商品"
              activeOpacity={0.75}
              style={home.searchButton}
              onPress={search}
            >
              <Text style={home.searchButtonText}>搜索</Text>
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
            style={home.promotion}
          >
            <RemoteImage uri={tag.bqsyct} />
          </Pressable>
        ))}
        <View style={home.categories}>
          {data?.cpbqsyftList?.map((tag) => (
            <Pressable
              key={tag.bm}
              onPress={() => openTag(tag)}
              style={home.category}
            >
              <Image
                source={imageSource(tag.bqft)}
                style={home.categoryImage}
                resizeMode="contain"
              />
            </Pressable>
          ))}
        </View>
        {sections.map((section, index) => (
          <View key={section.bm || index} style={home.productSection}>
            {!!section.cpbq && (
              <View style={home.sectionHeading}>
                <Text style={home.sectionTitle}>{section.cpbq}</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`查看更多${section.cpbq}`}
                  onPress={() => openTag(section)}
                  style={home.moreButton}
                >
                  <Text style={home.more}>更多 &gt;</Text>
                </Pressable>
              </View>
            )}
            <ProductGrid products={section.cpxxsyList || []} />
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
      style={home.banner}
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
              style={{
                width,
                height: width * (187 / 485),
                backgroundColor: '#1b130d',
              }}
              resizeMode="contain"
            />
          </Pressable>
        ))}
      </ScrollView>
      <View style={home.dots}>
        {tags.map((tag, i) => (
          <View
            key={tag.bm}
            style={[home.dot, index === i && home.activeDot]}
          />
        ))}
      </View>
    </View>
  );
}

const home = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#fff' },
  searchArea: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingLeft: 12,
    paddingRight: 4,
    minHeight: 52,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    height: 48,
    paddingVertical: 0,
    color: '#222',
  },
  searchButton: {
    backgroundColor: accent,
    minHeight: 44,
    minWidth: 60,
    paddingHorizontal: 14,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  banner: { backgroundColor: '#1b130d' },
  dots: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#ffffff80',
  },
  activeDot: { width: 16, backgroundColor: '#fff' },
  promotion: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  category: { width: '33.333333%', paddingHorizontal: 4 },
  categoryImage: { width: '100%', aspectRatio: 1 },
  productSection: { paddingBottom: 16, backgroundColor: '#f7f7f7' },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    gap: 12,
  },
  sectionTitle: { flex: 1, color: '#222', fontSize: 18, fontWeight: '700' },
  moreButton: { minHeight: 44, justifyContent: 'center', paddingLeft: 8 },
  more: { color: accent, fontSize: 13, fontWeight: '500' },
});
