/**
 * 主應用程式佈局
 *
 * 本文件設定了應用程式的根佈局，包括:
 * - 全局主題配置 (僅淺色模式)
 * - 字體載入
 * - 初始化堆疊導航
 * - 啟動畫面控制
 * - onBoarding 流程控制
 */

import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// onBoarding 完成標記的鍵名
const HAS_ONBOARDED_KEY = "hasOnboarded";

// 初始路由控制
function InitialLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  // 檢查用戶是否已完成 onBoarding
  useEffect(() => {
    async function checkOnboardingStatus() {
      try {
        const hasOnboardedValue = await AsyncStorage.getItem(HAS_ONBOARDED_KEY);
        setHasOnboarded(hasOnboardedValue === "true");
      } catch (e) {
        console.error("Failed to get onboarding status", e);
      } finally {
        setIsLoading(false);
      }
    }

    checkOnboardingStatus();
  }, []);

  // 根據 onBoarding 狀態決定導航
  useEffect(() => {
    if (isLoading) return;

    const firstSegment = segments[0] as string;
    const inOnboardingGroup = firstSegment === "onboarding";

    if (!hasOnboarded && !inOnboardingGroup) {
      // 用戶未完成 onBoarding，導向 onBoarding 頁面
      router.replace("/onboarding");
    } else if (hasOnboarded && inOnboardingGroup) {
      // 用戶已完成 onBoarding，但在 onBoarding 頁面，導向主頁
      router.replace("/(tabs)");
    }
  }, [hasOnboarded, segments, isLoading, router]);

  return <></>;
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <InitialLayout />
      <Stack>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="audio-settings" />
        <Stack.Screen name="premium" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}
