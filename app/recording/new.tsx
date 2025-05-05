/**
 * 新錄音頁面
 *
 * 本頁面提供錄音創建功能，包括:
 * - 錄音開始/暫停/繼續/停止控制
 * - 錄音時間計時與顯示
 * - 錄音狀態視覺化反饋（波形動畫）
 * - 錄音完成後的導航處理
 */

import { useState, useEffect, useRef } from "react";
import { StyleSheet, View, TouchableOpacity, Platform, StatusBar, BackHandler, Animated as RNAnimated, Text, Alert } from "react-native";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, FadeIn, FadeOut, withTiming, withRepeat, withSequence, Easing } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from "expo-av";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// 預先生成波形數據，避免重繪時隨機生成
const generateWaveformData = (length: number) => {
  // 創建一個具有韻律感的波形數據陣列
  const centerIndex = Math.floor(length / 2);
  const maxDistance = Math.max(centerIndex, length - centerIndex - 1);

  return Array.from({ length }).map((_, index) => {
    // 計算與中心的距離比例 (0 到 1 之間)
    const distanceFromCenter = Math.abs(index - centerIndex) / maxDistance;
    // 中心高度大，兩邊逐漸降低
    const baseHeightFactor = 1 - Math.pow(distanceFromCenter, 2) * 0.6;

    return {
      baseHeight: 15 + baseHeightFactor * 45, // 基礎高度 (中間高，兩邊低)
      animationOffset: index * 100, // 有規律的偏移量，創造波浪效果
      frequency: 600 + Math.random() * 400, // 頻率變化
      phase: index * (Math.PI / 6), // 相位差異，使波形有節奏感
    };
  });
};

// 生成30個波形柱狀數據
const waveformData = generateWaveformData(30);

export default function NewRecordingScreen() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingInstance, setRecordingInstance] = useState<Audio.Recording | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);

  const recordButtonScale = useSharedValue(1);
  const pauseButtonScale = useSharedValue(1);
  const microphonePulse = useSharedValue(1);
  // 全局動畫計時器
  const animationTime = useSharedValue(0);

  // 為每個波形柱創建動畫值
  const waveformAnimatedValues = useRef(waveformData.map(() => useSharedValue(0))).current;

  // 提前為每個波形柱創建動畫樣式，避免在循環渲染中使用hooks
  const barStyles = useRef(
    waveformAnimatedValues.map((animValue, index) =>
      useAnimatedStyle(() => {
        const { baseHeight, phase } = waveformData[index];

        // 使用正弦函數創建平滑的韻律波動
        const rhythmicFactor = isPaused ? 0.3 : 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(animationTime.value / 500 + phase)) * animValue.value;

        return {
          height: baseHeight * rhythmicFactor,
          opacity: 0.5 + rhythmicFactor * 0.5,
        };
      })
    )
  ).current;

  // 啟動波形動畫
  useEffect(() => {
    let animationFrame: number;
    let startTime: number;

    if (isRecording && !isPaused) {
      // 啟動全局動畫計時器
      const animateFrame = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;

        // 更新全局動畫時間
        animationTime.value = elapsed;

        // 使用正弦波和變化頻率為每個波形柱創建自然的波動
        waveformAnimatedValues.forEach((animValue, index) => {
          const { frequency, phase } = waveformData[index];

          // 正弦波的組合創建更複雜的波形
          const value =
            0.6 + 0.2 * Math.sin(elapsed / frequency + phase) + 0.1 * Math.sin(elapsed / (frequency / 2) + phase * 2) + 0.1 * Math.sin(elapsed / (frequency / 3) + phase / 2);

          animValue.value = withTiming(value, { duration: 100 });
        });

        // 請求下一幀
        animationFrame = requestAnimationFrame(animateFrame);
      };

      // 開始動畫循環
      animationFrame = requestAnimationFrame(animateFrame);

      // 清理函數
      return () => {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
      };
    } else {
      // 暫停時將波形設為靜止低振幅
      waveformAnimatedValues.forEach(animValue => {
        animValue.value = withTiming(0.2, { duration: 300 });
      });
    }
  }, [isRecording, isPaused, waveformAnimatedValues, animationTime]);

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
    let interval: ReturnType<typeof setInterval>;

    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setRecordingTime(prevTime => prevTime + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  // 權限檢查
  const checkAndRequestAudioPermissions = async () => {
    const { status } = await Audio.getPermissionsAsync();
    if (status === "granted") return true;
    const { status: newStatus } = await Audio.requestPermissionsAsync();
    return newStatus === "granted";
  };

  // 開始錄音
  const startRecording = async () => {
    const hasPermission = await checkAndRequestAudioPermissions();
    if (!hasPermission) {
      Alert.alert("需要麥克風權限", "請在設定中允許麥克風權限");
      return;
    }
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
    });
    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    await recording.startAsync();
    setRecordingInstance(recording);
    setIsRecording(true);
    setIsPaused(false);
  };

  // 暫停錄音
  const pauseRecording = async () => {
    if (recordingInstance) {
      await recordingInstance.pauseAsync();
      setIsPaused(true);
    }
  };

  // 繼續錄音
  const resumeRecording = async () => {
    if (recordingInstance) {
      await recordingInstance.startAsync();
      setIsPaused(false);
    }
  };

  // 停止錄音
  const stopRecording = async () => {
    if (!recordingInstance) return;
    await recordingInstance.stopAndUnloadAsync();
    const uri = recordingInstance.getURI();
    setRecordingUri(uri);
    setIsRecording(false);
    setIsPaused(false);
    setRecordingInstance(null);
    // 跳轉或儲存錄音檔案
    router.push("/(tabs)/recordings");
  };

  // 修改 handleRecordPress
  const handleRecordPress = async () => {
    recordButtonScale.value = withSpring(0.9, { damping: 10 });
    setTimeout(() => {
      recordButtonScale.value = withSpring(1, { damping: 8 });
    }, 200);
    if (!isRecording) {
      await startRecording();
      pulseAnimation.start();
    } else {
      await stopRecording();
      pulseAnimation.stop();
    }
  };

  // 修改 handlePauseResumePress
  const handlePauseResumePress = async () => {
    pauseButtonScale.value = withSpring(0.9, { damping: 10 });
    setTimeout(() => {
      pauseButtonScale.value = withSpring(1, { damping: 8 });
    }, 200);
    if (isPaused) {
      await resumeRecording();
    } else {
      await pauseRecording();
    }
  };

  // 修改 handleCancelPress
  const handleCancelPress = async () => {
    // 停止錄音並確認是否放棄
    if (isRecording && recordingInstance) {
      await stopRecording();
      pulseAnimation.stop();
    }
    router.back();
  };

  // 動畫樣式
  const recordButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: recordButtonScale.value }],
    };
  });

  const pauseButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pauseButtonScale.value }],
    };
  });

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
        {/* 錄音時間 - 移動到狀態指示器上方 */}
        {isRecording && (
          <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.timerContainer}>
            <ThemedText style={styles.timerText}>{formatTime(recordingTime)}</ThemedText>
          </Animated.View>
        )}

        {/* 錄音狀態文字 */}
        <View style={styles.statusContainer}>
          {isRecording && (
            <Animated.View entering={FadeIn} exiting={FadeOut}>
              <View style={styles.recordingStatus}>
                <View style={[styles.recordingIndicator, isPaused && styles.pausedIndicator]} />
                <ThemedText style={styles.recordingStatusText}>{isPaused ? "已暫停" : "正在錄音"}</ThemedText>
              </View>
            </Animated.View>
          )}

          {!isRecording && (
            <Animated.View entering={FadeIn} exiting={FadeOut}>
              <ThemedText style={styles.instructions}>點擊下方按鈕開始錄音</ThemedText>
            </Animated.View>
          )}
        </View>

        {/* 波形動畫 (優化版) */}
        <View style={styles.waveformContainer}>
          {isRecording && (
            <Animated.View style={styles.waveform} entering={FadeIn}>
              {/* 使用預先生成的動畫樣式 */}
              {waveformData.map((_, index) => (
                <Animated.View key={index} style={[styles.waveformBar, barStyles[index]]} />
              ))}
            </Animated.View>
          )}
        </View>
      </View>

      {/* 底部控制區 */}
      <View style={styles.controlsContainer}>
        {/* 暫停/繼續按鈕 (僅在錄音中顯示) */}
        {isRecording && (
          <AnimatedTouchable style={[styles.pauseButton, pauseButtonStyle]} onPress={handlePauseResumePress}>
            <LinearGradient colors={isPaused ? ["#3A7BFF", "#00C2A8"] : ["#F59E0B", "#FF4A6B"]} style={styles.pauseButtonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Ionicons name={isPaused ? "play" : "pause"} size={24} color="#FFFFFF" />
            </LinearGradient>
          </AnimatedTouchable>
        )}

        {/* 錄音按鈕 */}
        <AnimatedTouchable style={[styles.recordButton, recordButtonStyle]} onPress={handleRecordPress}>
          <LinearGradient colors={isRecording ? ["#FF4A6B", "#F59E0B"] : ["#3A7BFF", "#00C2A8"]} style={styles.recordButtonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            {isRecording ? <Ionicons name="square" size={28} color="#FFFFFF" /> : <Ionicons name="mic" size={32} color="#FFFFFF" />}
          </LinearGradient>
        </AnimatedTouchable>
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
  timerContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  statusContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  recordingStatus: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
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
    fontSize: 64,
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: 76,
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
    marginTop: 20,
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
    gap: 20,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 6,
  },
  recordButtonGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  pauseButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 5,
  },
  pauseButtonGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
});
