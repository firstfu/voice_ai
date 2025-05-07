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
      "本次會談中，社工師與獨居長者李先生討論了其日常生活情況和所需支持。李先生表示行動不便，特別是上下樓梯困難，且家中廁所進出有安全隱憂。社工師建議申請輔具補助以改善居家安全，並提議連結社區關懷據點增加社交機會，改善李先生因子女長期在國外造成的孤獨感。會談展現了社工師針對老人照顧的多面向評估及服務規劃能力。",
    keywords: ["獨居長者", "行動不便", "輔具補助", "居家安全", "社區關懷據點", "社交孤立", "家庭支持", "長者照顧"],
    topics: [
      { name: "長者照顧服務", confidence: 0.92 },
      { name: "社區資源連結", confidence: 0.85 },
      { name: "居家安全評估", confidence: 0.76 },
      { name: "家庭關係", confidence: 0.62 },
    ],
    sentiment: {
      overall: 0.62, // 中偏正面
      segments: [
        { startTime: 15, endTime: 82, score: 0.55 },
        { startTime: 82, endTime: 165, score: 0.58 },
        { startTime: 165, endTime: 255, score: 0.65 },
        { startTime: 255, endTime: 343, score: 0.7 },
      ],
    },
    entities: [
      { text: "李先生", type: "個案", startIndex: 12, endIndex: 15 },
      { text: "行動不便", type: "需求", startIndex: 42, endIndex: 46 },
      { text: "扶手", type: "輔具", startIndex: 82, endIndex: 84 },
      { text: "廁所", type: "場所", startIndex: 148, endIndex: 150 },
      { text: "社區關懷據點", type: "資源", startIndex: 210, endIndex: 216 },
      { text: "子女長期在國外", type: "家庭狀況", startIndex: 275, endIndex: 282 },
    ],
    questions: [
      {
        question: "李先生的主要生活困境是什麼？",
        answer: "行動不便，特別是上下樓梯困難和廁所進出有安全隱憂。",
      },
      {
        question: "社工師提出了哪些解決方案？",
        answer: "建議申請輔具補助（如扶手或助行器）以改善居家安全，並連結社區關懷據點增加社交機會。",
      },
      {
        question: "李先生的家庭支持狀況如何？",
        answer: "子女長期在國外，很少聯絡，造成社會支持不足和孤獨感。",
      },
      {
        question: "李先生對社區活動參與的態度如何？",
        answer: "他表示平常不太出門，但若有人陪同，願意參與社區活動認識新朋友。",
      },
      {
        question: "此案例適合連結哪些社會福利資源？",
        answer: "輔具補助、居家照護服務、社區關懷據點、獨居長者關懷訪視等。",
      },
    ],
  },
  "2": {
    id: "2",
    recordingId: "2",
    summary:
      "本次家庭訪視中，社工師跟進王女士的家庭暴力保護案件。自法院核發保護令後，前夫已停止騷擾，但孩子們仍出現適應問題，特別是老大有夜間惡夢症狀。王女士面臨經濟壓力，難以支付房租和撫養兩個孩子。社工師建議為孩子安排心理師會談，並規劃協助申請急難救助、租金補貼及就業服務，為家庭提供全面支持。",
    keywords: ["家庭暴力", "保護令", "兒童創傷", "經濟壓力", "單親家庭", "心理諮商", "急難救助", "租金補貼"],
    topics: [
      { name: "家庭暴力防治", confidence: 0.94 },
      { name: "兒童福利服務", confidence: 0.88 },
      { name: "經濟安全評估", confidence: 0.82 },
      { name: "單親家庭支持", confidence: 0.79 },
    ],
    sentiment: {
      overall: 0.42, // 中偏負面，反映困境
      segments: [
        { startTime: 30, endTime: 130, score: 0.35 },
        { startTime: 130, endTime: 230, score: 0.4 },
        { startTime: 230, endTime: 330, score: 0.51 },
      ],
    },
    entities: [
      { text: "王女士", type: "個案", startIndex: 25, endIndex: 28 },
      { text: "保護令", type: "法律文件", startIndex: 56, endIndex: 59 },
      { text: "惡夢", type: "症狀", startIndex: 70, endIndex: 72 },
      { text: "房租", type: "經濟需求", startIndex: 90, endIndex: 92 },
      { text: "心理師", type: "專業人員", startIndex: 120, endIndex: 123 },
      { text: "急難救助", type: "福利資源", startIndex: 145, endIndex: 149 },
      { text: "就業服務", type: "福利資源", startIndex: 158, endIndex: 162 },
    ],
    questions: [
      {
        question: "王女士的家庭暴力案件目前狀況如何？",
        answer: "法院已核發保護令，前夫已不再騷擾，但家庭仍處於創傷復原階段。",
      },
      {
        question: "孩子們出現了哪些適應問題？",
        answer: "特別是老大有夜間惡夢等創傷後症狀，顯示需要心理支持。",
      },
      {
        question: "王女士面臨哪些主要困境？",
        answer: "經濟壓力大，獨自扶養兩個孩子，並面臨房租支付困難。",
      },
      {
        question: "社工師提出的服務計畫包含哪些面向？",
        answer: "心理支持（安排心理師會談）、經濟支持（急難救助和租金補貼）以及就業協助。",
      },
      {
        question: "這個案例中應運用哪些社福資源？",
        answer: "家暴被害人補助、急難救助金、租金補貼、就業輔導服務、兒童心理諮商等。",
      },
    ],
  },
  "3": {
    id: "3",
    recordingId: "3",
    summary:
      "這場青少年情緒支持小組的第四次聚會聚焦於憤怒情緒管理。小組成員分享了引發憤怒的情境，包括校園嘲笑和家庭隱私問題。透過討論，帶領者協助成員辨識不同情緒調節策略的效果，肯定小明成功運用所學的深呼吸技巧避免衝突，並引導小華思考對母親摔門行為的替代方案。此團體工作展現了有效的情緒教育和行為改變策略。",
    keywords: ["青少年輔導", "情緒管理", "憤怒調節", "團體工作", "深呼吸技巧", "親子衝突", "校園霸凌", "因應策略"],
    topics: [
      { name: "青少年輔導", confidence: 0.92 },
      { name: "情緒教育", confidence: 0.89 },
      { name: "家庭關係", confidence: 0.75 },
      { name: "校園適應", confidence: 0.68 },
    ],
    sentiment: {
      overall: 0.6, // 中性偏正面
      segments: [
        { startTime: 22, endTime: 75, score: 0.45 },
        { startTime: 75, endTime: 140, score: 0.58 },
        { startTime: 140, endTime: 210, score: 0.72 },
      ],
    },
    entities: [
      { text: "青少年情緒支持小組", type: "服務類型", startIndex: 2, endIndex: 10 },
      { text: "憤怒情緒", type: "議題", startIndex: 22, endIndex: 26 },
      { text: "小明", type: "個案", startIndex: 56, endIndex: 58 },
      { text: "深呼吸", type: "技巧", startIndex: 90, endIndex: 93 },
      { text: "小華", type: "個案", startIndex: 107, endIndex: 109 },
      { text: "摔門", type: "行為", startIndex: 126, endIndex: 128 },
      { text: "親子隱私", type: "議題", startIndex: 158, endIndex: 162 },
    ],
    questions: [
      {
        question: "這次小組的主要主題是什麼？",
        answer: "「認識和管理憤怒情緒」，幫助青少年學習處理憤怒的技巧。",
      },
      {
        question: "小明面臨的情境和他的因應方式是什麼？",
        answer: "被班上同學嘲笑成績差，當下想打人但使用深呼吸技巧並離開教室，成功避免衝突。",
      },
      {
        question: "小華與母親之間的衝突源於什麼？",
        answer: "母親翻看她的東西，侵犯隱私，小華以摔門和大吵大鬧回應。",
      },
      {
        question: "帶領者如何運用成員的分享進行教學？",
        answer: "肯定小明運用學過的情緒調節技巧，並以此為例引導小華思考替代性的情緒表達方式。",
      },
      {
        question: "團體工作中展現了哪些專業輔導策略？",
        answer: "同儕學習、正向示範、技巧練習與回饋、解決問題思考引導等。",
      },
    ],
  },
  "4": {
    id: "4",
    recordingId: "4",
    summary:
      "此次大安區社區需求評估訪談中，社工師針對老人服務進行調查。居民反映活動中心地點不便，行動不便長者難以到達，建議設立接送服務。此外，居民指出獨居長者最需要的是陪伴聊天和日常事務協助，如繳費單處理和信件閱讀等。社工師表示正在規劃「社區關懷志工」計畫以回應這些需求，展現社區工作中的需求評估與資源規劃過程。",
    keywords: ["社區評估", "老人服務", "獨居長者", "接送服務", "社區關懷志工", "日常事務協助", "社區資源", "可近性"],
    topics: [
      { name: "社區工作", confidence: 0.94 },
      { name: "老人服務", confidence: 0.91 },
      { name: "志工資源", confidence: 0.82 },
      { name: "服務設計", confidence: 0.75 },
    ],
    sentiment: {
      overall: 0.58, // 中性
      segments: [
        { startTime: 10, endTime: 105, score: 0.5 },
        { startTime: 105, endTime: 175, score: 0.6 },
        { startTime: 175, endTime: 250, score: 0.65 },
      ],
    },
    entities: [
      { text: "大安區", type: "地點", startIndex: 15, endIndex: 18 },
      { text: "老人服務", type: "服務類型", startIndex: 25, endIndex: 29 },
      { text: "活動中心", type: "設施", startIndex: 50, endIndex: 54 },
      { text: "接送服務", type: "服務需求", startIndex: 70, endIndex: 74 },
      { text: "獨居老人", type: "對象", startIndex: 120, endIndex: 124 },
      { text: "繳費單", type: "需求", startIndex: 140, endIndex: 143 },
      { text: "社區關懷志工", type: "方案", startIndex: 180, endIndex: 186 },
    ],
    questions: [
      {
        question: "此次社區評估的主要目標族群是誰？",
        answer: "大安區的長者，特別是獨居和行動不便的老人。",
      },
      {
        question: "社區居民對現有老人服務提出了哪些主要問題？",
        answer: "活動中心位置太遠，行動不便長者無法到達；缺乏陪伴和日常事務協助服務。",
      },
      {
        question: "獨居長者最需要哪類型的服務？",
        answer: "陪伴聊天和協助處理日常事務，如繳費單、閱讀信件等。",
      },
      {
        question: "社工師提出的服務規劃方向是什麼？",
        answer: "規劃「社區關懷志工」計畫，招募志工提供陪伴和日常事務協助服務。",
      },
      {
        question: "從社區工作角度，此評估反映了哪些服務設計原則？",
        answer: "服務可近性、回應實際需求、善用社區資源（志工）、強化非正式支持網絡。",
      },
    ],
  },
  "5": {
    id: "5",
    recordingId: "5",
    summary:
      "本次個案研討會討論了張先生的多重障礙案例，他因車禍導致下肢癱瘓並患有憂鬱症和焦慮症。近期因房東漲租出現自殺意念。團隊成員從多專業角度提出服務建議，包括心理師建議評估自殺風險等級並建立24小時支持系統；督導則強調實務層面的介入，如協助申請租金補貼和評估長照服務資格。此研討會展現了處理複雜個案的跨專業合作模式和整體評估視角。",
    keywords: ["多重障礙", "自殺風險", "24小時支持系統", "租金補貼", "長照服務", "跨專業合作", "心理支持", "危機介入"],
    topics: [
      { name: "身心障礙服務", confidence: 0.9 },
      { name: "自殺防治", confidence: 0.85 },
      { name: "住宅議題", confidence: 0.75 },
      { name: "跨專業合作", confidence: 0.95 },
    ],
    sentiment: {
      overall: 0.4, // 偏向負面，但提供解決方案
      segments: [
        { startTime: 25, endTime: 100, score: 0.3 },
        { startTime: 100, endTime: 200, score: 0.4 },
        { startTime: 200, endTime: 300, score: 0.5 },
      ],
    },
    entities: [
      { text: "張先生", type: "個案", startIndex: 15, endIndex: 18 },
      { text: "下肢癱瘓", type: "身體狀況", startIndex: 45, endIndex: 49 },
      { text: "憂鬱症", type: "精神狀況", startIndex: 52, endIndex: 55 },
      { text: "焦慮症", type: "精神狀況", startIndex: 56, endIndex: 59 },
      { text: "自殺意念", type: "危機", startIndex: 80, endIndex: 84 },
      { text: "自殺風險等級", type: "評估項目", startIndex: 100, endIndex: 106 },
      { text: "租金補貼", type: "資源", startIndex: 150, endIndex: 154 },
      { text: "長照服務", type: "資源", startIndex: 160, endIndex: 164 },
    ],
    questions: [
      {
        question: "張先生面臨哪些複雜問題？",
        answer: "身體障礙（下肢癱瘓）、精神疾病（憂鬱症和焦慮症）、經濟困難（房東漲租）、社會支持不足（獨居，家人很少探望）以及自殺風險。",
      },
      {
        question: "心理師提出的介入重點是什麼？",
        answer: "評估自殺風險等級，建立24小時支持系統，並重新評估藥物治療以處理焦慮問題。",
      },
      {
        question: "督導從哪些實務層面提出建議？",
        answer: "協助申請租金補貼，尋找更適合的居住環境，以及評估是否符合長照服務資格。",
      },
      {
        question: "此案例反映了哪些社會工作實務原則？",
        answer: "個案的整體評估、跨專業合作、危機介入、資源連結以及實務與心理支持的整合。",
      },
      {
        question: "對於類似的多重障礙個案，社工需要連結哪些資源？",
        answer: "心理衛生資源、自殺防治資源、住宅補貼資源、長期照顧資源和輔具資源等。",
      },
    ],
  },
  "9": {
    id: "9",
    recordingId: "9",
    summary:
      "本次督導會議聚焦於邱社工處理拒絕接受服務的精神疾病個案的困境。個案有思覺失調症但拒絕就醫，獨居且有幻聽，三次家訪均拒絕開門。督導提出運用關鍵人物（如姊姊）協助建立關係，及結合衛生所護理師和社區志工建立多重支持網絡。討論也觸及社工專業耗竭議題，督導強調接受專業限制的重要性，並建議團體督導討論此類困境。會議展現了督導支持與專業成長的價值。",
    keywords: ["社工督導", "精神疾病", "拒絕服務", "專業耗竭", "關鍵人物", "多重支持網絡", "思覺失調症", "專業界限"],
    topics: [
      { name: "專業督導", confidence: 0.95 },
      { name: "精神衛生服務", confidence: 0.88 },
      { name: "專業耗竭預防", confidence: 0.82 },
      { name: "服務拒絕處理", confidence: 0.92 },
    ],
    sentiment: {
      overall: 0.55, // 中性，有困境但也有支持
      segments: [
        { startTime: 22, endTime: 120, score: 0.45 },
        { startTime: 120, endTime: 300, score: 0.52 },
        { startTime: 300, endTime: 430, score: 0.68 },
      ],
    },
    entities: [
      { text: "邱社工", type: "專業人員", startIndex: 15, endIndex: 18 },
      { text: "思覺失調症", type: "診斷", startIndex: 45, endIndex: 50 },
      { text: "幻聽", type: "症狀", startIndex: 58, endIndex: 60 },
      { text: "拒絕開門", type: "行為", startIndex: 70, endIndex: 74 },
      { text: "姊姊", type: "關鍵人物", startIndex: 100, endIndex: 102 },
      { text: "衛生所護理師", type: "資源", startIndex: 140, endIndex: 146 },
      { text: "專業耗竭", type: "議題", startIndex: 180, endIndex: 184 },
      { text: "團體督導", type: "服務", startIndex: 210, endIndex: 214 },
    ],
    questions: [
      {
        question: "邱社工處理的個案有哪些主要困難？",
        answer: "個案有思覺失調症但拒絕就醫，獨居且有幻聽，拒絕開門接受家訪服務。",
      },
      {
        question: "督導提出了哪些服務策略建議？",
        answer: "運用關鍵人物（姊姊）協助建立關係，結合衛生所護理師和社區關懷據點志工建立多重支持網絡。",
      },
      {
        question: "邱社工在個案工作中經歷的情緒狀態是什麼？",
        answer: "感到無力感和困擾，擔心個案狀況惡化卻無法強制介入。",
      },
      {
        question: "督導針對社工情緒提供了什麼支持？",
        answer: "肯定社工情緒屬於常見的專業耗竭現象，建議接受有些事不在控制範圍內，並善用團隊資源。",
      },
      {
        question: "此次督導會議對社工專業發展的意義為何？",
        answer: "提供了個案處遇的具體策略、情緒支持，並安排團體督導進一步討論類似困境，促進專業反思和成長。",
      },
    ],
  },
  "10": {
    id: "10",
    recordingId: "10",
    summary:
      "本次收養前家庭評估訪視中，社工師評估夫妻對收養的準備度。夫妻分享七年的結婚經歷，經多次人工受孕失敗後轉向收養。他們已參加收養準備課程並與其他收養家庭交流。訪談重點包括對收養身分認同和生理父母議題的準備，夫妻表示願意從小告知收養事實並支持孩子了解生父母資訊。他們也認識到收養兒童可能的特殊需求，願意尋求專業協助。社工師肯定其充分準備，顯示此為詳細且專業的收養評估過程。",
    keywords: ["收養評估", "家庭訪視", "收養準備度", "收養身分認同", "生理父母", "收養揭露", "特殊需求", "支持系統"],
    topics: [
      { name: "收養服務", confidence: 0.98 },
      { name: "家庭評估", confidence: 0.92 },
      { name: "兒童福利", confidence: 0.85 },
      { name: "親職準備", confidence: 0.88 },
    ],
    sentiment: {
      overall: 0.75, // 正面
      segments: [
        { startTime: 28, endTime: 120, score: 0.7 },
        { startTime: 120, endTime: 310, score: 0.75 },
        { startTime: 310, endTime: 430, score: 0.8 },
      ],
    },
    entities: [
      { text: "收養前家庭評估", type: "服務類型", startIndex: 2, endIndex: 9 },
      { text: "七年", type: "時間", startIndex: 56, endIndex: 58 },
      { text: "人工受孕", type: "嘗試", startIndex: 65, endIndex: 69 },
      { text: "收養準備課程", type: "資源", startIndex: 90, endIndex: 96 },
      { text: "收養身分認同", type: "議題", startIndex: 120, endIndex: 126 },
      { text: "生父母", type: "議題", startIndex: 150, endIndex: 153 },
      { text: "特殊需求", type: "議題", startIndex: 190, endIndex: 194 },
      { text: "心理諮商", type: "資源", startIndex: 210, endIndex: 214 },
    ],
    questions: [
      {
        question: "這對夫妻為何選擇收養方式組成家庭？",
        answer: "結婚七年，經過多次人工受孕失敗後，決定透過收養來實現組成家庭的願望。",
      },
      {
        question: "他們在收養前做了哪些準備？",
        answer: "參加收養準備課程，與其他收養家庭交流，閱讀相關書籍，了解收養流程和可能面臨的挑戰。",
      },
      {
        question: "對於收養身分議題，他們有什麼規劃？",
        answer: "計劃從小就以適合年齡的方式誠實告知孩子收養事實，並願意在適當時機支持孩子了解生父母資訊。",
      },
      {
        question: "他們對收養孩子可能面臨的挑戰有什麼認知？",
        answer: "認識到收養孩子可能有特殊需求或情緒行為挑戰，願意尋求專業協助如心理諮商或加入支持團體。",
      },
      {
        question: "社工師在收養評估中重視哪些關鍵因素？",
        answer: "收養動機與準備度、對收養身分認同議題的準備、對特殊需求的認識與因應策略、家庭支持系統和教養理念等。",
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
  const generateAnalysis = async (recordingId: string, transcription: { speaker: string; text: string; timestamp: string }[]): Promise<AnalysisResult | null> => {
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
  const refreshAnalysis = async (recordingId: string, transcription: { speaker: string; text: string; timestamp: string }[]): Promise<AnalysisResult | null> => {
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
