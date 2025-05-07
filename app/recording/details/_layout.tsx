/**
 * 錄音詳情頁面佈局
 *
 * 本佈局用於錄音詳情頁面，設定導航結構
 * 移除預設頂部導航欄，只保留底部導航
 * 底部導航按鈕可供編輯和分析頁面共用
 */

import { Stack } from "expo-router";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useEffect, useState } from "react";
import { useLocalSearchParams, usePathname, useRouter } from "expo-router";

export default function RecordingDetailsLayout() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const pathname = usePathname();

  // 根據當前路徑判斷是否在編輯器頁面
  const [isEditorActive, setIsEditorActive] = useState(false);
  // 根據當前路徑判斷是否在分析頁面
  const [isAnalysisActive, setIsAnalysisActive] = useState(false);

  useEffect(() => {
    if (!pathname) return;
    setIsEditorActive(pathname.includes("/recording/editor"));
    setIsAnalysisActive(pathname.includes("/recording/analysis"));
  }, [pathname]);

  // 前往編輯頁面
  const goToEditPage = () => {
    router.push(`/recording/editor?id=${id}`);
  };

  // 前往分析頁面
  const goToAnalysisPage = () => {
    router.push(`/recording/analysis/${id}`);
  };

  return (
    <>
      {/* 移除頂部Stack導航頭，保留Stack容器結構 */}
      <Stack screenOptions={{ headerShown: false }} />

      {/* 底部導航按鈕 */}
      {id && (
        <View style={styles.bottomBar}>
          <TouchableOpacity style={[styles.bottomButton, isEditorActive && styles.bottomButtonActive]} onPress={goToEditPage}>
            <Ionicons name="create-outline" size={24} color={isEditorActive ? "#FFFFFF" : "#3A7BFF"} />
            <ThemedText style={[styles.bottomButtonText, isEditorActive && styles.bottomButtonTextActive]}>編輯</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.bottomButton, isAnalysisActive && styles.bottomButtonActive]} onPress={goToAnalysisPage}>
            <Ionicons name="analytics-outline" size={24} color={isAnalysisActive ? "#FFFFFF" : "#3A7BFF"} />
            <ThemedText style={[styles.bottomButtonText, isAnalysisActive && styles.bottomButtonTextActive]}>分析</ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#EDF1F7",
    paddingVertical: 12,
  },
  bottomButton: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bottomButtonActive: {
    backgroundColor: "#3A7BFF",
  },
  bottomButtonText: {
    marginTop: 4,
    fontSize: 12,
    color: "#3A7BFF",
  },
  bottomButtonTextActive: {
    color: "#FFFFFF",
  },
});
