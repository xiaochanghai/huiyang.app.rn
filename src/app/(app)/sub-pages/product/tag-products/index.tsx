import { useInfiniteQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { NavHeader } from '@/components/ui/nav-header';
import { type Product, request, useMallSession } from '@/features/mall/api';
import { accent, ProductGrid, s, Status } from '@/features/mall/ui';

export default function ProductsScreen() {
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
    <View className={s.page}>
      <NavHeader title={keyword ? `搜索：${keyword}` : tagName || '商品列表'} />
      <ScrollView
        contentContainerStyle={{}}
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
