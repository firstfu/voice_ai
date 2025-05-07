/**
 * 幫助與支援頁面
 *
 * 本頁面提供使用者支援資訊，包括:
 * - 常見問題解答(FAQ)
 * - 客戶支援聯絡方式
 * - 使用者反饋提交功能
 * - 應用程式使用指南
 */

import { StyleSheet, View, ScrollView, TouchableOpacity, Platform } from "react-native";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export default function HelpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const faqs: FAQ[] = [
    {
      id: "1",
      question: "如何開始錄音？",
      answer: "在首頁點擊中央的「開始錄音」按鈕即可開始錄音。錄音過程中，您可以暫停、繼續或停止錄音。錄音完成後，會自動保存到您的錄音列表中。",
    },
    {
      id: "2",
      question: "如何編輯我的錄音？",
      answer:
        "在錄音列表中選擇您想編輯的錄音，點擊進入詳情頁面。在詳情頁面中，您可以找到編輯選項，包括裁剪、分割、合併等功能。編輯完成後，可以選擇保存為新文件或覆蓋原文件。",
    },
    {
      id: "3",
      question: "如何調整錄音質量？",
      answer:
        "在設置頁面中，您可以找到「錄音與播放」設置選項。在此可以調整錄音格式、採樣率和比特率等參數。選擇高品質錄音選項可獲得更好的音質，但會占用更多存儲空間。",
    },
    {
      id: "4",
      question: "如何將錄音轉換為文字？",
      answer:
        "在錄音詳情頁面，點擊「轉錄」按鈕即可開始將錄音轉換為文字。轉錄過程可能需要一些時間，具體取決於錄音長度和網絡連接情況。轉錄完成後，您可以編輯、複製或分享文本內容。",
    },
    {
      id: "5",
      question: "如何分享我的錄音？",
      answer:
        "在錄音詳情頁面，點擊分享圖標可以通過多種方式分享您的錄音，包括發送電子郵件、簡訊或通過其他應用程式分享。您可以選擇分享原始文件或轉換為其他常見格式後分享。",
    },
    {
      id: "6",
      question: "如何備份我的錄音？",
      answer:
        "在設置頁面中，您可以開啟「雲端同步」功能，自動將您的錄音備份到雲端存儲。您也可以在錄音管理頁面批量選擇錄音，然後使用導出功能將錄音保存到其他位置。",
    },
    {
      id: "7",
      question: "應用程式支援哪些錄音格式？",
      answer: "錄智通支援多種常見的音訊格式，包括但不限於MP3、WAV、AAC、FLAC等。在進階音訊設定中，您可以選擇不同的編碼格式和質量等級。",
    },
    {
      id: "8",
      question: "如何提高錄音的音質？",
      answer:
        "為獲得最佳錄音效果，建議在相對安靜的環境中錄音，將設備放在靠近聲音來源的位置。在設置中選擇高品質錄音選項，並確保您的設備有足夠的存儲空間。使用外接麥克風也可以顯著提高錄音質量。",
    },
  ];

  const toggleFAQ = (id: string) => {
    if (expandedFAQ === id) {
      setExpandedFAQ(null);
    } else {
      setExpandedFAQ(id);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="dark" />
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* 頂部漸變背景 */}
      <LinearGradient
        colors={["rgba(58, 123, 255, 0.2)", "rgba(58, 123, 255, 0)"]}
        style={[styles.headerBackground, { paddingTop: insets.top }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      {/* 頂部導航欄 */}
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#3A7BFF" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>
          幫助與支援
        </ThemedText>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* 介紹部分 */}
        <View style={styles.introContainer}>
          <ThemedText style={styles.introText}>
            我們希望為您提供最好的使用體驗。如果您有任何問題或需要協助，請查看以下常見問題或聯絡我們的客戶支援團隊。
          </ThemedText>
        </View>

        {/* 常見問題 */}
        <View style={styles.faqContainer}>
          <ThemedText style={styles.sectionTitle}>常見問題</ThemedText>

          {faqs.map(faq => (
            <View key={faq.id} style={styles.faqItem}>
              <TouchableOpacity style={styles.faqQuestionContainer} onPress={() => toggleFAQ(faq.id)} activeOpacity={0.7}>
                <ThemedText style={styles.faqQuestion}>{faq.question}</ThemedText>
                <Ionicons name={expandedFAQ === faq.id ? "chevron-up" : "chevron-down"} size={20} color="#3A7BFF" />
              </TouchableOpacity>

              {expandedFAQ === faq.id && (
                <View style={styles.faqAnswerContainer}>
                  <ThemedText style={styles.faqAnswer}>{faq.answer}</ThemedText>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* 聯絡支援 */}
        <View style={styles.supportContainer}>
          <ThemedText style={styles.sectionTitle}>聯絡客戶支援</ThemedText>

          <View style={styles.supportCard}>
            <View style={styles.supportMethod}>
              <View style={[styles.supportIcon, { backgroundColor: "#3B82F6" }]}>
                <Ionicons name="mail" size={22} color="#FFFFFF" />
              </View>
              <View style={styles.supportTextContainer}>
                <ThemedText style={styles.supportTitle}>電子郵件</ThemedText>
                <ThemedText style={styles.supportInfo}>support@voiceai.com</ThemedText>
                <ThemedText style={styles.supportDescription}>一般回覆時間: 24-48小時</ThemedText>
              </View>
            </View>

            <View style={styles.supportMethod}>
              <View style={[styles.supportIcon, { backgroundColor: "#10B981" }]}>
                <Ionicons name="chatbubbles" size={22} color="#FFFFFF" />
              </View>
              <View style={styles.supportTextContainer}>
                <ThemedText style={styles.supportTitle}>線上客服</ThemedText>
                <ThemedText style={styles.supportInfo}>www.voiceai.com/support</ThemedText>
                <ThemedText style={styles.supportDescription}>營業時間: 週一至週五 9:00-18:00</ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* 提交反饋 */}
        <TouchableOpacity style={styles.feedbackButton} activeOpacity={0.8} onPress={() => console.log("提交反饋")}>
          <Ionicons name="create-outline" size={20} color="#FFFFFF" />
          <ThemedText style={styles.feedbackButtonText}>提交反饋或建議</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 180,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    alignItems: "center",
    justifyContent: "center",
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
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
  },
  introContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  introText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#4A5568",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    color: "#3A7BFF",
  },
  faqContainer: {
    marginBottom: 30,
  },
  faqItem: {
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  faqQuestionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
    marginRight: 8,
  },
  faqAnswerContainer: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: "rgba(226, 232, 240, 0.5)",
  },
  faqAnswer: {
    fontSize: 15,
    lineHeight: 22,
    color: "#4A5568",
  },
  supportContainer: {
    marginBottom: 30,
  },
  supportCard: {
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  supportMethod: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(226, 232, 240, 0.5)",
    marginBottom: 12,
  },
  supportIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  supportTextContainer: {
    flex: 1,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  supportInfo: {
    fontSize: 15,
    color: "#3A7BFF",
    marginBottom: 4,
  },
  supportDescription: {
    fontSize: 13,
    color: "#718096",
  },
  feedbackButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3A7BFF",
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 30,
    ...Platform.select({
      ios: {
        shadowColor: "#3A7BFF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  feedbackButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
