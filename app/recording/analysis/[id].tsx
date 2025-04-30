import { useState, useEffect } from "react";
import { StyleSheet, View, TouchableOpacity, ScrollView, Platform, StatusBar, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import useAnalysisService, { AnalysisResult } from "@/hooks/useAnalysisService";

// 模擬的錄音詳情數據
const mockRecordings = {
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
      },
      {
        id: "2",
        speaker: "說話者 2",
        timestamp: "00:01:22",
        text: "上週我們完成了設計階段，主要界面已經定稿。關於開發階段，我認為我們需要先優先實現核心功能。",
      },
      {
        id: "3",
        speaker: "說話者 1",
        timestamp: "00:02:45",
        text: "我同意這個觀點，核心功能應該優先實現。根據我們的時間表，我們需要在下個月底前完成主要功能的開發。",
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
  // 其他錄音...保持原來的模擬數據結構
};

export default function AnalysisScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const recordingId = typeof id === "string" ? id : "1";

  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const { isLoading, error, getAnalysisResult, refreshAnalysis } = useAnalysisService();

  useEffect(() => {
    // 頁面加載時獲取分析結果
    loadAnalysisResult();
  }, [recordingId]);

  const loadAnalysisResult = async () => {
    const result = await getAnalysisResult(recordingId);
    if (result) {
      setAnalysisResult(result);
    }
  };

  const handleRefreshAnalysis = async () => {
    const recording = mockRecordings[recordingId];
    if (!recording) return;

    // 將錄音轉錄信息轉換為所需格式
    const transcription = recording.transcription.map(item => ({
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
              {analysisResult.topics.map((topic, index) => (
                <View key={index} style={styles.topicItem}>
                  <ThemedText style={styles.topicName}>{topic.name}</ThemedText>
                  <View style={styles.confidenceBarContainer}>
                    <View style={[styles.confidenceBar, { width: `${topic.confidence * 100}%` }]} />
                    <ThemedText style={styles.confidenceText}>{Math.round(topic.confidence * 100)}%</ThemedText>
                  </View>
                </View>
              ))}
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

      {/* 底部工具欄 */}
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.toolbarButton} onPress={handleRefreshAnalysis}>
          <Ionicons name="refresh-outline" size={24} color="#3A7BFF" />
          <ThemedText style={styles.toolbarButtonText}>重新分析</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolbarButton}>
          <Ionicons name="save-outline" size={24} color="#3A7BFF" />
          <ThemedText style={styles.toolbarButtonText}>匯出報告</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolbarButton}>
          <Ionicons name="share-social-outline" size={24} color="#3A7BFF" />
          <ThemedText style={styles.toolbarButtonText}>分享</ThemedText>
        </TouchableOpacity>
      </View>
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
  topicName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2C3E50",
    marginBottom: 4,
  },
  confidenceBarContainer: {
    height: 20,
    backgroundColor: "#F0F2F5",
    borderRadius: 10,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
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
