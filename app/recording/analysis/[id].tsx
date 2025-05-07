/**
 * 錄音內容分析頁面
 *
 * 本頁面負責展示錄音內容的AI分析結果，包括：
 * - 內容摘要：自動生成的錄音內容簡短總結
 * - 關鍵詞提取：從錄音內容中識別的重要詞彙
 * - 主題分類：識別錄音內容所屬的主題類別及其置信度
 * - 情感分析：分析錄音內容的整體情感傾向
 * - 智能問答：自動生成的基於內容的問答對
 *
 * 頁面頂部提供功能按鈕：
 * - 重新分析：觸發對錄音內容的重新分析
 * - 匯出報告：將分析結果匯出為可共享的報告
 * - 分享：分享分析結果
 *
 * 頁面使用AnalysisContext獲取和更新分析數據
 */

import { useState, useEffect, useContext } from "react";
import { StyleSheet, View, TouchableOpacity, ScrollView, Platform, StatusBar, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import useAnalysisService, { AnalysisResult } from "@/hooks/useAnalysisService";
import { AnalysisContext } from "@/contexts/AnalysisContext";

// 定義轉錄項目的類型
interface TranscriptionItem {
  id: string;
  speaker: string;
  timestamp: string;
  text: string;
}

// 定義錄音詳情的類型
interface RecordingDetail {
  id: string;
  title: string;
  duration: string;
  date: string;
  transcription: TranscriptionItem[];
}

// 模擬的錄音詳情數據
const mockRecordings: { [key: string]: RecordingDetail } = {
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
      },
      {
        id: "2",
        speaker: "李先生",
        timestamp: "00:01:22",
        text: "最近還可以，就是行動不太方便，上下樓梯很困難。居家服務的阿姨每週來兩次，幫我做飯、打掃，人很好。",
      },
      {
        id: "3",
        speaker: "社工師",
        timestamp: "00:02:45",
        text: "了解。我們也可以評估是否需要申請輔具補助，像是扶手或助行器，這樣您在家中移動會更安全。",
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
        timestamp: "00:00:30",
        text: "今天是我們小組的第四次聚會，主題是「認識和管理憤怒情緒」。想請大家分享，最近有什麼讓你感到憤怒的事情？",
      },
      {
        id: "2",
        speaker: "小明",
        timestamp: "00:03:15",
        text: "上週我被班上同學嘲笑成績差，我當下真的很想打他，但是想到這裡學的深呼吸，我就先離開教室了。",
      },
      {
        id: "3",
        speaker: "小華",
        timestamp: "00:05:40",
        text: "我媽總是翻我的東西，完全不尊重我的隱私。每次我就直接摔門，然後我們就大吵一架。",
      },
      {
        id: "4",
        speaker: "帶領者",
        timestamp: "00:08:20",
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
        timestamp: "00:00:30",
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
        timestamp: "00:03:20",
        text: "這點我們會記錄下來。還有其他服務是您認為社區需要加強的嗎？",
      },
      {
        id: "4",
        speaker: "社區居民",
        timestamp: "00:04:50",
        text: "很多獨居老人其實最需要的是有人陪伴聊天，或是幫忙處理一些日常事務，比如繳費單、看信件這類的。",
      },
      {
        id: "5",
        speaker: "社工師",
        timestamp: "00:06:30",
        text: "謝謝您的建議。我們正在規劃「社區關懷志工」計畫，希望能招募更多志工提供這類服務。",
      },
    ],
  },
};

export default function AnalysisScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const recordingId = typeof id === "string" ? id : "1";
  const { refreshTrigger, triggerRefresh } = useContext(AnalysisContext);

  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const { isLoading, error, getAnalysisResult, refreshAnalysis } = useAnalysisService();

  useEffect(() => {
    // 頁面加載時獲取分析結果
    loadAnalysisResult();
  }, [recordingId]);

  // 當 refreshTrigger 變化時，檢查是否需要重新分析
  useEffect(() => {
    if (refreshTrigger && refreshTrigger === recordingId) {
      handleRefreshAnalysis();
    }
  }, [refreshTrigger]);

  const loadAnalysisResult = async () => {
    const result = await getAnalysisResult(recordingId);
    if (result) {
      setAnalysisResult(result);
    }
  };

  const handleRefreshAnalysis = async () => {
    // 直接觸發上下文中的重新分析
    triggerRefresh(recordingId);

    const recording = mockRecordings[recordingId];
    if (!recording) return;

    // 將錄音轉錄信息轉換為所需格式
    const transcription = recording.transcription.map((item: TranscriptionItem) => ({
      speaker: item.speaker,
      text: item.text,
      timestamp: item.timestamp,
    }));

    const result = await refreshAnalysis(recordingId, transcription);
    if (result) {
      setAnalysisResult(result);
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3A7BFF" />
          <ThemedText style={styles.loadingText}>正在分析中，請稍候...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF6B4A" />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={loadAnalysisResult}>
            <ThemedText style={styles.retryButtonText}>重試</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  if (!analysisResult) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen
          options={{
            title: "分析結果不存在",
            headerShown: true,
            headerShadowVisible: false,
            headerStyle: {
              backgroundColor: "#F8F9FA",
            },
          }}
        />
        <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
        <View style={styles.noDataContainer}>
          <Ionicons name="document-text-outline" size={64} color="#718096" />
          <ThemedText style={styles.noDataText}>沒有找到此錄音的分析結果</ThemedText>
          <TouchableOpacity style={styles.generateButton} onPress={handleRefreshAnalysis}>
            <ThemedText style={styles.generateButtonText}>生成分析</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: "AI 內容分析",
          headerShown: true,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: "#F8F9FA",
          },
        }}
      />
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 頂部工具按鈕區 */}
        <View style={styles.toolbarContainer}>
          <TouchableOpacity style={styles.toolButton} onPress={handleRefreshAnalysis}>
            <Ionicons name="refresh-outline" size={22} color="#3A7BFF" />
            <ThemedText style={styles.toolButtonText}>重新分析</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolButton}>
            <Ionicons name="save-outline" size={22} color="#3A7BFF" />
            <ThemedText style={styles.toolButtonText}>匯出報告</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolButton}>
            <Ionicons name="share-social-outline" size={22} color="#3A7BFF" />
            <ThemedText style={styles.toolButtonText}>分享</ThemedText>
          </TouchableOpacity>
        </View>

        {/* 內容容器 */}
        <View style={styles.contentContainer}>
          {/* 摘要部分 */}
          <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <Ionicons name="document-text-outline" size={20} color="#3A7BFF" />
              </View>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                摘要
              </ThemedText>
            </View>
            <View style={styles.card}>
              <ThemedText style={styles.summaryText}>{analysisResult.summary}</ThemedText>
            </View>
          </Animated.View>

          {/* 關鍵詞部分 */}
          <Animated.View entering={FadeInDown.duration(400).delay(200)} style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <Ionicons name="key-outline" size={20} color="#3A7BFF" />
              </View>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                關鍵詞
              </ThemedText>
            </View>
            <View style={styles.card}>
              <View style={styles.keywordsContainer}>
                {analysisResult.keywords.map((keyword, index) => (
                  <View key={index} style={styles.keywordBadge}>
                    <ThemedText style={styles.keywordText}>{keyword}</ThemedText>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>

          {/* 主題分類部分 */}
          <Animated.View entering={FadeInDown.duration(400).delay(300)} style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <Ionicons name="pie-chart-outline" size={20} color="#3A7BFF" />
              </View>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                主題分類
              </ThemedText>
            </View>
            <View style={styles.card}>
              {analysisResult.topics.map((topic, index) => {
                const confidence = Math.round(topic.confidence * 100);
                const isShortBar = confidence < 50; // 進度條小於50%時視為較短

                return (
                  <View key={index} style={styles.topicItem}>
                    <View style={styles.topicNameContainer}>
                      <ThemedText style={styles.topicName}>{topic.name}</ThemedText>
                      {isShortBar && <ThemedText style={styles.percentageOutside}>{confidence}%</ThemedText>}
                    </View>
                    <View style={styles.confidenceBarContainer}>
                      <View style={[styles.confidenceBar, { width: `${confidence}%` }]} />
                      {!isShortBar && <ThemedText style={styles.confidenceText}>{confidence}%</ThemedText>}
                    </View>
                  </View>
                );
              })}
            </View>
          </Animated.View>

          {/* 情感分析部分 */}
          <Animated.View entering={FadeInDown.duration(400).delay(400)} style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <Ionicons name="happy-outline" size={20} color="#3A7BFF" />
              </View>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                情感分析
              </ThemedText>
            </View>
            <View style={styles.card}>
              <View style={styles.sentimentOverallContainer}>
                <ThemedText style={styles.sentimentOverallLabel}>整體情感傾向：</ThemedText>
                <View style={styles.sentimentIndicatorContainer}>
                  <LinearGradient colors={["#FF6B4A", "#FFAD33", "#38C172"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.sentimentGradient} />
                  <View style={[styles.sentimentIndicator, { left: `${analysisResult.sentiment.overall * 100}%` }]} />
                </View>
                <ThemedText style={styles.sentimentValue}>
                  {analysisResult.sentiment.overall < 0.3 ? "負面" : analysisResult.sentiment.overall < 0.7 ? "中性" : "正面"}({Math.round(analysisResult.sentiment.overall * 100)}
                  %)
                </ThemedText>
              </View>
            </View>
          </Animated.View>

          {/* 問答生成部分 */}
          <Animated.View entering={FadeInDown.duration(400).delay(500)} style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <Ionicons name="help-circle-outline" size={20} color="#3A7BFF" />
              </View>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                智能問答
              </ThemedText>
            </View>
            <View style={styles.card}>
              {analysisResult.questions.map((qa, index) => (
                <View key={index} style={[styles.qaItem, index === analysisResult.questions.length - 1 && { borderBottomWidth: 0, marginBottom: 0, paddingBottom: 0 }]}>
                  <View style={styles.questionContainer}>
                    <Ionicons name="help-circle" size={20} color="#3A7BFF" />
                    <ThemedText style={styles.questionText}>{qa.question}</ThemedText>
                  </View>
                  <View style={styles.answerContainer}>
                    <Ionicons name="chatbubble-ellipses-outline" size={20} color="#00C2A8" />
                    <ThemedText style={styles.answerText}>{qa.answer}</ThemedText>
                  </View>
                </View>
              ))}
            </View>
          </Animated.View>
        </View>
      </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#718096",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorText: {
    marginTop: 16,
    marginBottom: 24,
    fontSize: 16,
    color: "#718096",
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: "#3A7BFF",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  noDataText: {
    marginTop: 16,
    marginBottom: 24,
    fontSize: 16,
    color: "#718096",
    textAlign: "center",
  },
  generateButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: "#3A7BFF",
    borderRadius: 8,
  },
  generateButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(58, 123, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
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
  summaryText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#2C3E50",
  },
  keywordsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  keywordBadge: {
    backgroundColor: "rgba(58, 123, 255, 0.1)",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
  },
  keywordText: {
    color: "#3A7BFF",
    fontSize: 14,
    fontWeight: "500",
  },
  topicItem: {
    marginBottom: 12,
  },
  topicNameContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  topicName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2C3E50",
  },
  percentageOutside: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#3A7BFF",
  },
  confidenceBarContainer: {
    height: 20,
    backgroundColor: "#F0F2F5",
    borderRadius: 10,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  confidenceBar: {
    height: "100%",
    backgroundColor: "#3A7BFF",
    borderRadius: 10,
  },
  confidenceText: {
    position: "absolute",
    right: 8,
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  sentimentOverallContainer: {
    alignItems: "center",
  },
  sentimentOverallLabel: {
    fontSize: 16,
    color: "#2C3E50",
    marginBottom: 12,
  },
  sentimentIndicatorContainer: {
    width: "100%",
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
    position: "relative",
  },
  sentimentGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 4,
  },
  sentimentIndicator: {
    position: "absolute",
    top: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#3A7BFF",
    transform: [{ translateX: -10 }],
  },
  sentimentValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3A7BFF",
  },
  qaItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F2F5",
  },
  questionContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  questionText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#3A7BFF",
  },
  answerContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginLeft: 24,
  },
  answerText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: "#2C3E50",
  },
  toolbarContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "white",
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
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
  toolButton: {
    alignItems: "center",
    paddingHorizontal: 12,
  },
  toolButtonText: {
    fontSize: 12,
    marginTop: 4,
    color: "#3A7BFF",
  },
});
