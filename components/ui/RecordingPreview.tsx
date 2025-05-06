/**
 * 錄音預覽組件
 *
 * 提供錄音完成後的預覽功能，包括：
 * - 音訊播放控制（播放/暫停/進度控制）
 * - 錄音波形視覺化顯示
 * - 錄音命名編輯
 * - 儲存和捨棄選項
 */

import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, TouchableOpacity, TextInput, Dimensions, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { Audio } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn, FadeOut, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

interface RecordingPreviewProps {
  recordingUri: string;
  recordingDuration: number;
  onSave: () => void;
  onDiscard: () => void;
}

// 產生靜態的波形顯示資料
const generateWaveformData = (length: number) => {
  // 創建具有韻律感的波形數據陣列
  return Array.from({ length }).map(() => {
    const height = 0.2 + Math.random() * 0.6; // 介於 0.2 和 0.8 之間的隨機高度
    return height;
  });
};

// 預生成波形資料
const waveformData = generateWaveformData(60);

export default function RecordingPreview({ recordingUri, recordingDuration, onSave, onDiscard }: RecordingPreviewProps) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(recordingDuration * 1000); // 轉為毫秒
  const [recordingName, setRecordingName] = useState(() => {
    // 產生包含當前時間的預設錄音名稱
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `新錄音 ${year}-${month}-${day} ${hours}:${minutes}`;
  });

  const playButtonScale = useSharedValue(1);
  const saveButtonScale = useSharedValue(1);
  const discardButtonScale = useSharedValue(1);

  const inputRef = useRef<TextInput>(null);

  // 載入音訊
  useEffect(() => {
    loadSound();
    return () => {
      unloadSound();
    };
  }, [recordingUri]);

  const loadSound = async () => {
    try {
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: recordingUri }, { shouldPlay: false }, onPlaybackStatusUpdate);
      setSound(newSound);
    } catch (error) {
      console.error("載入音訊失敗:", error);
    }
  };

  const unloadSound = async () => {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
    }
  };

  // 播放狀態更新回調
  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPlaybackPosition(status.positionMillis || 0);
      setPlaybackDuration(status.durationMillis || playbackDuration);
      setIsPlaying(status.isPlaying);

      // 播放完成時自動重置
      if (status.didJustFinish) {
        sound?.setPositionAsync(0);
      }
    }
  };

  // 播放/暫停功能
  const handlePlayPause = async () => {
    // 播放按鈕動畫效果
    playButtonScale.value = withSpring(0.9, { damping: 10 });
    setTimeout(() => {
      playButtonScale.value = withSpring(1, { damping: 8 });
    }, 200);

    if (!sound) return;

    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  };

  // 進度調整功能
  const handleSeek = async (value: number) => {
    if (sound) {
      await sound.setPositionAsync(value);
    }
  };

  // 儲存功能
  const handleSave = () => {
    // 儲存按鈕動畫效果
    saveButtonScale.value = withSpring(0.9, { damping: 10 });
    setTimeout(() => {
      saveButtonScale.value = withSpring(1, { damping: 8 });
    }, 200);

    onSave();
  };

  // 捨棄功能
  const handleDiscard = () => {
    // 捨棄按鈕動畫效果
    discardButtonScale.value = withSpring(0.9, { damping: 10 });
    setTimeout(() => {
      discardButtonScale.value = withSpring(1, { damping: 8 });
    }, 200);

    onDiscard();
  };

  // 格式化時間
  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // 動畫樣式
  const playButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: playButtonScale.value }],
    };
  });

  const saveButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: saveButtonScale.value }],
    };
  });

  const discardButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: discardButtonScale.value }],
    };
  });

  return (
    <View style={styles.container}>
      {/* 錄音名稱輸入 */}
      <View style={styles.nameContainer}>
        <ThemedText style={styles.nameLabel}>錄音名稱</ThemedText>
        <TextInput
          ref={inputRef}
          style={styles.nameInput}
          value={recordingName}
          onChangeText={setRecordingName}
          placeholder="輸入錄音名稱"
          placeholderTextColor="#8E8E93"
          maxLength={40}
          selectionColor="#3A7BFF"
        />
      </View>

      {/* 波形顯示 */}
      <View style={styles.waveformContainer}>
        <View style={styles.waveform}>
          {waveformData.map((height, index) => (
            <View
              key={index}
              style={[
                styles.waveformBar,
                {
                  height: height * 60,
                  backgroundColor: (index / waveformData.length) * playbackDuration <= playbackPosition ? "#3A7BFF" : "rgba(255, 255, 255, 0.3)",
                },
              ]}
            />
          ))}
        </View>
      </View>

      {/* 播放控制 */}
      <View style={styles.playbackContainer}>
        <ThemedText style={styles.timeText}>{formatTime(playbackPosition)}</ThemedText>

        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={playbackDuration || 1}
          value={playbackPosition}
          onValueChange={handleSeek}
          minimumTrackTintColor="#3A7BFF"
          maximumTrackTintColor="rgba(255, 255, 255, 0.2)"
          thumbTintColor="#FFFFFF"
        />

        <ThemedText style={styles.timeText}>{formatTime(playbackDuration)}</ThemedText>
      </View>

      {/* 播放按鈕 */}
      <View style={styles.playButtonContainer}>
        <Animated.View style={playButtonStyle}>
          <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
            <LinearGradient colors={["#3A7BFF", "#00C2A8"]} style={styles.playButtonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Ionicons name={isPlaying ? "pause" : "play"} size={28} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* 底部操作按鈕 */}
      <View style={styles.actionsContainer}>
        <Animated.View style={discardButtonStyle}>
          <TouchableOpacity style={[styles.actionButton, styles.discardButton]} onPress={handleDiscard}>
            <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
            <ThemedText style={styles.actionButtonText}>捨棄</ThemedText>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={saveButtonStyle}>
          <TouchableOpacity style={[styles.actionButton, styles.saveButton]} onPress={handleSave}>
            <Ionicons name="save-outline" size={20} color="#FFFFFF" />
            <ThemedText style={styles.actionButtonText}>儲存</ThemedText>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  nameContainer: {
    marginBottom: 30,
  },
  nameLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "rgba(255, 255, 255, 0.7)",
  },
  nameInput: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  waveformContainer: {
    height: 80,
    marginBottom: 30,
    justifyContent: "center",
  },
  waveform: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 60,
  },
  waveformBar: {
    width: 3,
    borderRadius: 1.5,
  },
  playbackContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  timeText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    width: 45,
  },
  slider: {
    flex: 1,
    marginHorizontal: 10,
  },
  playButtonContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
  },
  playButtonGradient: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    justifyContent: "center",
    minWidth: 120,
  },
  discardButton: {
    backgroundColor: "rgba(255, 75, 75, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(255, 75, 75, 0.4)",
  },
  saveButton: {
    backgroundColor: "rgba(58, 123, 255, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(58, 123, 255, 0.4)",
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
  },
});
