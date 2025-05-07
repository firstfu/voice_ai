/**
 * 錄音內容AI問答頁面
 *
 * 本頁面提供基於錄音內容的AI對話功能，允許用戶：
 * - 使用自然語言提問有關錄音內容的問題
 * - 獲取基於錄音分析結果的AI回答
 * - 查看並選擇上下文相關的推薦問題
 *
 * 主要功能：
 * - 聊天界面：顯示用戶提問和AI回答的對話流
 * - 推薦問題：根據對話內容動態生成相關的建議問題
 * - 訊息輸入：允許用戶自由輸入問題
 *
 * 頁面使用動畫效果增強用戶體驗，並根據用戶的提問自動生成相關的後續問題建議
 */

import { useState, useEffect, useRef } from "react";
import { StyleSheet, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, FlatList, ActivityIndicator, Keyboard, SafeAreaView, ScrollView } from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import Animated, { FadeIn } from "react-native-reanimated";

// 導入 chatData.json
import chatData from "@/app/recording/chatData.json";

// 定義消息類型
interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

// 定義推薦問題類型
interface SuggestedQuestion {
  id: string;
  text: string;
}

export default function AIChat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState<SuggestedQuestion[]>([]);
  const [recordingType, setRecordingType] = useState<string>("default");

  // 當 id 改變時，確定錄音類型
  useEffect(() => {
    if (id && chatData.recordingTypeMap[id as keyof typeof chatData.recordingTypeMap]) {
      setRecordingType(chatData.recordingTypeMap[id as keyof typeof chatData.recordingTypeMap]);
    } else {
      setRecordingType("default");
    }
  }, [id]);

  // 初始歡迎消息
  useEffect(() => {
    // 使用 chatData 中的歡迎訊息
    const welcomeMessage: Message = {
      id: "welcome",
      text: chatData.welcomeMessages[recordingType as keyof typeof chatData.welcomeMessages] || chatData.welcomeMessages.default,
      isUser: false,
      timestamp: new Date(),
    };

    setMessages([welcomeMessage]);

    // 使用 chatData 中的建議問題
    const questions = chatData.suggestedQuestions[recordingType as keyof typeof chatData.suggestedQuestions] || chatData.suggestedQuestions.default;

    const formattedQuestions: SuggestedQuestion[] = questions.map((text, index) => ({
      id: `${index + 1}`,
      text,
    }));

    setSuggestedQuestions(formattedQuestions);
  }, [recordingType]);

  // 根據對話上下文生成新的推薦問題
  const generateContextualSuggestions = (lastMessage: string) => {
    // 使用基本問題
    const baseQuestions = chatData.suggestedQuestions[recordingType as keyof typeof chatData.suggestedQuestions] || chatData.suggestedQuestions.default;

    // 從基本問題中選取3-4個不同的問題
    const shuffled = [...baseQuestions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(4, shuffled.length));

    return selected.map((text, index) => ({
      id: `sugg_${Date.now()}_${index}`,
      text,
    }));
  };

  // 發送新消息
  const sendMessage = async (text = inputText.trim()) => {
    if (!text) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text,
      isUser: true,
      timestamp: new Date(),
    };

    // 清空輸入框並添加用戶消息
    setInputText("");
    setMessages(prev => [...prev, userMessage]);
    Keyboard.dismiss();

    // 模擬 AI 思考狀態
    setIsLoading(true);

    // 模擬 API 請求延遲
    setTimeout(() => {
      const aiResponseText = generateMockResponse(text, id as string);
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);

      // 更新推薦問題
      setSuggestedQuestions(generateContextualSuggestions(aiResponseText));
    }, 1500);
  };

  // 處理推薦問題點擊
  const handleSuggestedQuestionClick = (question: string) => {
    sendMessage(question);
  };

  // 滾動到底部
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // 從 chatData.json 中獲取回應
  const generateMockResponse = (query: string, recordingId: string): string => {
    const type = chatData.recordingTypeMap[recordingId as keyof typeof chatData.recordingTypeMap] || "default";
    const responses = chatData.responses[type as keyof typeof chatData.responses] || chatData.responses.default;

    // 嘗試匹配問題關鍵字
    const lowercaseQuery = query.toLowerCase();
    let responseKey: string | null = null;

    // 根據問題類型選擇回應
    if (lowercaseQuery.includes("主要內容") || lowercaseQuery.includes("內容是什麼") || lowercaseQuery.includes("主題")) {
      if (type === "elderCare") {
        responseKey = "mainNeed";
      } else if (type === "domesticViolence") {
        responseKey = "childTraumaSymptoms";
      } else if (type === "youthGroup") {
        responseKey = "emotionManagementTechniques";
      } else if (type === "communityWork") {
        responseKey = "elderlyIssues";
      } else {
        responseKey = "mainContent";
      }
    } else if (lowercaseQuery.includes("服務建議") || lowercaseQuery.includes("補助") || lowercaseQuery.includes("建議")) {
      if (type === "elderCare") {
        responseKey = "equipmentSuggestions";
      } else if (type === "domesticViolence") {
        responseKey = "protectionMeasures";
      } else if (type === "caseConference") {
        responseKey = "therapeuticRecommendations";
      } else {
        responseKey = "serviceRecommendations";
      }
    } else if (lowercaseQuery.includes("安全") || lowercaseQuery.includes("風險")) {
      if (type === "elderCare") {
        responseKey = "safetyRisks";
      } else if (type === "domesticViolence") {
        responseKey = "safetyRisks";
      } else if (type === "networkMeeting") {
        responseKey = "safetyPlanEnhancement";
      } else {
        responseKey = "assessment";
      }
    } else if (lowercaseQuery.includes("照顧") || lowercaseQuery.includes("服務提供")) {
      if (type === "elderCare") {
        responseKey = "careServices";
      } else {
        responseKey = "clientNeeds";
      }
    } else if (lowercaseQuery.includes("評估") || lowercaseQuery.includes("如何評估")) {
      if (type === "elderCare") {
        responseKey = "mobilityAssessment";
      } else if (type === "caseConference") {
        responseKey = "suicideAssessment";
      } else if (type === "youthGroup") {
        responseKey = "effectivenessEvaluation";
      } else {
        responseKey = "assessment";
      }
    } else {
      // 找到第一個可用的回應
      const keys = Object.keys(responses);
      if (keys.length > 0) {
        responseKey = keys[0];
      }
    }

    // 如果找到對應回應，返回；否則返回預設回應
    if (responseKey && responses[responseKey as keyof typeof responses]) {
      return responses[responseKey as keyof typeof responses];
    } else {
      return "抱歉，我目前無法回答這個問題。請嘗試詢問關於錄音內容的其他問題，或選擇下方的推薦問題。";
    }
  };

  // 消息氣泡組件
  const MessageBubble = ({ message }: { message: Message }) => (
    <Animated.View entering={FadeIn.duration(300)} style={[styles.messageBubble, message.isUser ? styles.userBubble : styles.aiBubble]}>
      <ThemedText style={[styles.messageText, message.isUser ? styles.userText : styles.aiText]}>{message.text}</ThemedText>
    </Animated.View>
  );

  // 推薦問題組件
  const SuggestedQuestions = () => (
    <View style={styles.suggestedQuestionsContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestedQuestionsScrollContent}>
        {suggestedQuestions.map(question => (
          <TouchableOpacity key={question.id} style={styles.suggestedQuestionBubble} onPress={() => handleSuggestedQuestionClick(question.text)}>
            <ThemedText style={styles.suggestedQuestionText}>{question.text}</ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}>
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.innerContainer}>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <MessageBubble message={item} />}
            contentContainerStyle={styles.messageList}
          />

          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#3A7BFF" />
              <ThemedText style={styles.loadingText}>AI 思考中...</ThemedText>
            </View>
          )}

          {messages.length > 0 && !isLoading && <SuggestedQuestions />}

          <View style={styles.inputContainer}>
            <TextInput style={styles.textInput} value={inputText} onChangeText={setInputText} placeholder="輸入您的問題..." placeholderTextColor="#9CA3AF" multiline />
            <TouchableOpacity style={[styles.sendButton, !inputText.trim() && styles.disabledButton]} onPress={() => sendMessage()} disabled={!inputText.trim()}>
              <Ionicons name="send" size={20} color={inputText.trim() ? "white" : "#9CA3AF"} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
  },
  messageList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
    maxWidth: "80%",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  userBubble: {
    backgroundColor: "#3A7BFF",
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: "#EBEEF5",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: "white",
  },
  aiText: {
    color: "#2C3E50",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginLeft: 16,
    marginBottom: 12,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#6B7280",
  },
  suggestedQuestionsContainer: {
    marginBottom: 12,
    marginTop: 8,
    paddingHorizontal: 16,
  },
  suggestedQuestionsScrollContent: {
    paddingRight: 24, // Extra padding for better scrolling experience
  },
  suggestedQuestionBubble: {
    backgroundColor: "#F0F6FF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#D0E1FF",
  },
  suggestedQuestionText: {
    fontSize: 14,
    color: "#3A7BFF",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#F0F2F5",
    backgroundColor: "white",
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: "#F0F2F5",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 16,
    color: "#1F2937",
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3A7BFF",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: "#E5E7EB",
  },
});
