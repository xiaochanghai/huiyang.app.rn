import { useInfiniteQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { Search } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import {
  type Catalog,
  type CategoryData,
  type HomeData,
  imageSource,
  type Product,
  request,
  type Tag,
  useMallSession,
} from './api';
import { useMallQuery } from './hooks';
import { accent, Header, paths, ProductGrid, s, Status } from './ui';

function openTag(tag: Tag) {
  router.push({
    pathname: paths.products,
    params: { tagId: tag.bm, tagName: tag.cpbq },
  });
}
export function HomeScreen() {
  const query = useMallQuery<HomeData>('home', '/xcx/Yw/Cxsy', {
    dpbm: useMallSession((state) => state.shop),
    cpbq: '',
    qswz: 0,
    sxlx: 0,
  });
  const [keyword, setKeyword] = useState('');
  const [catalog, setCatalog] = useState<Catalog | null>(null);
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
    <View style={s.page}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={query.isRefetching}
            onRefresh={() => query.refetch()}
            tintColor={accent}
          />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <Header title="首页 (Inicio)" />
        <View style={c.search}>
          <Search size={18} color="#999" />
          <TextInput
            accessibilityLabel="搜索商品"
            placeholder="搜索商品 / Buscar artículos"
            value={keyword}
            onChangeText={setKeyword}
            onSubmitEditing={search}
            returnKeyType="search"
            style={{ flex: 1, fontSize: 14, minWidth: 0, height: 38 }}
          />
          <Pressable style={c.searchButton} onPress={search}>
            <Text style={{ color: '#fff', fontSize: 13 }}>搜索</Text>
          </Pressable>
        </View>
        {!!data?.cpbqsygdtList?.length && (
          <Banner tags={data.cpbqsygdtList.filter((tag) => !!tag.bqsygdt)} />
        )}
        {!!data?.cpcList?.length && (
          <View style={{ padding: 12 }}>
            <Text style={c.title}>活动海报 (PDF Catalogo)</Text>
            <View style={[s.row, { gap: 8, flexWrap: 'wrap', marginTop: 10 }]}>
              {data.cpcList.map((item) => (
                <Pressable
                  key={item.bh}
                  onPress={() => setCatalog(item)}
                  style={{ width: '31%' }}
                >
                  <Image
                    source={imageSource(item.cpcft)}
                    style={{ width: '100%', height: 90 }}
                    resizeMode="contain"
                  />
                </Pressable>
              ))}
            </View>
          </View>
        )}
        {data?.cpbqsyctList?.map((tag) => (
          <Pressable
            key={tag.bm}
            onPress={() => openTag(tag)}
            style={{ marginHorizontal: 12, marginBottom: 8 }}
          >
            <RemoteImage uri={tag.bqsyct} />
          </Pressable>
        ))}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 6, paddingHorizontal: 12 }}
        >
          {data?.cpbqsyftList?.map((tag) => (
            <Pressable key={tag.bm} onPress={() => openTag(tag)}>
              <Image
                source={imageSource(tag.bqft)}
                style={{ width: 110, height: 110 }}
                resizeMode="contain"
              />
            </Pressable>
          ))}
        </ScrollView>
        {sections.map((section, index) => (
          <View key={section.bm || index} style={{ paddingBottom: 16 }}>
            {!!section.cpbq && (
              <View style={c.section}>
                <Text style={c.title}>{section.cpbq}</Text>
                <Pressable onPress={() => openTag(section)}>
                  <Text style={{ color: accent }}>更多 ›</Text>
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
      <Modal
        visible={!!catalog}
        animationType="slide"
        onRequestClose={() => setCatalog(null)}
      >
        <View style={{ flex: 1, paddingTop: 40, backgroundColor: '#fff' }}>
          <Pressable onPress={() => setCatalog(null)} style={{ padding: 16 }}>
            <Text>关闭 / Cerrar</Text>
          </Pressable>
          <ScrollView>
            {catalog?.cpcctList?.length ? (
              catalog.cpcctList.map((item) => (
                <RemoteImage key={item.bh} uri={item.cpcct} />
              ))
            ) : (
              <RemoteImage uri={catalog?.cpcft} />
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
function RemoteImage({ uri }: { uri?: string }) {
  const [ratio, setRatio] = useState(2);
  const [width, setWidth] = useState(0);
  return (
    <View
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={{ width: '100%' }}
    >
      <Image
        source={imageSource(uri)}
        onLoad={(event) => {
          const { width, height } = event.nativeEvent.source;
          if (width && height) setRatio(width / height);
        }}
        style={{ width: '100%', height: width / ratio }}
        resizeMode="contain"
      />
    </View>
  );
}
function Banner({ tags }: { tags: Tag[] }) {
  const { width } = useWindowDimensions();
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
    <View>
      <ScrollView
        ref={ref}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) =>
          setIndex(Math.round(event.nativeEvent.contentOffset.x / width))
        }
      >
        {tags.map((tag) => (
          <Pressable key={tag.bm} onPress={() => openTag(tag)}>
            <Image
              source={imageSource(tag.bqsygdt)}
              style={{ width, height: 140, backgroundColor: '#1b130d' }}
              resizeMode="contain"
            />
          </Pressable>
        ))}
      </ScrollView>
      <View style={c.dots}>
        {tags.map((tag, i) => (
          <View
            key={tag.bm}
            style={[c.dot, { opacity: index === i ? 1 : 0.5 }]}
          />
        ))}
      </View>
    </View>
  );
}
export function CategoryScreen() {
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
export function ProductsScreen() {
  const { tagId, tagName, keyword } = useLocalSearchParams<{
    tagId?: string;
    tagName?: string;
    keyword?: string;
  }>();
  const shop = useMallSession((state) => state.shop);
  const token = useMallSession((state) => state.token);
  const query = useInfiniteQuery({
    queryKey: ['mall', shop, token, 'products', { tagId, keyword }],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      request<{ cpxxList?: Product[] }>(
        keyword ? '/xcx/Yw/Cxsx' : '/xcx/Yw/Cxbq',
        {
          dpbm: shop,
          qswz: pageParam,
          ...(keyword ? { cpsx: keyword } : { cpbq: tagId }),
        }
      ),
    getNextPageParam: (page, _pages, offset) =>
      page.cpxxList?.length ? offset + page.cpxxList.length : undefined,
    enabled: !!shop && !!token && !!(keyword || tagId),
    retry: false,
  });
  const products = [
    ...new Map(
      query.data?.pages
        .flatMap((page) => page.cpxxList || [])
        .map((product) => [product.wlbm, product])
    ).values(),
  ];
  return (
    <View style={s.page}>
      <Header
        title={keyword ? `搜索：${keyword}` : tagName || '商品列表'}
        back
      />
      <ScrollView
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 24 }}
        scrollEventThrottle={100}
        onScroll={({ nativeEvent }) => {
          if (
            nativeEvent.contentOffset.y +
              nativeEvent.layoutMeasurement.height >=
              nativeEvent.contentSize.height - 100 &&
            query.hasNextPage &&
            !query.isFetching &&
            !query.isFetchNextPageError
          )
            void query.fetchNextPage();
        }}
      >
        <ProductGrid products={products} />
        <Status
          loading={query.isPending}
          error={query.error}
          retry={() =>
            query.isFetchNextPageError ? query.fetchNextPage() : query.refetch()
          }
          empty={!products.length ? '暂无商品' : undefined}
        />
        {query.hasNextPage && (
          <Pressable
            disabled={query.isFetching}
            onPress={() => query.fetchNextPage()}
            style={{ padding: 18, alignItems: 'center' }}
          >
            <Text style={{ color: accent }}>
              {query.isFetchingNextPage ? '加载中...' : '加载更多 / Cargar más'}
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}
const c = StyleSheet.create({
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 10,
    borderRadius: 8,
    paddingLeft: 12,
    paddingRight: 6,
  },
  searchButton: {
    backgroundColor: accent,
    height: 28,
    minWidth: 46,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { color: '#1a1a1a', fontSize: 16, fontWeight: '600' },
  section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 9,
  },
  dots: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#fff' },
  category: {
    minHeight: 55,
    justifyContent: 'center',
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  selected: { backgroundColor: '#fff', borderLeftColor: accent },
});
