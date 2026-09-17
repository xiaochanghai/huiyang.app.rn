import { isLiquidGlassAvailable } from 'expo-glass-effect';
import {
  router,
  Stack,
  // useRouter
} from 'expo-router';
import { HeaderBackButton } from 'expo-router/build/react-navigation/elements';
import React from 'react';
import { StatusBar, type StatusBarStyle } from 'react-native';

import { useAppColorScheme } from '@/lib/hooks';
import type { TxKeyPath } from '@/lib/i18n';
import { translate } from '@/lib/i18n';

import { ChevronLeft } from './icons';

// import { FontAwesome, GroupEnum } from './icons';

export type NavHeaderProps = {
  leftShown?: boolean;
  title?: string;
  headerBackTitle?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  tx?: TxKeyPath;
  backgroundColor?: string;
  tintColor?: string;
  statusBarStyle?: StatusBarStyle;
  onBackPress?: () => void;
};
export const NavHeader = ({
  leftShown = true,
  title = '',
  headerBackTitle = '',
  left = null,
  right = null,
  tx,
  backgroundColor,
  tintColor,
  statusBarStyle,
  onBackPress,
}: NavHeaderProps) => {
  // const router = useRouter();
  const hasCustomLeft = !!left;
  const resolvedTintColor = tintColor ?? '#000';
  const { isDark } = useAppColorScheme();

  return (
    <>
      <StatusBar
        barStyle={statusBarStyle ?? 'dark-content'}
        backgroundColor="transparent"
        translucent
        animated={false}
      />
      <Stack.Screen
        options={{
          title: tx ? translate(tx) : title,
          headerTintColor: resolvedTintColor,
          headerBackTitle: headerBackTitle,
          headerBackButtonDisplayMode: 'minimal',
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor:
              backgroundColor ?? (isDark ? '#171717' : '#ffffff'),
          },
          headerBackVisible: false,
          headerRight: () => right && <>{right}</>,
          headerLeft: (props) =>
            hasCustomLeft ? (
              <>{left}</>
            ) : leftShown && (onBackPress || props.canGoBack) ? (
              <HeaderBackButton
                {...props}
                backImage={() => (
                  <ChevronLeft
                    color={
                      isLiquidGlassAvailable() ? '#000' : resolvedTintColor
                    }
                  />
                )}
                displayMode="minimal"
                onPress={onBackPress ?? router.back}
                pressColor="transparent"
                // pressOpacity={1}
                // tintColor={resolvedTintColor}
                // tintColor={isLiquidGlassAvailable() ? '#000' : resolvedTintColor}
              />
            ) : null,
        }}
      />
    </>
  );
};
