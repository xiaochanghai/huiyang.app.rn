import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { type OrderData, request, useMallSession } from './api';

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
      if (data?.xsddList)
        client.setQueriesData(
          { queryKey: ['mall', shop, token, 'cart'] },
          data
        );
      await client.invalidateQueries({ queryKey: ['mall'] });
    },
  });
}
