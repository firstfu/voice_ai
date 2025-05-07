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
    { id: "1", text: "這個錄音的主要內容是什麼？" },
    { id: "2", text: "有哪些關鍵決策被提及？" },
    { id: "3", text: "總結一下會議的重點" },
    { id: "4", text: "誰是這次會議的主要參與者？" },
    { id: "5", text: "會議的整體氛圍如何？" },
  ];

  // 初始歡迎消息
  useEffect(() => {
    const welcomeMessage: Message = {
      id: "welcome",
      text: "歡迎使用AI問答功能！我已經分析了您的錄音內容，您可以向我詢問任何關於該錄音的問題，或選擇下方的推薦問題：",
      isUser: false,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
    setSuggestedQuestions(defaultSuggestions);
  }, []);

  // 根據對話上下文生成新的推薦問題
  const generateContextualSuggestions = (lastMessage: string) => {
    // 這裡可以基於最後一條AI訊息來決定下一步可能的問題
    if (lastMessage.includes("專案進度") || lastMessage.includes("核心功能")) {
      return [
        { id: "6", text: "核心功能的實現順序是什麼？" },
        { id: "7", text: "有沒有提到專案的截止日期？" },
        { id: "8", text: "團隊目前遇到了哪些挑戰？" },
      ];
    } else if (lastMessage.includes("測試") || lastMessage.includes("測試計劃")) {
      return [
        { id: "9", text: "測試計劃的具體內容是什麼？" },
        { id: "10", text: "誰負責測試工作？" },
        { id: "11", text: "測試階段的時間安排如何？" },
      ];
    } else if (lastMessage.includes("情感") || lastMessage.includes("氛圍")) {
      return [
        { id: "12", text: "有沒有出現意見分歧的情況？" },
        { id: "13", text: "團隊成員的參與度如何？" },
        { id: "14", text: "會議結束時的整體結論是正面的嗎？" },
      ];
    } else {
      // 默認問題集
      return [
        { id: "15", text: "這個錄音中有哪些重要數據被提及？" },
        { id: "16", text: "有哪些後續行動計劃？" },
        { id: "17", text: "會議達成了哪些共識？" },
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
      "根據錄音內容分析，這次會議主要討論了專案進度和下一步計劃。團隊計劃先實現核心功能，並討論了測試計劃的安排。",
      "在這段錄音中，主要決定包括：優先實現核心功能、分階段進行測試、以及安排下一次會議討論測試細節。",
      "錄音中提到的關鍵人物包括三位發言者，他們分別代表了開發、設計和測試團隊。",
      "根據分析，會議的情感基調較為正面和專業，團隊成員之間合作良好，對專案未來發展表現出信心。",
      "這次會議的主要目的是審視專案進度並計劃下一階段工作。團隊決定優先開發核心功能，並制定了初步的測試策略。",
      "根據錄音轉錄，參會者討論了設計階段的完成情況、開發階段的優先事項以及測試計劃的安排。決定下週再開一次會議討論測試細節。",
    ];

    // 根據問題類型返回不同回應
    if (query.toLowerCase().includes("總結") || query.toLowerCase().includes("概述")) {
      return possibleResponses[0];
    } else if (query.toLowerCase().includes("決策") || query.toLowerCase().includes("決定")) {
      return possibleResponses[1];
    } else if (query.toLowerCase().includes("誰") || query.toLowerCase().includes("人物")) {
      return possibleResponses[2];
    } else if (query.toLowerCase().includes("情感") || query.toLowerCase().includes("氛圍")) {
      return possibleResponses[3];
    } else if (query.toLowerCase().includes("目的") || query.toLowerCase().includes("為什麼")) {
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
      <Stack.Screen
        options={{
          title: "AI問答",
          headerShown: true,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: "#F8F9FA",
          },
        }}
      />

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
