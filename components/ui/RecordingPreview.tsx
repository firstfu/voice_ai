import { useState, useEffect, useRef } from "react";
import { View, TouchableOpacity, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import Slider from "@react-native-community/slider";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming, withRepeat, withSequence, Easing } from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

import { ThemedText } from "@/components/ThemedText";

interface RecordingPreviewProps {
  recordingUri: string;
  recordingDuration: number;
  onSave: (name: string) => void;
  onDiscard: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function RecordingPreview({ recordingUri, recordingDuration, onSave, onDiscard }: RecordingPreviewProps) {
  const [recordingName, setRecordingName] = useState("新錄音");
  const [soundInstance, setSoundInstance] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);

  // 動畫值
  const buttonScale = useSharedValue(1);
  const playIconScale = useSharedValue(1);
  const waveOpacity = useSharedValue(0.3);
  const inputFocus = useSharedValue(0);

  // 計算格式化時間
  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // 預覽播放功能
  const loadAndPlaySound = async () => {
    if (!recordingUri) return;
    if (soundInstance) {
      await soundInstance.unloadAsync();
      setSoundInstance(null);
    }
    const { sound, status } = await Audio.Sound.createAsync({ uri: recordingUri }, { shouldPlay: true }, onPlaybackStatusUpdate);
    setSoundInstance(sound);
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPlaybackPosition(status.positionMillis || 0);
      setPlaybackDuration(status.durationMillis || 0);
      setIsPlaying(status.isPlaying);
      if (status.didJustFinish) {
        setIsPlaying(false);
        waveOpacity.value = withTiming(0.3, { duration: 500 });
      }
    } else {
      setIsPlaying(false);
      waveOpacity.value = withTiming(0.3, { duration: 500 });
    }
  };

  const handlePlayPause = async () => {
    // 播放按鈕動畫
    playIconScale.value = withSequence(withTiming(0.8, { duration: 100 }), withTiming(1.1, { duration: 100 }), withTiming(1, { duration: 100 }));

    if (!soundInstance) {
      waveOpacity.value = withTiming(0.8, { duration: 500 });
      await loadAndPlaySound();
      return;
    }
    if (isPlaying) {
      waveOpacity.value = withTiming(0.3, { duration: 500 });
      await soundInstance.pauseAsync();
    } else {
      waveOpacity.value = withTiming(0.8, { duration: 500 });
      await soundInstance.playAsync();
    }
  };

  const handleSeek = async (value: number) => {
    if (soundInstance) {
      await soundInstance.setPositionAsync(value);
    }
  };

  // 清理音訊資源
  useEffect(() => {
    return () => {
      if (soundInstance) {
        soundInstance.unloadAsync();
      }
    };
  }, [soundInstance]);

  const handleSavePress = () => {
    // 儲存按鈕動畫
    buttonScale.value = withSequence(withTiming(0.95, { duration: 100 }), withTiming(1, { duration: 100 }));
    onSave(recordingName);
  };

  const handleDiscardPress = () => {
    // 放棄按鈕動畫
    buttonScale.value = withSequence(withTiming(0.95, { duration: 100 }), withTiming(1, { duration: 100 }));
    onDiscard();
  };

  // 點擊背景關閉鍵盤
  const dismissKeyboard = () => {
    Keyboard.dismiss();
    inputFocus.value = withTiming(0, { duration: 200 });
  };

  // 輸入框聚焦動畫
  const handleInputFocus = () => {
    inputFocus.value = withTiming(1, { duration: 200 });
  };

  const handleInputBlur = () => {
    inputFocus.value = withTiming(0, { duration: 200 });
  };

  // 動畫樣式
  const playButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: playIconScale.value }],
    };
  });

  const waveAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: waveOpacity.value,
    };
  });

  const saveButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  const inputContainerStyle = useAnimatedStyle(() => {
    return {
      borderColor: `rgba(58, 123, 255, ${0.2 + inputFocus.value * 0.8})`,
      transform: [{ scale: 1 + inputFocus.value * 0.02 }],
    };
  });

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container} keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 20}>
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <LinearGradient colors={["#1f2235", "#2a2d4a", "#2d325e"]} style={styles.previewContainer}>
          <View style={styles.contentContainer}>
            {/* 播放控制 */}
            <View style={styles.playbackControls}>
              <Animated.View style={playButtonStyle}>
                <TouchableOpacity onPress={handlePlayPause} style={styles.playButton} activeOpacity={0.7}>
                  <LinearGradient
                    colors={isPlaying ? ["#ff4a6b", "#ff6b8b"] : ["#3a7bff", "#6b94ff"]}
                    style={styles.playButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name={isPlaying ? "pause" : "play"} size={28} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              {/* 進度條 */}
              <View style={styles.sliderContainer}>
                <View style={styles.timeTextContainer}>
                  <Text style={styles.timeText}>{formatTime(playbackPosition)}</Text>
                  <Text style={styles.timeText}>{formatTime(playbackDuration > 0 ? playbackDuration : recordingDuration * 1000)}</Text>
                </View>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={playbackDuration > 0 ? playbackDuration : recordingDuration * 1000}
                  value={playbackPosition}
                  onValueChange={handleSeek}
                  minimumTrackTintColor="#3a7bff"
                  maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
                  thumbTintColor="#fff"
                />
              </View>
            </View>

            {/* 檔名編輯 */}
            <Animated.View style={[styles.inputContainer, inputContainerStyle]}>
              <Ionicons name="pencil" size={20} color="#3A7BFF" style={styles.inputIcon} />
              <TextInput
                style={styles.nameInput}
                value={recordingName}
                onChangeText={setRecordingName}
                placeholder="輸入錄音名稱"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                selectionColor="#3A7BFF"
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
            </Animated.View>

            {/* 操作按鈕 */}
            <View style={styles.buttonContainer}>
              <Animated.View style={saveButtonAnimatedStyle}>
                <TouchableOpacity onPress={handleDiscardPress} style={styles.discardButton} activeOpacity={0.8}>
                  <Ionicons name="trash-outline" size={18} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>放棄</Text>
                </TouchableOpacity>
              </Animated.View>

              <Animated.View style={saveButtonAnimatedStyle}>
                <TouchableOpacity onPress={handleSavePress} style={styles.saveButton} activeOpacity={0.8}>
                  <Ionicons name="save-outline" size={18} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>儲存</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        </LinearGradient>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  previewContainer: {
    flex: 1,
    padding: 0,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 24,
  },
  previewTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginVertical: 12,
    color: "#fff",
    textAlign: "center",
  },
  playbackControls: {
    width: "100%",
    alignItems: "center",
    marginVertical: 40,
  },
  playButton: {
    marginBottom: 24,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  playButtonGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  sliderContainer: {
    width: "100%",
    marginBottom: 24,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  sliderThumb: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  timeTextContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 4,
  },
  timeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  waveformContainer: {
    flexDirection: "row",
    height: 60,
    justifyContent: "space-around",
    alignItems: "center",
    width: "80%",
    marginVertical: 20,
  },
  waveBar: {
    width: 4,
    backgroundColor: "#3a7bff",
    borderRadius: 2,
    marginHorizontal: 3,
  },
  nameInput: {
    flex: 1,
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
    padding: 12,
    backgroundColor: "transparent",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    width: "90%",
    marginBottom: 36,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(58, 123, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    marginTop: 40,
  },
  inputIcon: {
    marginRight: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    width: "100%",
    marginTop: 16,
  },
  discardButton: {
    backgroundColor: "#ff4a6b",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButton: {
    backgroundColor: "#3a7bff",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
});
