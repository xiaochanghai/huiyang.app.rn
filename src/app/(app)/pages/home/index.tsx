import { router } from 'expo-router';
import { Search } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import {
  type Catalog,
  type HomeData,
  imageSource,
  type Tag,
  useMallSession,
} from '@/features/mall/api';
import { useMallQuery } from '@/features/mall/hooks';
import {
  accent,
  Header,
  paths,
  ProductGrid,
  s,
  Status,
} from '@/features/mall/ui';

import { c, openTag, RemoteImage } from '@/features/mall/catalog-ui';

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
