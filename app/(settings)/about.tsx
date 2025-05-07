/**
 * 關於頁面
 *
 * 本頁面提供應用程式的詳細資訊，包括:
 * - 應用程式簡介和版本信息
 * - 主要功能介紹
 * - 團隊背景故事
 * - 聯絡方式和版權信息
 */

import { StyleSheet, View, ScrollView, Image, TouchableOpacity, Platform } from "react-native";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function AboutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
          關於錄智AI
        </ThemedText>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 20 }]} showsVerticalScrollIndicator={false}>
        {/* 應用程式 Logo */}
        <View style={styles.logoContainer}>
          <Image source={require("../../assets/images/icon.png")} style={styles.logoImage} resizeMode="contain" />
          <ThemedText style={styles.appName}>錄智 AI</ThemedText>
          <ThemedText style={styles.versionText}>版本 1.0.0 (Build 2)</ThemedText>
        </View>

        {/* 應用程式介紹 */}
        <View style={styles.sectionContainer}>
          <ThemedText style={styles.sectionTitle}>我們的故事</ThemedText>
          <ThemedText style={styles.descriptionText}>
            錄智通誕生於2025年，是由一群熱愛音訊技術的專家共同打造的專業錄音應用。我們的使命是為用戶提供簡單易用且功能強大的錄音工具，讓錄音和音訊處理變得輕鬆愉快。
          </ThemedText>
          <ThemedText style={styles.descriptionText}>
            無論是會議記錄、課堂筆記、採訪或音樂創作，錄智通都能滿足您的需求。我們致力於通過持續的產品更新和功能優化，為用戶帶來最佳的錄音體驗。
          </ThemedText>
        </View>

        {/* 主要功能 */}
        <View style={styles.sectionContainer}>
          <ThemedText style={styles.sectionTitle}>主要功能</ThemedText>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: "#6366F1" }]}>
              <Ionicons name="mic" size={22} color="#FFFFFF" />
            </View>
            <View style={styles.featureTextContainer}>
              <ThemedText style={styles.featureTitle}>高品質錄音</ThemedText>
              <ThemedText style={styles.featureDescription}>支援多種格式和採樣率的專業錄音功能</ThemedText>
            </View>
          </View>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: "#10B981" }]}>
              <Ionicons name="pulse" size={22} color="#FFFFFF" />
            </View>
            <View style={styles.featureTextContainer}>
              <ThemedText style={styles.featureTitle}>音訊編輯與處理</ThemedText>
              <ThemedText style={styles.featureDescription}>裁剪、合併、加入效果等專業編輯功能</ThemedText>
            </View>
          </View>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: "#F59E0B" }]}>
              <Ionicons name="text" size={22} color="#FFFFFF" />
            </View>
            <View style={styles.featureTextContainer}>
              <ThemedText style={styles.featureTitle}>文字轉錄</ThemedText>
              <ThemedText style={styles.featureDescription}>將錄音自動轉換為文字，支援多種語言</ThemedText>
            </View>
          </View>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: "#3B82F6" }]}>
              <Ionicons name="cloud-upload" size={22} color="#FFFFFF" />
            </View>
            <View style={styles.featureTextContainer}>
              <ThemedText style={styles.featureTitle}>雲端同步</ThemedText>
              <ThemedText style={styles.featureDescription}>自動備份錄音到雲端，多設備同步訪問</ThemedText>
            </View>
          </View>
        </View>

        {/* 聯絡我們 */}
        <View style={styles.sectionContainer}>
          <ThemedText style={styles.sectionTitle}>聯絡我們</ThemedText>
          <ThemedText style={styles.descriptionText}>我們非常重視您的反饋和建議，請通過以下方式與我們聯絡：</ThemedText>
          <View style={styles.contactItem}>
            <Ionicons name="mail-outline" size={18} color="#3A7BFF" />
            <ThemedText style={styles.contactText}>support@voiceai.com</ThemedText>
          </View>
          <View style={styles.contactItem}>
            <Ionicons name="globe-outline" size={18} color="#3A7BFF" />
            <ThemedText style={styles.contactText}>www.voiceai.com</ThemedText>
          </View>
        </View>

        {/* 版權信息 */}
        <View style={styles.copyrightContainer}>
          <ThemedText style={styles.copyrightText}>© 2024 錄智通. 保留所有權利。</ThemedText>
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
  logoContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  logoImage: {
    width: 100,
    height: 100,
    marginBottom: 16,
    borderRadius: 20,
  },
  appName: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  versionText: {
    fontSize: 14,
    color: "#718096",
  },
  sectionContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    color: "#3A7BFF",
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#4A5568",
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 16,
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
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: "#718096",
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  contactText: {
    fontSize: 16,
    color: "#4A5568",
    marginLeft: 10,
  },
  copyrightContainer: {
    marginTop: 16,
    marginBottom: 24,
    alignItems: "center",
  },
  copyrightText: {
    fontSize: 14,
    color: "#A0AEC0",
  },
});
