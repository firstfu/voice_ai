/**
 * 揮手動畫組件
 *
 * 提供一個簡單的揮手動畫表情，功能包括：
 * - 自動播放揮手旋轉動畫（重複4次）
 * - 使用React Native Reanimated實現平滑動畫效果
 * - 適合用於歡迎頁面或友好互動場景
 */

import { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";

export function HelloWave() {
  const rotationAnimation = useSharedValue(0);

  useEffect(() => {
    rotationAnimation.value = withRepeat(
      withSequence(withTiming(25, { duration: 150 }), withTiming(0, { duration: 150 })),
      4 // Run the animation 4 times
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotationAnimation.value}deg` }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <ThemedText style={styles.text}>👋</ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 28,
    lineHeight: 32,
    marginTop: -6,
  },
});
