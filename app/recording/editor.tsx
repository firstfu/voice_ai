import { useState, useRef, useEffect } from "react";
import { StyleSheet, View, ScrollView, TouchableOpacity, TextInput, Platform, Alert } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import Slider from "@react-native-community/slider";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

// 定義轉錄項目介面
interface TranscriptItem {
  id: string;
  speaker: string;
  timestamp: string;
  originalText: string;
  editedText: string;
  isEdited: boolean;
  isEditing: boolean;
}

// 定義標記接口
interface Marker {
  id: string;
  type: "note" | "important" | "question" | "task";
  timestamp: string;
  text: string;
}

// 模擬的錄音詳情數據 (與 [id].tsx 相同，但新增了 isEditing 屬性)
const mockRecordings: Record<string, any> = {
  "1": {
    id: "1",
    title: "會議記錄 - 5月12日",
    duration: "00:32:15",
    date: "2024-05-12",
    tags: ["會議", "專案規劃"],
    transcription: [
      {
        id: "1",
        speaker: "說話者 1",
        timestamp: "00:00:15",
        originalText: "今天我們將討論專案進度和下一步計劃。",
        editedText: "今天我們將討論專案進度和下一步計劃。",
        isEdited: false,
        isEditing: false,
      },
      {
        id: "2",
        speaker: "說話者 2",
        timestamp: "00:01:22",
        originalText: "上週我們完成了設計階段，主要界面已經定稿。關於開發階段，我認為我們需要先優先實現核心功能。",
        editedText: "上週我們完成了設計階段，主要界面已經定稿。關於開發階段，我認為我們需要先優先實現核心功能。",
        isEdited: false,
        isEditing: false,
      },
      {
        id: "3",
        speaker: "說話者 1",
        timestamp: "00:02:45",
        originalText: "我同意這個觀點，核心功能應該優先實現。根據我們的時間表，我們需要在下個月底前完成主要功能的開發。",
        editedText: "我同意這個觀點，核心功能應該優先實現。根據我們的時間表，我們需要在下個月底前完成主要功能的開發。",
        isEdited: false,
        isEditing: false,
      },
    ],
    markers: [
      {
        id: "m1",
        type: "important",
        timestamp: "00:01:22",
        text: "核心功能優先",
      },
      {
        id: "m2",
        type: "task",
        timestamp: "00:02:45",
        text: "下個月底完成開發",
      },
    ],
  },
};

// 說話者顏色映射
const speakerColors: Record<string, string> = {
  "說話者 1": "#3A7BFF",
  "說話者 2": "#00C2A8",
  "說話者 3": "#FF6B4A",
};

// 標記類型圖標和顏色
const markerConfig: Record<string, { icon: string; color: string }> = {
  note: { icon: "document-text", color: "#8E8E93" },
  important: { icon: "alert-circle", color: "#FF2D55" },
  question: { icon: "help-circle", color: "#5AC8FA" },
  task: { icon: "checkbox", color: "#30D158" },
};

// 轉換時間格式 "00:00:00" 為秒數
const timeStringToSeconds = (timeString: string): number => {
  const [hours, minutes, seconds] = timeString.split(":").map(Number);
  return hours * 3600 + minutes * 60 + seconds;
};

// 格式化秒數為時間格式 "00:00:00"
const formatTime = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

export default function EditorScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const recordingId = typeof id === "string" ? id : "1";
  const [recording, setRecording] = useState<any>(mockRecordings[recordingId]);

  const [title, setTitle] = useState(recording.title);
  const [tags, setTags] = useState<string[]>(recording.tags || []);
  const [newTag, setNewTag] = useState("");
  const [transcription, setTranscription] = useState<TranscriptItem[]>(recording.transcription);
  const [markers, setMarkers] = useState<Marker[]>(recording.markers || []);
  const [newMarker, setNewMarker] = useState({ type: "note", text: "", timestamp: "00:00:00" });
  const [showAddMarker, setShowAddMarker] = useState(false);
  const [position, setPosition] = useState(0);
  const [showOriginal, setShowOriginal] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  // 編輯轉錄文本
  const handleEditTranscript = (id: string) => {
    setTranscription(prev => prev.map(item => (item.id === id ? { ...item, isEditing: true } : { ...item, isEditing: false })));
  };

  // 保存編輯的轉錄文本
  const handleSaveTranscript = (id: string, newText: string) => {
    setTranscription(prev =>
      prev.map(item => (item.id === id ? { ...item, editedText: newText, isEditing: false, isEdited: newText !== item.originalText } : item))
    );
  };

  // 新增標籤
  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  // 移除標籤
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // 新增標記
  const handleAddMarker = () => {
    if (newMarker.text.trim()) {
      const marker: Marker = {
        id: `m${Date.now()}`,
        type: newMarker.type as "note" | "important" | "question" | "task",
        timestamp: formatTime(position),
        text: newMarker.text,
      };
      setMarkers([...markers, marker]);
      setNewMarker({ type: "note", text: "", timestamp: "00:00:00" });
      setShowAddMarker(false);
    }
  };

  // 移除標記
  const handleRemoveMarker = (markerId: string) => {
    setMarkers(markers.filter(marker => marker.id !== markerId));
  };

  // 保存所有更改
  const handleSaveChanges = () => {
    // 在實際應用中，這裡應該發送API請求更新錄音數據
    const updatedRecording = {
      ...recording,
      title,
      tags,
      transcription,
      markers,
    };

    // 更新模擬數據，以便在返回詳情頁面時能夠看到更改
    mockRecordings[recordingId] = updatedRecording;
    setRecording(updatedRecording);
    Alert.alert("成功", "變更已保存，請回到詳情頁面查看結果");
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "編輯錄音",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
              <Ionicons name="chevron-back" size={24} color="#007AFF" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleSaveChanges} style={{ marginRight: 15 }}>
              <ThemedText style={{ color: "#007AFF", fontWeight: "600" }}>保存</ThemedText>
            </TouchableOpacity>
          ),
        }}
      />

      <ThemedView style={styles.container}>
        <ScrollView ref={scrollViewRef} style={styles.scrollView}>
          {/* 標題編輯 */}
          <Animated.View entering={FadeIn.delay(100).duration(400)} style={styles.section}>
            <ThemedText style={styles.sectionTitle}>標題</ThemedText>
            <TextInput style={styles.titleInput} value={title} onChangeText={setTitle} placeholder="輸入標題" placeholderTextColor="#8E8E93" />
          </Animated.View>

          {/* 標籤管理 */}
          <Animated.View entering={FadeIn.delay(200).duration(400)} style={styles.section}>
            <ThemedText style={styles.sectionTitle}>標籤</ThemedText>
            <View style={styles.tagsContainer}>
              {tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <ThemedText style={styles.tagText}>{tag}</ThemedText>
                  <TouchableOpacity onPress={() => handleRemoveTag(tag)}>
                    <Ionicons name="close-circle" size={18} color="#8E8E93" />
                  </TouchableOpacity>
                </View>
              ))}
              <View style={styles.addTagContainer}>
                <TextInput
                  style={styles.addTagInput}
                  value={newTag}
                  onChangeText={setNewTag}
                  placeholder="新增標籤"
                  placeholderTextColor="#8E8E93"
                  onSubmitEditing={handleAddTag}
                />
                <TouchableOpacity onPress={handleAddTag}>
                  <Ionicons name="add-circle" size={24} color="#007AFF" />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          {/* 標記管理 */}
          <Animated.View entering={FadeIn.delay(300).duration(400)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>標記</ThemedText>
              <TouchableOpacity onPress={() => setShowAddMarker(!showAddMarker)}>
                <Ionicons name={showAddMarker ? "remove-circle" : "add-circle"} size={24} color="#3A7BFF" />
              </TouchableOpacity>
            </View>

            {showAddMarker && (
              <View style={styles.addMarkerSection}>
                <View style={styles.markerTypeContainer}>
                  {Object.entries(markerConfig).map(([type, config]) => (
                    <TouchableOpacity
                      key={type}
                      style={[styles.markerTypeButton, newMarker.type === type && { backgroundColor: `${config.color}20` }]}
                      onPress={() => setNewMarker({ ...newMarker, type: type as any })}
                    >
                      <Ionicons name={config.icon as any} size={16} color={config.color} />
                      <ThemedText style={[styles.markerTypeText, newMarker.type === type && { color: config.color }]}>
                        {type === "note" ? "筆記" : type === "important" ? "重要" : type === "question" ? "問題" : "任務"}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput
                  style={styles.markerInput}
                  placeholder="輸入標記內容..."
                  placeholderTextColor="#8E8E93"
                  value={newMarker.text}
                  onChangeText={text => setNewMarker({ ...newMarker, text })}
                />

                <TouchableOpacity style={styles.addMarkerButton} onPress={handleAddMarker}>
                  <ThemedText style={styles.addMarkerButtonText}>新增標記</ThemedText>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.markersList}>
              {markers.map(marker => (
                <View key={marker.id} style={styles.markerItem}>
                  <View style={styles.markerHeader}>
                    <View style={styles.markerTypeIndicator}>
                      <Ionicons name={markerConfig[marker.type].icon as any} size={16} color={markerConfig[marker.type].color} />
                      <ThemedText style={{ color: markerConfig[marker.type].color, marginLeft: 5 }}>{marker.timestamp}</ThemedText>
                    </View>
                    <TouchableOpacity onPress={() => handleRemoveMarker(marker.id)}>
                      <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                  <ThemedText style={styles.markerText}>{marker.text}</ThemedText>
                </View>
              ))}
              {markers.length === 0 && <ThemedText style={styles.emptyText}>尚無標記</ThemedText>}
            </View>
          </Animated.View>

          {/* 轉錄文本編輯 */}
          <Animated.View entering={FadeIn.delay(400).duration(400)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>轉錄文本</ThemedText>
              <View style={styles.switchContainer}>
                <TouchableOpacity style={[styles.switchButton, showOriginal && styles.switchButtonActive]} onPress={() => setShowOriginal(true)}>
                  <ThemedText style={[styles.switchText, showOriginal && styles.switchTextActive]}>原始轉錄</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.switchButton, !showOriginal && styles.switchButtonActive]} onPress={() => setShowOriginal(false)}>
                  <ThemedText style={[styles.switchText, !showOriginal && styles.switchTextActive]}>編輯版本</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
            {transcription.map(item => (
              <View
                key={item.id}
                style={[
                  styles.transcriptItem,
                  { borderLeftColor: speakerColors[item.speaker] || "#8E8E93" },
                  !showOriginal && item.isEdited && styles.editedTranscriptItem,
                ]}
              >
                <View style={styles.transcriptHeader}>
                  <View style={styles.speakerInfo}>
                    <View style={[styles.speakerDot, { backgroundColor: speakerColors[item.speaker] || "#8E8E93" }]} />
                    <ThemedText style={[styles.speakerName, { color: speakerColors[item.speaker] || "#2C3E50" }]}>{item.speaker}</ThemedText>
                    <ThemedText style={styles.timestamp}>{item.timestamp}</ThemedText>
                    {!showOriginal && item.isEdited && (
                      <View style={styles.editedBadge}>
                        <Ionicons name="pencil" size={12} color="#FFFFFF" />
                      </View>
                    )}
                  </View>
                  {!showOriginal && (
                    <TouchableOpacity style={styles.editButton} onPress={() => handleEditTranscript(item.id)}>
                      <Ionicons name="pencil" size={18} color="#3A7BFF" />
                    </TouchableOpacity>
                  )}
                </View>

                {item.isEditing ? (
                  <View style={styles.textEditContainer}>
                    <TextInput
                      style={styles.textEditInput}
                      multiline
                      value={item.editedText}
                      onChangeText={text => {
                        setTranscription(prev => prev.map(t => (t.id === item.id ? { ...t, editedText: text } : t)));
                      }}
                    />
                    <TouchableOpacity style={styles.saveButton} onPress={() => handleSaveTranscript(item.id, item.editedText)}>
                      <ThemedText style={styles.saveButtonText}>保存</ThemedText>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <ThemedText style={styles.transcriptText}>{showOriginal ? item.originalText : item.editedText}</ThemedText>
                )}
              </View>
            ))}
          </Animated.View>

          {/* 存檔選項 */}
          <Animated.View entering={FadeIn.delay(600).duration(400)} style={[styles.section, styles.lastSection]}>
            <ThemedText style={styles.sectionTitle}>存檔選項</ThemedText>
            <View style={styles.archiveOptions}>
              <TouchableOpacity style={styles.archiveButton}>
                <LinearGradient colors={["#30D158", "#4CD964"]} style={styles.archiveButtonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Ionicons name="archive-outline" size={20} color="#FFFFFF" />
                  <ThemedText style={styles.archiveButtonText}>存檔</ThemedText>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.archiveButton}>
                <LinearGradient colors={["#FF9500", "#FFCC00"]} style={styles.archiveButtonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Ionicons name="share-outline" size={20} color="#FFFFFF" />
                  <ThemedText style={styles.archiveButtonText}>導出</ThemedText>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
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
  },
  lastSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#2C3E50",
  },
  titleInput: {
    fontSize: 16,
    padding: 14,
    backgroundColor: "#F0F2F5",
    borderRadius: 8,
    color: "#2C3E50",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6EFFD",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: "#3A7BFF",
    fontSize: 14,
    marginRight: 4,
  },
  addTagContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F2F5",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 2,
    marginBottom: 8,
  },
  addTagInput: {
    flex: 1,
    height: 32,
    fontSize: 14,
    color: "#2C3E50",
  },
  markersList: {
    marginTop: 12,
  },
  markerItem: {
    backgroundColor: "#F0F2F5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  markerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  markerTypeIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  markerText: {
    fontSize: 14,
    color: "#2C3E50",
  },
  emptyText: {
    fontSize: 14,
    color: "#8E8E93",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 8,
  },
  addMarkerSection: {
    marginTop: 16,
  },
  markerTypeContainer: {
    flexDirection: "row",
    marginBottom: 12,
  },
  markerTypeButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: "#F0F2F5",
  },
  markerTypeText: {
    fontSize: 12,
    marginLeft: 4,
    color: "#2C3E50",
  },
  markerInput: {
    fontSize: 14,
    padding: 12,
    backgroundColor: "#F0F2F5",
    borderRadius: 8,
    color: "#2C3E50",
    marginBottom: 12,
  },
  addMarkerButton: {
    backgroundColor: "#3A7BFF",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  addMarkerButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  transcriptItem: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#3A7BFF",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  transcriptHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  speakerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  speakerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  speakerName: {
    fontSize: 14,
    fontWeight: "500",
    marginRight: 8,
    color: "#2C3E50",
  },
  timestamp: {
    fontSize: 12,
    color: "#718096",
  },
  transcriptText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#2C3E50",
  },
  textEditContainer: {
    marginTop: 8,
  },
  textEditInput: {
    backgroundColor: "#F0F2F5",
    borderRadius: 8,
    padding: 12,
    color: "#2C3E50",
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 8,
  },
  saveButton: {
    backgroundColor: "#3A7BFF",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  archiveOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  archiveButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 8,
    overflow: "hidden",
  },
  archiveButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 8,
  },
  archiveButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F0F2F5",
    justifyContent: "center",
    alignItems: "center",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  switchButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F0F2F5",
  },
  switchButtonActive: {
    backgroundColor: "#3A7BFF",
  },
  switchText: {
    color: "#2C3E50",
    fontWeight: "600",
  },
  switchTextActive: {
    color: "#FFFFFF",
  },
  editedTranscriptItem: {
    backgroundColor: "#FFF0F0",
  },
  editedBadge: {
    backgroundColor: "#FF3B30",
    borderRadius: 8,
    padding: 4,
    marginLeft: 8,
  },
});
