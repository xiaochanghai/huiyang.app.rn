import { useIsMutating } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
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

import { FontAwesome } from '@/components/ui/icons';

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
    <View className={s.header}>
      {back && (
        <Pressable
          accessibilityLabel="返回"
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace(paths.home)
          }
          className={s.back}
        >
          <FontAwesome name="arrow-left" size={21} color="#1a1a1a" />
        </Pressable>
      )}
      <Text numberOfLines={1} className={s.headerTitle}>
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
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      accessibilityState={{ disabled: !!disabled }}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      className={`${s.button} ${outline ? 'border' : ''}`}
      style={{
        backgroundColor: muted ? '#f8f8f8' : outline ? '#fff' : '#ff694d',
        borderRadius: radius,
        borderColor: muted ? '#e0e0e0' : outline ? accent : undefined,
        opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      }}
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
        className={s.buttonTitle}
        style={
          muted ? { color: '#333' } : outline ? { color: accent } : undefined
        }
      >
        {title}
      </Text>
      {subtitle && (
        <Text
          className={`${s.buttonSubtitle} ${muted ? 'text-[#999]' : outline ? 'text-[#ff9a85]' : 'text-[#ffffffc0]'}`}
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
}: TextInputProps & { hint?: string; password?: boolean }) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <View
      className={`${s.field} ${focused ? 'border-[#f5b6a8]' : 'border-[#f0e8e5]'}`}
    >
      {password ? (
        <FontAwesome name="lock" size={20} color="#c5bdba" />
      ) : (
        <FontAwesome name="user-o" size={20} color="#c5bdba" />
      )}
      <View className={s.flex}>
        <TextInput
          {...props}
          accessibilityLabel={props.placeholder}
          secureTextEntry={password && !visible}
          autoCapitalize="none"
          placeholderTextColor="#c0b8b5"
          className={s.input}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {!!hint && <Text className={s.hint}>{hint}</Text>}
      </View>
      {password && (
        <Pressable
          accessibilityLabel={t(
            visible ? 'login.hide_password' : 'login.show_password'
          )}
          hitSlop={10}
          onPress={() => setVisible(!visible)}
        >
          {visible ? (
            <FontAwesome name="eye-slash" size={20} color="#c5bdba" />
          ) : (
            <FontAwesome name="eye" size={20} color="#c5bdba" />
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
      className={`${s.row} min-h-10 gap-1.5`}
    >
      <View
        className={s.check}
        style={
          value ? { backgroundColor: accent, borderColor: accent } : undefined
        }
      >
        {value && <FontAwesome name="check" size={12} color="white" />}
      </View>
      <View>
        <Text className="text-[11px] text-[#666]">{title}</Text>
        {subtitle && <Text className="text-[9px] text-[#aaa]">{subtitle}</Text>}
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
      <View className={s.status}>
        <ActivityIndicator color={accent} />
        <Text className={s.muted}>加载中...</Text>
      </View>
    );
  if (error)
    return (
      <View className={s.status}>
        <Text className={s.error}>{error.message}</Text>
        {retry && (
          <Pressable onPress={retry} className={s.retry}>
            <Text style={{ color: accent }}>重试 / Reintentar</Text>
          </Pressable>
        )}
      </View>
    );
  return empty ? (
    <View className={s.status}>
      <Text className={s.muted}>{empty}</Text>
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
  const operations = useRef<((quantity: number) => number)[]>([]);
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
    (value: number, operation: 'set' | 'increase' | 'decrease' = 'set') => {
      if (!Number.isFinite(value))
        return Promise.reject(new Error('请输入有效的商品数量'));
      const apply = (current: number) =>
        Math.max(
          0,
          Math.floor(
            operation === 'increase'
              ? current + 1
              : operation === 'decrease'
                ? current - 1
                : value
          )
        );
      if (operation === 'decrease' && Number(draftRef.current) <= 0)
        return Promise.resolve();
      operations.current.push(apply);
      const showPending = () => {
        draftRef.current = String(
          operations.current.reduce(
            (current, change) => change(current),
            confirmed.current
          )
        );
        setDraft(draftRef.current);
      };
      // Reflect every tap immediately; responses reconcile the remaining queued taps.
      showPending();
      const previous = pending.current;
      const work = (async () => {
        await previous?.catch(() => {});
        try {
          const next = apply(confirmed.current);
          if (next === confirmed.current) return;
          const result = await mutateAsync({ code, quantity: next, operation });
          confirmed.current = Array.isArray(result?.xsddmxList)
            ? Number(
                result.xsddmxList.find((item) => item.wlbm === code)?.sl ?? 0
              )
            : next;
        } finally {
          operations.current = operations.current.filter(
            (change) => change !== apply
          );
          showPending();
        }
      })();
      pending.current = work;
      return work.finally(() => {
        if (pending.current === work) pending.current = null;
      });
    },
    [code, mutateAsync]
  );
  useEffect(
    () =>
      registry?.register(registrationKey.current, async () => {
        while (pending.current) await pending.current;
        await commit(Number(draftRef.current));
      }),
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
        className={s.quantity}
        style={Number(draft) > 0 ? { borderColor: accent } : undefined}
      >
        <Pressable
          accessibilityLabel="减少数量"
          onPress={() => update(quantity - 1, 'decrease')}
          className={s.qtyButton}
        >
          <FontAwesome
            name="minus"
            size={17}
            color={Number(draft) <= 0 ? '#ccc' : '#666'}
          />
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
          onEndEditing={() => {
            if (!pending.current) update(Number(draftRef.current));
          }}
          className={s.qtyInput}
        />
        <Pressable
          accessibilityLabel="增加数量"
          onPress={() => update(quantity + 1, 'increase')}
          className={s.qtyButton}
        >
          <FontAwesome name="plus" size={17} color="#666" />
        </Pressable>
      </View>
      {mutation.error && (
        <Text className={s.error}>{mutation.error.message}</Text>
      )}
    </View>
  );
}
export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <View className={s.grid}>
      {products.map((product) => (
        <View className={s.product} key={product.wlbm}>
          <Pressable
            onPress={() =>
              router.push({
                pathname: paths.detail,
                params: { id: product.wlbm },
              })
            }
          >
            <View className={s.productImage}>
              <Image
                source={imageSource(product.cpft)}
                className="size-4/5"
                resizeMode="contain"
              />
            </View>
            <View className="p-2.5">
              <Text numberOfLines={1} className="text-[13px] font-medium">
                {product.wlmc}
              </Text>
              <Text numberOfLines={1} className={s.hint}>
                {product.gystm}
              </Text>
              <View className={`${s.row} mt-1.5`}>
                <Text className="font-semibold">
                  {money(productPrice(product), '')}
                </Text>
                {Number(product.zhj) > 0 &&
                  Number(product.zhj) !== Number(product.dj) && (
                    <Text className={s.oldPrice}>{money(product.dj, '')}</Text>
                  )}
                <Text className="ml-auto text-[11px] text-[#999]">
                  {product.jldw_sw || product.jldw}
                </Text>
              </View>
            </View>
          </Pressable>
          <View className="px-2.5">
            <Quantity code={product.wlbm} quantity={product.wlsl || 0} />
          </View>
        </View>
      ))}
    </View>
  );
}
export const s = {
  flex: 'flex-1',
  page: 'flex-1 bg-neutral-100',
  row: 'flex-row items-center',
  header:
    'h-11 items-center justify-center border-b-hairline web:border-b border-b-[#f0f0f0] bg-white',
  headerTitle: 'max-w-[78%] text-[16px] font-semibold text-[#1a1a1a]',
  back: 'absolute left-3 z-[1] p-2.5',
  button:
    'my-[7px] min-h-[52px] items-center justify-center overflow-hidden rounded-lg',
  buttonTitle: 'text-[16px] font-semibold tracking-[3px] text-white',
  buttonSubtitle: 'mt-0.5 text-[10px] tracking-[1px]',
  field:
    'mb-[11px] flex-row items-center gap-2 rounded-[7px] border bg-white px-3 py-[9px]',
  input: 'min-h-[25px] p-0 text-[14px] text-[#1a1a1a]',
  hint: 'mt-[3px] text-[10px] text-[#b5adaa]',
  check:
    'size-4 items-center justify-center rounded-[3px] border border-[#d5cdca]',
  status: 'items-center gap-2.5 p-6',
  muted: 'text-[12px] text-[#999]',
  error: 'py-1.5 text-[12px] text-[#c44731]',
  retry: 'p-2.5',
  grid: 'flex-row flex-wrap gap-2.5 px-3',
  product:
    'w-[48%] max-w-[50%] grow overflow-hidden rounded-lg bg-white pb-2.5',
  productImage: 'h-[140px] items-center justify-center bg-neutral-100',
  oldPrice: 'ml-1 text-[11px] text-[#999] line-through',
  quantity: 'h-9 flex-row items-center rounded-md border border-[#e0e0e0]',
  qtyButton: 'h-[34px] min-w-[30px] flex-1 items-center justify-center',
  qtyInput:
    'w-[38px] border-x border-[#e0e0e0] p-0 text-center text-[12px] text-[#555]',
  card: 'mx-2 mt-2 rounded-[7px] bg-white p-2.5',
  divider: 'border-b-hairline web:border-b border-[#f0f0f0] py-2.5',
};
