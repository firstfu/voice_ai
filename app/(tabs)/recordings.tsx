/**
 * 錄音管理頁面
 *
 * 本頁面提供錄音列表與管理功能，包括:
 * - 錄音列表顯示與瀏覽
 * - 搜尋錄音功能
 * - 錄音刪除管理
 * - 進入錄音詳情頁的導航
 * - 空狀態顯示處理
 */

import { useState, useRef } from "react";
import { StyleSheet, View, FlatList, TouchableOpacity, Platform, StatusBar, TextInput, Modal, Alert, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const insets = useSafeAreaInsets();
  const [recordings, setRecordings] = useState<Recording[]>(mockRecordings);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const searchInputRef = useRef<TextInput>(null);

  const filteredRecordings = recordings.filter(recording => recording.title.toLowerCase().includes(searchQuery.toLowerCase()) || recording.date.includes(searchQuery));

  const navigateToRecordingDetail = (id: string) => {
    router.push(`/recording/${id}`);
  };

  const clearSearch = () => {
    setSearchQuery("");
    searchInputRef.current?.focus();
  };

  const handleMorePress = (id: string) => {
    setSelectedItemId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteRecording = () => {
    if (selectedItemId) {
      // 在實際應用中，這裡應該調用API刪除錄音
      setRecordings(recordings.filter(rec => rec.id !== selectedItemId));
      setShowDeleteModal(false);
      setSelectedItemId(null);
    }
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
        <TouchableOpacity style={styles.moreButton} onPress={() => handleMorePress(item.id)}>
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

      <View style={[styles.headerContainer, { paddingTop: insets.top + 20 }]}>
        <ThemedText type="title" style={styles.headerTitle}>
          管理錄音
        </ThemedText>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#718096" style={styles.searchIcon} />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="搜尋錄音..."
            placeholderTextColor="#A0AEC0"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <Ionicons name="close" size={22} color="#718096" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filteredRecordings}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color="#A0AEC0" />
            <ThemedText style={styles.emptyText}>{searchQuery ? "找不到匹配的錄音" : "沒有錄音"}</ThemedText>
          </View>
        )}
      />

      {/* 刪除確認Modal */}
      <Modal transparent={true} visible={showDeleteModal} animationType="fade" onRequestClose={() => setShowDeleteModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ThemedText style={styles.modalTitle}>刪除錄音</ThemedText>
            <ThemedText style={styles.modalText}>確定要刪除這個錄音嗎？此操作無法撤銷。</ThemedText>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setShowDeleteModal(false)}>
                <ThemedText style={styles.cancelButtonText}>取消</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.deleteButton]} onPress={handleDeleteRecording}>
                <ThemedText style={styles.deleteButtonText}>刪除</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontWeight: "700",
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
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
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#2D3748",
    paddingVertical: 0,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100, // 為底部標籤留出空間
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
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: "#A0AEC0",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    color: "#4A5568",
    textAlign: "center",
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  modalButton: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: "#EDF2F7",
  },
  cancelButtonText: {
    color: "#4A5568",
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: "#FC8181",
  },
  deleteButtonText: {
    color: "white",
    fontWeight: "600",
  },
});
