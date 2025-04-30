import React, { useState } from "react";
import { StyleSheet, View, TouchableOpacity, TextInput, FlatList, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";

// 定義分類接口
interface Category {
  id: string;
  name: string;
  color: string;
  count: number;
}

// 定義標籤接口
interface Tag {
  id: string;
  name: string;
  count: number;
}

interface OrganizePanelProps {
  onCategorySelect?: (category: string) => void;
  onTagSelect?: (tag: string) => void;
  onSearch?: (query: string) => void;
}

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

export const OrganizePanel: React.FC<OrganizePanelProps> = ({ onCategorySelect, onTagSelect, onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("c1");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // 處理分類選擇
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (onCategorySelect) {
      const category = defaultCategories.find(c => c.id === categoryId);
      if (category) {
        onCategorySelect(category.name);
      }
    }
  };

  // 處理標籤選擇
  const handleTagSelect = (tagId: string) => {
    let newSelectedTags: string[];

    if (selectedTags.includes(tagId)) {
      newSelectedTags = selectedTags.filter(id => id !== tagId);
    } else {
      newSelectedTags = [...selectedTags, tagId];
    }

    setSelectedTags(newSelectedTags);

    if (onTagSelect && newSelectedTags.length > 0) {
      const tagName = defaultTags.find(t => t.id === tagId)?.name || "";
      onTagSelect(tagName);
    }
  };

  // 處理搜索
  const handleSearch = () => {
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  return (
    <View style={styles.container}>
      {/* 搜索欄 */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={16} color="#718096" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="搜索錄音"
          placeholderTextColor="#718096"
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={16} color="#718096" />
          </TouchableOpacity>
        )}
      </View>

      {/* 分類列表 */}
      <View style={styles.sectionContainer}>
        <ThemedText style={styles.sectionTitle}>分類</ThemedText>
        <View style={styles.categoriesContainer}>
          {defaultCategories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[styles.categoryItem, selectedCategory === category.id && styles.selectedCategory]}
              onPress={() => handleCategorySelect(category.id)}
            >
              <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
              <ThemedText style={styles.categoryName}>{category.name}</ThemedText>
              <View style={styles.countBadge}>
                <ThemedText style={styles.countText}>{category.count}</ThemedText>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 標籤列表 */}
      <View style={styles.sectionContainer}>
        <ThemedText style={styles.sectionTitle}>標籤</ThemedText>
        <View style={styles.tagsContainer}>
          {defaultTags.map(tag => (
            <TouchableOpacity
              key={tag.id}
              style={[styles.tagItem, selectedTags.includes(tag.id) && styles.selectedTag]}
              onPress={() => handleTagSelect(tag.id)}
            >
              <ThemedText style={styles.tagName}>{tag.name}</ThemedText>
              <ThemedText style={styles.tagCount}>{tag.count}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 新增分類按鈕 */}
      <TouchableOpacity style={styles.addButton}>
        <Ionicons name="add-circle-outline" size={18} color="#3A7BFF" />
        <ThemedText style={styles.addButtonText}>新增分類</ThemedText>
      </TouchableOpacity>

      {/* 新增標籤按鈕 */}
      <TouchableOpacity style={styles.addButton}>
        <Ionicons name="pricetag-outline" size={18} color="#3A7BFF" />
        <ThemedText style={styles.addButtonText}>新增標籤</ThemedText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F2F5",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 16,
    height: 40,
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
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#2C3E50",
  },
  categoriesContainer: {
    gap: 8,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 12,
  },
  selectedCategory: {
    backgroundColor: "#E6EFFD",
    borderWidth: 1,
    borderColor: "#3A7BFF",
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  categoryName: {
    flex: 1,
    fontSize: 14,
    color: "#2C3E50",
  },
  countBadge: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  countText: {
    fontSize: 12,
    color: "#718096",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  selectedTag: {
    backgroundColor: "#E6EFFD",
    borderWidth: 1,
    borderColor: "#3A7BFF",
  },
  tagName: {
    fontSize: 14,
    marginRight: 6,
    color: "#2C3E50",
  },
  tagCount: {
    fontSize: 12,
    color: "#718096",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  addButtonText: {
    color: "#3A7BFF",
    marginLeft: 8,
    fontSize: 14,
  },
});
