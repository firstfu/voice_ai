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

  // 預設推薦問題
  const defaultSuggestions: SuggestedQuestion[] = [
    { id: "1", text: "這次會談的主要內容是什麼？" },
    { id: "2", text: "社工師提出了哪些服務建議？" },
    { id: "3", text: "個案面臨的主要困境有哪些？" },
    { id: "4", text: "社工師運用了哪些評估方法？" },
    { id: "5", text: "會談中連結了哪些社會福利資源？" },
  ];

  // 初始歡迎消息
  useEffect(() => {
    const welcomeMessage: Message = {
      id: "welcome",
      text: "歡迎使用AI問答功能！我已經分析了您的個案會談錄音內容，您可以向我詢問關於個案評估、服務計畫、資源連結或會談技巧的相關問題，或選擇下方的推薦問題：",
      isUser: false,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
    setSuggestedQuestions(defaultSuggestions);
  }, []);

  // 根據對話上下文生成新的推薦問題
  const generateContextualSuggestions = (lastMessage: string) => {
    // 這裡可以基於最後一條AI訊息來決定下一步可能的問題
    if (lastMessage.includes("行動不便") || lastMessage.includes("居家安全") || lastMessage.includes("輔具")) {
      return [
        { id: "6", text: "李先生在家中面臨哪些主要安全風險？" },
        { id: "7", text: "社工師建議申請哪些輔具補助？" },
        { id: "8", text: "輔具補助的申請流程是什麼？" },
      ];
    } else if (lastMessage.includes("社區關懷據點") || lastMessage.includes("社交機會") || lastMessage.includes("孤獨感")) {
      return [
        { id: "9", text: "李先生目前的社會支持網絡如何？" },
        { id: "10", text: "社區關懷據點能提供哪些服務？" },
        { id: "11", text: "如何改善獨居長者的社會參與？" },
      ];
    } else if (lastMessage.includes("情感") || lastMessage.includes("情緒") || lastMessage.includes("態度")) {
      return [
        { id: "12", text: "李先生對接受服務的意願如何？" },
        { id: "13", text: "社工師如何建立與個案的信任關係？" },
        { id: "14", text: "會談結束時李先生的心理狀態有改善嗎？" },
      ];
    } else {
      // 默認問題集
      return [
        { id: "15", text: "這個案例中運用了哪些社會福利資源？" },
        { id: "16", text: "社工師安排了哪些後續追蹤計畫？" },
        { id: "17", text: "這次會談達成了哪些服務目標？" },
      ];
    }
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
      const aiResponseText = generateMockResponse(text, id);
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

  // 模擬 AI 回應 (實際應用中會使用真實 API)
  const generateMockResponse = (query: string, recordingId: string): string => {
    // 這裡只是模擬回應，實際應用中會調用真實的 AI API
    const possibleResponses = [
      "根據錄音內容分析，這次會談主要是社工師與獨居長者李先生討論其生活情況和所需支持。社工師評估了李先生的行動不便問題，特別是上下樓梯和廁所安全的風險，並提出申請輔具補助的建議。",
      "在這段錄音中，社工師提出的主要服務計畫包括：申請居家安全輔具補助、連結社區關懷據點增加社交機會，以及安排定期家訪關懷。這些決定都旨在改善李先生的生活品質和安全。",
      "錄音中的主要人物是社工師和獨居長者李先生。李先生提到他的子女長期在國外，很少聯絡，因此社會支持不足，感到孤獨。",
      "根據分析，會談的情感基調起初較為中性，隨著社工師提供具體協助方案後，情緒逐漸轉為正向。李先生對於社工師提出的社區資源連結表現出謹慎但樂觀的態度。",
      "這次會談的主要目的是評估獨居長者的居家安全和社會支持需求。社工師運用多面向評估，包括身體功能、居家環境安全、社會支持網絡和心理狀態等，並制定了相應的服務計畫。",
      "根據錄音轉錄，社工師評估了李先生的日常生活能力、居家安全風險和社會支持網絡。建議申請輔具補助改善居家安全，並連結社區關懷據點增加社交機會，以改善因子女長期在國外造成的孤獨感。",
    ];

    // 根據問題類型返回不同回應
    if (query.toLowerCase().includes("總結") || query.toLowerCase().includes("概述")) {
      return possibleResponses[0];
    } else if (query.toLowerCase().includes("決策") || query.toLowerCase().includes("建議") || query.toLowerCase().includes("服務計畫")) {
      return possibleResponses[1];
    } else if (query.toLowerCase().includes("誰") || query.toLowerCase().includes("人物") || query.toLowerCase().includes("家庭")) {
      return possibleResponses[2];
    } else if (query.toLowerCase().includes("情感") || query.toLowerCase().includes("氛圍") || query.toLowerCase().includes("情緒")) {
      return possibleResponses[3];
    } else if (query.toLowerCase().includes("目的") || query.toLowerCase().includes("為什麼") || query.toLowerCase().includes("評估")) {
      return possibleResponses[4];
    } else {
      return possibleResponses[5];
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
