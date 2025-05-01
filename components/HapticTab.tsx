/**
 * 觸覺反饋標籤組件
 *
 * 提供底部標籤點擊時的觸覺反饋功能，特點：
 * - 在iOS平台提供輕度觸覺反饋
 * - 保留底部標籤原始點擊處理功能
 * - 採用平台特定的可壓按組件實現良好體驗
 */

import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { PlatformPressable } from "@react-navigation/elements";
import * as Haptics from "expo-haptics";

export function HapticTab(props: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      {...props}
      onPressIn={ev => {
        if (process.env.EXPO_OS === "ios") {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}
