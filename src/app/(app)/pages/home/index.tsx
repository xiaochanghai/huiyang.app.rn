import { router } from 'expo-router';
import { ClipboardPlus, Search } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  type Catalog,
  type HomeData,
  imageSource,
  type Tag,
  useMallSession,
} from '@/features/mall/api';
import { openTag, RemoteImage } from '@/features/mall/catalog-ui';
import { useMallQuery } from '@/features/mall/hooks';
import { accent, paths, ProductGrid, Status } from '@/features/mall/ui';

export default function HomeScreen() {
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
    <View style={home.page}>
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
        <View style={home.header}>
          {!!data?.cpcList?.length && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="活动海报 (PDF Catalogo)"
              onPress={() => setCatalog(data.cpcList?.[0] ?? null)}
              style={home.catalogButton}
            >
              <ClipboardPlus size={24} color="#26343c" />
            </Pressable>
          )}
          <Text style={home.headerTitle}>首页 (Inicio)</Text>
        </View>
        <View style={home.searchArea}>
          <View style={home.search}>
            <Search size={20} color="#999" />
            <TextInput
              accessibilityLabel="搜索商品"
              placeholder="搜索商品 / Buscar artículos"
              value={keyword}
              onChangeText={setKeyword}
              onSubmitEditing={search}
              returnKeyType="search"
              placeholderTextColor="#888"
              style={home.searchInput}
            />
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [
                home.searchButton,
                { opacity: pressed ? 0.75 : 1 },
              ]}
              onPress={search}
            >
              <Text style={{ color: '#fff', fontSize: 18 }}>搜索</Text>
            </Pressable>
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
                <Pressable onPress={() => openTag(section)}>
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
            <View style={home.catalogChoices}>
              {data?.cpcList?.map((item) => (
                <Pressable
                  key={item.bh}
                  onPress={() => setCatalog(item)}
                  accessibilityLabel={'查看海报 ' + item.bh}
                >
                  <Image
                    source={imageSource(item.cpcft)}
                    style={{ width: 90, height: 90 }}
                    resizeMode="contain"
                  />
                </Pressable>
              ))}
            </View>
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
            style={[home.dot, { opacity: index === i ? 1 : 0.5 }]}
          />
        ))}
      </View>
    </View>
  );
}

const home = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#fff' },
  header: {
    height: 59,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 23, fontWeight: '700', color: '#111' },
  catalogButton: {
    position: 'absolute',
    left: 16,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchArea: {
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 13,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#efefef',
    borderRadius: 12,
    paddingLeft: 16,
    paddingRight: 8,
    height: 51,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    fontSize: 19,
    height: 51,
    color: '#222',
  },
  searchButton: {
    backgroundColor: '#ff2044',
    height: 38,
    paddingHorizontal: 13,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  banner: { backgroundColor: '#1b130d' },
  dots: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
  promotion: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 6,
    overflow: 'hidden',
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
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
    paddingTop: 24,
    paddingBottom: 16,
  },
  sectionTitle: { color: '#111', fontSize: 22, fontWeight: '700' },
  more: { color: '#ff2044', fontSize: 18 },
  catalogChoices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    padding: 16,
  },
});
