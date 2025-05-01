/**
 * 標籤欄背景組件 (iOS平台)
 *
 * 專為iOS平台提供模糊效果標籤欄背景，特點：
 * - 使用iOS原生模糊效果
 * - 自動適配系統深色/淺色主題
 * - 提供標籤欄溢出空間計算功能
 * - 視覺效果與iOS系統標籤欄一致
 */

import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function BlurTabBarBackground() {
  return (
    <BlurView
      // System chrome material automatically adapts to the system's theme
      // and matches the native tab bar appearance on iOS.
      tint="systemChromeMaterial"
      intensity={100}
      style={StyleSheet.absoluteFill}
    />
  );
}

export function useBottomTabOverflow() {
  const tabHeight = useBottomTabBarHeight();
  const { bottom } = useSafeAreaInsets();
  return tabHeight - bottom;
}
