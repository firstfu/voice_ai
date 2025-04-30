import { useState } from "react";

export interface AnalysisResult {
  id: string;
  recordingId: string;
  summary: string;
  keywords: string[];
  topics: { name: string; confidence: number }[];
  sentiment: {
    overall: number;
    segments: { startTime: number; endTime: number; score: number }[];
  };
  entities: { text: string; type: string; startIndex: number; endIndex: number }[];
  questions: { question: string; answer: string }[];
}

// 模擬的分析結果數據
const mockAnalysisResults: Record<string, AnalysisResult> = {
  "1": {
    id: "1",
    recordingId: "1",
    summary:
      "會議中討論了專案的進度和下一步計劃。主要包括設計階段已完成，核心功能需要優先實現，以及測試計劃的安排。團隊成員就開發時間表達成共識，並計劃下週再次會面討論測試計劃的細節。整體會議氛圍積極，團隊合作良好。",
    keywords: ["專案進度", "設計階段", "核心功能", "開發時間表", "測試計劃", "用戶體驗測試", "內部測試", "外部測試"],
    topics: [
      { name: "專案管理", confidence: 0.85 },
      { name: "軟體開發", confidence: 0.78 },
      { name: "測試策略", confidence: 0.65 },
      { name: "時間規劃", confidence: 0.52 },
    ],
    sentiment: {
      overall: 0.72, // 正面情緒
      segments: [
        { startTime: 15, endTime: 45, score: 0.65 },
        { startTime: 82, endTime: 165, score: 0.78 },
        { startTime: 165, endTime: 210, score: 0.75 },
        { startTime: 210, endTime: 255, score: 0.68 },
        { startTime: 255, endTime: 343, score: 0.72 },
      ],
    },
    entities: [
      { text: "設計階段", type: "階段", startIndex: 42, endIndex: 46 },
      { text: "核心功能", type: "功能", startIndex: 82, endIndex: 86 },
      { text: "下個月底", type: "時間", startIndex: 148, endIndex: 152 },
      { text: "用戶體驗測試", type: "測試類型", startIndex: 210, endIndex: 216 },
      { text: "內部測試", type: "測試類型", startIndex: 270, endIndex: 274 },
      { text: "外部用戶測試", type: "測試類型", startIndex: 275, endIndex: 281 },
    ],
    questions: [
      {
        question: "會議的主要目的是什麼？",
        answer: "討論專案進度和下一步計劃。",
      },
      {
        question: "目前專案進行到哪個階段？",
        answer: "設計階段已經完成，準備開始核心功能開發。",
      },
      {
        question: "團隊計劃如何進行測試？",
        answer: "分為內部測試和外部用戶測試兩個階段，內部測試在功能模塊完成後立即進行。",
      },
      {
        question: "專案開發的時間表是什麼？",
        answer: "計劃在下個月底前完成主要功能的開發。",
      },
      {
        question: "下一步的會議安排是什麼？",
        answer: "安排下週再開一次會議，具體討論測試計劃的細節。",
      },
    ],
  },
  "2": {
    id: "2",
    recordingId: "2",
    summary: "這是一場關於人工智能在現代醫療應用的講座。教授介紹了人工智能技術如何在醫學診斷、藥物研發和醫療管理等領域廣泛應用，為醫療行業帶來革命性的變化。",
    keywords: ["人工智能", "現代醫療", "醫學診斷", "藥物研發", "醫療管理"],
    topics: [
      { name: "人工智能", confidence: 0.92 },
      { name: "醫療科技", confidence: 0.86 },
      { name: "科技應用", confidence: 0.75 },
    ],
    sentiment: {
      overall: 0.65,
      segments: [{ startTime: 30, endTime: 130, score: 0.62 }],
    },
    entities: [
      { text: "人工智能", type: "技術", startIndex: 12, endIndex: 16 },
      { text: "現代醫療", type: "領域", startIndex: 17, endIndex: 21 },
      { text: "醫學診斷", type: "應用", startIndex: 36, endIndex: 40 },
      { text: "藥物研發", type: "應用", startIndex: 41, endIndex: 45 },
      { text: "醫療管理", type: "應用", startIndex: 46, endIndex: 50 },
    ],
    questions: [
      {
        question: "講座的主題是什麼？",
        answer: "人工智能在現代醫療中的應用。",
      },
      {
        question: "人工智能在醫療領域的哪些方面有應用？",
        answer: "醫學診斷、藥物研發和醫療管理等領域。",
      },
    ],
  },
  "3": {
    id: "3",
    recordingId: "3",
    summary: "這是一場行業訪談，受訪者分享了他在行業內超過15年的經驗和觀察到的主要趨勢。訪談內容涵蓋了行業發展歷程、技術變革及未來展望。",
    keywords: ["行業經驗", "趨勢分析", "技術變革", "15年經驗", "行業發展"],
    topics: [
      { name: "行業發展", confidence: 0.88 },
      { name: "經驗分享", confidence: 0.82 },
      { name: "趨勢分析", confidence: 0.75 },
    ],
    sentiment: {
      overall: 0.68,
      segments: [{ startTime: 22, endTime: 75, score: 0.68 }],
    },
    entities: [
      { text: "行業", type: "領域", startIndex: 25, endIndex: 27 },
      { text: "15年", type: "時間", startIndex: 56, endIndex: 60 },
      { text: "重大變革", type: "事件", startIndex: 70, endIndex: 74 },
    ],
    questions: [
      {
        question: "受訪者有多少年的行業經驗？",
        answer: "超過15年的行業經驗。",
      },
      {
        question: "訪談的主要主題是什麼？",
        answer: "行業內的經驗和觀察到的主要趨勢。",
      },
    ],
  },
  "4": {
    id: "4",
    recordingId: "4",
    summary: "這是一份個人筆記，主要記錄了下週項目提案需要完成的內容，以及提醒自己聯繫設計團隊確認最新的視覺設計方案。",
    keywords: ["項目提案", "下週任務", "設計團隊", "視覺設計", "任務清單"],
    topics: [
      { name: "工作規劃", confidence: 0.91 },
      { name: "項目管理", confidence: 0.78 },
      { name: "設計協作", confidence: 0.62 },
    ],
    sentiment: {
      overall: 0.55, // 中性
      segments: [{ startTime: 10, endTime: 105, score: 0.55 }],
    },
    entities: [
      { text: "下週", type: "時間", startIndex: 15, endIndex: 17 },
      { text: "項目提案", type: "文件", startIndex: 18, endIndex: 22 },
      { text: "設計團隊", type: "團隊", startIndex: 50, endIndex: 54 },
      { text: "視覺設計方案", type: "文件", startIndex: 58, endIndex: 64 },
    ],
    questions: [
      {
        question: "什麼時候需要完成項目提案？",
        answer: "下週需要完成項目提案。",
      },
      {
        question: "需要聯繫誰確認設計方案？",
        answer: "需要聯繫設計團隊確認最新的視覺設計方案。",
      },
    ],
  },
};

interface UseAnalysisServiceProps {
  autoGenerate?: boolean;
}

/**
 * 自定義 Hook 用於處理錄音分析服務
 */
export function useAnalysisService({ autoGenerate = false }: UseAnalysisServiceProps = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 獲取錄音的分析結果
   * @param recordingId 錄音ID
   * @returns 分析結果或 null
   */
  const getAnalysisResult = async (recordingId: string): Promise<AnalysisResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // 目前使用模擬數據，實際應用中將調用 AI 服務 API
      await new Promise(resolve => setTimeout(resolve, 500)); // 模擬 API 延遲

      const result = mockAnalysisResults[recordingId];

      if (!result) {
        throw new Error("找不到該錄音的分析結果");
      }

      setIsLoading(false);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "分析過程中發生錯誤";
      setError(errorMessage);
      setIsLoading(false);
      return null;
    }
  };

  /**
   * 生成錄音的分析結果
   * @param recordingId 錄音ID
   * @param transcription 轉錄文本
   * @returns 分析結果或 null
   */
  const generateAnalysis = async (
    recordingId: string,
    transcription: { speaker: string; text: string; timestamp: string }[]
  ): Promise<AnalysisResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // 在實際應用中，這裡會調用 OpenAI API 或其他 AI 服務來生成分析
      // 目前使用模擬數據
      await new Promise(resolve => setTimeout(resolve, 2000)); // 模擬 AI 處理時間

      // 檢查是否已有分析結果
      const existingResult = mockAnalysisResults[recordingId];

      if (existingResult) {
        setIsLoading(false);
        return existingResult;
      }

      // 如果沒有現有結果，創建一個新的模擬結果
      // 這裡只是一個示例，實際應用中應該用真實 AI 服務生成
      const newResult: AnalysisResult = {
        id: `generated_${recordingId}`,
        recordingId,
        summary: "這是一個自動生成的摘要，基於錄音轉錄內容。實際應用中將使用 AI 模型生成更精確的摘要。",
        keywords: ["關鍵詞1", "關鍵詞2", "關鍵詞3"],
        topics: [
          { name: "主題1", confidence: 0.8 },
          { name: "主題2", confidence: 0.5 },
        ],
        sentiment: {
          overall: 0.6,
          segments: [{ startTime: 0, endTime: 60, score: 0.6 }],
        },
        entities: [
          { text: "實體1", type: "類型1", startIndex: 0, endIndex: 3 },
          { text: "實體2", type: "類型2", startIndex: 10, endIndex: 13 },
        ],
        questions: [
          { question: "自動生成的問題1？", answer: "自動生成的回答1。" },
          { question: "自動生成的問題2？", answer: "自動生成的回答2。" },
        ],
      };

      setIsLoading(false);
      return newResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "生成分析時發生錯誤";
      setError(errorMessage);
      setIsLoading(false);
      return null;
    }
  };

  /**
   * 重新生成分析結果
   * @param recordingId 錄音ID
   * @param transcription 轉錄文本
   * @returns 分析結果或 null
   */
  const refreshAnalysis = async (
    recordingId: string,
    transcription: { speaker: string; text: string; timestamp: string }[]
  ): Promise<AnalysisResult | null> => {
    return generateAnalysis(recordingId, transcription);
  };

  return {
    isLoading,
    error,
    getAnalysisResult,
    generateAnalysis,
    refreshAnalysis,
  };
}

export default useAnalysisService;
