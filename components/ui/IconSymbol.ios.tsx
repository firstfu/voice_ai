/**
 * 圖標符號組件 (iOS平台)
 *
 * 專為iOS平台提供原生SF Symbols圖標支援，特點：
 * - 直接使用iOS系統原生SF Symbols圖標
 * - 支援權重、顏色和大小自訂
 * - 自動適配深色模式
 * - 提供與其他平台一致的API接口
 */

import { SymbolView, SymbolViewProps, SymbolWeight } from "expo-symbols";
import { StyleProp, ViewStyle } from "react-native";

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight = "regular",
}: {
  name: SymbolViewProps["name"];
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  return (
    <SymbolView
      weight={weight}
      tintColor={color}
      resizeMode="scaleAspectFit"
      name={name}
      style={[
        {
          width: size,
          height: size,
        },
        style,
      ]}
    />
  );
}
