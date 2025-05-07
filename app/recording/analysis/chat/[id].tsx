import { useState, useEffect, useRef } from "react";
import { StyleSheet, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, FlatList, ActivityIndicator, Keyboard, SafeAreaView } from "react-native";
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

export default function AIChat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // 初始歡迎消息
  useEffect(() => {
    const welcomeMessage: Message = {
      id: "welcome",
      text: "歡迎使用智能問答功能！我已經分析了您的錄音內容，您可以向我詢問任何關於該錄音的問題，例如:\n- 這個錄音的主要內容是什麼？\n- 有哪些關鍵決策被提及？\n- 總結一下會議的重點",
      isUser: false,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  // 發送新消息
  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
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
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateMockResponse(inputText, id),
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
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

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}>
      <Stack.Screen
        options={{
          title: "智能問答",
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

          <View style={styles.inputContainer}>
            <TextInput style={styles.textInput} value={inputText} onChangeText={setInputText} placeholder="輸入您的問題..." placeholderTextColor="#9CA3AF" multiline />
            <TouchableOpacity style={[styles.sendButton, !inputText.trim() && styles.disabledButton]} onPress={sendMessage} disabled={!inputText.trim()}>
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
