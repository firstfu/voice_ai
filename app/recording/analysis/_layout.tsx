import { Stack } from "expo-router";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useEffect, useState, useContext } from "react";
import { useLocalSearchParams, usePathname, useRouter } from "expo-router";
import { AnalysisContext, AnalysisProvider } from "@/contexts/AnalysisContext";

function AnalysisLayoutContent() {
  const pathname = usePathname();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isDetailsPage, setIsDetailsPage] = useState(false);
  const { triggerRefresh } = useContext(AnalysisContext);

  useEffect(() => {
    // 檢查當前頁面是否為 [id] 頁面
    setIsDetailsPage(pathname.includes("/recording/analysis/") && !!id);
  }, [pathname, id]);

  const handleRefreshAnalysis = () => {
    // 使用 Context API 觸發重新分析
    if (id) {
      triggerRefresh(id);
    }
  };

  const handleOpenAIChat = () => {
    // 導航到智能問答頁面，並傳遞錄音ID
    if (id) {
      router.push(`/recording/analysis/chat/${id}`);
    }
  };

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: true, // 顯示系統標題欄
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: "#F8F9FA",
          },
        }}
      />

      {isDetailsPage && (
        <View style={styles.toolbar}>
          <TouchableOpacity style={styles.toolbarButton} onPress={handleRefreshAnalysis}>
            <Ionicons name="refresh-outline" size={24} color="#3A7BFF" />
            <ThemedText style={styles.toolbarButtonText}>重新分析</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolbarButton}>
            <Ionicons name="save-outline" size={24} color="#3A7BFF" />
            <ThemedText style={styles.toolbarButtonText}>匯出報告</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolbarButton}>
            <Ionicons name="share-social-outline" size={24} color="#3A7BFF" />
            <ThemedText style={styles.toolbarButtonText}>分享</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolbarButton} onPress={handleOpenAIChat}>
            <Ionicons name="chatbubble-ellipses-outline" size={24} color="#3A7BFF" />
            <ThemedText style={styles.toolbarButtonText}>AI問答</ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
}

// 主要佈局元件，提供 AnalysisContext
export default function AnalysisLayout() {
  return (
    <AnalysisProvider>
      <AnalysisLayoutContent />
    </AnalysisProvider>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#F0F2F5",
  },
  toolbarButton: {
    alignItems: "center",
    paddingHorizontal: 12,
  },
  toolbarButtonText: {
    fontSize: 12,
    marginTop: 4,
    color: "#3A7BFF",
  },
});
