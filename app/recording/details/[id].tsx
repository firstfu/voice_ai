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
import { useLocalSearchParams, useRouter } from "expo-router";
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
  const [timer, setTimer] = useState<ReturnType<typeof setInterval> | null>(null);
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
        // 這裡可以添加滾動邏輯
      }
    }
  };

  // 切換播放狀態
  const togglePlayback = () => {
    // 播放按鈕動畫
    playButtonScale.value = withTiming(0.9, { duration: 100 }, () => {
      playButtonScale.value = withTiming(1, { duration: 100 });
    });

    setIsPlaying(!isPlaying);
  };

  // 處理進度條變化
  const handleSliderChange = (value: number) => {
    setPosition(value);
    updateActiveTranscript(value);
    // 在實際應用中，這裡應該調用音頻播放器的 seek 方法
  };

  // 處理轉錄項點擊
  const handleTranscriptPress = (transcript: TranscriptItem) => {
    const transcriptTime = timeStringToSeconds(transcript.timestamp);
    setPosition(transcriptTime);
    setActiveTranscriptId(transcript.id);
    // 在實際應用中，這裡應該調用音頻播放器的 seek 方法
  };

  // 獲取說話者顏色
  const getSpeakerColor = (speaker: string): string => {
    return speakerColors[speaker] || "#3A7BFF";
  };

  // 跳轉到編輯頁面
  const goToEditPage = () => {
    router.push(`/recording/editor?id=${recordingId}`);
  };

  // 跳轉到分析頁面
  const goToAnalysisPage = () => {
    router.push(`/recording/analysis/${recordingId}`);
  };

  // 如果沒有找到錄音
  if (!recording) {
    return (
      <View style={styles.container}>
        <ThemedText>找不到錄音</ThemedText>
      </View>
    );
  }

  return (
    <ThemedView style={styles.container} lightColor="#F8F9FA">
      {/* 自定義標題欄 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <ThemedText style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {recording.title}
        </ThemedText>
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color="#3A7BFF" />
        </TouchableOpacity>
      </View>

      {/* 播放器區域 */}
      <View style={styles.playerContainer}>
        {/* 時間指示器 */}
        <View style={styles.timeIndicator}>
          <ThemedText style={styles.timeText}>{formatTime(position)}</ThemedText>
          <ThemedText style={styles.timeText}>{recording.duration}</ThemedText>
        </View>

        {/* 進度條 */}
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={duration}
          value={position}
          onValueChange={handleSliderChange}
          minimumTrackTintColor="#3A7BFF"
          maximumTrackTintColor="#E8EDF4"
          thumbTintColor="#3A7BFF"
        />

        {/* 播放控制 */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton}>
            <Ionicons name="play-skip-back" size={32} color="#2E3A59" />
          </TouchableOpacity>

          <Animated.View style={playButtonStyle}>
            <TouchableOpacity style={styles.playButton} onPress={togglePlayback}>
              <Ionicons name={isPlaying ? "pause" : "play"} size={40} color="white" style={isPlaying ? styles.pauseIcon : styles.playIcon} />
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity style={styles.controlButton}>
            <Ionicons name="play-skip-forward" size={32} color="#2E3A59" />
          </TouchableOpacity>
        </View>

        {/* 播放速度控制 */}
        <TouchableOpacity style={styles.speedButton}>
          <ThemedText style={styles.speedText}>1.0x</ThemedText>
        </TouchableOpacity>
      </View>

      {/* 轉錄文本標題 */}
      <View style={styles.transcriptHeader}>
        <ThemedText style={styles.transcriptTitle}>轉錄文本</ThemedText>
        <View style={styles.transcriptActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => setShowOriginal(!showOriginal)}>
            <ThemedText style={styles.actionButtonText}>{showOriginal ? "原始" : "已編輯"}</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.editButton} onPress={goToEditPage}>
            <Ionicons name="create-outline" size={20} color="#3A7BFF" />
            <ThemedText style={styles.editButtonText}>編輯</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {/* 轉錄文本列表 */}
      <ScrollView style={styles.transcriptContainer} contentContainerStyle={styles.transcriptContent} showsVerticalScrollIndicator={false}>
        {recording.transcription.map((item, index) => (
          <Animated.View
            key={item.id}
            entering={FadeInDown.delay(index * 50).duration(200)}
            style={[styles.transcriptItem, activeTranscriptId === item.id && styles.activeTranscriptItem]}
          >
            <TouchableOpacity style={styles.transcriptItemInner} onPress={() => handleTranscriptPress(item)}>
              <View style={styles.speakerHeader}>
                <View style={[styles.speakerIndicator, { backgroundColor: getSpeakerColor(item.speaker) }]} />
                <ThemedText style={[styles.speakerName, { color: getSpeakerColor(item.speaker) }]}>{item.speaker}</ThemedText>
                <ThemedText style={styles.timestamp}>{item.timestamp}</ThemedText>
                {item.isEdited && (
                  <View style={styles.editedBadge}>
                    <ThemedText style={styles.editedText}>已編輯</ThemedText>
                  </View>
                )}
              </View>

              <ThemedText style={styles.transcriptText}>{showOriginal ? item.originalText || item.text : item.editedText || item.text}</ThemedText>
            </TouchableOpacity>
          </Animated.View>
        ))}

        {/* 底部間距 */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* 底部按鈕 */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomButton} onPress={() => goToEditPage()}>
          <Ionicons name="create-outline" size={24} color="#3A7BFF" />
          <ThemedText style={styles.bottomButtonText}>編輯</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomButton} onPress={() => goToAnalysisPage()}>
          <Ionicons name="analytics-outline" size={24} color="#3A7BFF" />
          <ThemedText style={styles.bottomButtonText}>分析</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight || 0,
    paddingBottom: 10,
    backgroundColor: "#F8F9FA",
  },
  backButton: {
    padding: 8,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginHorizontal: 16,
  },
  shareButton: {
    padding: 8,
  },
  playerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#F8F9FA",
  },
  timeIndicator: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  timeText: {
    fontSize: 14,
    color: "#8F9BB3",
  },
  slider: {
    width: "100%",
    height: 40,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  controlButton: {
    marginHorizontal: 24,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#3A7BFF",
    justifyContent: "center",
    alignItems: "center",
  },
  playIcon: {
    marginLeft: 4,
  },
  pauseIcon: {
    marginLeft: 0,
  },
  speedButton: {
    alignSelf: "center",
    backgroundColor: "#EDF1F7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 12,
  },
  speedText: {
    fontSize: 14,
    color: "#2E3A59",
  },
  transcriptHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF1F7",
  },
  transcriptTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  transcriptActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    marginRight: 16,
  },
  actionButtonText: {
    fontSize: 14,
    color: "#3A7BFF",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  editButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: "#3A7BFF",
  },
  transcriptContainer: {
    flex: 1,
  },
  transcriptContent: {
    padding: 16,
  },
  transcriptItem: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "white",
  },
  activeTranscriptItem: {
    backgroundColor: "#F0F6FF",
  },
  transcriptItemInner: {
    padding: 16,
  },
  speakerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  speakerIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  speakerName: {
    fontSize: 14,
    fontWeight: "600",
  },
  timestamp: {
    fontSize: 12,
    color: "#8F9BB3",
    marginLeft: 8,
  },
  editedBadge: {
    backgroundColor: "#FFE7D9",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  editedText: {
    fontSize: 10,
    color: "#FF6B4A",
  },
  transcriptText: {
    fontSize: 16,
    lineHeight: 24,
  },
  bottomSpacer: {
    height: 70,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#EDF1F7",
    paddingVertical: 12,
  },
  bottomButton: {
    alignItems: "center",
    paddingHorizontal: 16,
  },
  bottomButtonText: {
    marginTop: 4,
    fontSize: 12,
    color: "#3A7BFF",
  },
});
