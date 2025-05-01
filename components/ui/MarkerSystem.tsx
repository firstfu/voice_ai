/**
 * 標記系統組件
 *
 * 提供音訊或視頻檔案的時間點標記功能，特點：
 * - 支援多種標記類型（筆記、重要、問題、任務）
 * - 時間點選擇與顯示
 * - 標記新增、編輯、刪除功能
 * - 跳轉到標記時間點
 * - 標記內容編輯與類型切換
 * - 視覺化區分不同類型的標記
 */

import React, { useState, useEffect } from "react";
import { StyleSheet, View, TouchableOpacity, TextInput, FlatList, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";

// 定義標記類型
type MarkerType = "note" | "important" | "question" | "task";

// 定義標記數據接口
interface Marker {
  id: string;
  type: MarkerType;
  timestamp: string;
  text: string;
  isEditing?: boolean;
}

interface MarkerSystemProps {
  markers: Marker[];
  currentPosition?: number; // 當前播放位置（秒）
  onAddMarker?: (marker: Omit<Marker, "id">) => void;
  onEditMarker?: (marker: Marker) => void;
  onDeleteMarker?: (id: string) => void;
  onJumpToMarker?: (timestamp: string) => void;
}

// 標記類型設定（圖標和顏色）
const markerTypeConfig: Record<MarkerType, { icon: string; label: string; color: string }> = {
  note: { icon: "document-text", label: "筆記", color: "#8E8E93" },
  important: { icon: "alert-circle", label: "重要", color: "#FF2D55" },
  question: { icon: "help-circle", label: "問題", color: "#5AC8FA" },
  task: { icon: "checkbox", label: "任務", color: "#30D158" },
};

// 時間格式化函數
const formatTime = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

// 從時間格式轉換為秒數
const timeToSeconds = (time: string): number => {
  const [hours, minutes, seconds] = time.split(":").map(Number);
  return hours * 3600 + minutes * 60 + seconds;
};

export const MarkerSystem: React.FC<MarkerSystemProps> = ({ markers, currentPosition = 0, onAddMarker, onEditMarker, onDeleteMarker, onJumpToMarker }) => {
  const [newMarker, setNewMarker] = useState<Omit<Marker, "id">>({
    type: "note",
    timestamp: formatTime(currentPosition),
    text: "",
  });

  const [editingMarkerId, setEditingMarkerId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [selectedType, setSelectedType] = useState<MarkerType>("note");
  const [showAddMarker, setShowAddMarker] = useState(false);

  // 當播放位置更新時，同步新標記的時間戳
  useEffect(() => {
    setNewMarker(prev => ({
      ...prev,
      timestamp: formatTime(currentPosition),
    }));
  }, [currentPosition]);

  // 添加新標記
  const handleAddMarker = () => {
    if (newMarker.text.trim() === "") {
      Alert.alert("提示", "標記內容不能為空");
      return;
    }

    if (onAddMarker) {
      onAddMarker(newMarker);
    }

    // 重置表單
    setNewMarker({
      type: "note",
      timestamp: formatTime(currentPosition),
      text: "",
    });
    setShowAddMarker(false);
  };

  // 開始編輯標記
  const handleStartEdit = (marker: Marker) => {
    setEditingMarkerId(marker.id);
    setEditingText(marker.text);
    setSelectedType(marker.type);
  };

  // 保存編輯的標記
  const handleSaveEdit = () => {
    if (editingMarkerId && editingText.trim() !== "") {
      const marker = markers.find(m => m.id === editingMarkerId);

      if (marker && onEditMarker) {
        onEditMarker({
          ...marker,
          text: editingText,
          type: selectedType,
        });
      }

      setEditingMarkerId(null);
      setEditingText("");
    }
  };

  // 取消編輯
  const handleCancelEdit = () => {
    setEditingMarkerId(null);
    setEditingText("");
  };

  // 刪除標記
  const handleDeleteMarker = (id: string) => {
    if (onDeleteMarker) {
      Alert.alert("確認刪除", "確定要刪除這個標記嗎？", [
        { text: "取消", style: "cancel" },
        {
          text: "刪除",
          style: "destructive",
          onPress: () => onDeleteMarker(id),
        },
      ]);
    }
  };

  // 跳轉到標記位置
  const handleJumpToMarker = (timestamp: string) => {
    if (onJumpToMarker) {
      onJumpToMarker(timestamp);
    }
  };

  // 渲染標記項
  const renderMarkerItem = ({ item }: { item: Marker }) => {
    const isEditing = editingMarkerId === item.id;
    const config = markerTypeConfig[item.type];

    return (
      <View style={styles.markerItem}>
        <View style={styles.markerHeader}>
          <View style={styles.markerHeaderLeft}>
            <Ionicons name={config.icon as any} size={18} color={config.color} />
            <ThemedText style={[styles.markerType, { color: config.color }]}>{config.label}</ThemedText>
            <TouchableOpacity onPress={() => handleJumpToMarker(item.timestamp)}>
              <ThemedText style={styles.markerTimestamp}>{item.timestamp}</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.markerActions}>
            {isEditing ? (
              <>
                <TouchableOpacity style={styles.actionButton} onPress={handleSaveEdit}>
                  <Ionicons name="checkmark" size={18} color="#30D158" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={handleCancelEdit}>
                  <Ionicons name="close" size={18} color="#FF3B30" />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity style={styles.actionButton} onPress={() => handleStartEdit(item)}>
                  <Ionicons name="pencil" size={16} color="#007AFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteMarker(item.id)}>
                  <Ionicons name="trash-outline" size={16} color="#FF3B30" />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {isEditing ? (
          <>
            <View style={styles.typeSelector}>
              {Object.entries(markerTypeConfig).map(([type, config]) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeButton, selectedType === type && { backgroundColor: config.color + "30" }]}
                  onPress={() => setSelectedType(type as MarkerType)}
                >
                  <Ionicons name={config.icon as any} size={16} color={config.color} />
                  <ThemedText style={[styles.typeButtonText, { color: config.color }]}>{config.label}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput style={styles.editInput} value={editingText} onChangeText={setEditingText} multiline autoFocus placeholderTextColor="#8E8E93" />
          </>
        ) : (
          <ThemedText style={styles.markerText}>{item.text}</ThemedText>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>標記與註釋</ThemedText>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddMarker(!showAddMarker)}>
          <Ionicons name={showAddMarker ? "remove-circle" : "add-circle"} size={22} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {showAddMarker && (
        <View style={styles.addMarkerForm}>
          <View style={styles.formRow}>
            <ThemedText style={styles.formLabel}>時間點</ThemedText>
            <ThemedText style={styles.timestampText}>{newMarker.timestamp}</ThemedText>
          </View>

          <View style={styles.formRow}>
            <ThemedText style={styles.formLabel}>類型</ThemedText>
            <View style={styles.typeSelector}>
              {Object.entries(markerTypeConfig).map(([type, config]) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeButton, newMarker.type === type && { backgroundColor: config.color + "30" }]}
                  onPress={() => setNewMarker({ ...newMarker, type: type as MarkerType })}
                >
                  <Ionicons name={config.icon as any} size={16} color={config.color} />
                  <ThemedText style={[styles.typeButtonText, { color: config.color }]}>{config.label}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formRow}>
            <ThemedText style={styles.formLabel}>內容</ThemedText>
            <TextInput
              style={styles.markerInput}
              value={newMarker.text}
              onChangeText={text => setNewMarker({ ...newMarker, text })}
              placeholder="輸入標記內容..."
              placeholderTextColor="#8E8E93"
              multiline
            />
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleAddMarker}>
            <ThemedText style={styles.submitButtonText}>添加標記</ThemedText>
          </TouchableOpacity>
        </View>
      )}

      {markers.length > 0 ? (
        <FlatList
          data={markers.sort((a, b) => timeToSeconds(a.timestamp) - timeToSeconds(b.timestamp))}
          renderItem={renderMarkerItem}
          keyExtractor={item => item.id}
          style={styles.markerList}
          contentContainerStyle={styles.markerListContent}
        />
      ) : (
        <ThemedText style={styles.emptyText}>尚無標記</ThemedText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  addButton: {
    padding: 4,
  },
  addMarkerForm: {
    backgroundColor: "#1C1C1E",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  formRow: {
    marginBottom: 12,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
  },
  timestampText: {
    fontSize: 16,
    color: "#007AFF",
  },
  typeSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  typeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2C2C2E",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  typeButtonText: {
    fontSize: 12,
    marginLeft: 4,
  },
  markerInput: {
    backgroundColor: "#2C2C2E",
    borderRadius: 8,
    padding: 12,
    color: "#FFFFFF",
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  markerList: {
    flex: 1,
  },
  markerListContent: {
    paddingBottom: 16,
  },
  markerItem: {
    backgroundColor: "#1C1C1E",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  markerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  markerHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  markerType: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
    marginRight: 10,
  },
  markerTimestamp: {
    fontSize: 12,
    color: "#8E8E93",
  },
  markerActions: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 4,
    marginLeft: 8,
  },
  markerText: {
    fontSize: 14,
    lineHeight: 20,
  },
  editInput: {
    backgroundColor: "#2C2C2E",
    borderRadius: 8,
    padding: 12,
    color: "#FFFFFF",
    fontSize: 14,
    minHeight: 60,
    marginTop: 8,
    textAlignVertical: "top",
  },
  emptyText: {
    textAlign: "center",
    color: "#8E8E93",
    marginTop: 20,
  },
});
