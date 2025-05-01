/**
 * 錄音詳情頁面
 *
 * 本頁面顯示單個錄音的詳細信息，功能包括:
 * - 錄音播放控制與進度條
 * - 錄音轉錄文本顯示
 * - 不同說話者的區分與高亮
 * - 文本編輯功能入口
 * - 錄音分析與共享功能
 */

import { useState, useEffect, useRef } from "react";
import { StyleSheet, View, TouchableOpacity, ScrollView, Platform, StatusBar } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { AVPlaybackStatus, Audio } from "expo-av";
import Slider from "@react-native-community/slider";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

// 定義轉錄項目介面
interface TranscriptItem {
  id: string;
  speaker: string;
  timestamp: string;
  text: string;
  originalText?: string;
  editedText?: string;
  isEdited?: boolean;
}

// 定義錄音詳情介面
interface RecordingDetail {
  id: string;
  title: string;
  duration: string;
  date: string;
  transcription: TranscriptItem[];
}

// 模擬的錄音詳情數據
const mockRecordings: Record<string, RecordingDetail> = {
  "1": {
    id: "1",
    title: "會議記錄 - 5月12日",
    duration: "00:32:15",
    date: "2024-05-12",
    transcription: [
      {
        id: "1",
        speaker: "說話者 1",
        timestamp: "00:00:15",
        text: "今天我們將討論專案進度和下一步計劃。",
        originalText: "今天我們將討論專案進度和下一步計劃。",
        editedText: "今天我們將討論專案進度和下一步計劃。",
        isEdited: false,
      },
      {
        id: "2",
        speaker: "說話者 2",
        timestamp: "00:01:22",
        text: "上週我們完成了設計階段，主要界面已經定稿。關於開發階段，我認為我們需要先優先實現核心功能。",
        originalText: "上週我們完成了設計階段，主要界面已經定稿。關於開發階段，我認為我們需要先優先實現核心功能。",
        editedText: "上週我們完成了設計階段，主要界面已經定稿。關於開發階段，我認為我們需要優先實現核心功能。",
        isEdited: true,
      },
      {
        id: "3",
        speaker: "說話者 1",
        timestamp: "00:02:45",
        text: "我同意這個觀點，核心功能應該優先實現。根據我們的時間表，我們需要在下個月底前完成主要功能的開發。",
        originalText: "我同意這個觀點，核心功能應該優先實現。根據我們的時間表，我們需要在下個月底前完成主要功能的開發。",
        editedText: "我同意這個觀點，核心功能應該優先實現。根據我們的時間表，我們需要在下個月底前完成主要功能的開發。",
        isEdited: false,
      },
      {
        id: "4",
        speaker: "說話者 3",
        timestamp: "00:03:30",
        text: "我們還需要考慮一下測試計劃，尤其是用戶體驗測試部分。我們應該盡早開始招募測試用戶。",
      },
      {
        id: "5",
        speaker: "說話者 2",
        timestamp: "00:04:15",
        text: "關於測試計劃，我們可以分為內部測試和外部用戶測試兩個階段。內部測試可以在每個功能模塊完成後立即進行。",
      },
      {
        id: "6",
        speaker: "說話者 1",
        timestamp: "00:05:43",
        text: "好的，我們可以安排下週再開一次會議，具體討論測試計劃的細節。還有其他問題需要現在討論嗎？",
      },
    ],
  },
  "2": {
    id: "2",
    title: "課堂筆記 - 5月10日",
    duration: "01:15:42",
    date: "2024-05-10",
    transcription: [
      {
        id: "1",
        speaker: "教授",
        timestamp: "00:00:30",
        text: "今天我們將討論人工智能在現代醫療中的應用。",
      },
      {
        id: "2",
        speaker: "教授",
        timestamp: "00:02:10",
        text: "人工智能技術已經在醫學診斷、藥物研發和醫療管理等領域有了廣泛應用。",
      },
    ],
  },
  "3": {
    id: "3",
    title: "訪談 - 5月8日",
    duration: "00:45:30",
    date: "2024-05-08",
    transcription: [
      {
        id: "1",
        speaker: "採訪者",
        timestamp: "00:00:22",
        text: "請您介紹一下您在行業內的經驗和觀察到的主要趨勢。",
      },
      {
        id: "2",
        speaker: "受訪者",
        timestamp: "00:01:15",
        text: "我在這個行業已經工作了超過15年，見證了許多重大變革...",
      },
    ],
  },
  "4": {
    id: "4",
    title: "個人筆記 - 5月5日",
    duration: "00:12:08",
    date: "2024-05-05",
    transcription: [
      {
        id: "1",
        speaker: "我",
        timestamp: "00:00:10",
        text: "需要完成下週的項目提案，主要包括以下幾個方面...",
      },
      {
        id: "2",
        speaker: "我",
        timestamp: "00:01:45",
        text: "記得聯繫設計團隊確認最新的視覺設計方案。",
      },
    ],
  },
};

// 轉換時間格式 "00:00:00" 為秒數
const timeStringToSeconds = (timeString: string): number => {
  const [hours, minutes, seconds] = timeString.split(":").map(Number);
  return hours * 3600 + minutes * 60 + seconds;
};

// 格式化秒數為時間格式 "00:00:00"
const formatTime = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

// 說話者顏色映射
const speakerColors: Record<string, string> = {
  "說話者 1": "#3A7BFF",
  "說話者 2": "#00C2A8",
  "說話者 3": "#FF6B4A",
  教授: "#3A7BFF",
  採訪者: "#3A7BFF",
  受訪者: "#00C2A8",
  我: "#3A7BFF",
};

export default function RecordingDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const recordingId = typeof id === "string" ? id : "1";
  const recording = mockRecordings[recordingId];

  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(recording ? timeStringToSeconds(recording.duration) : 0);
  const [activeTranscriptId, setActiveTranscriptId] = useState<string | null>(null);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [showOriginal, setShowOriginal] = useState(true);

  // 播放動畫
  const playButtonScale = useSharedValue(1);
  const playButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: playButtonScale.value }],
  }));

  // 模擬音頻播放器進度更新
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setPosition(prevPosition => {
          // 增加播放位置（每秒增加1秒）
          const newPosition = prevPosition + 1;

          // 如果達到錄音總時長，停止播放
          if (newPosition >= duration) {
            setIsPlaying(false);
            clearInterval(interval);
            return duration;
          }

          // 更新當前活動的轉錄項
          updateActiveTranscript(newPosition);

          return newPosition;
        });
      }, 1000);

      setTimer(interval);
      return () => clearInterval(interval);
    } else if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
  }, [isPlaying]);

  // 更新當前活動的轉錄項
  const updateActiveTranscript = (currentPosition: number) => {
    if (!recording) return;

    const currentTranscript = recording.transcription.find(t => {
      const transcriptTime = timeStringToSeconds(t.timestamp);
      return currentPosition >= transcriptTime && currentPosition < transcriptTime + 10;
    });

    if (currentTranscript && currentTranscript.id !== activeTranscriptId) {
      setActiveTranscriptId(currentTranscript.id);

      // 滾動到當前轉錄文本
      const index = recording.transcription.findIndex(t => t.id === currentTranscript.id);
      if (index >= 0) {
        scrollViewRef.current?.scrollTo({
          y: index * 100, // 假設每個轉錄項高度約100
          animated: true,
        });
      }
    }
  };

  const scrollViewRef = useRef<ScrollView>(null);

  // 切換播放/暫停
  const togglePlayback = () => {
    playButtonScale.value = withTiming(0.9, { duration: 100 });
    setTimeout(() => {
      playButtonScale.value = withTiming(1, { duration: 100 });
    }, 100);

    setIsPlaying(!isPlaying);
  };

  // 處理進度條變化
  const handleSliderChange = (value: number) => {
    setPosition(value);
    updateActiveTranscript(value);
  };

  // 點擊轉錄文本項
  const handleTranscriptPress = (transcript: TranscriptItem) => {
    const timeInSeconds = timeStringToSeconds(transcript.timestamp);
    setPosition(timeInSeconds);
    setActiveTranscriptId(transcript.id);
  };

  // 獲取說話者顏色
  const getSpeakerColor = (speaker: string): string => {
    return speakerColors[speaker] || "#3A7BFF";
  };

  // 前往編輯頁面
  const goToEditPage = () => {
    router.push(`/recording/editor?id=${recordingId}`);
  };

  if (!recording) {
    return (
      <ThemedView style={styles.container}>
        <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#2C3E50" />
          </TouchableOpacity>
          <ThemedText type="title">錄音不存在</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* 標題欄 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.title} numberOfLines={1}>
          {recording.title}
        </ThemedText>
        <TouchableOpacity style={styles.moreButton} onPress={goToEditPage}>
          <Ionicons name="pencil" size={22} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* 音頻播放器 */}
      <Animated.View style={styles.playerContainer} entering={FadeInDown.duration(400)}>
        <LinearGradient colors={["#F8F9FA", "#EBF4FF"]} style={styles.playerGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          {/* 時間顯示 */}
          <View style={styles.timeContainer}>
            <ThemedText style={styles.timeText}>{formatTime(position)}</ThemedText>
            <ThemedText style={styles.timeText}>{recording.duration}</ThemedText>
          </View>

          {/* 波形或進度條 */}
          <View style={styles.waveformContainer}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={duration}
              value={position}
              onValueChange={handleSliderChange}
              minimumTrackTintColor="#3A7BFF"
              maximumTrackTintColor="#D1D5DB"
              thumbTintColor="#3A7BFF"
            />
          </View>

          {/* 播放控制 */}
          <View style={styles.controlsContainer}>
            <TouchableOpacity style={styles.controlButton}>
              <Ionicons name="play-skip-back" size={24} color="#2C3E50" />
            </TouchableOpacity>

            <Animated.View style={[styles.playButtonContainer, playButtonStyle]}>
              <TouchableOpacity style={styles.playButton} onPress={togglePlayback} activeOpacity={0.8}>
                <Ionicons name={isPlaying ? "pause" : "play"} size={28} color="white" style={isPlaying ? {} : { marginLeft: 4 }} />
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity style={styles.controlButton}>
              <Ionicons name="play-skip-forward" size={24} color="#2C3E50" />
            </TouchableOpacity>
          </View>

          {/* 播放速度 */}
          <View style={styles.speedContainer}>
            <TouchableOpacity style={styles.speedButton}>
              <ThemedText style={styles.speedText}>1.0x</ThemedText>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* 轉錄內容 */}
      <View style={styles.transcriptionContainer}>
        <View style={styles.transcriptionHeader}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            轉錄文本
          </ThemedText>

          {recording.transcription.some(t => t.isEdited) && (
            <View style={styles.switchContainer}>
              <TouchableOpacity style={[styles.switchButton, showOriginal && styles.switchButtonActive]} onPress={() => setShowOriginal(true)}>
                <ThemedText style={[styles.switchText, showOriginal && styles.switchTextActive]}>原始</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.switchButton, !showOriginal && styles.switchButtonActive]} onPress={() => setShowOriginal(false)}>
                <ThemedText style={[styles.switchText, !showOriginal && styles.switchTextActive]}>已編輯</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <ScrollView ref={scrollViewRef} style={styles.transcriptionScroll} showsVerticalScrollIndicator={false}>
          {recording.transcription.map((transcript, index) => (
            <Animated.View key={transcript.id} entering={FadeIn.delay(index * 50).duration(300)}>
              <TouchableOpacity
                style={[
                  styles.transcriptItem,
                  activeTranscriptId === transcript.id && styles.activeTranscriptItem,
                  !showOriginal && transcript.isEdited && styles.editedTranscriptItem,
                ]}
                onPress={() => handleTranscriptPress(transcript)}
                activeOpacity={0.7}
              >
                <View style={styles.transcriptHeader}>
                  <View style={[styles.speakerBadge, { backgroundColor: getSpeakerColor(transcript.speaker) }]}>
                    <ThemedText style={styles.speakerText}>{transcript.speaker}</ThemedText>
                  </View>
                  <View style={styles.transcriptMetadata}>
                    <ThemedText style={styles.timestampText}>{transcript.timestamp}</ThemedText>
                    {!showOriginal && transcript.isEdited && (
                      <View style={styles.editedIndicator}>
                        <Ionicons name="pencil" size={12} color="#FFFFFF" />
                        <ThemedText style={styles.editedText}>已編輯</ThemedText>
                      </View>
                    )}
                  </View>
                </View>
                <ThemedText style={styles.transcriptText}>{showOriginal ? transcript.originalText || transcript.text : transcript.editedText || transcript.text}</ThemedText>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </ScrollView>
      </View>

      {/* 底部工具欄 */}
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.toolbarButton} onPress={() => router.push(`/recording/editor?id=${recordingId}`)}>
          <Ionicons name="create-outline" size={24} color="#3A7BFF" />
          <ThemedText style={styles.toolbarButtonText}>編輯</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolbarButton} onPress={() => router.push(`/recording/analysis/${recordingId}`)}>
          <Ionicons name="analytics-outline" size={24} color="#3A7BFF" />
          <ThemedText style={styles.toolbarButtonText}>分析</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolbarButton} onPress={() => router.push(`/recording/manage`)}>
          <Ionicons name="list-outline" size={24} color="#3A7BFF" />
          <ThemedText style={styles.toolbarButtonText}>管理</ThemedText>
        </TouchableOpacity>
      </View>

      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  title: {
    flex: 1,
    marginHorizontal: 12,
    fontSize: 20,
    fontWeight: "600",
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  playerContainer: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  playerGradient: {
    padding: 16,
    borderRadius: 16,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  timeText: {
    fontSize: 14,
    color: "#2C3E50",
  },
  waveformContainer: {
    height: 40,
    justifyContent: "center",
    marginBottom: 16,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  playButtonContainer: {
    marginHorizontal: 24,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#3A7BFF",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#3A7BFF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  speedContainer: {
    alignItems: "center",
  },
  speedButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "rgba(58, 123, 255, 0.1)",
  },
  speedText: {
    fontSize: 14,
    color: "#3A7BFF",
    fontWeight: "600",
  },
  transcriptionContainer: {
    flex: 1,
    marginTop: 24,
    marginHorizontal: 16,
  },
  transcriptionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  transcriptionScroll: {
    flex: 1,
  },
  transcriptItem: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: "white",
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  activeTranscriptItem: {
    borderWidth: 2,
    borderColor: "#3A7BFF",
  },
  editedTranscriptItem: {
    backgroundColor: "#FFF8F8",
    borderLeftWidth: 3,
    borderLeftColor: "#FF3B30",
  },
  transcriptHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  speakerBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  speakerText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  timestampText: {
    fontSize: 12,
    color: "#718096",
  },
  transcriptText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#2C3E50",
  },
  transcriptMetadata: {
    flexDirection: "row",
    alignItems: "center",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  switchButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "rgba(58, 123, 255, 0.1)",
  },
  switchButtonActive: {
    backgroundColor: "#3A7BFF",
  },
  switchText: {
    fontSize: 12,
    color: "#3A7BFF",
    fontWeight: "600",
  },
  switchTextActive: {
    color: "white",
  },
  editedIndicator: {
    marginLeft: 4,
    padding: 3,
    borderRadius: 4,
    backgroundColor: "#FF3B30",
    flexDirection: "row",
    alignItems: "center",
  },
  editedText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#F0F2F5",
  },
  toolbarButton: {
    alignItems: "center",
    paddingHorizontal: 12,
  },
  toolbarButtonText: {
    fontSize: 12,
    marginTop: 4,
    color: "#3A7BFF",
  },
});
