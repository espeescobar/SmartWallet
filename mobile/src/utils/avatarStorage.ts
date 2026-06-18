import AsyncStorage from '@react-native-async-storage/async-storage';

const avatarKey = (userId: string) => `avatar_local_${userId}`;

export async function saveLocalAvatar(userId: string, uri: string): Promise<void> {
  await AsyncStorage.setItem(avatarKey(userId), uri);
}

export async function getLocalAvatar(userId: string): Promise<string | null> {
  return AsyncStorage.getItem(avatarKey(userId));
}

export async function removeLocalAvatar(userId: string): Promise<void> {
  await AsyncStorage.removeItem(avatarKey(userId));
}
