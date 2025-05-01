# Voice AI 語音助手 📱🎙️

這是一個基於 [Expo](https://expo.dev) 和 React Native 開發的專業語音處理應用程式，專注於高品質語音錄製、分析和編輯。

## 專案概述

Voice AI (智音坊) 是一款功能強大的語音處理工具，專為需要高效處理音訊的專業人士和普通用戶設計，提供以下核心功能：

- 🎙️ 專業級語音錄製，支援暫停/繼續功能
- 🔊 高質量音訊播放與波形可視化
- ✏️ 直觀的音訊剪輯與編輯工具
- 🔍 自動語音轉文字與文本分析
- 🗂️ 智能分類與標籤管理
- 📊 語音數據統計與分析
- 🎨 美觀現代的用戶界面

## 技術架構

Voice AI 採用現代 React Native 技術棧：

- **框架**: [Expo](https://expo.dev) SDK 52 - 提供跨平台開發能力
- **語言**: TypeScript - 確保代碼類型安全
- **路由**: expo-router 4.0 - 基於檔案系統的應用路由
- **狀態管理**: React Hooks - 使用 useState、useEffect 管理狀態
- **音訊處理**: expo-av - 提供強大的音訊錄製與播放功能
- **UI 動畫**: react-native-reanimated - 實現流暢的使用者介面動畫
- **介面設計**: 使用 Linear Gradient、Blur 效果等現代 UI 元素

## 專案結構

```
voice_ai/
├── app/                     # 應用路由和頁面
│   ├── _layout.tsx          # 根佈局
│   ├── +not-found.tsx       # 404 頁面
│   ├── about.tsx            # 關於頁面
│   ├── help.tsx             # 幫助頁面
│   ├── (tabs)/              # 底部標籤頁面
│   │   ├── _layout.tsx      # 標籤佈局
│   │   ├── index.tsx        # 首頁
│   │   ├── recordings.tsx   # 錄音列表頁
│   │   └── settings.tsx     # 設置頁面
│   └── recording/           # 錄音功能
│       ├── [id].tsx         # 錄音詳情頁
│       ├── new.tsx          # 新建錄音頁
│       ├── editor.tsx       # 錄音編輯頁
│       ├── manage.tsx       # 錄音管理頁
│       └── analysis/        # 音訊分析相關頁面
├── components/              # UI 組件
│   ├── ui/                  # 通用 UI 元素
│   ├── ThemedText.tsx       # 主題文字組件
│   ├── ThemedView.tsx       # 主題視圖組件
│   ├── ExternalLink.tsx     # 外部連結組件
│   ├── HelloWave.tsx        # 波形動畫組件
│   ├── Collapsible.tsx      # 可折疊組件
│   ├── HapticTab.tsx        # 觸覺反饋標籤
│   └── ParallaxScrollView.tsx # 視差滾動組件
├── assets/                  # 靜態資源
│   ├── fonts/               # 自定義字體
│   ├── images/              # 圖片資源
│   └── sounds/              # 音效檔案
├── constants/               # 應用常量與設定
├── hooks/                   # 自定義 React Hooks
└── scripts/                 # 工具腳本
```

## 功能模組詳解

### 1. 首頁模組 (app/(tabs)/index.tsx)

- 快速錄音入口
- 最近錄音展示
- 分類導航
- 個人資料快速訪問

### 2. 錄音功能模組 (app/recording/)

#### 2.1 錄音創建 (app/recording/new.tsx)

- 專業語音錄製界面
- 實時波形顯示
- 錄音計時器
- 暫停/繼續功能
- 高品質音訊設定

#### 2.2 錄音詳情 (app/recording/[id].tsx)

- 音訊播放控制
- 文字轉錄顯示和同步跟踪
- 轉錄文本編輯功能
- 說話者識別與區分
- 詳細元數據顯示

#### 2.3 錄音編輯 (app/recording/editor.tsx)

- 音訊剪輯與修剪
- 效果添加
- 混音功能
- 音量調整
- 格式轉換

#### 2.4 錄音分析 (app/recording/analysis/)

- 語音轉文字功能
- 情感分析
- 關鍵詞提取
- 說話者識別
- 音訊質量優化建議

### 3. 錄音管理模組 (app/(tabs)/recordings.tsx)

- 錄音文件管理
- 分類與標籤系統
- 搜索與過濾功能
- 批次處理操作
- 錄音分享功能

### 4. 設置模組 (app/(tabs)/settings.tsx)

- 用戶偏好設定
- 音訊質量設定
- 雲同步設定
- 通知管理
- 隱私與安全設定

## 音訊處理功能

Voice AI 使用 `expo-av` 套件處理音訊，主要包括：

- **錄音功能**：透過 `Audio.Recording` API 實現高品質錄音

  ```typescript
  // 初始化錄音對象
  const recording = new Audio.Recording();

  // 設置高品質錄音選項
  await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
  await recording.startAsync();
  ```

- **音訊播放**：使用 `Audio.Sound` API 實現精確控制

  ```typescript
  const sound = new Audio.Sound();
  await sound.loadAsync({ uri: soundFileUri });
  await sound.playAsync();
  ```

- **音訊編輯**：通過專用的編輯器組件實現剪輯、混音等功能

  ```typescript
  // 在編輯頁面中導入音訊文件
  const editorRef = useRef<AudioEditor>(null);
  editorRef.current?.importAudio(fileUri);

  // 執行剪輯操作
  editorRef.current?.trimAudio(startTime, endTime);
  ```

## 使用的主要套件

Voice AI 使用以下關鍵依賴套件：

- **expo**: v52.0.46 - React Native 應用開發工具
- **expo-av**: v15.0.2 - 音訊和視訊處理
- **expo-router**: v4.0.20 - 基於檔案系統的路由
- **react-native-reanimated**: v3.16.1 - 高性能動畫庫
- **@react-native-community/slider**: v4.5.6 - 滑動控制組件
- **expo-blur**: v14.0.3 - 模糊效果
- **expo-haptics**: v14.0.1 - 觸覺反饋
- **expo-linear-gradient**: v14.0.2 - 漸變效果

## 開發指南

### 環境設置

1. 確保已安裝 Node.js 16+ 和 npm 8+

2. 安裝 Expo CLI

   ```bash
   npm install -g expo-cli
   ```

3. 安裝專案依賴
   ```bash
   npm install
   ```

### 啟動開發環境

```bash
npx expo start
```

啟動後，你可以選擇以下方式運行應用：

- **開發版本**：使用 `npx expo run:ios` 或 `npx expo run:android` 創建開發版本
- **模擬器**：按 `i` 在 iOS 模擬器中運行，或按 `a` 在 Android 模擬器中運行
- **實機測試**：使用 Expo Go App 掃描 QR 碼在實際設備上測試

### 專案指令

- `npm start` - 啟動開發服務器
- `npm run ios` - 在 iOS 模擬器中運行應用
- `npm run android` - 在 Android 模擬器中運行應用
- `npm run test` - 運行測試套件
- `npm run lint` - 檢查代碼風格
- `npm run reset-project` - 重置專案（清除緩存）

## 部署說明

### 1. 生成生產版本

```bash
npx expo prebuild
```

### 2. 構建獨立安裝包

```bash
# For iOS
npx expo build:ios

# For Android
npx expo build:android
```

### 3. 發布更新

使用 EAS (Expo Application Services) 進行部署：

```bash
npx eas update
```

## 貢獻與支持

歡迎透過 Issue 和 Pull Request 貢獻代碼或提出建議。如有問題，請參考我們的說明文檔或聯繫開發團隊。

## 授權協議

本專案採用 MIT 授權協議。

## 參考資源

- [Expo 文檔](https://docs.expo.dev/)
- [React Native 文檔](https://reactnative.dev/)
- [expo-av 音訊文檔](https://docs.expo.dev/versions/latest/sdk/av/)
- [expo-router 路由文檔](https://expo.github.io/router/docs/)
