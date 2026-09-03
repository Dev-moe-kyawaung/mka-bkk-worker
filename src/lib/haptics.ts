import { Platform } from 'react-native';

let Haptics: typeof import('expo-haptics') | null = null;

export const tap = async () => {
  if (Platform.OS === 'web') return;
  try {
    if (!Haptics) Haptics = await import('expo-haptics');
    await Haptics.selectionAsync();
  } catch {
    /* haptics unavailable */
  }
};

export const success = async () => {
  if (Platform.OS === 'web') return;
  try {
    if (!Haptics) Haptics = await import('expo-haptics');
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    /* haptics unavailable */
  }
};
