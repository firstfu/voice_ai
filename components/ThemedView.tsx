/**
 * 主題視圖組件
 *
 * 提供根據系統主題自動適應的視圖容器，功能包括：
 * - 自動根據淺色/深色主題切換背景顏色
 * - 可自訂淺色/深色模式下的背景顏色
 * - 保留原生View組件的所有屬性和功能
 */

import { View, type ViewProps } from "react-native";

import { useThemeColor } from "@/hooks/useThemeColor";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, "background");

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
