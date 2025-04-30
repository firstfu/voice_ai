import { useState, useEffect } from "react";
import { StyleSheet, View, TouchableOpacity, Platform, StatusBar, BackHandler, Animated as RNAnimated } from "react-native";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, FadeIn, FadeOut } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function NewRecordingScreen() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const recordButtonScale = useSharedValue(1);
  const microphonePulse = useSharedValue(1);

  // 錄音動畫效果
  const pulseAnimation = RNAnimated.loop(
    RNAnimated.sequence([
      RNAnimated.timing(new RNAnimated.Value(1), {
        toValue: 1.2,
        duration: 1000,
        useNativeDriver: true,
      }),
      RNAnimated.timing(new RNAnimated.Value(1.2), {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ])
  );

  // 格式化錄音時間
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hrs > 0 ? `${hrs.toString().padStart(2, "0")}:` : ""}${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // 模擬錄音計時器
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setRecordingTime(prevTime => prevTime + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  // 處理開始/停止錄音
  const handleRecordPress = () => {
    recordButtonScale.value = withSpring(0.9, { damping: 10 });

    setTimeout(() => {
      recordButtonScale.value = withSpring(1, { damping: 8 });
    }, 200);

    if (!isRecording) {
      // 開始錄音
      setIsRecording(true);
      pulseAnimation.start();
    } else {
      // 停止錄音並保存
      setIsRecording(false);
      setIsPaused(false);
      pulseAnimation.stop();

      // 模擬保存錄音
      setTimeout(() => {
        router.push({
          pathname: "/recording/[id]",
          params: { id: "new" },
        });
      }, 1000);
    }
  };

  // 處理暫停/繼續錄音
  const handlePauseResumePress = () => {
    setIsPaused(!isPaused);
  };

  // 動畫樣式
  const recordButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: recordButtonScale.value }],
    };
  });

  // 處理取消錄音
  const handleCancelPress = () => {
    // 停止錄音並確認是否放棄
    if (isRecording) {
      setIsRecording(false);
      setIsPaused(false);
      pulseAnimation.stop();
    }

    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false, // 自定義標題欄，所以禁用預設標題
        }}
      />
      <StatusBar translucent barStyle="light-content" backgroundColor="transparent" />

      {/* 自定義頂部標題欄 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleCancelPress}>
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <ThemedText style={styles.headerTitle}>{isRecording ? "錄音中" : "開始錄音"}</ThemedText>

        <View style={styles.placeholderButton} />
      </View>

      {/* 主內容區 */}
      <View style={styles.content}>
        {/* 錄音狀態文字 */}
        <View style={styles.statusContainer}>
          {isRecording && (
            <Animated.View entering={FadeIn} exiting={FadeOut}>
              <View style={styles.recordingStatus}>
                <View style={[styles.recordingIndicator, isPaused && styles.pausedIndicator]} />
                <ThemedText style={styles.recordingStatusText}>{isPaused ? "已暫停" : "正在錄音"}</ThemedText>
              </View>

              <ThemedText style={styles.timerText}>{formatTime(recordingTime)}</ThemedText>
            </Animated.View>
          )}

          {!isRecording && (
            <Animated.View entering={FadeIn} exiting={FadeOut}>
              <ThemedText style={styles.instructions}>點擊下方按鈕開始錄音</ThemedText>
            </Animated.View>
          )}
        </View>

        {/* 波形動畫 (模擬) */}
        <View style={styles.waveformContainer}>
          {isRecording && !isPaused && (
            <Animated.View style={styles.waveform} entering={FadeIn}>
              {/* 簡單模擬音頻波形 */}
              {Array.from({ length: 30 }).map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.waveformBar,
                    {
                      height: 10 + Math.random() * 60,
                      opacity: Math.random() * 0.5 + 0.5,
                    },
                  ]}
                />
              ))}
            </Animated.View>
          )}
        </View>
      </View>

      {/* 底部控制區 */}
      <View style={styles.controlsContainer}>
        {/* 錄音按鈕 */}
        <AnimatedTouchable style={[styles.recordButton, recordButtonStyle]} onPress={handleRecordPress}>
          <View style={[styles.recordButtonInner, isRecording && styles.stopButton]}>
            {isRecording ? <Ionicons name="square" size={28} color="#FFFFFF" /> : <Ionicons name="mic" size={32} color="#FFFFFF" />}
          </View>
        </AnimatedTouchable>

        {/* 暫停/繼續按鈕 (僅在錄音中顯示) */}
        {isRecording && (
          <TouchableOpacity style={styles.pauseButton} onPress={handlePauseResumePress}>
            <Ionicons name={isPaused ? "play" : "pause"} size={28} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E293B",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  placeholderButton: {
    width: 40,
    height: 40,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  statusContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  recordingStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  recordingIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FF4A6B",
    marginRight: 8,
  },
  pausedIndicator: {
    backgroundColor: "#FFB547",
  },
  recordingStatusText: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  timerText: {
    fontSize: 48,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  instructions: {
    fontSize: 18,
    color: "#FFFFFF",
    opacity: 0.8,
    textAlign: "center",
  },
  waveformContainer: {
    height: 120,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  waveform: {
    flexDirection: "row",
    alignItems: "center",
    height: 80,
    width: "100%",
    justifyContent: "space-between",
  },
  waveformBar: {
    width: 4,
    backgroundColor: "#3A7BFF",
    borderRadius: 2,
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: Platform.OS === "ios" ? 50 : 30,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
  },
  recordButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#3A7BFF",
    justifyContent: "center",
    alignItems: "center",
  },
  stopButton: {
    backgroundColor: "#FF4A6B",
    borderRadius: 8,
  },
  pauseButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
});
