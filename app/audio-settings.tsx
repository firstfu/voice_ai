/**
 * 進階音訊設定頁面
 *
 * 本頁面提供應用程式音訊錄音和播放的進階設定功能，包括:
 * - 採樣率設定
 * - 編碼格式選擇
 * - 聲道設定
 * - 比特率設定
 * - 噪音消除等級
 */

import { StyleSheet, TouchableOpacity, View, StatusBar, Switch, ScrollView, Platform, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useRouter, Stack } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedView } from "@/components/ThemedView";

interface AudioSettingsState {
  sampleRate: string;
  encodingFormat: string;
  channelCount: string;
  bitRate: string;
  noiseReduction: boolean;
  audioEnhancement: boolean;
  autoNormalize: boolean;
}

// 選項定義
const sampleRateOptions = [
  { label: "8,000 Hz (電話音質)", value: "8000" },
  { label: "16,000 Hz (語音)", value: "16000" },
  { label: "22,050 Hz (FM廣播)", value: "22050" },
  { label: "44,100 Hz (CD音質)", value: "44100" },
  { label: "48,000 Hz (專業音訊)", value: "48000" },
  { label: "96,000 Hz (高解析度)", value: "96000" },
];

const encodingFormatOptions = [
  { label: "AAC (一般用途)", value: "aac" },
  { label: "MP3 (高相容性)", value: "mp3" },
  { label: "WAV (無損音訊)", value: "wav" },
  { label: "FLAC (高效無損)", value: "flac" },
  { label: "OGG (開源格式)", value: "ogg" },
];

const channelCountOptions = [
  { label: "單聲道 (較小檔案)", value: "mono" },
  { label: "立體聲 (較佳音場)", value: "stereo" },
];

const bitRateOptions = [
  { label: "64 kbps (低音質)", value: "64" },
  { label: "96 kbps (中等音質)", value: "96" },
  { label: "128 kbps (標準音質)", value: "128" },
  { label: "192 kbps (高音質)", value: "192" },
  { label: "256 kbps (很高音質)", value: "256" },
  { label: "320 kbps (最高音質)", value: "320" },
];

export default function AudioSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // 初始音訊設定狀態
  const [audioSettings, setAudioSettings] = useState<AudioSettingsState>({
    sampleRate: "44100",
    encodingFormat: "aac",
    channelCount: "stereo",
    bitRate: "128",
    noiseReduction: true,
    audioEnhancement: false,
    autoNormalize: true,
  });

  // 更新設定函數
  const updateSetting = (key: keyof AudioSettingsState, value: string | boolean) => {
    setAudioSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // 保存設定並返回
  const saveSettings = () => {
    // 在實際應用中，這裡會儲存設定到本地儲存
    console.log("儲存設定:", audioSettings);
    router.back();
  };

  // 渲染選項元素
  const renderSelectOption = (title: string, description: string, options: Array<{ label: string; value: string }>, currentValue: string, settingKey: keyof AudioSettingsState) => {
    return (
      <View style={styles.settingGroup}>
        <Text style={styles.settingGroupTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
        <View style={styles.optionsContainer}>
          {options.map(option => (
            <TouchableOpacity
              key={option.value}
              style={[styles.optionButton, audioSettings[settingKey] === option.value && styles.optionButtonSelected]}
              onPress={() => updateSetting(settingKey, option.value)}
            >
              <Text style={[styles.optionText, audioSettings[settingKey] === option.value && styles.optionTextSelected]}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* 頂部設計元素 */}
      <LinearGradient
        colors={["rgba(236, 72, 153, 0.1)", "rgba(236, 72, 153, 0)"]}
        style={[styles.headerBackground, { paddingTop: insets.top }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      {/* 頂部標題區 */}
      <View style={[styles.headerContainer, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#3A7BFF" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>進階音訊設定</Text>
        </View>
      </View>

      <ScrollView style={styles.settingsContainer} showsVerticalScrollIndicator={false}>
        {/* 採樣率 */}
        {renderSelectOption("採樣率", "設定錄音的採樣率，較高採樣率提供更高品質但檔案更大", sampleRateOptions, audioSettings.sampleRate, "sampleRate")}

        {/* 編碼格式 */}
        {renderSelectOption("編碼格式", "選擇錄音檔案的編碼格式，不同格式在相容性和品質上有所差異", encodingFormatOptions, audioSettings.encodingFormat, "encodingFormat")}

        {/* 聲道設定 */}
        {renderSelectOption("聲道設定", "設定錄音的聲道數量", channelCountOptions, audioSettings.channelCount, "channelCount")}

        {/* 比特率設定 */}
        {renderSelectOption("比特率 (kbps)", "設定錄音的比特率，影響音訊品質和檔案大小", bitRateOptions, audioSettings.bitRate, "bitRate")}

        {/* 音訊處理選項 */}
        <View style={styles.settingGroup}>
          <Text style={styles.settingGroupTitle}>音訊處理</Text>
          <Text style={styles.settingDescription}>啟用或禁用各種音訊處理選項</Text>

          <View style={styles.toggleItem}>
            <View style={styles.toggleTextContainer}>
              <Text style={styles.toggleTitle}>噪音消除</Text>
              <Text style={styles.toggleDescription}>減少背景噪音和雜訊</Text>
            </View>
            <Switch
              value={audioSettings.noiseReduction}
              onValueChange={value => updateSetting("noiseReduction", value)}
              trackColor={{ false: "#E2E8F0", true: "#EC4899" }}
              thumbColor={"#FFFFFF"}
              ios_backgroundColor="#E2E8F0"
            />
          </View>

          <View style={styles.toggleItem}>
            <View style={styles.toggleTextContainer}>
              <Text style={styles.toggleTitle}>音訊增強</Text>
              <Text style={styles.toggleDescription}>增強聲音的清晰度和豐富度</Text>
            </View>
            <Switch
              value={audioSettings.audioEnhancement}
              onValueChange={value => updateSetting("audioEnhancement", value)}
              trackColor={{ false: "#E2E8F0", true: "#EC4899" }}
              thumbColor={"#FFFFFF"}
              ios_backgroundColor="#E2E8F0"
            />
          </View>

          <View style={styles.toggleItem}>
            <View style={styles.toggleTextContainer}>
              <Text style={styles.toggleTitle}>自動正規化</Text>
              <Text style={styles.toggleDescription}>自動平衡音量水平</Text>
            </View>
            <Switch
              value={audioSettings.autoNormalize}
              onValueChange={value => updateSetting("autoNormalize", value)}
              trackColor={{ false: "#E2E8F0", true: "#EC4899" }}
              thumbColor={"#FFFFFF"}
              ios_backgroundColor="#E2E8F0"
            />
          </View>
        </View>

        {/* 保存按鈕 */}
        <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
          <Text style={styles.saveButtonText}>儲存設定</Text>
        </TouchableOpacity>

        {/* 底部間距 */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBackground: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 200,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    marginRight: 40, // 為了平衡返回按鈕的寬度，讓標題居中
  },
  titleText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    lineHeight: 24,
  },
  settingsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  settingGroup: {
    marginBottom: 25,
    borderRadius: 12,
    padding: 16,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  settingGroupTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#000000",
    lineHeight: 22,
  },
  settingDescription: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 16,
    lineHeight: 20,
  },
  optionsContainer: {
    flexDirection: "column",
    flexWrap: "wrap",
  },
  optionButton: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    justifyContent: "center",
    minHeight: 48,
  },
  optionButtonSelected: {
    borderColor: "#EC4899",
    backgroundColor: "rgba(236, 72, 153, 0.1)",
  },
  optionText: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
    marginVertical: 3,
  },
  optionTextSelected: {
    color: "#EC4899",
    fontWeight: "500",
  },
  toggleItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(226, 232, 240, 0.8)",
  },
  toggleTextContainer: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#000000",
    lineHeight: 21,
  },
  toggleDescription: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
    lineHeight: 18,
  },
  saveButton: {
    backgroundColor: "#EC4899",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
  },
});
