import { Link, Redirect, Stack, useLocalSearchParams } from 'expo-router';

import { Text, View } from '@/components/ui';
import { paths } from '@/features/mall/ui';

export default function NotFoundScreen() {
  const { messing, ...params } = useLocalSearchParams<{ messing: string[] }>();
  const sourcePath =
    '/' + (Array.isArray(messing) ? messing.join('/') : messing || '');
  const match = Object.values(paths).find(
    (path) => path.replace('/(app)', '') + '/index' === sourcePath
  );
  if (match) return <Redirect href={{ pathname: match, params }} />;
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center p-4">
        <Text className="mb-4 text-2xl font-bold">
          This screen doesn&apos;t exist.
        </Text>

        <Link href="/" className="mt-4">
          <Text className="text-blue-500 underline">Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}
