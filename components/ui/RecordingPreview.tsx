import { useState, useEffect } from "react";
import { View, TouchableOpacity, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import Slider from "@react-native-community/slider";
import Animated from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";

interface RecordingPreviewProps {
  recordingUri: string;
  recordingDuration: number;
  onSave: (name: string) => void;
  onDiscard: () => void;
}

export default function RecordingPreview({ recordingUri, recordingDuration, onSave, onDiscard }: RecordingPreviewProps) {
  const [recordingName, setRecordingName] = useState("新錄音");
  const [soundInstance, setSoundInstance] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);

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
      }
    } else {
      setIsPlaying(false);
    }
  };

  const handlePlayPause = async () => {
    if (!soundInstance) {
      await loadAndPlaySound();
      return;
    }
    if (isPlaying) {
      await soundInstance.pauseAsync();
    } else {
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
    onSave(recordingName);
  };

  // 點擊背景關閉鍵盤
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container} keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 20}>
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.previewContainer}>
          <ThemedText style={styles.previewTitle}>預覽錄音</ThemedText>

          {/* 播放控制 */}
          <TouchableOpacity onPress={handlePlayPause} style={styles.playButton}>
            <Ionicons name={isPlaying ? "pause" : "play"} size={48} color="#fff" />
          </TouchableOpacity>

          {/* 進度條 */}
          <View style={styles.sliderContainer}>
            <Text style={styles.timeText}>{`${Math.floor(playbackPosition / 1000)} / ${Math.floor(playbackDuration > 0 ? playbackDuration / 1000 : recordingDuration)} 秒`}</Text>
            <Animated.View>
              <Slider
                style={{ width: "100%" }}
                minimumValue={0}
                maximumValue={playbackDuration > 0 ? playbackDuration : recordingDuration * 1000}
                value={playbackPosition}
                onValueChange={handleSeek}
                minimumTrackTintColor="#fff"
                maximumTrackTintColor="#D1D5DB"
                thumbTintColor="#fff"
              />
            </Animated.View>
          </View>

          {/* 檔名編輯 */}
          <View style={styles.inputContainer}>
            <Ionicons name="pencil" size={20} color="#3A7BFF" style={styles.inputIcon} />
            <TextInput
              style={styles.nameInput}
              value={recordingName}
              onChangeText={setRecordingName}
              placeholder="輸入錄音名稱"
              placeholderTextColor="rgba(150, 150, 150, 0.8)"
              selectionColor="#3A7BFF"
            />
          </View>

          {/* 操作按鈕 */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={onDiscard} style={styles.discardButton}>
              <Text style={styles.buttonText}>放棄</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSavePress} style={styles.saveButton}>
              <Text style={styles.buttonText}>儲存</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  previewTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
    color: "#fff",
  },
  playButton: {
    marginBottom: 16,
  },
  sliderContainer: {
    width: "90%",
    marginBottom: 16,
  },
  timeText: {
    color: "#fff",
    marginBottom: 4,
  },
  nameInput: {
    flex: 1,
    fontSize: 18,
    color: "#fff",
    fontWeight: "500",
    padding: 8,
    backgroundColor: "transparent",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    width: "90%",
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  inputIcon: {
    marginRight: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 20,
  },
  discardButton: {
    backgroundColor: "#FF4A6B",
    padding: 14,
    borderRadius: 10,
  },
  saveButton: {
    backgroundColor: "#3A7BFF",
    padding: 14,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
