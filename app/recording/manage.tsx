import React, { useState } from "react";
import { StyleSheet, View, FlatList, TouchableOpacity, Text, Alert, Platform, ScrollView, TextInput } from "react-native";
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

// 添加適當的介面定義
interface Category {
  id: string;
  name: string;
  color: string;
  count: number;
}

interface Tag {
  id: string;
  name: string;
  count: number;
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

// 預設分類
const defaultCategories: Category[] = [
  { id: "c1", name: "所有錄音", color: "#3A7BFF", count: 12 },
  { id: "c2", name: "會議", color: "#FF9500", count: 5 },
  { id: "c3", name: "課程", color: "#5AC8FA", count: 3 },
  { id: "c4", name: "訪談", color: "#FF6B4A", count: 2 },
  { id: "c5", name: "個人筆記", color: "#30D158", count: 2 },
];

// 預設標籤
const defaultTags: Tag[] = [
  { id: "t1", name: "重要", count: 4 },
  { id: "t2", name: "待處理", count: 3 },
  { id: "t3", name: "專案規劃", count: 2 },
  { id: "t4", name: "產品開發", count: 2 },
  { id: "t5", name: "行銷", count: 1 },
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
              <Ionicons name="pencil" size={18} color="#3A7BFF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={() => handleArchiveRecording(item.id)}>
              <Ionicons name={item.isArchived ? "archive-outline" : "archive"} size={18} color="#30D158" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteRecording(item.id)}>
              <Ionicons name="trash-outline" size={18} color="#FF6B4A" />
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
              <Ionicons name={showArchived ? "archive" : "archive-outline"} size={22} color="#3A7BFF" />
            </TouchableOpacity>
          ),
        }}
      />

      <ThemedView style={styles.container}>
        {/* 搜索欄 */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={18} color="#718096" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={text => setSearchQuery(text)}
              placeholder="搜索錄音"
              placeholderTextColor="#718096"
              returnKeyType="search"
              onSubmitEditing={() => handleSearch(searchQuery)}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery("");
                  handleSearch("");
                }}
              >
                <Ionicons name="close-circle" size={18} color="#718096" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.sortButton}>
            <Ionicons name="options-outline" size={18} color="#3A7BFF" />
            <ThemedText style={styles.sortButtonText}>排序</ThemedText>
          </TouchableOpacity>
        </View>

        {/* 分類標籤橫向滾動 */}
        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll} contentContainerStyle={styles.categoriesContent}>
            {defaultCategories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[styles.categoryChip, currentCategory === category.name && styles.selectedCategoryChip]}
                onPress={() => handleCategorySelect(category.name)}
              >
                <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                <ThemedText style={[styles.categoryChipText, currentCategory === category.name && styles.selectedCategoryChipText]}>{category.name}</ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsScroll} contentContainerStyle={styles.tagsContent}>
            {defaultTags.map(tag => (
              <TouchableOpacity
                key={tag.id}
                style={[styles.tagChip, selectedTags.includes(tag.name) && styles.selectedTagChip]}
                onPress={() => handleTagSelect(tag.name)}
              >
                <ThemedText style={[styles.tagChipText, selectedTags.includes(tag.name) && styles.selectedTagChipText]}>{tag.name}</ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 錄音列表標題 */}
        <View style={styles.listHeader}>
          <ThemedText style={styles.listTitle}>
            {currentCategory}
            <ThemedText style={styles.recordingCount}>（{filteredRecordings.length}）</ThemedText>
          </ThemedText>
        </View>

        {/* 錄音列表 */}
        {filteredRecordings.length > 0 ? (
          <FlatList
            data={filteredRecordings}
            renderItem={renderRecordingItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="search" size={50} color="#718096" />
            <ThemedText style={styles.emptyText}>找不到符合條件的錄音</ThemedText>
          </View>
        )}
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    alignItems: "center",
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F0F2F5",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    alignItems: "center",
    marginRight: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: "#2C3E50",
    fontSize: 14,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F5FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sortButtonText: {
    color: "#3A7BFF",
    fontSize: 13,
    marginLeft: 4,
    fontWeight: "500",
  },
  filterSection: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  categoriesScroll: {
    marginBottom: 8,
  },
  categoriesContent: {
    paddingHorizontal: 16,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F2F5",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  selectedCategoryChip: {
    backgroundColor: "#E6EFFD",
    borderWidth: 1,
    borderColor: "#3A7BFF",
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  categoryChipText: {
    fontSize: 14,
    color: "#2C3E50",
  },
  selectedCategoryChipText: {
    color: "#3A7BFF",
    fontWeight: "500",
  },
  tagsScroll: {
    marginTop: 4,
  },
  tagsContent: {
    paddingHorizontal: 16,
  },
  tagChip: {
    backgroundColor: "#F0F2F5",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  selectedTagChip: {
    backgroundColor: "#E6EFFD",
    borderWidth: 1,
    borderColor: "#3A7BFF",
  },
  tagChipText: {
    fontSize: 13,
    color: "#2C3E50",
  },
  selectedTagChipText: {
    color: "#3A7BFF",
    fontWeight: "500",
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F8F9FA",
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2C3E50",
  },
  recordingCount: {
    fontSize: 16,
    color: "#718096",
    fontWeight: "400",
    marginLeft: 5,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  recordingItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
    borderLeftWidth: 3,
    borderLeftColor: "#3A7BFF",
  },
  archivedItem: {
    opacity: 0.85,
    borderLeftColor: "#30D158",
  },
  recordingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  recordingTitleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  recordingTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
    color: "#2C3E50",
  },
  recordingInfo: {
    flexDirection: "row",
    marginBottom: 10,
  },
  recordingDate: {
    fontSize: 14,
    color: "#718096",
    marginRight: 16,
  },
  recordingDuration: {
    fontSize: 14,
    color: "#718096",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: "#E6EFFD",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: "#3A7BFF",
    fontWeight: "500",
  },
  recordingActions: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 8,
    marginLeft: 6,
    backgroundColor: "#F0F2F5",
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  archivedBadge: {
    backgroundColor: "#30D158",
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  archivedText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    backgroundColor: "#F8F9FA",
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#718096",
    textAlign: "center",
  },
  headerButton: {
    marginRight: 16,
    backgroundColor: "#F0F2F5",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
