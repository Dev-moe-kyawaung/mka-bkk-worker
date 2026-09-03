import Ionicons from '@expo/vector-icons/Ionicons';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import React from 'react';
import { useWindowDimensions } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { CaseStudyScreen } from './src/screens/CaseStudyScreen';
import { ContactScreen } from './src/screens/ContactScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { SkillsScreen } from './src/screens/SkillsScreen';
import { WorkScreen } from './src/screens/WorkScreen';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { mono } from './src/theme/tokens';
import { RootStackParamList, TabParamList } from './src/navigation/types';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const TAB_ICONS: Record<
  keyof TabParamList,
  { active: keyof typeof Ionicons.glyphMap; idle: keyof typeof Ionicons.glyphMap }
> = {
  Reel: { active: 'cube', idle: 'cube-outline' },
  Work: { active: 'albums', idle: 'albums-outline' },
  Skills: { active: 'planet', idle: 'planet-outline' },
  Contact: { active: 'paper-plane', idle: 'paper-plane-outline' },
};

const Tabs = () => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: {
          backgroundColor: colors.navBg,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 58 + insets.bottom,
          paddingBottom: insets.bottom + 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: mono,
          letterSpacing: 0.4,
          fontWeight: '700',
        },
        tabBarHideOnKeyboard: true,
        tabBarIcon: ({ color, focused }) => {
          const icons = TAB_ICONS[route.name];
          return <Ionicons name={focused ? icons.active : icons.idle} size={19} color={color} />;
        },
        sceneStyle: {
          backgroundColor: isDark ? colors.bg : colors.bg,
        },
        tabBarItemStyle: {
          maxWidth: width > 700 ? 200 : undefined,
        },
      })}
    >
      <Tab.Screen name="Reel" component={HomeScreen} />
      <Tab.Screen name="Work" component={WorkScreen} />
      <Tab.Screen name="Skills" component={SkillsScreen} />
      <Tab.Screen name="Contact" component={ContactScreen} />
    </Tab.Navigator>
  );
};

const RootNavigator = () => {
  const { colors, isDark } = useTheme();

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme : DefaultTheme).colors,
      primary: colors.accent,
      background: colors.bg,
      card: colors.bg,
      text: colors.text,
      border: colors.border,
      notification: colors.accent3,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="Tabs" component={Tabs} />
        <Stack.Screen
          name="CaseStudy"
          component={CaseStudyScreen}
          options={{ animation: 'slide_from_right' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <RootNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
