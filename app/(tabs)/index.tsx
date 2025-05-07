/**
 * 主頁畫面
 *
 * 本頁面是應用程式的主要入口點，功能包括:
 * - 快速錄音按鈕（帶有動畫效果）
 * - 最近錄音列表顯示
 * - 使用者個人資料入口
 * - 分類導航選項
 * - 視覺化佈局與漸變背景
 */

import { StyleSheet, TouchableOpacity, FlatList, View, Platform, StatusBar, Image, ScrollView, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useRef } from "react";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack } from "expo-router";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { BlurView } from "expo-blur";

// 模擬的最近錄音數據
const recentRecordings = [
  {
    id: "1",
    title: "會議記錄 - 5月12日",
    duration: "00:32:15",
    date: "2024-05-12",
    category: "工作",
    color: "#F59E0B",
  },
  {
    id: "2",
    title: "課堂筆記 - 5月10日",
    duration: "01:15:42",
    date: "2024-05-10",
    category: "學習",
    color: "#3B82F6",
  },
  {
    id: "3",
    title: "訪談 - 5月8日",
    duration: "00:45:30",
    date: "2024-05-08",
    category: "工作",
    color: "#F59E0B",
  },
  {
    id: "4",
    title: "個人筆記 - 5月5日",
    duration: "00:12:08",
    date: "2024-05-05",
    category: "個人",
    color: "#8B5CF6",
  },
];

// 分類列表
const categories = [
  { id: "all", name: "全部", icon: "apps", color: "#3A7BFF" },
  { id: "work", name: "工作", icon: "briefcase", color: "#F59E0B" },
  { id: "study", name: "學習", icon: "school", color: "#3B82F6" },
  { id: "personal", name: "個人", icon: "person", color: "#8B5CF6" },
];

// 定義錄音項目的介面
interface Recording {
  id: string;
  title: string;
  duration: string;
  date: string;
  category: string;
  color: string;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const recordButtonScale = useSharedValue(1);
  const scrollViewRef = useRef<ScrollView>(null);

  // 錄音按鈕動畫效果
  const recordButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: recordButtonScale.value }],
    };
  });

  const handleStartRecording = () => {
    // 按下時縮小
    recordButtonScale.value = withSpring(0.95, { damping: 10 });

    // 釋放時回彈
    setTimeout(() => {
      recordButtonScale.value = withSpring(1, { damping: 8 });
    }, 200);

    // 導航到錄音頁面
    router.push("/recording/new");
  };

  const handleOpenRecording = (recordingId: string) => {
    // 導航到錄音詳情頁面
    router.push({
      pathname: "/recording/[id]",
      params: { id: recordingId },
    });
  };

  const renderRecordingItem = ({ item, index }: { item: Recording; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 100).duration(300)}>
      <TouchableOpacity style={styles.recordingItem} onPress={() => handleOpenRecording(item.id)} activeOpacity={0.8}>
        <View style={styles.recordingContent}>
          <View style={[styles.categoryIndicator, { backgroundColor: item.color }]} />
          <View style={styles.recordingDetails}>
            <ThemedText type="defaultSemiBold" style={styles.recordingTitle}>
              {item.title}
            </ThemedText>
            <View style={styles.recordingMeta}>
              <ThemedText style={styles.recordingCategory}>{item.category}</ThemedText>
              <View style={styles.bulletPoint} />
              <ThemedText style={styles.recordingDuration}>{item.duration}</ThemedText>
            </View>
          </View>
          <View style={styles.recordingActions}>
            <TouchableOpacity style={styles.playButton} onPress={() => handleOpenRecording(item.id)}>
              <Ionicons name="play" size={16} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.moreButton}>
              <Ionicons name="ellipsis-horizontal" size={18} color="#A0AEC0" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <ThemedView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* 禁用內建標題欄 */}
      <Stack.Screen options={{ headerShown: false }} />

      {/* 頂部漸變背景 */}
      <LinearGradient
        colors={["rgba(58, 123, 255, 0.08)", "rgba(0, 194, 168, 0.03)", "rgba(255, 255, 255, 0)"]}
        style={[styles.headerBackground, { paddingTop: insets.top }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* 固定的頂部導航欄 */}
      <View style={[styles.fixedHeaderContainer, { paddingTop: insets.top }]}>
        <View style={styles.titleRow}>
          <View>
            <ThemedText style={styles.welcomeText}>歡迎回來</ThemedText>
            <ThemedText type="title" style={styles.titleText}>
              錄智通
            </ThemedText>
          </View>
          <TouchableOpacity style={styles.profileButton} onPress={() => router.push("/settings")}>
            <Image source={require("@/assets/images/profile-avatar.png")} style={styles.profileImage} defaultSource={require("@/assets/images/profile-avatar.png")} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + 90 }]} // 增加頂部空間以避免與導航欄重疊
        showsVerticalScrollIndicator={false}
      >
        {/* 快速錄音按鈕 */}
        <AnimatedTouchable style={[styles.startRecordingButtonContainer, recordButtonStyle]} onPress={handleStartRecording} activeOpacity={0.9}>
          <LinearGradient colors={["#3A7BFF", "#00C2A8"]} style={styles.startRecordingButton} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Ionicons name="mic" size={32} color="white" />
            <ThemedText style={styles.startRecordingText}>按下開始錄音</ThemedText>
          </LinearGradient>
        </AnimatedTouchable>

        {/* 最近錄音列表 */}
        <View style={styles.recentRecordingsContainer}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">最近錄音</ThemedText>
            <TouchableOpacity style={styles.viewAllButton} onPress={() => router.push("/recordings")}>
              <ThemedText style={styles.viewAllText}>查看全部</ThemedText>
              <Ionicons name="chevron-forward" size={16} color="#3A7BFF" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={recentRecordings}
            renderItem={renderRecordingItem}
            keyExtractor={item => item.id}
            style={styles.recordingsList}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
            contentContainerStyle={styles.recordingsListContent}
          />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 250,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  fixedHeaderContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.1)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  headerContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    marginTop: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: "#64748B",
    marginBottom: 4,
  },
  titleText: {
    fontSize: 28,
    fontWeight: "700",
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#F8F9FA",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  profileImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  startRecordingButtonContainer: {
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#3A7BFF",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  startRecordingButton: {
    height: 64,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  startRecordingText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 12,
  },
  recentRecordingsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllText: {
    color: "#3A7BFF",
    fontSize: 14,
    fontWeight: "500",
  },
  recordingsList: {
    flex: 1,
  },
  recordingsListContent: {
    paddingBottom: 20,
  },
  recordingItem: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  recordingContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  categoryIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 14,
  },
  recordingDetails: {
    flex: 1,
  },
  recordingTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  recordingMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  recordingCategory: {
    fontSize: 13,
    color: "#64748B",
  },
  bulletPoint: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#64748B",
    marginHorizontal: 6,
  },
  recordingDuration: {
    fontSize: 13,
    color: "#64748B",
  },
  recordingActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#3A7BFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  moreButton: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    color: "#A0AEC0",
    fontSize: 16,
    marginTop: 12,
  },
});
