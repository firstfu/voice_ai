/**
 * 設定頁面
 *
 * 本頁面提供應用程式設定管理功能，包括:
 * - 個人化設定（深色模式、通知等）
 * - 錄音與播放參數配置
 * - 安全與隱私選項
 * - 應用程式資訊與支援入口
 * - 使用分組顯示的設定列表
 */

import { StyleSheet, TouchableOpacity, SectionList, View, Platform, StatusBar, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { useRouter, Stack } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SectionListRenderItem } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

interface SettingItem {
  id: string;
  title: string;
  icon: string;
  subtitle?: string;
  type: "toggle" | "arrow" | "info";
  value?: boolean;
  onPress?: () => void;
}

interface SettingSection {
  title: string;
  data: SettingItem[];
}

// 設定儲存鍵
const SETTINGS_STORAGE_KEY = "voice_ai_settings";
const AUDIO_SETTINGS_STORAGE_KEY = "voice_ai_audio_settings";

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [settings, setSettings] = useState({
    notifications: true,
    highQuality: true,
    autoSave: true,
    biometricAuth: false,
    saveOriginal: true,
  });

  // 從本地儲存載入設定
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // 載入一般設定
        const savedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
        if (savedSettings) {
          setSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }));
        }

        // 載入音訊設定中的高音質設定
        const savedAudioSettings = await AsyncStorage.getItem(AUDIO_SETTINGS_STORAGE_KEY);
        if (savedAudioSettings) {
          const audioSettings = JSON.parse(savedAudioSettings);
          if ("highQuality" in audioSettings) {
            setSettings(prev => ({ ...prev, highQuality: audioSettings.highQuality }));
          }
        }
      } catch (error) {
        console.error("無法載入設定:", error);
      }
    };

    loadSettings();
  }, []);

  // 儲存設定
  const toggleSetting = async (key: string) => {
    const newValue = !settings[key as keyof typeof settings];

    setSettings(prevSettings => ({
      ...prevSettings,
      [key]: newValue,
    }));

    try {
      // 儲存更新後的設定
      const settingsToSave = { ...settings, [key]: newValue };
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settingsToSave));
    } catch (error) {
      console.error("無法儲存設定:", error);
    }
  };

  const settingsSections: SettingSection[] = [
    {
      title: "個人化",
      data: [
        {
          id: "notifications",
          title: "通知",
          subtitle: "接收錄音完成和處理提醒",
          icon: "notifications",
          type: "toggle",
          value: settings.notifications,
          onPress: () => toggleSetting("notifications"),
        },
      ],
    },
    {
      title: "錄音與播放",
      data: [
        {
          id: "autoSave",
          title: "自動儲存",
          subtitle: "自動保存錄音並進行命名",
          icon: "save",
          type: "toggle",
          value: settings.autoSave,
          onPress: () => toggleSetting("autoSave"),
        },
        {
          id: "saveOriginal",
          title: "保留原始檔案",
          subtitle: "在編輯後保留原始錄音檔案",
          icon: "document-text",
          type: "toggle",
          value: settings.saveOriginal,
          onPress: () => toggleSetting("saveOriginal"),
        },
        {
          id: "audioSettings",
          title: "進階音訊設定",
          subtitle: "音質、採樣率、編碼格式等設定",
          icon: "options",
          type: "arrow",
          onPress: () => router.push("/audio-settings"),
        },
      ],
    },
    {
      title: "安全與隱私",
      data: [
        {
          id: "privacy",
          title: "法律資訊",
          subtitle: "隱私權政策與服務條款",
          icon: "lock-closed",
          type: "arrow",
          onPress: () => router.push("/legal"),
        },
      ],
    },
    {
      title: "關於與支援",
      data: [
        {
          id: "about",
          title: "關於智音坊",
          subtitle: "了解我們的故事與使命",
          icon: "information-circle",
          type: "arrow",
          onPress: () => router.push("/about"),
        },
        {
          id: "help",
          title: "幫助與支援",
          subtitle: "尋求協助或提供反饋",
          icon: "help-circle",
          type: "arrow",
          onPress: () => router.push("/help"),
        },
        {
          id: "version",
          title: "版本",
          subtitle: "1.0.0 (Build 2402)",
          icon: "code-slash",
          type: "info",
        },
      ],
    },
    {
      title: "開發者工具",
      data: [
        {
          id: "devTools",
          title: "開發者工具",
          subtitle: "用於測試與開發的功能",
          icon: "construct",
          type: "arrow",
          onPress: () => router.push("/dev-tools"),
        },
      ],
    },
  ];

  const renderSettingItem: SectionListRenderItem<SettingItem, SettingSection> = ({ item, index }) => (
    <View style={styles.settingItemContainer}>
      <TouchableOpacity style={styles.settingItem} onPress={item.onPress} disabled={item.type === "info"} activeOpacity={0.7}>
        <View style={styles.settingItemLeft}>
          <View style={[styles.iconContainer, { backgroundColor: getIconBackground(item.id) }]}>
            <Ionicons name={item.icon as any} size={20} color="#FFFFFF" />
          </View>
          <View style={styles.textContainer}>
            <ThemedText style={styles.settingTitle}>{item.title}</ThemedText>
            {item.subtitle && <ThemedText style={styles.settingSubtitle}>{item.subtitle}</ThemedText>}
          </View>
        </View>

        <View style={styles.settingItemRight}>
          {item.type === "toggle" && (
            <Switch
              value={item.value}
              onValueChange={item.onPress}
              trackColor={{ false: "#E2E8F0", true: "#3A7BFF" }}
              thumbColor={"#FFFFFF"}
              ios_backgroundColor="#E2E8F0"
            />
          )}
          {item.type === "arrow" && (
            <View style={styles.arrowContainer}>
              <Ionicons name="chevron-forward" size={18} color="#A0AEC0" />
            </View>
          )}
          {item.type === "info" && <ThemedText style={styles.infoText}>{item.subtitle}</ThemedText>}
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderSectionHeader = ({ section }: { section: SettingSection }) => (
    <View style={styles.sectionHeader}>
      <ThemedText style={styles.sectionTitle}>{section.title}</ThemedText>
    </View>
  );

  // 根據不同設定項目返回不同的圖標背景色
  const getIconBackground = (id: string) => {
    const colorMap: { [key: string]: string } = {
      notifications: "#F59E0B",
      highQuality: "#10B981",
      autoSave: "#3B82F6",
      saveOriginal: "#8B5CF6",
      audioSettings: "#EC4899",
      privacy: "#64748B",
      about: "#0EA5E9",
      help: "#14B8A6",
      version: "#8B5CF6",
    };

    return colorMap[id] || "#3A7BFF";
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* 頂部設計元素 */}
      <LinearGradient
        colors={["rgba(58, 123, 255, 0.1)", "rgba(58, 123, 255, 0)"]}
        style={[styles.headerBackground, { paddingTop: insets.top }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      {/* 頂部標題區 */}
      <View style={[styles.headerContainer, { paddingTop: insets.top + 20 }]}>
        <View style={styles.titleContainer}>
          <ThemedText type="title" style={styles.titleText}>
            設置
          </ThemedText>
        </View>
      </View>

      {/* 設置列表 */}
      <SectionList
        sections={settingsSections}
        keyExtractor={item => item.id}
        renderItem={renderSettingItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 80 }]}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  titleText: {
    fontSize: 32,
    fontWeight: "700",
  },
  listContent: {
    paddingHorizontal: 18,
  },
  sectionHeader: {
    marginTop: 30,
    marginBottom: 10,
    paddingHorizontal: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#3A7BFF",
    letterSpacing: 0.3,
  },
  settingItemContainer: {
    marginBottom: 8,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  settingItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  settingSubtitle: {
    fontSize: 13,
    color: "#718096",
    marginTop: 2,
  },
  settingItemRight: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 8,
  },
  arrowContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(160, 174, 192, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  infoText: {
    fontSize: 14,
    color: "#A0AEC0",
  },
});
