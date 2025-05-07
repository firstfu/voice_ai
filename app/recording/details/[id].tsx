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
    title: "個案會談 - 獨居長者李先生",
    duration: "00:42:15",
    date: "2024-05-12",
    transcription: [
      {
        id: "1",
        speaker: "社工師",
        timestamp: "00:00:15",
        text: "李先生，今天我們來聊聊您最近的生活狀況，以及居家照護服務是否有幫助到您？",
        originalText: "李先生，今天我們來聊聊您最近的生活狀況，以及居家照護服務是否有幫助到您？",
        editedText: "李先生，今天我們來聊聊您最近的生活狀況，以及居家照護服務是否有幫助到您？",
        isEdited: false,
      },
      {
        id: "2",
        speaker: "李先生",
        timestamp: "00:01:22",
        text: "最近還可以，就是行動不太方便，上下樓梯很困難。居家服務的阿姨每週來兩次，幫我做飯、打掃，人很好。",
        originalText: "最近還可以，就是行動不太方便，上下樓梯很困難。居家服務的阿姨每週來兩次，幫我做飯、打掃，人很好。",
        editedText: "最近還可以，就是行動不太方便，上下樓梯很困難。居家服務的阿姨每週來兩次，幫我做飯、打掃，人很好。",
        isEdited: false,
      },
      {
        id: "3",
        speaker: "社工師",
        timestamp: "00:02:45",
        text: "了解。我們也可以評估是否需要申請輔具補助，像是扶手或助行器，這樣您在家中移動會更安全。",
        originalText: "了解。我們也可以評估是否需要申請輔具補助，像是扶手或助行器，這樣您在家中移動會更安全。",
        editedText: "了解。我們可以評估申請輔具補助，像是扶手或助行器，讓您在家移動更安全。",
        isEdited: true,
      },
      {
        id: "4",
        speaker: "李先生",
        timestamp: "00:03:30",
        text: "那很好啊，我家廁所是真的很難進出，如果有扶手我就不用這麼擔心跌倒了。",
      },
      {
        id: "5",
        speaker: "社工師",
        timestamp: "00:04:15",
        text: "另外，您有提到子女長期在國外，很少聯絡。我們可以討論一下，是否要連結社區關懷據點，讓您有更多社交活動的機會？",
      },
      {
        id: "6",
        speaker: "李先生",
        timestamp: "00:05:43",
        text: "我平常不太出門，但如果有人陪我去，我倒是很想認識新朋友。現在一個人在家，有時候一整天都沒說話。",
      },
    ],
  },
  "2": {
    id: "2",
    title: "家庭訪視 - 王氏家庭暴力跟進",
    duration: "01:05:23",
    date: "2024-05-10",
    transcription: [
      {
        id: "1",
        speaker: "社工師",
        timestamp: "00:00:30",
        text: "王女士，這是我們第三次的跟進訪視了，想了解一下您和孩子們最近的情況如何？",
      },
      {
        id: "2",
        speaker: "王女士",
        timestamp: "00:02:10",
        text: "自從上次法院核發保護令後，他沒有再來騷擾我們。孩子們還在適應，特別是老大晚上常做惡夢。",
      },
      {
        id: "3",
        speaker: "社工師",
        timestamp: "00:03:45",
        text: "孩子的反應是正常的，我們可以安排心理師和孩子會談。您自己的情緒管理還好嗎？",
      },
      {
        id: "4",
        speaker: "王女士",
        timestamp: "00:05:20",
        text: "我在努力堅強，但經濟壓力很大。現在一個人要養兩個孩子，房租也快付不出來了。",
      },
      {
        id: "5",
        speaker: "社工師",
        timestamp: "00:07:30",
        text: "關於經濟問題，我們可以協助您申請急難救助和租金補貼。另外也可以連結就業服務，幫您找適合的工作。",
      },
    ],
  },
  "3": {
    id: "3",
    title: "團體工作 - 青少年情緒支持小組",
    duration: "00:58:30",
    date: "2024-05-08",
    transcription: [
      {
        id: "1",
        speaker: "帶領者",
        timestamp: "00:00:22",
        text: "今天是我們小組的第四次聚會，主題是「認識和管理憤怒情緒」。想請大家分享，最近有什麼讓你感到憤怒的事情？",
      },
      {
        id: "2",
        speaker: "小明",
        timestamp: "00:01:15",
        text: "上週我被班上同學嘲笑成績差，我當下真的很想打他，但是想到這裡學的深呼吸，我就先離開教室了。",
      },
      {
        id: "3",
        speaker: "小華",
        timestamp: "00:02:20",
        text: "我媽總是翻我的東西，完全不尊重我的隱私。每次我就直接摔門，然後我們就大吵一架。",
      },
      {
        id: "4",
        speaker: "帶領者",
        timestamp: "00:03:30",
        text: "謝謝大家的分享。小明做得很好，運用了我們之前學習的情緒調節技巧。小華，你能想到有什麼其他方式可以表達你的不滿嗎？",
      },
    ],
  },
  "4": {
    id: "4",
    title: "社區評估 - 大安區長者需求調查",
    duration: "00:34:18",
    date: "2024-05-05",
    transcription: [
      {
        id: "1",
        speaker: "社工師",
        timestamp: "00:00:10",
        text: "我們正在進行大安區長者社區需求評估，想請問您對目前社區提供的老人服務有什麼看法？",
      },
      {
        id: "2",
        speaker: "社區居民",
        timestamp: "00:01:45",
        text: "我覺得活動中心的位置太遠了，很多老人家行動不便，根本去不了。如果能有接送服務就好了。",
      },
      {
        id: "3",
        speaker: "社工師",
        timestamp: "00:02:50",
        text: "這點我們會記錄下來。還有其他服務是您認為社區需要加強的嗎？",
      },
      {
        id: "4",
        speaker: "社區居民",
        timestamp: "00:04:15",
        text: "很多獨居老人其實最需要的是有人陪伴聊天，或是幫忙處理一些日常事務，比如繳費單、看信件這類的。",
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
  社工師: "#3A7BFF",
  李先生: "#00C2A8",
  王女士: "#FF6B4A",
  帶領者: "#3A7BFF",
  小明: "#00C2A8",
  小華: "#FF6B4A",
  社區居民: "#00C2A8",
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

        {/* 底部間距，增加間距以留出底部導航的空間 */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
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
    height: 80,
  },
});
