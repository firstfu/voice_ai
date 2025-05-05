/**
 * onBoarding 引導頁面
 *
 * 使用者首次啟動應用時顯示的引導頁面
 * 包含應用程式主要功能介紹和使用指南
 */

import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, Image, SafeAreaView, Dimensions, TouchableOpacity, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutLeft } from "react-native-reanimated";

// 擴展全局變量的聲明
declare global {
  var hasCompletedOnboarding: boolean;
}

// onBoarding 完成標記的鍵名
const HAS_ONBOARDED_KEY = "hasOnboarded";

// 螢幕寬度
const { width } = Dimensions.get("window");

// 引導頁內容
const onboardingData = [
  {
    id: "1",
    title: "歡迎使用錄智通",
    description: "結合 LLM AI 技術的高級錄音應用，為您提供專業的語音處理體驗",
    image: require("../assets/images/logo_3d_elegant.webp"),
    bgColor: "transparent",
  },
  {
    id: "2",
    title: "高品質錄音",
    description: "支援多種採樣率和音頻格式，智能過濾背景噪音，捕捉每一個清晰音符",
    image: require("../assets/images/logo_3d_premium.webp"),
    bgColor: "transparent",
  },
  {
    id: "3",
    title: "智能分析",
    description: "先進的 AI 技術，自動轉錄、提取關鍵點、生成摘要，讓語音資料更有價值",
    image: require("../assets/images/logo_3d_no_text.webp"),
    bgColor: "transparent",
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  // 標記已完成引導並導航到主頁
  const handleFinish = useCallback(async () => {
    if (isNavigating) return; // 防止多次點擊

    setIsNavigating(true);

    try {
      // 設置全局變量，確保根佈局立即獲知引導已完成
      global.hasCompletedOnboarding = true;
      console.log("已設置全局完成標記");

      // 先儲存已完成狀態
      await AsyncStorage.setItem(HAS_ONBOARDED_KEY, "true");

      console.log("完成 onBoarding，準備跳轉到首頁");

      // 直接導航到主頁，不使用延遲
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Error saving onboarding status", error);
      Alert.alert("錯誤", "無法儲存設定。請重試。");
      setIsNavigating(false);
    }
  }, [router, isNavigating]);

  // 切換到下一個引導頁
  const handleNext = useCallback(() => {
    if (currentIndex < onboardingData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleFinish();
    }
  }, [currentIndex, handleFinish]);

  // 跳過引導流程
  const handleSkip = useCallback(async () => {
    if (isNavigating) return; // 防止多次點擊

    setIsNavigating(true);

    try {
      // 設置全局變量，確保根佈局立即獲知引導已完成
      global.hasCompletedOnboarding = true;
      console.log("已設置全局完成標記 (跳過)");

      // 確保設置了已完成標記
      await AsyncStorage.setItem(HAS_ONBOARDED_KEY, "true");

      console.log("跳過 onBoarding，準備跳轉到首頁");

      // 直接導航到主頁，不使用延遲
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Error while skipping onboarding", error);
      Alert.alert("錯誤", "無法儲存設定。請重試。");
      setIsNavigating(false);
    }
  }, [router, isNavigating]);

  // 當前引導頁內容
  const currentItem = onboardingData[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* 內容區域 */}
      <Animated.View key={currentItem.id} entering={SlideInRight.duration(300)} exiting={SlideOutLeft.duration(300)} style={styles.contentContainer}>
        <View style={styles.logoOuterContainer}>
          <Image source={currentItem.image} style={styles.logoImage} resizeMode="cover" />
        </View>

        <Animated.Text entering={FadeIn.duration(400)} exiting={FadeOut.duration(200)} style={styles.title}>
          {currentItem.title}
        </Animated.Text>

        <Animated.Text entering={FadeIn.delay(100).duration(400)} exiting={FadeOut.duration(200)} style={styles.description}>
          {currentItem.description}
        </Animated.Text>
      </Animated.View>

      {/* 底部控制區 */}
      <View style={styles.bottomContainer}>
        {/* 進度指示器 */}
        <View style={styles.paginationContainer}>
          {onboardingData.map((_, index) => (
            <View key={index} style={[styles.paginationDot, index === currentIndex && styles.paginationDotActive]} />
          ))}
        </View>

        {/* 按鈕區域 */}
        <View style={styles.buttonContainer}>
          {currentIndex < onboardingData.length - 1 ? (
            <>
              <TouchableOpacity style={styles.skipButton} onPress={handleSkip} activeOpacity={0.7} disabled={isNavigating}>
                <Text style={styles.skipButtonText}>跳過</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.8}>
                <LinearGradient colors={["#3A7BFF", "#6E99FF"]} style={styles.gradientButton} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Text style={styles.nextButtonText}>下一步</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={[styles.finishButton, isNavigating && styles.disabledButton]} onPress={handleFinish} activeOpacity={0.8} disabled={isNavigating}>
              <LinearGradient colors={["#3A7BFF", "#6E99FF"]} style={styles.gradientButton} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.nextButtonText}>{isNavigating ? "處理中..." : "開始使用"}</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  logoOuterContainer: {
    marginBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
    width: width * 0.62,
    height: width * 0.62,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: width * 0.31,
    overflow: "hidden",
  },
  logoImage: {
    width: width * 0.62,
    height: width * 0.62,
    resizeMode: "cover",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 16,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: "85%",
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#E2E8F0",
    marginHorizontal: 6,
  },
  paginationDotActive: {
    backgroundColor: "#3A7BFF",
    width: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  skipButtonText: {
    color: "#64748B",
    fontSize: 16,
    fontWeight: "500",
  },
  nextButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  finishButton: {
    borderRadius: 12,
    overflow: "hidden",
    flex: 1,
  },
  disabledButton: {
    opacity: 0.7,
  },
  gradientButton: {
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  nextButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
