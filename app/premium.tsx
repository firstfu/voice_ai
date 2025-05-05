/**
 * 進階功能訂閱頁面
 *
 * 本頁面提供使用者訂閱進階功能的介面，包括:
 * - 不同時長的訂閱選項
 * - 功能優勢說明
 * - 價格與優惠顯示
 * - 訂閱協議與隱私政策連結
 */

import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image, SafeAreaView, Platform, ActivityIndicator } from "react-native";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

// 訂閱計劃類型
interface SubscriptionPlan {
  id: string;
  title: string;
  duration: string;
  price: string;
  originalPrice?: string;
  popular?: boolean;
  savingsPercent?: number;
}

// 功能優勢項目類型
interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export default function PremiumScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 模擬的訂閱計劃數據
  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: "monthly",
      title: "月度訂閱",
      duration: "1個月",
      price: "NT$99",
      originalPrice: "NT$129",
    },
    {
      id: "yearly",
      title: "年度訂閱",
      duration: "12個月",
      price: "NT$799",
      originalPrice: "NT$1,188",
      popular: true,
      savingsPercent: 33,
    },
    {
      id: "lifetime",
      title: "終身會員",
      duration: "一次性付費",
      price: "NT$1,999",
      originalPrice: "NT$2,999",
      savingsPercent: 33,
    },
  ];

  // 模擬的功能優勢數據
  const features: FeatureItem[] = [
    {
      id: "unlimited",
      title: "不限時長錄音",
      description: "突破免費版限制，無論多長內容都能輕鬆錄製",
      icon: "infinite",
    },
    {
      id: "transcription",
      title: "智能語音轉文字",
      description: "專業級語音識別技術，快速生成高精度文字稿",
      icon: "document-text",
    },
    {
      id: "export",
      title: "多格式導出",
      description: "支援多種音訊和文件格式導出，滿足不同場景需求",
      icon: "share",
    },
    {
      id: "cloud",
      title: "雲端儲存",
      description: "自動雲端備份，永不丟失重要錄音內容",
      icon: "cloud-upload",
    },
    {
      id: "noise",
      title: "降噪增強",
      description: "先進的降噪算法，提供清晰的錄音效果",
      icon: "options",
    },
  ];

  // 處理訂閱計劃選擇
  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
  };

  // 處理訂閱操作
  const handleSubscribe = async () => {
    if (!selectedPlan) return;

    setIsLoading(true);

    // 模擬購買流程，實際應用中需要接入真實的內購 API
    setTimeout(() => {
      setIsLoading(false);
      // 這裡應該處理成功或失敗的後續操作
      router.back();
    }, 2000);
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: "進階功能訂閱",
          headerShown: true,
          headerBackTitle: "返回",
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: "rgba(58, 123, 255, 0.05)",
          },
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 頂部圖片區域 */}
        <View style={styles.headerImageContainer}>
          <Image source={require("@/assets/images/icon.png")} style={styles.headerImage} resizeMode="contain" />
        </View>

        {/* 標題區域 */}
        <View style={styles.titleContainer}>
          <ThemedText style={styles.title}>智音坊 專業版</ThemedText>
          <ThemedText style={styles.subtitle}>解鎖全部進階功能，提升您的錄音體驗</ThemedText>
        </View>

        {/* 訂閱計劃選擇區域 */}
        <View style={styles.plansContainer}>
          <ThemedText style={styles.sectionTitle}>選擇訂閱計劃</ThemedText>

          {subscriptionPlans.map(plan => (
            <TouchableOpacity
              key={plan.id}
              style={[styles.planCard, selectedPlan === plan.id && styles.selectedPlanCard, plan.popular && styles.popularPlanCard]}
              onPress={() => handleSelectPlan(plan.id)}
              activeOpacity={0.8}
            >
              {plan.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>最受歡迎</Text>
                </View>
              )}

              <View style={styles.planCardContent}>
                <View style={styles.planInfo}>
                  <ThemedText style={styles.planTitle}>{plan.title}</ThemedText>
                  <ThemedText style={styles.planDuration}>{plan.duration}</ThemedText>

                  <View style={styles.priceContainer}>
                    <ThemedText style={styles.planPrice}>{plan.price}</ThemedText>
                    {plan.originalPrice && <ThemedText style={styles.originalPrice}>{plan.originalPrice}</ThemedText>}
                  </View>

                  {plan.savingsPercent && (
                    <View style={styles.savingsBadge}>
                      <Text style={styles.savingsBadgeText}>省 {plan.savingsPercent}%</Text>
                    </View>
                  )}
                </View>

                <View style={styles.radioContainer}>
                  <View style={[styles.radioOuter, selectedPlan === plan.id && styles.radioOuterSelected]}>
                    {selectedPlan === plan.id && <View style={styles.radioInner} />}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* 功能優勢展示區域 */}
        <View style={styles.featuresContainer}>
          <ThemedText style={styles.sectionTitle}>專業版特色功能</ThemedText>

          {features.map(feature => (
            <View key={feature.id} style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Ionicons name={feature.icon as any} size={24} color="#3A7BFF" />
              </View>
              <View style={styles.featureTextContainer}>
                <ThemedText style={styles.featureTitle}>{feature.title}</ThemedText>
                <ThemedText style={styles.featureDescription}>{feature.description}</ThemedText>
              </View>
            </View>
          ))}
        </View>

        {/* 使用條款與隱私政策 */}
        <View style={styles.termsContainer}>
          <ThemedText style={styles.termsText}>
            訂閱後，您確認已閱讀並同意我們的
            <Text style={styles.termsLink} onPress={() => router.push("/legal")}>
              {" "}
              使用條款{" "}
            </Text>
            與
            <Text style={styles.termsLink} onPress={() => router.push("/legal")}>
              {" "}
              隱私政策
            </Text>
            。訂閱會自動續約，可隨時在 App Store 帳戶設定中取消。
          </ThemedText>
        </View>
      </ScrollView>

      {/* 底部訂閱按鈕 */}
      <View style={[styles.subscribeContainer, { paddingBottom: insets.bottom + 16 }]}>
        <LinearGradient colors={["#3A7BFF", "#6C3AFF"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.subscribeButton}>
          <TouchableOpacity style={styles.subscribeButtonTouch} onPress={handleSubscribe} disabled={!selectedPlan || isLoading} activeOpacity={0.9}>
            {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.subscribeButtonText}>{selectedPlan ? "訂閱" : "選擇方案"}</Text>}
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollView: {
    flex: 1,
  },
  headerImageContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  headerImage: {
    width: 100,
    height: 100,
  },
  titleContainer: {
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
    color: "#111827",
  },
  subtitle: {
    fontSize: 16,
    color: "#4B5563",
    textAlign: "center",
    lineHeight: 22,
  },
  plansContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#111827",
  },
  planCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    overflow: "hidden",
  },
  selectedPlanCard: {
    borderColor: "#3A7BFF",
    borderWidth: 2,
  },
  popularPlanCard: {
    borderColor: "#6C3AFF",
    borderWidth: 2,
  },
  popularBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#6C3AFF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
  },
  popularBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },
  planCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  planInfo: {
    flex: 1,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  planDuration: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  planPrice: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  originalPrice: {
    fontSize: 16,
    color: "#9CA3AF",
    marginLeft: 8,
    textDecorationLine: "line-through",
  },
  savingsBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginTop: 6,
  },
  savingsBadgeText: {
    color: "#10B981",
    fontSize: 12,
    fontWeight: "500",
  },
  radioContainer: {
    padding: 4,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: {
    borderColor: "#3A7BFF",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#3A7BFF",
  },
  featuresContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(58, 123, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  termsContainer: {
    paddingHorizontal: 20,
    marginBottom: 100,
  },
  termsText: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 18,
  },
  termsLink: {
    color: "#3A7BFF",
    textDecorationLine: "underline",
  },
  subscribeContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingTop: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderColor: "rgba(229, 231, 235, 0.5)",
  },
  subscribeButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  subscribeButtonTouch: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  subscribeButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
});
