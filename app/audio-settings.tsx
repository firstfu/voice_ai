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

import { StyleSheet, TouchableOpacity, View, StatusBar, Switch, ScrollView, Platform, Text, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { useRouter, Stack } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ThemedView } from "@/components/ThemedView";

interface AudioSettingsState {
  sampleRate: string;
  encodingFormat: string;
  channelCount: string;
  bitRate: string;
  noiseReduction: boolean;
  audioEnhancement: boolean;
  autoNormalize: boolean;
  highQuality: boolean;
  recordingQuality: "standard" | "high" | "custom";
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

const recordingQualityOptions = [
  {
    label: "標準品質",
    value: "standard",
    description: "適合一般對話錄音，檔案較小",
    icon: "document-outline" as const,
    color: "#3A7BFF",
    settings: {
      sampleRate: "22050",
      encodingFormat: "aac",
      bitRate: "128",
      channelCount: "mono",
    },
  },
  {
    label: "高音質",
    value: "high",
    description: "以最佳品質錄製聲音，適合音樂與專業用途",
    icon: "disc-outline" as const,
    color: "#10B981",
    settings: {
      sampleRate: "44100",
      encodingFormat: "wav",
      bitRate: "256",
      channelCount: "stereo",
    },
  },
  {
    label: "自訂設定",
    value: "custom",
    description: "手動調整所有音訊參數",
    icon: "settings-outline" as const,
    color: "#EC4899",
    settings: null,
  },
];

// 儲存設定的鍵名
const AUDIO_SETTINGS_STORAGE_KEY = "voice_ai_audio_settings";

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
    highQuality: true,
    recordingQuality: "high",
  });

  // 載入已儲存的設定
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem(AUDIO_SETTINGS_STORAGE_KEY);
        if (savedSettings) {
          setAudioSettings(JSON.parse(savedSettings));
        }
      } catch (error) {
        console.error("無法載入音訊設定:", error);
      }
    };

    loadSettings();
  }, []);

  // 更新設定函數
  const updateSetting = (key: keyof AudioSettingsState, value: string | boolean) => {
    // 先創建新的設定物件
    const newSettings = { ...audioSettings, [key]: value };

    // 處理錄音品質預設值的選擇
    if (key === "recordingQuality") {
      const qualityOption = recordingQualityOptions.find(option => option.value === value);
      if (qualityOption && qualityOption.settings) {
        // 套用預設參數
        newSettings.sampleRate = qualityOption.settings.sampleRate;
        newSettings.encodingFormat = qualityOption.settings.encodingFormat;
        newSettings.bitRate = qualityOption.settings.bitRate;
        newSettings.channelCount = qualityOption.settings.channelCount;

        // 更新高音質錄音開關
        newSettings.highQuality = value === "high";
      }
    }
    // 高音質錄音相關邏輯
    else if (key === "highQuality") {
      if (value === true) {
        // 若開啟高音質錄音，自動設定為高品質參數
        newSettings.sampleRate = "44100"; // CD音質
        newSettings.encodingFormat = "wav"; // 無損格式
        newSettings.bitRate = "256"; // 高比特率
        newSettings.channelCount = "stereo"; // 立體聲
        newSettings.noiseReduction = true; // 啟用噪音消除
        newSettings.recordingQuality = "high"; // 設為高音質預設
      } else {
        newSettings.recordingQuality = "custom"; // 設為自訂
      }
    }
    // 當用戶修改任何技術參數時
    else if (["sampleRate", "encodingFormat", "bitRate", "channelCount"].includes(key as string)) {
      // 檢查是否與任何預設設定匹配
      let matchFound = false;
      for (const option of recordingQualityOptions) {
        if (
          option.settings &&
          option.settings.sampleRate === newSettings.sampleRate &&
          option.settings.encodingFormat === newSettings.encodingFormat &&
          option.settings.bitRate === newSettings.bitRate &&
          option.settings.channelCount === newSettings.channelCount
        ) {
          newSettings.recordingQuality = option.value as any;
          matchFound = true;
          break;
        }
      }

      // 如果沒有匹配的預設，則設為自訂
      if (!matchFound) {
        newSettings.recordingQuality = "custom";
      }

      // 反向邏輯：當用戶手動調低音質設定時，自動關閉高音質模式
      if (
        (key === "sampleRate" && parseInt(value as string) < 44100) ||
        (key === "encodingFormat" && value !== "wav" && value !== "flac") ||
        (key === "bitRate" && parseInt(value as string) < 192) ||
        (key === "channelCount" && value === "mono")
      ) {
        newSettings.highQuality = false;
      }
    }

    // 更新狀態
    setAudioSettings(newSettings);
  };

  // 保存設定並返回
  const saveSettings = async () => {
    try {
      // 將設定保存到本地存儲
      await AsyncStorage.setItem(AUDIO_SETTINGS_STORAGE_KEY, JSON.stringify(audioSettings));

      // 顯示成功訊息
      Alert.alert("設定已儲存", "您的進階音訊設定已成功儲存", [{ text: "確定", onPress: () => router.back() }]);
    } catch (error) {
      console.error("無法儲存音訊設定:", error);
      Alert.alert("儲存失敗", "無法儲存音訊設定，請稍後再試");
    }
  };

  // 渲染選項元素
  const renderSelectOption = (
    title: string,
    description: string,
    options: Array<{ label: string; value: string }>,
    currentValue: string,
    settingKey: keyof AudioSettingsState,
    disabled: boolean = false
  ) => {
    return (
      <View style={styles.settingGroup}>
        <Text style={styles.settingGroupTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
        <View style={styles.optionsContainer}>
          {options.map(option => (
            <TouchableOpacity
              key={option.value}
              style={[styles.optionButton, audioSettings[settingKey] === option.value && styles.optionButtonSelected, disabled && styles.optionButtonDisabled]}
              onPress={() => !disabled && updateSetting(settingKey, option.value)}
              disabled={disabled}
            >
              <Text style={[styles.optionText, audioSettings[settingKey] === option.value && styles.optionTextSelected, disabled && styles.optionTextDisabled]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {disabled && audioSettings.recordingQuality !== "custom" && <Text style={styles.disabledNote}>使用預設品質時，系統會自動選擇最佳設定</Text>}
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
        {/* 錄音質量選項 */}
        <View style={styles.settingGroup}>
          <Text style={styles.settingGroupTitle}>錄音質量</Text>
          <Text style={styles.settingDescription}>調整錄音的品質和儲存設定</Text>

          <View style={styles.qualityOptionsContainer}>
            {recordingQualityOptions.map(option => (
              <TouchableOpacity
                key={option.value}
                style={[styles.qualityOption, audioSettings.recordingQuality === option.value && styles.qualityOptionSelected, { borderColor: option.color }]}
                onPress={() => updateSetting("recordingQuality", option.value)}
              >
                <View style={[styles.qualityIconContainer, { backgroundColor: option.color }]}>
                  <Ionicons name={option.icon} size={20} color="#FFFFFF" />
                </View>
                <View style={styles.qualityTextContainer}>
                  <Text style={styles.qualityTitle}>{option.label}</Text>
                  <Text style={styles.qualityDescription}>{option.description}</Text>
                </View>
                <View style={styles.qualityRadioContainer}>
                  <View
                    style={[
                      styles.qualityRadio,
                      audioSettings.recordingQuality === option.value && styles.qualityRadioSelected,
                      audioSettings.recordingQuality === option.value && { borderColor: option.color },
                    ]}
                  >
                    {audioSettings.recordingQuality === option.value && <View style={[styles.qualityRadioDot, { backgroundColor: option.color }]} />}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* 顯示當前選擇的預設品質參數摘要 */}
          {audioSettings.recordingQuality !== "custom" && (
            <View style={styles.presetSummaryContainer}>
              <Text style={styles.presetSummaryTitle}>預設參數摘要：</Text>
              <View style={styles.presetSummaryItems}>
                <Text style={styles.presetSummaryItem}>
                  採樣率:{" "}
                  {recordingQualityOptions.find(opt => opt.value === audioSettings.recordingQuality)?.settings?.sampleRate === "44100"
                    ? "44.1 kHz (CD音質)"
                    : "22.05 kHz (語音品質)"}
                </Text>
                <Text style={styles.presetSummaryItem}>
                  格式: {recordingQualityOptions.find(opt => opt.value === audioSettings.recordingQuality)?.settings?.encodingFormat.toUpperCase()}
                </Text>
                <Text style={styles.presetSummaryItem}>
                  聲道: {recordingQualityOptions.find(opt => opt.value === audioSettings.recordingQuality)?.settings?.channelCount === "stereo" ? "立體聲" : "單聲道"}
                </Text>
                <Text style={styles.presetSummaryItem}>比特率: {recordingQualityOptions.find(opt => opt.value === audioSettings.recordingQuality)?.settings?.bitRate} kbps</Text>
              </View>
            </View>
          )}
        </View>

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

        {/* 僅在自訂設定模式下顯示詳細參數 */}
        {audioSettings.recordingQuality === "custom" && (
          <>
            {/* 採樣率 */}
            {renderSelectOption(
              "採樣率",
              "設定錄音的採樣率，較高採樣率提供更高品質但檔案更大",
              sampleRateOptions,
              audioSettings.sampleRate,
              "sampleRate",
              false // 自訂模式下可編輯
            )}

            {/* 編碼格式 */}
            {renderSelectOption(
              "編碼格式",
              "選擇錄音檔案的編碼格式，不同格式在相容性和品質上有所差異",
              encodingFormatOptions,
              audioSettings.encodingFormat,
              "encodingFormat",
              false // 自訂模式下可編輯
            )}

            {/* 聲道設定 */}
            {renderSelectOption(
              "聲道設定",
              "設定錄音的聲道數量",
              channelCountOptions,
              audioSettings.channelCount,
              "channelCount",
              false // 自訂模式下可編輯
            )}

            {/* 比特率設定 */}
            {renderSelectOption(
              "比特率 (kbps)",
              "設定錄音的比特率，影響音訊品質和檔案大小",
              bitRateOptions,
              audioSettings.bitRate,
              "bitRate",
              false // 自訂模式下可編輯
            )}
          </>
        )}

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
  optionButtonDisabled: {
    backgroundColor: "rgba(236, 240, 250, 0.6)",
    borderColor: "#D1D5DB",
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
  optionTextDisabled: {
    color: "#9CA3AF",
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
  qualityOptionsContainer: {
    marginTop: 5,
  },
  qualityOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
  qualityOptionSelected: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  qualityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  qualityTextContainer: {
    flex: 1,
  },
  qualityTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 3,
    lineHeight: 20,
  },
  qualityDescription: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
  },
  qualityRadioContainer: {
    width: 40,
    alignItems: "center",
  },
  qualityRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    justifyContent: "center",
    alignItems: "center",
  },
  qualityRadioSelected: {
    borderColor: "#3A7BFF",
  },
  qualityRadioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#3A7BFF",
  },
  disabledNote: {
    fontSize: 13,
    color: "#3A7BFF",
    fontStyle: "italic",
    marginTop: 10,
    lineHeight: 18,
  },
  presetSummaryContainer: {
    marginTop: 16,
    backgroundColor: "rgba(240, 240, 250, 0.6)",
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#3A7BFF",
  },
  presetSummaryTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3A7BFF",
    marginBottom: 6,
    lineHeight: 20,
  },
  presetSummaryItems: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  presetSummaryItem: {
    fontSize: 13,
    color: "#4B5563",
    marginRight: 12,
    marginBottom: 4,
    lineHeight: 18,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
});
