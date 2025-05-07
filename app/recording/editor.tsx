/**
 * 錄音編輯頁面
 *
 * 本頁面提供錄音內容的編輯功能，包括:
 * - 轉錄文本的編輯與修正
 * - 添加和管理標記點（重要、任務、疑問等）
 * - 錄音標籤管理
 * - 原始與編輯內容的切換顯示
 * - 變更保存與同步
 */

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
    title: "個案會談 - 獨居長者李先生",
    duration: "00:42:15",
    date: "2024-05-12",
    tags: ["長者照顧", "居家安全"],
    transcription: [
      {
        id: "1",
        speaker: "社工師",
        timestamp: "00:00:15",
        originalText: "李先生，今天我們來聊聊您最近的生活狀況，以及居家照護服務是否有幫助到您？",
        editedText: "李先生，今天我們來聊聊您最近的生活狀況，以及居家照護服務是否有幫助到您？",
        isEdited: false,
        isEditing: false,
      },
      {
        id: "2",
        speaker: "李先生",
        timestamp: "00:01:22",
        originalText: "最近還可以，就是行動不太方便，上下樓梯很困難。居家服務的阿姨每週來兩次，幫我做飯、打掃，人很好。",
        editedText: "最近還可以，就是行動不太方便，上下樓梯很困難。居家服務的阿姨每週來兩次，幫我做飯、打掃，人很好。",
        isEdited: false,
        isEditing: false,
      },
      {
        id: "3",
        speaker: "社工師",
        timestamp: "00:02:45",
        originalText: "了解。我們也可以評估是否需要申請輔具補助，像是扶手或助行器，這樣您在家中移動會更安全。",
        editedText: "了解。我們也可以評估是否需要申請輔具補助，像是扶手或助行器，這樣您在家中移動會更安全。",
        isEdited: false,
        isEditing: false,
      },
    ],
    markers: [
      {
        id: "m1",
        type: "important",
        timestamp: "00:01:22",
        text: "行動不便問題",
      },
      {
        id: "m2",
        type: "task",
        timestamp: "00:02:45",
        text: "申請輔具補助",
      },
    ],
  },
  "2": {
    id: "2",
    title: "家庭訪視 - 王氏家庭暴力跟進",
    duration: "01:05:23",
    date: "2024-05-10",
    tags: ["家暴案件", "兒少保護"],
    transcription: [
      {
        id: "1",
        speaker: "社工師",
        timestamp: "00:00:30",
        originalText: "王女士，自從上次法院核發保護令後，情況是否有改善？前夫還有騷擾您嗎？",
        editedText: "王女士，自從上次法院核發保護令後，情況是否有改善？前夫還有騷擾您嗎？",
        isEdited: false,
        isEditing: false,
      },
      {
        id: "2",
        speaker: "王女士",
        timestamp: "00:01:15",
        originalText: "他不敢再直接來家裡了，但有時候會在小孩放學路上遇到。孩子們晚上常做惡夢，特別是老大。",
        editedText: "他不敢再直接來家裡了，但有時候會在小孩放學路上遇到。孩子們晚上常做惡夢，特別是老大。",
        isEdited: false,
        isEditing: false,
      },
      {
        id: "3",
        speaker: "社工師",
        timestamp: "00:02:20",
        originalText: "孩子的反應很正常，我們可以安排心理師跟他們會談。經濟方面還有困難嗎？",
        editedText: "孩子的反應很正常，我們可以安排心理師跟他們會談。經濟方面還有困難嗎？",
        isEdited: false,
        isEditing: false,
      },
    ],
    markers: [
      {
        id: "m1",
        type: "important",
        timestamp: "00:01:15",
        text: "兒童創傷症狀",
      },
      {
        id: "m2",
        type: "task",
        timestamp: "00:02:20",
        text: "安排兒童心理諮商",
      },
    ],
  },
  "3": {
    id: "3",
    title: "團體工作 - 青少年情緒支持小組",
    duration: "00:58:30",
    date: "2024-05-08",
    tags: ["團體工作", "青少年"],
    transcription: [
      {
        id: "1",
        speaker: "帶領者",
        timestamp: "00:00:22",
        originalText: "今天是我們小組的第四次聚會，主題是「認識和管理憤怒情緒」，誰願意先分享上週練習的情況？",
        editedText: "今天是我們小組的第四次聚會，主題是「認識和管理憤怒情緒」，誰願意先分享上週練習的情況？",
        isEdited: false,
        isEditing: false,
      },
      {
        id: "2",
        speaker: "小明",
        timestamp: "00:01:30",
        originalText: "上週我在班上被其他同學嘲笑成績差，當下很想打人，但我用了深呼吸的方法，然後就離開教室冷靜一下。",
        editedText: "上週我在班上被其他同學嘲笑成績差，當下很想打人，但我用了深呼吸的方法，然後就離開教室冷靜一下。",
        isEdited: false,
        isEditing: false,
      },
      {
        id: "3",
        speaker: "帶領者",
        timestamp: "00:02:45",
        originalText: "小明做得很好！這正是我們上週學的技巧。大家還記得，憤怒本身不是問題，重要的是我們如何表達它。",
        editedText: "小明做得很好！這正是我們上週學的技巧。大家還記得，憤怒本身不是問題，重要的是我們如何表達它。",
        isEdited: false,
        isEditing: false,
      },
    ],
    markers: [
      {
        id: "m1",
        type: "important",
        timestamp: "00:01:30",
        text: "情緒管理技巧應用",
      },
      {
        id: "m2",
        type: "note",
        timestamp: "00:02:45",
        text: "肯定成員進步",
      },
    ],
  },
  "4": {
    id: "4",
    title: "社區評估 - 大安區長者需求調查",
    duration: "00:34:18",
    date: "2024-05-05",
    tags: ["社區工作", "需求評估"],
    transcription: [
      {
        id: "1",
        speaker: "社工師",
        timestamp: "00:00:10",
        originalText: "感謝各位社區居民參與今天的焦點團體，我們想了解大安區長者的需求，特別是關於活動場所和服務內容。",
        editedText: "感謝各位社區居民參與今天的焦點團體，我們想了解大安區長者的需求，特別是關於活動場所和服務內容。",
        isEdited: false,
        isEditing: false,
      },
      {
        id: "2",
        speaker: "居民甲",
        timestamp: "00:01:05",
        originalText: "活動中心離很多老人家太遠了，行動不便的長輩根本去不了。如果能有接送服務就好了。",
        editedText: "活動中心離很多老人家太遠了，行動不便的長輩根本去不了。如果能有接送服務就好了。",
        isEdited: false,
        isEditing: false,
      },
      {
        id: "3",
        speaker: "居民乙",
        timestamp: "00:02:10",
        originalText: "獨居老人最需要的是有人陪他們聊天、協助處理日常事務，像是繳費單、信件這些，很多長輩看不懂。",
        editedText: "獨居老人最需要的是有人陪他們聊天、協助處理日常事務，像是繳費單、信件這些，很多長輩看不懂。",
        isEdited: false,
        isEditing: false,
      },
    ],
    markers: [
      {
        id: "m1",
        type: "important",
        timestamp: "00:01:05",
        text: "交通可及性問題",
      },
      {
        id: "m2",
        type: "task",
        timestamp: "00:02:10",
        text: "規劃日常事務協助服務",
      },
    ],
  },
  "5": {
    id: "5",
    title: "個案研討會 - 多重障礙個案討論",
    duration: "01:28:42",
    date: "2024-05-03",
    tags: ["個案研討", "多重障礙"],
    transcription: [
      {
        id: "1",
        speaker: "報告社工",
        timestamp: "00:00:25",
        originalText: "今天要討論的個案是張先生，45歲，因車禍導致下肢癱瘓，同時有憂鬱症和焦慮症診斷。最近因房東漲租，出現自殺意念。",
        editedText: "今天要討論的個案是張先生，45歲，因車禍導致下肢癱瘓，同時有憂鬱症和焦慮症診斷。最近因房東漲租，出現自殺意念。",
        isEdited: false,
        isEditing: false,
      },
      {
        id: "2",
        speaker: "心理師",
        timestamp: "00:01:40",
        originalText: "建議先評估自殺風險等級，並建立24小時支持系統。藥物治療也需要重新評估，他的焦慮似乎控制得不好。",
        editedText: "建議先評估自殺風險等級，並建立24小時支持系統。藥物治療也需要重新評估，他的焦慮似乎控制得不好。",
        isEdited: false,
        isEditing: false,
      },
      {
        id: "3",
        speaker: "督導",
        timestamp: "00:02:55",
        originalText: "除了心理層面，實務上我們需要協助他申請租金補貼，並評估是否符合長照服務資格，減輕他的經濟和生活壓力。",
        editedText: "除了心理層面，實務上我們需要協助他申請租金補貼，並評估是否符合長照服務資格，減輕他的經濟和生活壓力。",
        isEdited: false,
        isEditing: false,
      },
    ],
    markers: [
      {
        id: "m1",
        type: "important",
        timestamp: "00:01:40",
        text: "自殺風險評估",
      },
      {
        id: "m2",
        type: "task",
        timestamp: "00:02:55",
        text: "申請租金補貼和長照服務",
      },
    ],
  },
  "6": {
    id: "6",
    title: "網絡會議 - 家暴防治中心協調",
    duration: "00:52:36",
    date: "2024-04-29",
    tags: ["網絡會議", "家暴防治"],
    transcription: [
      {
        id: "1",
        speaker: "協調員",
        timestamp: "00:00:18",
        originalText: "謝謝各位出席今日的跨網絡協調會議，今天主要討論三個高風險家暴案件的跨專業合作模式。",
        editedText: "謝謝各位出席今日的跨網絡協調會議，今天主要討論三個高風險家暴案件的跨專業合作模式。",
        isEdited: false,
        isEditing: false,
      },
      {
        id: "2",
        speaker: "警政代表",
        timestamp: "00:01:30",
        originalText: "關於林家案件，我們接獲了三次報案，但每次到場時，加害人都已離開。受害者也拒絕驗傷。",
        editedText: "關於林家案件，我們接獲了三次報案，但每次到場時，加害人都已離開。受害者也拒絕驗傷。",
        isEdited: false,
        isEditing: false,
      },
      {
        id: "3",
        speaker: "社工師",
        timestamp: "00:02:40",
        originalText: "我們與受害者保持每週聯繫，並已設計安全計畫，但她目前不願意聲請保護令。建議可安排社區巡邏加強注意。",
        editedText: "我們與受害者保持每週聯繫，並已設計安全計畫，但她目前不願意聲請保護令。建議可安排社區巡邏加強注意。",
        isEdited: false,
        isEditing: false,
      },
    ],
    markers: [
      {
        id: "m1",
        type: "important",
        timestamp: "00:01:30",
        text: "高風險家暴案件通報",
      },
      {
        id: "m2",
        type: "task",
        timestamp: "00:02:40",
        text: "安排社區巡邏資源",
      },
    ],
  },
  "7": {
    id: "7",
    title: "個案管理 - 陳小姐就業輔導追蹤",
    duration: "00:37:14",
    date: "2024-04-25",
    tags: ["就業輔導", "單親家庭"],
    transcription: [
      {
        id: "1",
        speaker: "社工師",
        timestamp: "00:00:12",
        originalText: "陳小姐，很高興看到您上次參加我們的就業培訓後有了進展。能跟我分享一下過去兩週的求職情況嗎？",
        editedText: "陳小姐，很高興看到您上次參加我們的就業培訓後有了進展。能跟我分享一下過去兩週的求職情況嗎？",
        isEdited: false,
        isEditing: false,
      },
      {
        id: "2",
        speaker: "陳小姐",
        timestamp: "00:01:05",
        originalText: "我去了兩場面試，一個是行政助理，另一個是門市人員。門市已經回覆錄取了，但是輪班時間和小孩放學時間衝突。",
        editedText: "我去了兩場面試，一個是行政助理，另一個是門市人員。門市已經回覆錄取了，但是輪班時間和小孩放學時間衝突。",
        isEdited: false,
        isEditing: false,
      },
      {
        id: "3",
        speaker: "社工師",
        timestamp: "00:02:18",
        originalText: "了解您的困難。我們可以討論課後照顧資源，或是協助您跟雇主商量固定班別的可能性。您比較傾向哪一種方式？",
        editedText: "了解您的困難。我們可以討論課後照顧資源，或是協助您跟雇主商量固定班別的可能性。您比較傾向哪一種方式？",
        isEdited: false,
        isEditing: false,
      },
    ],
    markers: [
      {
        id: "m1",
        type: "important",
        timestamp: "00:01:05",
        text: "托育與就業衝突",
      },
      {
        id: "m2",
        type: "task",
        timestamp: "00:02:18",
        text: "連結課後照顧資源",
      },
    ],
  },
  "8": {
    id: "8",
    title: "資源連結 - 弱勢家庭物資發放",
    duration: "00:45:53",
    date: "2024-04-22",
    tags: ["物資發放", "弱勢家庭"],
    transcription: [
      {
        id: "1",
        speaker: "社工師",
        timestamp: "00:00:20",
        originalText: "今天我們要確認下週食物銀行發放的流程和名單。目前登記的有45戶家庭，其中15戶需要額外的嬰幼兒用品。",
        editedText: "今天我們要確認下週食物銀行發放的流程和名單。目前登記的有45戶家庭，其中15戶需要額外的嬰幼兒用品。",
        isEdited: false,
        isEditing: false,
      },
      {
        id: "2",
        speaker: "志工組長",
        timestamp: "00:01:35",
        originalText: "企業捐贈的尿布已經清點完畢，有三種尺寸，應該足夠本次發放。但嬰兒奶粉數量不足，可能需要再尋找贊助。",
        editedText: "企業捐贈的尿布已經清點完畢，有三種尺寸，應該足夠本次發放。但嬰兒奶粉數量不足，可能需要再尋找贊助。",
        isEdited: false,
        isEditing: false,
      },
      {
        id: "3",
        speaker: "社工師",
        timestamp: "00:02:50",
        originalText: "好的，我會聯繫之前合作過的乳品公司。另外，這次我們需要特別注意疫情防控措施，建議分時段發放。",
        editedText: "好的，我會聯繫之前合作過的乳品公司。另外，這次我們需要特別注意疫情防控措施，建議分時段發放。",
        isEdited: false,
        isEditing: false,
      },
    ],
    markers: [
      {
        id: "m1",
        type: "note",
        timestamp: "00:01:35",
        text: "嬰兒奶粉不足",
      },
      {
        id: "m2",
        type: "task",
        timestamp: "00:02:50",
        text: "聯繫乳品公司贊助",
      },
    ],
  },
  "9": {
    id: "9",
    title: "社工督導 - 精神疾病個案處遇討論",
    duration: "00:48:27",
    date: "2024-04-18",
    tags: ["社工督導", "精神疾病"],
    transcription: [
      {
        id: "1",
        speaker: "邱社工",
        timestamp: "00:00:22",
        originalText: "我負責的是一位思覺失調症個案，他拒絕任何形式的服務介入，三次家訪都拒絕開門，我感到很無力。",
        editedText: "我負責的是一位思覺失調症個案，他拒絕任何形式的服務介入，三次家訪都拒絕開門，我感到很無力。",
        isEdited: false,
        isEditing: false,
      },
      {
        id: "2",
        speaker: "督導",
        timestamp: "00:01:30",
        originalText: "這類個案確實具有挑戰性。你提到他有一位願意合作的姊姊，我們可以透過她建立關係。試著了解個案平時的興趣。",
        editedText: "這類個案確實具有挑戰性。你提到他有一位願意合作的姊姊，我們可以透過她建立關係。試著了解個案平時的興趣。",
        isEdited: false,
        isEditing: false,
      },
      {
        id: "3",
        speaker: "邱社工",
        timestamp: "00:03:10",
        originalText: "我會嘗試這個方向。但有時我會擔心，如果他狀況惡化，又不願意就醫怎麼辦？我常感到很焦慮。",
        editedText: "我會嘗試這個方向。但有時我會擔心，如果他狀況惡化，又不願意就醫怎麼辦？我常感到很焦慮。",
        isEdited: false,
        isEditing: false,
      },
      {
        id: "4",
        speaker: "督導",
        timestamp: "00:04:20",
        originalText: "我理解你的感受，這是社工常見的專業耗竭現象。但重要的是認識到有些事不在我們控制範圍內。下週我們可以在團體督導中討論類似困境。",
        editedText: "我理解你的感受，這是社工常見的專業耗竭現象。但重要的是認識到有些事不在我們控制範圍內。下週我們可以在團體督導中討論類似困境。",
        isEdited: false,
        isEditing: false,
      },
    ],
    markers: [
      {
        id: "m1",
        type: "important",
        timestamp: "00:01:30",
        text: "透過關鍵人物建立關係",
      },
      {
        id: "m2",
        type: "note",
        timestamp: "00:04:20",
        text: "專業耗竭議題討論",
      },
    ],
  },
  "10": {
    id: "10",
    title: "家庭評估 - 收養前家庭訪視",
    duration: "01:15:06",
    date: "2024-04-15",
    tags: ["收養評估", "家庭訪視"],
    transcription: [
      {
        id: "1",
        speaker: "社工師",
        timestamp: "00:00:28",
        originalText: "今天這次家訪的目的是了解你們收養孩子的準備情況。能否先分享一下，是什麼原因讓你們決定走上收養之路？",
        editedText: "今天這次家訪的目的是了解你們收養孩子的準備情況。能否先分享一下，是什麼原因讓你們決定走上收養之路？",
        isEdited: false,
        isEditing: false,
      },
      {
        id: "2",
        speaker: "王先生",
        timestamp: "00:01:15",
        originalText: "我們結婚七年了，經過多次人工受孕都失敗後，開始考慮收養。去年參加了收養準備課程，也和其他收養家庭有交流。",
        editedText: "我們結婚七年了，經過多次人工受孕都失敗後，開始考慮收養。去年參加了收養準備課程，也和其他收養家庭有交流。",
        isEdited: false,
        isEditing: false,
      },
      {
        id: "3",
        speaker: "社工師",
        timestamp: "00:02:40",
        originalText: "謝謝分享。關於收養身分認同和生父母的議題，你們有什麼想法？這些通常是收養家庭會面臨的重要課題。",
        editedText: "謝謝分享。關於收養身分認同和生父母的議題，你們有什麼想法？這些通常是收養家庭會面臨的重要課題。",
        isEdited: false,
        isEditing: false,
      },
      {
        id: "4",
        speaker: "王太太",
        timestamp: "00:03:30",
        originalText: "我們計劃從小就誠實告知孩子收養事實，使用適合年齡的方式說明。如果孩子長大後想了解生父母，我們也會支持。",
        editedText: "我們計劃從小就誠實告知孩子收養事實，使用適合年齡的方式說明。如果孩子長大後想了解生父母，我們也會支持。",
        isEdited: false,
        isEditing: false,
      },
    ],
    markers: [
      {
        id: "m1",
        type: "important",
        timestamp: "00:02:40",
        text: "收養身分認同議題",
      },
      {
        id: "m2",
        type: "note",
        timestamp: "00:03:30",
        text: "開放式收養態度",
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
    setTranscription(prev => prev.map(item => (item.id === id ? { ...item, editedText: newText, isEditing: false, isEdited: newText !== item.originalText } : item)));
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
                style={[styles.transcriptItem, { borderLeftColor: speakerColors[item.speaker] || "#8E8E93" }, !showOriginal && item.isEdited && styles.editedTranscriptItem]}
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
