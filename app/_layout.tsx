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

// 擴展全局變量的聲明
declare global {
  var hasCompletedOnboarding: boolean;
}

// 用於跳過引導檢查的全局標記
// 此變量確保在 onboarding 頁面執行 AsyncStorage 寫入後
// _layout 能夠直接獲取正確的狀態，而不需要再從 AsyncStorage 讀取
global.hasCompletedOnboarding = false;

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
        // 如果全局標記已設置，無需從 AsyncStorage 讀取
        if (global.hasCompletedOnboarding) {
          console.log("使用全局狀態: 引導已完成");
          setHasOnboarded(true);
          setIsLoading(false);
          return;
        }

        const hasOnboardedValue = await AsyncStorage.getItem(HAS_ONBOARDED_KEY);
        console.log("OnBoarding 狀態檢查: ", hasOnboardedValue);

        const hasCompleted = hasOnboardedValue === "true";
        setHasOnboarded(hasCompleted);

        // 同步更新全局狀態
        if (hasCompleted) {
          global.hasCompletedOnboarding = true;
        }
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
    const inTabsGroup = firstSegment === "(tabs)";

    console.log(`導航檢查: hasOnboarded=${hasOnboarded}, global=${global.hasCompletedOnboarding}, current segment=${firstSegment}`);

    // 如果全局標記顯示已完成引導但本地狀態尚未更新，更新本地狀態
    if (global.hasCompletedOnboarding && !hasOnboarded) {
      console.log("檢測到全局狀態變更，更新本地狀態");
      setHasOnboarded(true);
      return;
    }

    if (!hasOnboarded && !inOnboardingGroup && !global.hasCompletedOnboarding) {
      // 用戶未完成 onBoarding，導向 onBoarding 頁面
      console.log("用戶未完成引導，導向引導頁");
      setTimeout(() => router.replace("/onboarding"), 100);
    } else if ((hasOnboarded || global.hasCompletedOnboarding) && inOnboardingGroup) {
      // 用戶已完成 onBoarding，但在 onBoarding 頁面，導向主頁
      console.log("用戶已完成引導但在引導頁，導向主頁");
      setTimeout(() => router.replace("/(tabs)"), 100);
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
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="recording" options={{ headerShown: false }} />
        <Stack.Screen name="audio-settings" />
        <Stack.Screen name="premium" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}
