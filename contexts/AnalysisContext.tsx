import React, { createContext, useState, ReactNode } from "react";

// 定義 Context 型別
interface AnalysisContextType {
  refreshTrigger: string | null;
  triggerRefresh: (id: string) => void;
}

// 創建 Context
export const AnalysisContext = createContext<AnalysisContextType>({
  refreshTrigger: null,
  triggerRefresh: () => {},
});

// Context Provider 元件
interface AnalysisProviderProps {
  children: ReactNode;
}

export const AnalysisProvider: React.FC<AnalysisProviderProps> = ({ children }) => {
  const [refreshTrigger, setRefreshTrigger] = useState<string | null>(null);

  const triggerRefresh = (id: string) => {
    // 設置 trigger 觸發更新，然後在短暫延遲後重置
    setRefreshTrigger(id);
    // 清除 trigger，以便下次可以再次觸發相同 ID
    setTimeout(() => {
      setRefreshTrigger(null);
    }, 300);
  };

  return <AnalysisContext.Provider value={{ refreshTrigger, triggerRefresh }}>{children}</AnalysisContext.Provider>;
};
