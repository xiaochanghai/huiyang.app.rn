import { Env } from '@env';
import axios from 'axios';
import { Platform } from 'react-native';
import { create } from 'zustand';

import { getItem, setItem } from '@/lib/storage';

type Session = { token: string; shop: string };
const emptySession: Session = { token: '', shop: '' };
export const useMallSession = create<
  Session & {
    ready: boolean;
    hydrate: () => void;
    login: (session: Session) => void;
    logout: () => void;
  }
>((set) => ({
  ...emptySession,
  ready: false,
  hydrate: () => {
    let session = emptySession;
    try {
      session = getItem<Session>('mall-session') || emptySession;
    } catch {
      /* Ignore an invalid persisted session. */
    }
    set({ ...session, ready: true });
  },
  login: (session) => {
    setItem('mall-session', session);
    set(session);
  },
  logout: () => {
    setItem('mall-session', emptySession);
    set(emptySession);
  },
}));

export async function request<T>(
  path: string,
  data?: unknown,
  method: 'POST' | 'GET' | 'PUT' = 'POST'
): Promise<T> {
  const { token } = useMallSession.getState();
  const response = await axios.request({
    baseURL: Env.API_URL,
    url: path,
    method,
    timeout: 60000,
    ...(method === 'GET' ? { params: data } : { data }),
    headers: {
      'Content-Type': 'application/json',
      'tenant-id': '1590229800633634816',
      'platform-type': Platform.OS === 'web' ? 'H5' : 'APP',
      ...(token && path !== '/xcx/Authorize/Login'
        ? { Authorization: token, Token: token }
        : {}),
    },
    validateStatus: () => true,
  });
  let body = response.data;
  const code = body?.Status ?? body?.code;
  const message = body?.Message || body?.msg || '请求失败，请重试';
  if (
    response.status === 401 ||
    response.status === 403 ||
    code === 401 ||
    code === 403 ||
    (body?.Success === false && message.includes('登录超时'))
  ) {
    useMallSession.getState().logout();
    throw new Error('登录已过期，请重新登录');
  }
  if (
    response.status >= 400 ||
    body?.Success === false ||
    (typeof code === 'number' && code !== 0)
  )
    throw new Error(message);
  for (let depth = 0; depth < 5 && body && typeof body === 'object'; depth++) {
    if ('Data' in body) body = body.Data;
    else if ('data' in body) body = body.data;
    else break;
  }
  return body as T;
}

export type Product = {
  wlbm: string;
  wlmc: string;
  gystm?: string;
  cpft?: string;
  jldw?: string;
  jldw_sw?: string;
  dj: number;
  zhj: number;
  wlsl?: number | null;
  zkl_sw?: string;
  iva_sw?: string;
  sj?: number;
  tsje?: number;
  shj?: number;
  cpgdtList?: { bh: number; cpgdt: string }[];
};
export type Tag = {
  bm: string;
  cpbq: string;
  bqft?: string;
  bqsyct?: string;
  bqsygdt?: string;
};
export type Category = {
  bm: string;
  cpdl: string;
  dlct?: string;
  dlft?: string;
};
export type Catalog = {
  bh: number;
  cpcft: string;
  cpcctList?: { bh: number; cpcct: string }[];
};
export type HomeData = {
  cpbqsygdtList?: Tag[];
  cpcList?: Catalog[];
  cpbqsyctList?: Tag[];
  cpbqsyftList?: Tag[];
  cpbqsyList?: (Tag & { cpxxsyList?: Product[] })[];
  cpxxsyList?: Product[];
};
export type CategoryData = {
  cpdlList?: Category[];
  cpbqList?: Tag[];
  cpxxList?: Product[];
};
export type Order = {
  xshth: string;
  jezj: number;
  pcczsj?: string;
  lsdz?: string;
  bz?: string;
  [key: string]: string | number | undefined;
};
export type OrderItem = {
  bh: number;
  wlbm: string;
  wlmc: string;
  cpct?: string;
  cpft?: string;
  sl: number;
  dj: number;
  zhj: number;
};
export type OrderData = { xsddList?: Order[]; xsddmxList?: OrderItem[] };
export type Shop = {
  dpbm: string;
  khmc: string;
  sh: string;
  dpmc: string;
  dpdz: string;
  dpdh: string;
  dpdzyx: string;
  djrq: string;
  zhxdrq: string;
};
export const money = (value: unknown, symbol = '€') =>
  `${symbol}${Number.isFinite(Number(value)) ? Number(value).toFixed(2) : '0.00'}`;
export const productPrice = (product: Product) =>
  Number(product.zhj) > 0 ? product.zhj : product.dj;
export function imageSource(uri?: string) {
  if (!uri || uri.startsWith('/static/'))
    return require('../../../assets/mall/logo.png');
  return {
    uri: /^https?:\/\//.test(uri)
      ? uri
      : `${Env.API_URL.replace(/\/$/, '')}/${uri.replace(/^\//, '')}`,
  };
}
