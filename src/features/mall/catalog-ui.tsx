import { router } from 'expo-router';
import { Image, StyleSheet } from 'react-native';

import { imageSource, type Tag } from './api';
import { accent, paths } from './ui';

export function openTag(tag: Tag) {
  router.push({
    pathname: paths.products,
    params: { tagId: tag.bm, tagName: tag.cpbq },
  });
}
export const c = StyleSheet.create({
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

export function RemoteImage({ uri }: { uri?: string }) {
  return (
    <Image
      source={imageSource(uri)}
      style={{ width: '100%', height: 120 }}
      resizeMode="contain"
    />
  );
}
