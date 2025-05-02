/**
 * 法律資訊頁面
 *
 * 本頁面提供應用程式的法律相關資訊，包括:
 * - 隱私權政策
 * - 服務條款
 * - 資料處理聲明
 */

import { StyleSheet, ScrollView, View, TouchableOpacity, Dimensions, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useRef } from "react";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

const TabBar = ({ activeTab, setActiveTab }: { activeTab: number; setActiveTab: (index: number) => void }) => {
  const tabs = ["隱私權政策", "服務條款"];
  const translateX = useRef(new Animated.Value(0)).current;
  const tabWidth = Dimensions.get("window").width / tabs.length;

  const handleTabPress = (index: number) => {
    Animated.spring(translateX, {
      toValue: index * tabWidth,
      useNativeDriver: true,
    }).start();
    setActiveTab(index);
  };

  return (
    <View style={styles.tabContainer}>
      {tabs.map((tab, index) => (
        <TouchableOpacity key={index} style={[styles.tab, { width: tabWidth }]} onPress={() => handleTabPress(index)} activeOpacity={0.7}>
          <ThemedText style={[styles.tabText, activeTab === index && styles.activeTabText]}>{tab}</ThemedText>
        </TouchableOpacity>
      ))}
      <Animated.View
        style={[
          styles.tabIndicator,
          {
            width: tabWidth,
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  );
};

export default function LegalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState(0);

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* 頂部設計元素 */}
      <LinearGradient
        colors={["rgba(58, 123, 255, 0.1)", "rgba(58, 123, 255, 0)"]}
        style={[styles.headerBackground, { paddingTop: insets.top }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      {/* 頂部標題欄 */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color="#3A7BFF" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>法律資訊</ThemedText>
        <View style={{ width: 40 }} />
      </View>

      {/* 標籤欄 */}
      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* 隱私權政策部分 */}
        {activeTab === 0 && (
          <View style={styles.section}>
            <ThemedText style={styles.paragraph}>最後更新日期：2023年12月15日</ThemedText>

            <ThemedText style={styles.paragraph}>
              智音坊（以下簡稱「我們」）重視您的隱私。本隱私權政策說明我們在您使用智音坊應用程式時如何收集、使用和保護您的個人資料。
            </ThemedText>

            <ThemedText style={styles.subTitle}>資料收集</ThemedText>
            <ThemedText style={styles.paragraph}>我們可能收集以下類型的資料：</ThemedText>
            <View style={styles.bulletList}>
              <ThemedText style={styles.bulletItem}>• 您創建的音訊錄音</ThemedText>
              <ThemedText style={styles.bulletItem}>• 使用偏好和設定</ThemedText>
              <ThemedText style={styles.bulletItem}>• 應用程式使用統計資料</ThemedText>
              <ThemedText style={styles.bulletItem}>• 裝置資訊（作業系統、裝置型號等）</ThemedText>
            </View>

            <ThemedText style={styles.subTitle}>資料使用</ThemedText>
            <ThemedText style={styles.paragraph}>我們使用收集的資料來：</ThemedText>
            <View style={styles.bulletList}>
              <ThemedText style={styles.bulletItem}>• 提供並改進我們的服務</ThemedText>
              <ThemedText style={styles.bulletItem}>• 個人化您的使用體驗</ThemedText>
              <ThemedText style={styles.bulletItem}>• 開發新功能</ThemedText>
              <ThemedText style={styles.bulletItem}>• 分析應用程式效能和使用情況</ThemedText>
            </View>

            <ThemedText style={styles.subTitle}>資料存儲</ThemedText>
            <ThemedText style={styles.paragraph}>您的錄音檔案儲存在您的裝置上。我們不會在未經您明確許可的情況下將您的錄音上傳到我們的伺服器。</ThemedText>

            <ThemedText style={styles.subTitle}>第三方服務</ThemedText>
            <ThemedText style={styles.paragraph}>我們可能使用第三方服務來協助分析應用程式使用情況，這些服務可能收集匿名使用資料。</ThemedText>

            <ThemedText style={styles.subTitle}>安全措施</ThemedText>
            <ThemedText style={styles.paragraph}>我們採取合理的技術和組織措施來保護您的資料不被未經授權的訪問或洩露。</ThemedText>

            <ThemedText style={styles.subTitle}>隱私權變更</ThemedText>
            <ThemedText style={styles.paragraph}>我們可能會不時更新本隱私權政策。我們會在應用程式內通知您重要變更。</ThemedText>

            {/* 聯絡資訊 */}
            <ThemedText style={styles.subTitle}>聯絡我們</ThemedText>
            <ThemedText style={styles.paragraph}>如果您對我們的隱私權政策有任何疑問，請透過以下方式聯絡我們：</ThemedText>
            <ThemedText style={styles.paragraph}>電子郵件：support@voiceaiapp.com</ThemedText>
          </View>
        )}

        {/* 服務條款部分 */}
        {activeTab === 1 && (
          <View style={styles.section}>
            <ThemedText style={styles.paragraph}>最後更新日期：2023年12月15日</ThemedText>

            <ThemedText style={styles.paragraph}>歡迎使用智音坊。使用我們的應用程式，即表示您同意遵守以下條款。</ThemedText>

            <ThemedText style={styles.subTitle}>使用限制</ThemedText>
            <ThemedText style={styles.paragraph}>您同意不以任何可能破壞、禁用或損害應用程式功能的方式使用本應用程式。</ThemedText>

            <ThemedText style={styles.subTitle}>知識產權</ThemedText>
            <ThemedText style={styles.paragraph}>
              智音坊及其內容（包括但不限於軟體、設計、文字和圖形）的所有權利均為我們所有。您不得複製、修改、分發或銷售應用程式的任何部分。
            </ThemedText>

            <ThemedText style={styles.subTitle}>免責聲明</ThemedText>
            <ThemedText style={styles.paragraph}>本應用程式按「現狀」提供，不提供任何明示或暗示的保證。我們不保證應用程式將不中斷運行或無錯誤。</ThemedText>

            <ThemedText style={styles.subTitle}>服務變更</ThemedText>
            <ThemedText style={styles.paragraph}>我們保留隨時修改或中止服務的權利，恕不另行通知。</ThemedText>

            <ThemedText style={styles.subTitle}>準據法</ThemedText>
            <ThemedText style={styles.paragraph}>這些條款受台灣法律管轄，並依據台灣法律解釋。</ThemedText>

            {/* 聯絡資訊 */}
            <ThemedText style={styles.subTitle}>聯絡我們</ThemedText>
            <ThemedText style={styles.paragraph}>如果您對我們的服務條款有任何疑問，請透過以下方式聯絡我們：</ThemedText>
            <ThemedText style={styles.paragraph}>電子郵件：support@voiceaiapp.com</ThemedText>
          </View>
        )}
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
    height: 150,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#3A7BFF",
    height: 48,
    position: "relative",
  },
  tab: {
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.7)",
    textTransform: "uppercase",
  },
  activeTabText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  tabIndicator: {
    position: "absolute",
    height: 3,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 8,
    color: "#3A7BFF",
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  bulletList: {
    marginLeft: 10,
    marginBottom: 15,
  },
  bulletItem: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
});
