import { Redirect } from 'expo-router';

import { paths } from '@/features/mall/ui';
export default function LegacyRoute() {
  return <Redirect href={paths.orders} />;
}
