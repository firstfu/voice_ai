# 智音坊 - 快速原型設計指南

## 原型目標

本指南旨在幫助設計和開發團隊快速建立「智音坊」的可用原型，以進行初期驗證和用戶測試。原型將聚焦於核心功能流程和關鍵用戶體驗，在保證基本體驗完整的同時，最小化開發工作量。

## 原型範圍

### 包含功能

1. **基礎錄音功能**

   - 錄音開始/暫停/停止
   - 音頻可視化波形
   - 基本錄音列表管理

2. **基本轉錄能力**

   - 錄音後文字轉換
   - 簡單的文本查看界面
   - 基礎的文本編輯

3. **簡化版 AI 分析**

   - 基本摘要生成
   - 簡單關鍵詞提取
   - 模擬分析結果展示

4. **最小可行的用戶界面**
   - 主要導航和頁面布局
   - 基本交互元素和反饋
   - 關鍵視覺元素實現

### 不包含功能

1. 用戶帳戶體系和雲同步
2. 高級音頻編輯工具
3. 複雜的分析可視化
4. 多語言支持和離線模式
5. 分享和協作功能
6. 完整的設置選項

## 技術選擇

為快速開發原型，建議使用以下技術：

### 前端

- **框架**: Expo (React Native) 快速啟動
- **UI 套件**: Expo UI Kitten 或 React Native Paper
- **音頻處理**: Expo AV 基本音頻功能
- **狀態管理**: React Context API (避免複雜的 Redux 設置)
- **導航**: React Navigation 基礎配置

### 後端

- **服務**: Firebase 或 Supabase 降低後端複雜度
- **AI 轉錄**: OpenAI Whisper API 作為初始服務
- **文本分析**: OpenAI GPT-4 API 進行基本文本處理
- **存儲**: Firebase Storage 簡化文件管理

## 實施策略

### 1. 關鍵界面模擬

優先實現以下關鍵界面的視覺原型：

#### 首頁/錄音列表

```
+---------------------------+
|  智音坊                 ⚙️  |
+---------------------------+
|                           |
|     +---------------+     |
|     |  開始錄音  🎙️  |     |
|     +---------------+     |
|                           |
| 最近錄音                  |
| +-------------------------+
| | 會議記錄 - 5月12日      |
| | 00:32:15     →          |
| +-------------------------+
| | 課堂筆記 - 5月10日      |
| | 01:15:42     →          |
| +-------------------------+
|                           |
+---------------------------+
|  📋 列表    🎙️ 錄音    👤 我 |
+---------------------------+
```

#### 錄音界面

```
+---------------------------+
|  ← 返回             保存  |
+---------------------------+
|                           |
|       00:05:32            |
|                           |
|    /\/\/\/\/\/\/\/\/\     |
|    \/\/\/\/\/\/\/\/\/     |
|                           |
|                           |
|                           |
|     +-------+    ■        |
|     |   ⏸   |             |
|     +-------+             |
|                           |
| [實時轉錄文字預覽區域]     |
| ...正在聽取您的聲音...     |
|                           |
+---------------------------+
```

#### 轉錄編輯界面

```
+---------------------------+
|  ← 返回             分析  |
+---------------------------+
| ▶️ 00:02:13 / 00:32:15    |
| +-------------------------+
| |      音頻波形           |
| +-------------------------+
|                           |
| 說話者 1 (00:00:15):      |
| 今天我們將討論專案進度...  |
|                           |
| 說話者 2 (00:01:22):      |
| 上週我們完成了設計階段...  |
|                           |
| [可編輯文本區域]           |
|                           |
+---------------------------+
| 編輯  |  播放  |  標記     |
+---------------------------+
```

#### AI 分析結果界面

```
+---------------------------+
|  ← 返回             分享  |
+---------------------------+
|                           |
| 📝 摘要                   |
| +-------------------------+
| | 會議討論了專案進度、     |
| | 資源分配和下一階段計劃... |
| +-------------------------+
|                           |
| 🔑 關鍵點                  |
| • 設計階段已完成           |
| • 開發將於下週開始         |
| • 測試計劃需要修訂         |
|                           |
| 📊 主題分布                |
| [簡化的餅圖]               |
|                           |
+---------------------------+
| 重新分析  |  導出  |  編輯  |
+---------------------------+
```

### 2. 數據模擬策略

為加速原型開發，建議採用以下數據模擬策略：

- **預設錄音樣本**: 包含 2-3 個預錄音頻樣本
- **模擬轉錄結果**: 對於現場錄音，可預先準備一些通用文本
- **模擬分析數據**: 使用固定模板產生分析結果
- **本地狀態存儲**: 使用 AsyncStorage 實現基本數據持久化

### 3. 開發階段規劃

將原型開發分為以下階段，每個階段 2-3 天：

#### 階段一：基礎框架與錄音功能

- 搭建 Expo 專案架構
- 實現基本導航流程
- 完成錄音和音頻可視化功能
- 建立基本錄音列表和管理

#### 階段二：轉錄與文本展示

- 整合 Whisper API 或模擬轉錄結果
- 開發文本查看和編輯界面
- 實現播放控制和文本同步
- 建立簡單的編輯功能

#### 階段三：AI 分析與優化

- 實現或模擬基本 AI 分析功能
- 開發分析結果展示界面
- 完善用戶交互細節
- 優化整體視覺和流程體驗

## 用戶測試計劃

原型完成後，建議執行以下用戶測試：

### 測試目標

1. 評估核心功能的可用性
2. 獲取用戶對 AI 功能價值的反饋
3. 識別主要的易用性障礙
4. 確認用戶流程的直觀性

### 測試方法

1. **引導式任務測試**

   - 要求用戶完成錄音和獲取分析的完整流程
   - 觀察並記錄用戶行為和評論
   - 測量任務完成時間和成功率

2. **半結構化訪談**
   - 探討用戶對功能重要性的看法
   - 獲取對介面設計的反饋
   - 了解潛在使用場景和需求

### 關鍵評估指標

- 任務完成率
- 關鍵路徑的點擊/步驟數
- 用戶滿意度評分
- 功能吸引力排名
- 問題識別與嚴重程度分級

## 原型優化迭代

基於測試結果，計劃 1-2 個快速迭代週期：

### 迭代一：基本修正

- 修復關鍵可用性問題
- 調整不直觀的交互元素
- 優化視覺設計中的混淆點

### 迭代二：功能增強

- 增強用戶最關注的功能
- 移除或簡化低價值元素
- 為下一階段開發確定優先級

## 從原型到產品

原型驗證後，制定以下轉換策略：

1. **技術重構計劃**

   - 確定需要重新設計的架構部分
   - 制定可擴展的數據模型
   - 規劃技術債務管理策略

2. **功能過渡路線圖**

   - 確定 MVP 核心功能集
   - 規劃分階段實施計劃
   - 設定功能完整性標準

3. **設計資產整理**
   - 建立設計系統基礎
   - 標準化 UI 組件和模式
   - 完善視覺細節規範

## 附錄：快速實施示例代碼

### 基本錄音功能 (React Native + Expo)

```javascript
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";

export function RecordingScreen() {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  async function startRecording() {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);

      setRecording(recording);
      setIsRecording(true);
      setDuration(0);
    } catch (err) {
      console.error("無法開始錄音", err);
    }
  }

  async function stopRecording() {
    setIsRecording(false);

    if (!recording) return;

    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();

    // 這裡可以發送錄音到後端進行處理
    console.log("錄音已保存至:", uri);

    setRecording(null);
  }

  function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.timeDisplay}>{formatDuration(duration)}</Text>

      <View style={styles.waveform}>
        {/* 這裡可以放置波形可視化組件 */}
        <Text style={styles.waveformPlaceholder}>{isRecording ? "波形視覺化" : "準備錄音"}</Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={[styles.recordButton, isRecording && styles.recordingActive]} onPress={isRecording ? stopRecording : startRecording}>
          <Ionicons name={isRecording ? "square" : "mic"} size={32} color="white" />
        </TouchableOpacity>
      </View>

      {isRecording && (
        <View style={styles.transcription}>
          <Text style={styles.transcriptionText}>正在聆聽您的聲音...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  timeDisplay: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 30,
  },
  waveform: {
    width: "100%",
    height: 120,
    backgroundColor: "#e2e8f0",
    borderRadius: 12,
    marginBottom: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  waveformPlaceholder: {
    color: "#718096",
  },
  controls: {
    flexDirection: "row",
    marginBottom: 30,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#3A7BFF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  recordingActive: {
    backgroundColor: "#FF6B4A",
  },
  transcription: {
    width: "100%",
    padding: 16,
    backgroundColor: "white",
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  transcriptionText: {
    fontSize: 16,
    color: "#2C3E50",
  },
});
```

### 簡單的轉錄結果界面

```javascript
import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// 模擬轉錄數據
const mockTranscription = [
  {
    id: 1,
    speaker: "說話者 1",
    timestamp: "00:00:15",
    text: "今天我們將討論專案進度和下一步計劃。",
  },
  {
    id: 2,
    speaker: "說話者 2",
    timestamp: "00:01:22",
    text: "上週我們完成了設計階段，主要界面已經定稿。關於開發階段，我認為我們需要先優先實現核心功能。",
  },
  // 更多數據...
];

export function TranscriptionScreen() {
  const [currentTime, setCurrentTime] = useState("00:00:00");
  const [totalTime, setTotalTime] = useState("00:32:15");
  const [isPlaying, setIsPlaying] = useState(false);

  function togglePlayback() {
    setIsPlaying(!isPlaying);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.timeDisplay}>
          {currentTime} / {totalTime}
        </Text>

        <TouchableOpacity style={styles.playButton} onPress={togglePlayback}>
          <Ionicons name={isPlaying ? "pause" : "play"} size={20} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.waveform}>
        {/* 音頻波形可視化 */}
        <View style={styles.waveformLine}></View>
      </View>

      <ScrollView style={styles.transcriptionContainer}>
        {mockTranscription.map(item => (
          <View key={item.id} style={styles.transcriptionItem}>
            <View style={styles.transcriptionHeader}>
              <Text style={styles.speakerLabel}>{item.speaker}</Text>
              <Text style={styles.timestampLabel}>{item.timestamp}</Text>
            </View>
            <Text style={styles.transcriptionText}>{item.text}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.toolbarButton}>
          <Ionicons name="create-outline" size={24} color="#3A7BFF" />
          <Text style={styles.toolbarButtonText}>編輯</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolbarButton}>
          <Ionicons name="play" size={24} color="#3A7BFF" />
          <Text style={styles.toolbarButtonText}>播放</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolbarButton}>
          <Ionicons name="bookmark-outline" size={24} color="#3A7BFF" />
          <Text style={styles.toolbarButtonText}>標記</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  timeDisplay: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2C3E50",
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#3A7BFF",
    alignItems: "center",
    justifyContent: "center",
  },
  waveform: {
    height: 60,
    padding: 16,
    justifyContent: "center",
    backgroundColor: "#EBF4FF",
  },
  waveformLine: {
    height: 2,
    backgroundColor: "#3A7BFF",
    width: "70%",
  },
  transcriptionContainer: {
    flex: 1,
    padding: 16,
  },
  transcriptionItem: {
    marginBottom: 24,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  transcriptionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  speakerLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#3A7BFF",
  },
  timestampLabel: {
    fontSize: 12,
    color: "#718096",
  },
  transcriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#2C3E50",
  },
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    backgroundColor: "white",
  },
  toolbarButton: {
    alignItems: "center",
  },
  toolbarButtonText: {
    marginTop: 4,
    fontSize: 12,
    color: "#3A7BFF",
  },
});
```

---

本文檔提供了「智音坊」應用的快速原型設計指南，旨在幫助團隊以最少的資源在短時間內創建可用的產品原型。通過聚焦核心功能流程和關鍵用戶體驗，並採用模擬數據策略，我們可以快速驗證產品概念並收集初期用戶反饋。
