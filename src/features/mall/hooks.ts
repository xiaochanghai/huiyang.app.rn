import {
  type InfiniteData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  type CategoryData,
  type HomeData,
  type OrderData,
  type Product,
  request,
  useMallSession,
} from './api';

export function useMallQuery<T>(
  key: string,
  path: string,
  params?: Record<string, unknown>,
  method: 'GET' | 'POST' = 'POST',
  enabled = true
) {
  const shop = useMallSession((s) => s.shop);
  const token = useMallSession((s) => s.token);
  return useQuery({
    queryKey: ['mall', shop, token, key, params],
    queryFn: () => request<T>(path, params ?? { dpbm: shop, qswz: 0 }, method),
    enabled: !!shop && !!token && enabled,
    retry: false,
  });
}
export function useCurrentOrder() {
  const shop = useMallSession((s) => s.shop);
  return useMallQuery<OrderData>('cart', '/xcx/Yw/Ddzr', {
    xsddList: [{ dpbm: shop }],
  });
}
export function useQuantity() {
  const client = useQueryClient();
  const shop = useMallSession((s) => s.shop);
  const token = useMallSession((s) => s.token);
  return useMutation({
    mutationKey: ['mall-quantity'],
    scope: { id: 'mall-quantity' },
    mutationFn: ({
      code,
      quantity,
      operation = 'set',
    }: {
      code: string;
      quantity: number;
      operation?: 'set' | 'increase' | 'decrease';
    }) => {
      const current = client.getQueriesData<OrderData>({
        queryKey: ['mall', shop, token, 'cart'],
      })[0]?.[1];
      return request<OrderData>(
        operation === 'increase'
          ? '/xcx/Yw/Ddjia'
          : operation === 'decrease'
            ? '/xcx/Yw/Ddjian'
            : '/xcx/Yw/Ddtiao',
        {
          xsddList: [
            {
              dpbm: shop,
              wlbm: code,
              xshtmxbh:
                current?.xsddmxList?.find((item) => item.wlbm === code)?.bh ||
                0,
              xshth: current?.xsddList?.[0]?.xshth || '',
              ...(operation === 'set'
                ? { wlsl: Math.max(0, Math.floor(quantity)) }
                : {}),
            },
          ],
        }
      );
    },
    onSuccess: async (data) => {
      const accountKey = ['mall', shop, token];
      if (Array.isArray(data?.xsddmxList)) {
        // Prevent an older in-flight response from overwriting the saved order.
        await client.cancelQueries({
          queryKey: accountKey,
          predicate: (query) =>
            [
              'home',
              'cart',
              'categories',
              'category-tags',
              'detail',
              'products',
            ].includes(String(query.queryKey[3])),
        });
        client.setQueryData(
          [...accountKey, 'cart', { xsddList: [{ dpbm: shop }] }],
          data
        );
        client.setQueriesData({ queryKey: [...accountKey, 'cart'] }, data);
        const quantities = new Map(
          data.xsddmxList.map((item) => [item.wlbm, Number(item.sl)])
        );
        const updateProducts = (products?: Product[]) =>
          products?.map((product) => ({
            ...product,
            wlsl: quantities.get(product.wlbm) ?? 0,
          }));
        client.setQueriesData<HomeData>(
          { queryKey: [...accountKey, 'home'] },
          (home) =>
            home && {
              ...home,
              cpxxsyList: updateProducts(home.cpxxsyList),
              cpbqsyList: home.cpbqsyList?.map((section) => ({
                ...section,
                cpxxsyList: updateProducts(section.cpxxsyList),
              })),
            }
        );
        for (const key of ['categories', 'category-tags', 'detail']) {
          client.setQueriesData<CategoryData>(
            { queryKey: [...accountKey, key] },
            (page) =>
              page && { ...page, cpxxList: updateProducts(page.cpxxList) }
          );
        }
        client.setQueriesData<InfiniteData<{ cpxxList?: Product[] }>>(
          { queryKey: [...accountKey, 'products'] },
          (list) =>
            list && {
              ...list,
              pages: list.pages.map((page) => ({
                ...page,
                cpxxList: updateProducts(page.cpxxList),
              })),
            }
        );
      }
    },
  });
}
