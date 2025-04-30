import React, { useState } from "react";
import { StyleSheet, View, FlatList, TouchableOpacity, Text, Alert } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { OrganizePanel } from "@/components/ui/OrganizePanel";

// 定義錄音接口
interface Recording {
  id: string;
  title: string;
  duration: string;
  date: string;
  tags: string[];
  isArchived: boolean;
}

// 模擬錄音數據
const mockRecordings: Recording[] = [
  {
    id: "1",
    title: "會議記錄 - 5月12日",
    duration: "00:32:15",
    date: "2024-05-12",
    tags: ["會議", "專案規劃"],
    isArchived: false,
  },
  {
    id: "2",
    title: "課堂筆記 - 5月10日",
    duration: "01:15:42",
    date: "2024-05-10",
    tags: ["課程", "學習"],
    isArchived: false,
  },
  {
    id: "3",
    title: "訪談 - 5月8日",
    duration: "00:45:30",
    date: "2024-05-08",
    tags: ["訪談", "研究"],
    isArchived: false,
  },
  {
    id: "4",
    title: "個人筆記 - 5月5日",
    duration: "00:12:08",
    date: "2024-05-05",
    tags: ["筆記", "待辦事項"],
    isArchived: true,
  },
  {
    id: "5",
    title: "產品討論 - 5月2日",
    duration: "00:56:22",
    date: "2024-05-02",
    tags: ["會議", "產品"],
    isArchived: false,
  },
];

export default function ManageRecordingsScreen() {
  const router = useRouter();
  const [recordings, setRecordings] = useState<Recording[]>(mockRecordings);
  const [filteredRecordings, setFilteredRecordings] = useState<Recording[]>(mockRecordings);
  const [currentCategory, setCurrentCategory] = useState<string>("所有錄音");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showArchived, setShowArchived] = useState<boolean>(false);

  // 處理分類選擇
  const handleCategorySelect = (category: string) => {
    setCurrentCategory(category);
    filterRecordings(category, selectedTags, searchQuery, showArchived);
  };

  // 處理標籤選擇
  const handleTagSelect = (tag: string) => {
    let newSelectedTags: string[];

    if (selectedTags.includes(tag)) {
      newSelectedTags = selectedTags.filter(t => t !== tag);
    } else {
      newSelectedTags = [...selectedTags, tag];
    }

    setSelectedTags(newSelectedTags);
    filterRecordings(currentCategory, newSelectedTags, searchQuery, showArchived);
  };

  // 處理搜索
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterRecordings(currentCategory, selectedTags, query, showArchived);
  };

  // 切換顯示存檔
  const toggleShowArchived = () => {
    const newShowArchived = !showArchived;
    setShowArchived(newShowArchived);
    filterRecordings(currentCategory, selectedTags, searchQuery, newShowArchived);
  };

  // 過濾錄音
  const filterRecordings = (category: string, tags: string[], query: string, archived: boolean) => {
    let filtered = [...recordings];

    // 過濾分類
    if (category !== "所有錄音") {
      switch (category) {
        case "會議":
          filtered = filtered.filter(r => r.tags.includes("會議"));
          break;
        case "課程":
          filtered = filtered.filter(r => r.tags.includes("課程"));
          break;
        case "訪談":
          filtered = filtered.filter(r => r.tags.includes("訪談"));
          break;
        case "個人筆記":
          filtered = filtered.filter(r => r.tags.includes("筆記"));
          break;
      }
    }

    // 過濾標籤
    if (tags.length > 0) {
      filtered = filtered.filter(r => tags.some(tag => r.tags.includes(tag)));
    }

    // 過濾搜索
    if (query) {
      filtered = filtered.filter(r => r.title.toLowerCase().includes(query.toLowerCase()));
    }

    // 過濾存檔狀態
    if (!archived) {
      filtered = filtered.filter(r => !r.isArchived);
    }

    setFilteredRecordings(filtered);
  };

  // 存檔錄音
  const handleArchiveRecording = (id: string) => {
    const updatedRecordings = recordings.map(r => (r.id === id ? { ...r, isArchived: !r.isArchived } : r));

    setRecordings(updatedRecordings);
    filterRecordings(currentCategory, selectedTags, searchQuery, showArchived);

    Alert.alert("成功", `錄音已${updatedRecordings.find(r => r.id === id)?.isArchived ? "存檔" : "取消存檔"}`);
  };

  // 刪除錄音
  const handleDeleteRecording = (id: string) => {
    Alert.alert("確認刪除", "確定要刪除這個錄音嗎？這個操作無法撤銷。", [
      { text: "取消", style: "cancel" },
      {
        text: "刪除",
        style: "destructive",
        onPress: () => {
          const updatedRecordings = recordings.filter(r => r.id !== id);
          setRecordings(updatedRecordings);
          filterRecordings(currentCategory, selectedTags, searchQuery, showArchived);
          Alert.alert("成功", "錄音已刪除");
        },
      },
    ]);
  };

  // 前往編輯頁面
  const handleEditRecording = (id: string) => {
    router.push(`/recording/editor?id=${id}`);
  };

  // 前往詳情頁面
  const handleViewRecording = (id: string) => {
    router.push(`/recording/${id}`);
  };

  // 渲染錄音項
  const renderRecordingItem = ({ item }: { item: Recording }) => {
    return (
      <TouchableOpacity style={[styles.recordingItem, item.isArchived && styles.archivedItem]} onPress={() => handleViewRecording(item.id)}>
        <View style={styles.recordingHeader}>
          <View style={styles.recordingTitleContainer}>
            <ThemedText style={styles.recordingTitle}>{item.title}</ThemedText>
            {item.isArchived && (
              <View style={styles.archivedBadge}>
                <ThemedText style={styles.archivedText}>已存檔</ThemedText>
              </View>
            )}
          </View>

          <View style={styles.recordingActions}>
            <TouchableOpacity style={styles.actionButton} onPress={() => handleEditRecording(item.id)}>
              <Ionicons name="pencil" size={18} color="#007AFF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={() => handleArchiveRecording(item.id)}>
              <Ionicons name={item.isArchived ? "archive-outline" : "archive"} size={18} color="#30D158" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteRecording(item.id)}>
              <Ionicons name="trash-outline" size={18} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.recordingInfo}>
          <ThemedText style={styles.recordingDate}>{item.date}</ThemedText>
          <ThemedText style={styles.recordingDuration}>{item.duration}</ThemedText>
        </View>

        <View style={styles.tagsContainer}>
          {item.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <ThemedText style={styles.tagText}>{tag}</ThemedText>
            </View>
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "錄音管理",
          headerRight: () => (
            <TouchableOpacity style={styles.headerButton} onPress={toggleShowArchived}>
              <Ionicons name={showArchived ? "archive" : "archive-outline"} size={22} color="#007AFF" />
            </TouchableOpacity>
          ),
        }}
      />

      <ThemedView style={styles.container}>
        <View style={styles.contentContainer}>
          <View style={styles.organizePanel}>
            <OrganizePanel onCategorySelect={handleCategorySelect} onTagSelect={handleTagSelect} onSearch={handleSearch} />
          </View>

          <View style={styles.recordingsList}>
            <View style={styles.listHeader}>
              <ThemedText style={styles.listTitle}>
                {currentCategory}
                <ThemedText style={styles.recordingCount}>（{filteredRecordings.length}）</ThemedText>
              </ThemedText>

              <TouchableOpacity style={styles.sortButton}>
                <Ionicons name="options-outline" size={20} color="#007AFF" />
                <ThemedText style={styles.sortButtonText}>排序</ThemedText>
              </TouchableOpacity>
            </View>

            {filteredRecordings.length > 0 ? (
              <FlatList data={filteredRecordings} renderItem={renderRecordingItem} keyExtractor={item => item.id} contentContainerStyle={styles.listContent} />
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="search" size={50} color="#8E8E93" />
                <ThemedText style={styles.emptyText}>找不到符合條件的錄音</ThemedText>
              </View>
            )}
          </View>
        </View>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    flexDirection: "row",
  },
  organizePanel: {
    width: "30%",
    borderRightWidth: 1,
    borderRightColor: "#2C2C2E",
  },
  recordingsList: {
    flex: 1,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2C2C2E",
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  recordingCount: {
    fontSize: 16,
    color: "#8E8E93",
    fontWeight: "400",
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  sortButtonText: {
    color: "#007AFF",
    marginLeft: 4,
  },
  listContent: {
    padding: 16,
  },
  recordingItem: {
    backgroundColor: "#1C1C1E",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  archivedItem: {
    opacity: 0.7,
  },
  recordingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  recordingTitleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  recordingTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginRight: 8,
  },
  recordingInfo: {
    flexDirection: "row",
    marginBottom: 8,
  },
  recordingDate: {
    fontSize: 14,
    color: "#8E8E93",
    marginRight: 16,
  },
  recordingDuration: {
    fontSize: 14,
    color: "#8E8E93",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: "#2C2C2E",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
  },
  recordingActions: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 6,
    marginLeft: 4,
  },
  archivedBadge: {
    backgroundColor: "#30D158",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  archivedText: {
    fontSize: 12,
    color: "#FFFFFF",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
  },
  headerButton: {
    marginRight: 16,
  },
});
