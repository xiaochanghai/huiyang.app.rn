import { useIsMutating } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Minus,
  Plus,
  UserRound,
} from 'lucide-react-native';
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';

import { imageSource, money, type Product, productPrice } from './api';
import { useQuantity } from './hooks';
import { QuantityDraftContext } from './quantity-drafts';

export const accent = '#ff6b4a';
export const paths = {
  home: '/(app)/pages/home',
  category: '/(app)/pages/product/category',
  cart: '/(app)/pages/user/shopping-cart',
  profile: '/(app)/pages/user/user-center',
  login: '/(app)/pages/login',
  register: '/(app)/sub-pages/user/register',
  password: '/(app)/sub-pages/user/user-setting/password',
  orders: '/(app)/sub-pages/order/order-list',
  detail: '/(app)/sub-pages/product/goods-detail',
  products: '/(app)/sub-pages/product/tag-products',
} as const;
export function Header({
  title,
  back = false,
}: {
  title: string;
  back?: boolean;
}) {
  return (
    <View style={s.header}>
      {back && (
        <Pressable
          accessibilityLabel="返回"
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace(paths.home)
          }
          style={s.back}
        >
          <ArrowLeft size={21} color="#1a1a1a" />
        </Pressable>
      )}
      <Text numberOfLines={1} style={s.headerTitle}>
        {title}
      </Text>
    </View>
  );
}
export function Button({
  title,
  subtitle,
  onPress,
  disabled,
  outline = false,
  muted = false,
  gradient = false,
  radius = 8,
}: {
  title: string;
  subtitle?: string;
  onPress: () => void;
  disabled?: boolean;
  outline?: boolean;
  muted?: boolean;
  gradient?: boolean;
  radius?: number;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        { backgroundColor: '#ff694d', borderRadius: radius },
        outline && s.outline,
        muted && { backgroundColor: '#f8f8f8', borderColor: '#e0e0e0' },
        {
          opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      {!outline && gradient && (
        <LinearGradient
          colors={['#ff8a6e', accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      <Text
        style={[
          s.buttonTitle,
          outline && { color: accent },
          muted && { color: '#333' },
        ]}
      >
        {title}
      </Text>
      {subtitle && (
        <Text
          style={[
            s.buttonSubtitle,
            outline && { color: '#ff9a85' },
            muted && { color: '#999' },
          ]}
        >
          {subtitle}
        </Text>
      )}
    </Pressable>
  );
}
export function Field({
  hint,
  password,
  ...props
}: TextInputProps & { hint: string; password?: boolean }) {
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <View style={[s.field, focused && { borderColor: '#f5b6a8' }]}>
      {password ? (
        <LockKeyhole size={20} color="#c5bdba" />
      ) : (
        <UserRound size={20} color="#c5bdba" />
      )}
      <View style={s.flex}>
        <TextInput
          {...props}
          accessibilityLabel={props.placeholder}
          secureTextEntry={password && !visible}
          autoCapitalize="none"
          placeholderTextColor="#c0b8b5"
          style={s.input}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <Text style={s.hint}>{hint}</Text>
      </View>
      {password && (
        <Pressable
          accessibilityLabel={visible ? '隐藏密码' : '显示密码'}
          hitSlop={10}
          onPress={() => setVisible(!visible)}
        >
          {visible ? (
            <EyeOff size={20} color="#c5bdba" />
          ) : (
            <Eye size={20} color="#c5bdba" />
          )}
        </Pressable>
      )}
    </View>
  );
}
export function Checkbox({
  value,
  onPress,
  title,
  subtitle,
}: {
  value: boolean;
  onPress: () => void;
  title: string;
  subtitle?: string;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: value }}
      onPress={onPress}
      style={[s.row, { gap: 6, minHeight: 40 }]}
    >
      <View
        style={[
          s.check,
          value && { backgroundColor: accent, borderColor: accent },
        ]}
      >
        {value && <Check size={12} color="white" />}
      </View>
      <View>
        <Text style={{ fontSize: 11, color: '#666' }}>{title}</Text>
        {subtitle && (
          <Text style={{ fontSize: 9, color: '#aaa' }}>{subtitle}</Text>
        )}
      </View>
    </Pressable>
  );
}
export function Status({
  loading,
  error,
  empty,
  retry,
}: {
  loading?: boolean;
  error?: Error | null;
  empty?: string;
  retry?: () => void;
}) {
  if (loading)
    return (
      <View style={s.status}>
        <ActivityIndicator color={accent} />
        <Text style={s.muted}>加载中...</Text>
      </View>
    );
  if (error)
    return (
      <View style={s.status}>
        <Text style={s.error}>{error.message}</Text>
        {retry && (
          <Pressable onPress={retry} style={s.retry}>
            <Text style={{ color: accent }}>重试 / Reintentar</Text>
          </Pressable>
        )}
      </View>
    );
  return empty ? (
    <View style={s.status}>
      <Text style={s.muted}>{empty}</Text>
    </View>
  ) : null;
}
export function Quantity({
  code,
  quantity,
}: {
  code: string;
  quantity: number;
}) {
  const mutation = useQuantity();
  const busy = useIsMutating({ mutationKey: ['mall-quantity'] }) > 0;
  const [draft, setDraft] = useState(String(quantity));
  const draftRef = useRef(String(quantity));
  const confirmed = useRef(quantity);
  const pending = useRef<Promise<void> | null>(null);
  const registry = useContext(QuantityDraftContext);
  const registrationKey = useRef({});
  useEffect(() => {
    confirmed.current = quantity;
    if (!pending.current) {
      draftRef.current = String(quantity);
      setDraft(String(quantity));
    }
  }, [quantity]);
  const { mutateAsync } = mutation;
  const commit = useCallback(
    async (
      value: number,
      operation: 'set' | 'increase' | 'decrease' = 'set'
    ) => {
      if (pending.current) await pending.current;
      if (!Number.isFinite(value)) {
        throw new Error('请输入有效的商品数量');
      }
      const next = Math.max(0, Math.floor(value));
      draftRef.current = String(next);
      setDraft(String(next));
      if (next === confirmed.current) return;
      const work = (async () => {
        try {
          await mutateAsync({ code, quantity: next, operation });
          confirmed.current = next;
        } catch (error) {
          draftRef.current = String(confirmed.current);
          setDraft(draftRef.current);
          throw error;
        }
      })();
      pending.current = work;
      try {
        await work;
      } finally {
        if (pending.current === work) pending.current = null;
      }
    },
    [code, mutateAsync]
  );
  useEffect(
    () =>
      registry?.register(registrationKey.current, () =>
        commit(Number(draftRef.current))
      ),
    [registry, commit]
  );
  const update = (
    value: number,
    operation: 'set' | 'increase' | 'decrease' = 'set'
  ) => {
    void commit(value, operation).catch(() => {
      /* The mutation renders its error; submit propagates it. */
    });
  };
  return (
    <View>
      <View
        style={[
          s.quantity,
          quantity > 0 && { borderColor: accent },
          busy && { opacity: 0.5 },
        ]}
      >
        <Pressable
          accessibilityLabel="减少数量"
          disabled={busy || quantity <= 0}
          onPress={() => update(quantity - 1, 'decrease')}
          style={s.qtyButton}
        >
          <Minus size={17} color={quantity <= 0 ? '#ccc' : '#666'} />
        </Pressable>
        <TextInput
          accessibilityLabel="商品数量"
          editable={!busy}
          keyboardType="number-pad"
          value={draft}
          onChangeText={(value) => {
            draftRef.current = value;
            setDraft(value);
          }}
          onEndEditing={() => update(Number(draftRef.current))}
          style={s.qtyInput}
        />
        <Pressable
          accessibilityLabel="增加数量"
          disabled={busy}
          onPress={() => update(quantity + 1, 'increase')}
          style={s.qtyButton}
        >
          <Plus size={17} color="#666" />
        </Pressable>
      </View>
      {mutation.error && <Text style={s.error}>{mutation.error.message}</Text>}
    </View>
  );
}
export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <View style={s.grid}>
      {products.map((product) => (
        <View style={s.product} key={product.wlbm}>
          <Pressable
            onPress={() =>
              router.push({
                pathname: paths.detail,
                params: { id: product.wlbm },
              })
            }
          >
            <View style={s.productImage}>
              <Image
                source={imageSource(product.cpft)}
                style={{ width: '80%', height: '80%' }}
                resizeMode="contain"
              />
            </View>
            <View style={{ padding: 10 }}>
              <Text
                numberOfLines={1}
                style={{ fontSize: 13, fontWeight: '500' }}
              >
                {product.wlmc}
              </Text>
              <Text numberOfLines={1} style={s.hint}>
                {product.gystm}
              </Text>
              <View style={[s.row, { marginTop: 6 }]}>
                <Text style={{ fontWeight: '600' }}>
                  {money(productPrice(product), '')}
                </Text>
                {Number(product.zhj) > 0 &&
                  Number(product.zhj) !== Number(product.dj) && (
                    <Text style={s.oldPrice}>{money(product.dj, '')}</Text>
                  )}
                <Text style={[s.muted, { marginLeft: 'auto', fontSize: 11 }]}>
                  {product.jldw_sw || product.jldw}
                </Text>
              </View>
            </View>
          </Pressable>
          <View style={{ paddingHorizontal: 10 }}>
            <Quantity code={product.wlbm} quantity={product.wlsl || 0} />
          </View>
        </View>
      ))}
    </View>
  );
}
export const s = StyleSheet.create({
  flex: { flex: 1 },
  page: { flex: 1, backgroundColor: '#f5f5f5' },
  row: { flexDirection: 'row', alignItems: 'center' },
  header: {
    height: 44,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomColor: '#f0f0f0',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    maxWidth: '78%',
  },
  back: { position: 'absolute', left: 12, padding: 10, zIndex: 1 },
  button: {
    minHeight: 52,
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 7,
  },
  outline: { backgroundColor: '#fff', borderWidth: 1, borderColor: accent },
  buttonTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 3,
  },
  buttonSubtitle: {
    fontSize: 10,
    color: '#ffffffc0',
    letterSpacing: 1,
    marginTop: 2,
  },
  field: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f0e8e5',
    borderRadius: 7,
    marginBottom: 11,
  },
  input: { minHeight: 25, padding: 0, fontSize: 14, color: '#1a1a1a' },
  hint: { color: '#b5adaa', fontSize: 10, marginTop: 3 },
  check: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: '#d5cdca',
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  status: { padding: 24, alignItems: 'center', gap: 10 },
  muted: { fontSize: 12, color: '#999' },
  error: { color: '#c44731', fontSize: 12, paddingVertical: 6 },
  retry: { padding: 10 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 10,
  },
  product: {
    width: '48%',
    flexGrow: 1,
    maxWidth: '50%',
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    paddingBottom: 10,
  },
  productImage: {
    height: 140,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  oldPrice: {
    fontSize: 11,
    color: '#999',
    textDecorationLine: 'line-through',
    marginLeft: 4,
  },
  quantity: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
  },
  qtyButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 30,
    height: 34,
  },
  qtyInput: {
    width: 38,
    textAlign: 'center',
    padding: 0,
    fontSize: 12,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#e0e0e0',
    color: '#555',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 7,
    marginHorizontal: 8,
    marginTop: 8,
    padding: 10,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#f0f0f0',
    paddingVertical: 10,
  },
});
