import { useState } from "react";
import { StyleSheet, View, FlatList, TouchableOpacity, Platform, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import Animated, { FadeIn } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

// 模擬錄音數據
const mockRecordings = [
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

// 定義 Recording 類型
interface Recording {
  id: string;
  title: string;
  duration: string;
  date: string;
}

export default function RecordingsScreen() {
  const router = useRouter();
  const [recordings, setRecordings] = useState<Recording[]>(mockRecordings);

  const navigateToRecordingDetail = (id: string) => {
    router.push(`/recording/${id}`);
  };

  const renderItem = ({ item, index }: { item: Recording; index: number }) => (
    <Animated.View entering={FadeIn.delay(index * 100).duration(300)}>
      <TouchableOpacity style={styles.recordingItem} onPress={() => navigateToRecordingDetail(item.id)}>
        <View style={styles.recordingIconContainer}>
          <Ionicons name="mic" size={28} color="#3A7BFF" />
        </View>
        <View style={styles.recordingInfo}>
          <ThemedText style={styles.recordingTitle}>{item.title}</ThemedText>
          <View style={styles.recordingMeta}>
            <ThemedText style={styles.recordingDuration}>{item.duration}</ThemedText>
            <View style={styles.dot} />
            <ThemedText style={styles.recordingDate}>{item.date}</ThemedText>
          </View>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={20} color="#718096" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>管理錄音</ThemedText>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color="#2C3E50" />
        </TouchableOpacity>
      </View>

      <FlatList data={recordings} renderItem={renderItem} keyExtractor={item => item.id} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
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
  listContent: {
    padding: 16,
  },
  recordingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  recordingIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(58, 123, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  recordingInfo: {
    flex: 1,
  },
  recordingTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  recordingMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  recordingDuration: {
    fontSize: 14,
    color: "#718096",
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#CBD5E0",
    marginHorizontal: 8,
  },
  recordingDate: {
    fontSize: 14,
    color: "#718096",
  },
  moreButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
});
