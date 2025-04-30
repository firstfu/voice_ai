import { StyleSheet, TouchableOpacity, FlatList, View, Platform, StatusBar, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

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
  },
  {
    id: "2",
    title: "課堂筆記 - 5月10日",
    duration: "01:15:42",
    date: "2024-05-10",
  },
  {
    id: "3",
    title: "訪談 - 5月8日",
    duration: "00:45:30",
    date: "2024-05-08",
  },
  {
    id: "4",
    title: "個人筆記 - 5月5日",
    duration: "00:12:08",
    date: "2024-05-05",
  },
];

// 定義錄音項目的介面
interface Recording {
  id: string;
  title: string;
  duration: string;
  date: string;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function HomeScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const recordButtonScale = useSharedValue(1);

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

    // 導航到錄音頁面或啟動錄音功能
    console.log("開始錄音");
    // 在實際應用中: router.push('/recording');
  };

  const handleOpenRecording = (recordingId: string) => {
    console.log(`打開錄音 ${recordingId}`);
    // 導航到錄音詳情頁面
    router.push({
      pathname: "/recording/[id]",
      params: { id: recordingId },
    });
  };

  const renderRecordingItem = ({ item, index }: { item: Recording; index: number }) => (
    <Animated.View entering={FadeIn.delay(index * 100).duration(400)}>
      <TouchableOpacity style={styles.recordingItem} onPress={() => handleOpenRecording(item.id)} activeOpacity={0.7}>
        <LinearGradient colors={["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0.05)"]} style={styles.recordingItemGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.recordingIconContainer}>
            <Ionicons name="mic-outline" size={24} color="#3A7BFF" />
          </View>
          <View style={styles.recordingContent}>
            <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
            <ThemedText style={styles.recordingDuration}>{item.duration}</ThemedText>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#A0AEC0" />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <ThemedView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* 頂部標題區 */}
      <View style={styles.headerContainer}>
        <View style={styles.titleContainer}>
          <ThemedText type="title" style={styles.titleText}>
            智音坊
          </ThemedText>
        </View>
      </View>

      {/* 主內容區 */}
      <View style={styles.mainContent}>
        {/* 錄音按鈕 */}
        <AnimatedTouchable style={[styles.startRecordingButtonContainer, recordButtonStyle]} onPress={handleStartRecording} activeOpacity={0.9}>
          <LinearGradient colors={["#3A7BFF", "#00C2A8"]} style={styles.startRecordingButton} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <View style={styles.micIconCircle}>
              <Ionicons name="mic" size={32} color="white" />
            </View>
            <ThemedText style={styles.startRecordingText}>開始錄音</ThemedText>
          </LinearGradient>
        </AnimatedTouchable>

        {/* 快捷按鈕區 */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity style={styles.quickActionButton} onPress={() => router.push("/recording/manage")}>
            <Ionicons name="list-outline" size={22} color="#3A7BFF" />
            <ThemedText style={styles.quickActionText}>管理錄音</ThemedText>
          </TouchableOpacity>
        </View>

        {/* 最近錄音列表 */}
        <View style={styles.recentRecordingsContainer}>
          <ThemedText type="subtitle" style={styles.sectionHeader}>
            最近錄音
          </ThemedText>

          <FlatList
            data={recentRecordings}
            renderItem={renderRecordingItem}
            keyExtractor={item => item.id}
            style={styles.recordingsList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.recordingsListContent}
          />
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  titleText: {
    fontSize: 28,
    fontWeight: "700",
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  startRecordingButtonContainer: {
    marginTop: 20,
    marginBottom: 40,
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
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  micIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  startRecordingText: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
  },
  recentRecordingsContainer: {
    flex: 1,
  },
  sectionHeader: {
    marginBottom: 16,
    fontSize: 20,
    fontWeight: "600",
  },
  recordingsList: {
    flex: 1,
  },
  recordingsListContent: {
    paddingBottom: 20,
  },
  recordingItem: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  recordingItemGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderRadius: 16,
  },
  recordingIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(58, 123, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  recordingContent: {
    flex: 1,
  },
  recordingDuration: {
    color: "#718096",
    marginTop: 4,
  },
  quickActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginVertical: 15,
  },
  quickActionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
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
  quickActionText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#3A7BFF",
  },
  shareButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "rgba(58, 123, 255, 0.05)",
    borderRadius: 6,
    marginLeft: 10,
  },
  shareButtonText: {
    fontSize: 12,
    color: "#3A7BFF",
    fontWeight: "500",
  },
});
