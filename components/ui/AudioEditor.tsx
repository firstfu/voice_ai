/**
 * 音訊編輯器組件
 *
 * 提供音訊檔案編輯與處理功能，特點：
 * - 音訊波形視覺化顯示
 * - 音訊剪裁功能（選擇開始/結束時間點）
 * - 音量標準化處理
 * - 噪音消除功能
 * - 均衡器設定（低/中/高音調整）
 * - 完整的用戶介面與操作反饋
 */

import React, { useState, useEffect } from "react";
import { StyleSheet, View, TouchableOpacity, ScrollView, Alert } from "react-native";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";

interface AudioEditorProps {
  duration: number; // 總時長（秒）
  waveform?: number[]; // 音頻波形數據
  onTrim?: (startTime: number, endTime: number) => void;
  onNormalize?: () => void;
  onNoiseReduction?: () => void;
  onEqualizer?: (settings: EqualizerSettings) => void;
}

interface EqualizerSettings {
  bass: number;
  mid: number;
  treble: number;
}

// 模擬波形生成函數
function generateMockWaveform() {
  const data = [];
  for (let i = 0; i < 100; i++) {
    data.push(Math.random() * 0.8 + 0.2);
  }
  return data;
}

export const AudioEditor: React.FC<AudioEditorProps> = ({ duration, waveform = generateMockWaveform(), onTrim, onNormalize, onNoiseReduction, onEqualizer }) => {
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(duration);
  const [isEditingTrim, setIsEditingTrim] = useState(false);

  const [equalizerSettings, setEqualizerSettings] = useState<EqualizerSettings>({
    bass: 0,
    mid: 0,
    treble: 0,
  });

  // 格式化時間
  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // 處理波形選擇範圍
  const handleTrimRange = () => {
    if (isEditingTrim) {
      if (onTrim) {
        onTrim(trimStart, trimEnd);
      }
      setIsEditingTrim(false);
      Alert.alert("音頻剪輯", `已選擇時間範圍：${formatTime(trimStart)} - ${formatTime(trimEnd)}`);
    } else {
      setIsEditingTrim(true);
    }
  };

  // 處理均衡器設置
  const handleEqualizerChange = (type: keyof EqualizerSettings, value: number) => {
    const newSettings = { ...equalizerSettings, [type]: value };
    setEqualizerSettings(newSettings);

    if (onEqualizer) {
      onEqualizer(newSettings);
    }
  };

  // 處理音頻標準化
  const handleNormalize = () => {
    if (onNormalize) {
      onNormalize();
    }
    Alert.alert("音頻標準化", "音頻音量已標準化");
  };

  // 處理噪音消除
  const handleNoiseReduction = () => {
    if (onNoiseReduction) {
      onNoiseReduction();
    }
    Alert.alert("噪音消除", "音頻噪音已減少");
  };

  return (
    <View style={styles.container}>
      {/* 波形顯示與剪輯 */}
      <View style={styles.waveformContainer}>
        <ThemedText style={styles.sectionTitle}>波形</ThemedText>

        <View style={styles.waveform}>
          {waveform.map((amplitude, index) => (
            <View
              key={index}
              style={[
                styles.waveformBar,
                {
                  height: amplitude * 60,
                  backgroundColor: (index / waveform.length) * duration >= trimStart && (index / waveform.length) * duration <= trimEnd ? "#007AFF" : "#8E8E93",
                },
              ]}
            />
          ))}
        </View>

        <View style={styles.trimControls}>
          <ThemedText>{formatTime(trimStart)}</ThemedText>
          <ThemedText>{formatTime(trimEnd)}</ThemedText>
        </View>

        {isEditingTrim && (
          <View style={styles.trimSliderContainer}>
            <ThemedText style={styles.trimLabel}>開始</ThemedText>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={duration}
              value={trimStart}
              onValueChange={setTrimStart}
              minimumTrackTintColor="#007AFF"
              maximumTrackTintColor="#1C1C1E"
              thumbTintColor="#FFFFFF"
            />

            <ThemedText style={styles.trimLabel}>結束</ThemedText>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={duration}
              value={trimEnd}
              onValueChange={setTrimEnd}
              minimumTrackTintColor="#007AFF"
              maximumTrackTintColor="#1C1C1E"
              thumbTintColor="#FFFFFF"
            />
          </View>
        )}

        <TouchableOpacity style={[styles.actionButton, isEditingTrim ? styles.actionButtonActive : null]} onPress={handleTrimRange}>
          <Ionicons name="cut-outline" size={18} color="#FFFFFF" />
          <ThemedText style={styles.actionButtonText}>{isEditingTrim ? "確認剪輯" : "選擇剪輯範圍"}</ThemedText>
        </TouchableOpacity>
      </View>

      {/* 音效處理 */}
      <View style={styles.audioFxContainer}>
        <ThemedText style={styles.sectionTitle}>音效處理</ThemedText>

        <View style={styles.fxButtons}>
          <TouchableOpacity style={styles.fxButton} onPress={handleNormalize}>
            <Ionicons name="analytics-outline" size={18} color="#FFFFFF" />
            <ThemedText style={styles.fxButtonText}>音量標準化</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.fxButton} onPress={handleNoiseReduction}>
            <Ionicons name="ear-outline" size={18} color="#FFFFFF" />
            <ThemedText style={styles.fxButtonText}>噪音消除</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {/* 均衡器 */}
      <View style={styles.equalizerContainer}>
        <ThemedText style={styles.sectionTitle}>均衡器</ThemedText>

        <View style={styles.eqControl}>
          <ThemedText style={styles.eqLabel}>低音</ThemedText>
          <Slider
            style={styles.eqSlider}
            minimumValue={-10}
            maximumValue={10}
            value={equalizerSettings.bass}
            onValueChange={value => handleEqualizerChange("bass", value)}
            minimumTrackTintColor="#007AFF"
            maximumTrackTintColor="#1C1C1E"
            thumbTintColor="#FFFFFF"
          />
          <ThemedText>{equalizerSettings.bass.toFixed(1)}</ThemedText>
        </View>

        <View style={styles.eqControl}>
          <ThemedText style={styles.eqLabel}>中音</ThemedText>
          <Slider
            style={styles.eqSlider}
            minimumValue={-10}
            maximumValue={10}
            value={equalizerSettings.mid}
            onValueChange={value => handleEqualizerChange("mid", value)}
            minimumTrackTintColor="#007AFF"
            maximumTrackTintColor="#1C1C1E"
            thumbTintColor="#FFFFFF"
          />
          <ThemedText>{equalizerSettings.mid.toFixed(1)}</ThemedText>
        </View>

        <View style={styles.eqControl}>
          <ThemedText style={styles.eqLabel}>高音</ThemedText>
          <Slider
            style={styles.eqSlider}
            minimumValue={-10}
            maximumValue={10}
            value={equalizerSettings.treble}
            onValueChange={value => handleEqualizerChange("treble", value)}
            minimumTrackTintColor="#007AFF"
            maximumTrackTintColor="#1C1C1E"
            thumbTintColor="#FFFFFF"
          />
          <ThemedText>{equalizerSettings.treble.toFixed(1)}</ThemedText>
        </View>
      </View>

      {/* 保存按鈕 */}
      <TouchableOpacity style={styles.saveButton}>
        <Ionicons name="save-outline" size={18} color="#FFFFFF" />
        <ThemedText style={styles.saveButtonText}>保存更改</ThemedText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  waveformContainer: {
    marginBottom: 24,
  },
  waveform: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1C1C1E",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  waveformBar: {
    width: 2,
    backgroundColor: "#8E8E93",
    marginHorizontal: 1,
    borderRadius: 1,
  },
  trimControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  trimSliderContainer: {
    marginTop: 12,
  },
  trimLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  slider: {
    width: "100%",
    height: 40,
    marginBottom: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
  },
  actionButtonActive: {
    backgroundColor: "#FF9500",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontWeight: "500",
    marginLeft: 8,
  },
  audioFxContainer: {
    marginBottom: 24,
  },
  fxButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  fxButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#5AC8FA",
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
  },
  fxButtonText: {
    color: "#FFFFFF",
    fontWeight: "500",
    marginLeft: 6,
  },
  equalizerContainer: {
    marginBottom: 24,
  },
  eqControl: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  eqLabel: {
    width: 40,
    fontSize: 14,
  },
  eqSlider: {
    flex: 1,
    height: 40,
    marginHorizontal: 8,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#30D158",
    borderRadius: 8,
    padding: 14,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 8,
  },
});
