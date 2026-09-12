import { Redirect } from 'expo-router';

import { get as getUserInfoData } from '@/lib/user/utils';

export default function Index() {
  const userInfo = getUserInfoData();
  if (userInfo?.UserType === 'Chat') return <Redirect href="/(chat)" />;
  return <Redirect href="/(app)" />;
}
