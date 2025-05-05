/**
 * 錄音管理頁面
 *
 * 本頁面提供錄音列表與管理功能，包括:
 * - 錄音列表顯示與瀏覽
 * - 搜尋錄音功能
 * - 錄音刪除管理
 * - 進入錄音詳情頁的導航
 * - 空狀態顯示處理
 * - 開始新錄音功能
 */

import { useState, useRef, useEffect } from "react";
import { StyleSheet, View, FlatList, TouchableOpacity, Platform, StatusBar, TextInput, Modal, Alert, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withSpring, withTiming, withRepeat, Easing } from "react-native-reanimated";
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
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newRecordingName, setNewRecordingName] = useState("");
  const searchInputRef = useRef<TextInput>(null);
  const renameInputRef = useRef<TextInput>(null);

  // 簡化按鈕動畫效果
  const buttonScale = useSharedValue(1);

  // 簡化按鈕動畫
  const recordButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  // 處理按鈕點擊
  const handleRecordButtonPress = () => {
    // 按下反饋
    buttonScale.value = withSpring(0.95, { damping: 10 });

    // 釋放時恢復並導航
    setTimeout(() => {
      buttonScale.value = withSpring(1, { damping: 8 });
      navigateToNewRecording();
    }, 100);
  };

  const filteredRecordings = recordings.filter(
    recording => recording.title.toLowerCase().includes(searchQuery.toLowerCase()) || recording.date.includes(searchQuery)
  );

  const navigateToRecordingDetail = (id: string) => {
    router.push(`/recording/${id}`);
  };

  const navigateToNewRecording = () => {
    router.push("/recording/new");
  };

  const clearSearch = () => {
    setSearchQuery("");
    searchInputRef.current?.focus();
  };

  const handleMorePress = (id: string) => {
    setSelectedItemId(id);
    setShowActionMenu(true);
  };

  const handleDeleteRecording = () => {
    if (selectedItemId) {
      // 在實際應用中，這裡應該調用API刪除錄音
      setRecordings(recordings.filter(rec => rec.id !== selectedItemId));
      setShowDeleteModal(false);
      setSelectedItemId(null);
    }
  };

  const handleRename = () => {
    setShowActionMenu(false);
    const recording = recordings.find(rec => rec.id === selectedItemId);
    if (recording) {
      setNewRecordingName(recording.title);
      setShowRenameModal(true);
      // 在下一個渲染週期後聚焦到輸入框
      setTimeout(() => {
        renameInputRef.current?.focus();
      }, 100);
    }
  };

  const confirmRename = () => {
    if (selectedItemId && newRecordingName.trim()) {
      // 在實際應用中，這裡應該調用API更新錄音名稱
      setRecordings(recordings.map(rec => (rec.id === selectedItemId ? { ...rec, title: newRecordingName.trim() } : rec)));
      setShowRenameModal(false);
      setNewRecordingName("");
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

  // 計算按鈕底部位置，考慮底部安全區域和 tabbar 高度，並進一步調高位置
  const buttonBottomPosition =
    Platform.OS === "ios"
      ? insets.bottom + 100 // 進一步增加底部間距
      : 100; // 同樣為 Android 增加間距

  // 空的滾動處理函數，保持介面一致性
  const handleScroll = () => {};
  const handleScrollEnd = () => {};

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
            {!searchQuery && (
              <TouchableOpacity style={styles.startRecordingButton} onPress={navigateToNewRecording} activeOpacity={0.85}>
                <View style={styles.startRecordingGradient}>
                  <Ionicons name="mic" size={18} color="#FFF" style={styles.startRecordingIcon} />
                  <ThemedText style={styles.startRecordingText}>開始錄音</ThemedText>
                </View>
              </TouchableOpacity>
            )}
          </View>
        )}
      />

      {/* 浮動錄音按鈕 - 添加光暈效果 */}
      <View style={[styles.recordButtonContainer, { bottom: buttonBottomPosition }]}>
        <View style={styles.buttonGlow} />
        <Animated.View style={[styles.recordButton, recordButtonAnimatedStyle]}>
          <TouchableOpacity style={styles.recordButtonTouchable} onPress={handleRecordButtonPress} activeOpacity={0.8}>
            <View style={styles.recordButtonInner}>
              <Ionicons name="mic" size={24} color="#FFF" />
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>

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

      {/* 操作選單Modal */}
      <Modal transparent={true} visible={showActionMenu} animationType="fade" onRequestClose={() => setShowActionMenu(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowActionMenu(false)}>
          <View style={styles.actionMenuContainer}>
            <TouchableOpacity style={styles.actionMenuItem} onPress={handleRename}>
              <Ionicons name="pencil-outline" size={22} color="#3A7BFF" />
              <ThemedText style={styles.actionMenuText}>變更名稱</ThemedText>
            </TouchableOpacity>

            <View style={styles.actionMenuDivider} />

            <TouchableOpacity
              style={styles.actionMenuItem}
              onPress={() => {
                setShowActionMenu(false);
                setShowDeleteModal(true);
              }}
            >
              <Ionicons name="trash-outline" size={22} color="#F56565" />
              <ThemedText style={[styles.actionMenuText, { color: "#F56565" }]}>刪除記錄</ThemedText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 重命名Modal */}
      <Modal transparent={true} visible={showRenameModal} animationType="fade" onRequestClose={() => setShowRenameModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ThemedText style={styles.modalTitle}>變更名稱</ThemedText>

            <TextInput
              ref={renameInputRef}
              style={styles.renameInput}
              value={newRecordingName}
              onChangeText={setNewRecordingName}
              placeholder="輸入新名稱"
              placeholderTextColor="#A0AEC0"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setShowRenameModal(false)}>
                <ThemedText style={styles.cancelButtonText}>取消</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.confirmButton]} onPress={confirmRename}>
                <ThemedText style={styles.confirmButtonText}>確認</ThemedText>
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
    paddingBottom: 180, // 進一步增加底部內邊距，適應按鈕新位置
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
  actionMenuContainer: {
    position: "absolute",
    right: 20,
    top: "30%",
    backgroundColor: "white",
    borderRadius: 14,
    overflow: "hidden",
    width: 180,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  actionMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  actionMenuText: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 12,
    color: "#2D3748",
  },
  actionMenuDivider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    width: "100%",
  },
  renameInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#2D3748",
    backgroundColor: "#F8FAFC",
    marginBottom: 24,
  },
  confirmButton: {
    backgroundColor: "#3A7BFF",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  recordButtonContainer: {
    position: "absolute",
    right: 20,
    width: 72,
    height: 72,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  buttonGlow: {
    position: "absolute",
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "transparent",
    // 模糊效果在各平台實現方式不同
    ...Platform.select({
      ios: {
        shadowColor: "#3A7BFF",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 12,
      },
      android: {
        // Android上使用背景色+透明度來模擬光暈效果
        backgroundColor: "rgba(58, 123, 255, 0.18)",
        elevation: 1,
      },
    }),
  },
  recordButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  recordButtonTouchable: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
  },
  recordButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#3A7BFF",
    justifyContent: "center",
    alignItems: "center",
  },
  startRecordingButton: {
    marginTop: 24,
    borderRadius: 20,
    backgroundColor: "#3A7BFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  startRecordingGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  startRecordingIcon: {
    marginRight: 8,
  },
  startRecordingText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
