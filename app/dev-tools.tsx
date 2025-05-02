/**
 * 開發者工具頁面
 *
 * 本頁面提供應用程式開發者測試功能，包括:
 * - 本地推播測試
 * - 更多開發測試功能將來會加入此頁面
 */

import { StyleSheet, TouchableOpacity, View, StatusBar, Text, Alert, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { useRouter, Stack } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import NotificationService from "@/services/NotificationService";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

// 設定通知處理方式
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function DevToolsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [expoPushToken, setExpoPushToken] = useState<string>("");
  const [notificationPermission, setNotificationPermission] = useState<boolean | null>(null);
  const [scheduledNotifications, setScheduledNotifications] = useState<Notifications.NotificationRequest[]>([]);

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token);
      }
    });

    checkNotificationPermission().then(permission => {
      setNotificationPermission(permission);
    });

    // 初始化通知服務
    NotificationService.init().then(hasPermission => {
      setNotificationPermission(hasPermission);
    });

    // 獲取當前已排程的通知
    fetchScheduledNotifications();
  }, []);

  // 註冊推播通知權限並取得Token
  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#3A7BFF",
      });
    }

    if (Constants.platform) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        Alert.alert("通知權限被拒絕", "無法接收推播通知。如需啟用通知，請在設備設定中開啟權限。");
        return;
      }

      try {
        const tokenData = await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas?.projectId,
        });
        token = tokenData.data;
      } catch (e) {
        console.error("取得 Expo Push Token 失敗", e);
      }
    }

    return token;
  }

  // 檢查通知權限
  async function checkNotificationPermission() {
    const { status } = await Notifications.getPermissionsAsync();
    return status === "granted";
  }

  // 發送本地通知
  async function sendLocalNotification() {
    await NotificationService.sendImmediateNotification({
      title: "本地通知測試",
      body: "這是一條本地推播通知，點擊查看詳情",
      data: { screen: "recording" },
    });
    fetchScheduledNotifications();
  }

  // 發送延遲通知
  async function sendDelayedNotification() {
    await NotificationService.sendDelayedNotification(
      {
        title: "延遲通知測試",
        body: "這是一條延遲5秒後發送的通知",
        data: { screen: "settings" },
      },
      5
    );
    fetchScheduledNotifications();
  }

  // 發送帶圖標的通知
  async function sendNotificationWithIcon() {
    await NotificationService.sendImmediateNotification({
      title: "智音坊錄音完成",
      body: "您的錄音已完成處理，點擊查看詳情",
      data: { screen: "recordings" },
      sound: "notification.wav",
      badge: 1,
    });
    fetchScheduledNotifications();
  }

  // 發送每日通知
  async function sendDailyNotification() {
    // 獲取當前時間並設定為每天的這個時間點
    const now = new Date();
    const minute = (now.getMinutes() + 1) % 60; // 設定為一分鐘後，如果大於59則回到0
    const hour = minute === 0 ? (now.getHours() + 1) % 24 : now.getHours(); // 如果分鐘變為0，則小時+1

    await NotificationService.scheduleDailyNotification(
      {
        title: "每日提醒",
        body: `這是一個在每天 ${hour}:${minute} 發送的定時通知`,
        data: { screen: "home" },
      },
      hour,
      minute
    );

    Alert.alert("每日通知已設定", `通知將在每天 ${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")} 發送`);
    fetchScheduledNotifications();
  }

  // 清除所有通知
  async function dismissAllNotifications() {
    await NotificationService.dismissAllNotifications();
    Alert.alert("已清除所有通知");
    fetchScheduledNotifications();
  }

  // 添加獲取已排程通知的函數
  async function fetchScheduledNotifications() {
    const notifications = await NotificationService.getAllScheduledNotifications();
    setScheduledNotifications(notifications);
  }

  // 渲染通知觸發器信息的輔助函數
  function renderTriggerInfo(trigger: any): string {
    if (!trigger) {
      return "立即";
    }

    if (trigger.type === Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL) {
      return `延遲 ${trigger.seconds} 秒`;
    }

    if (trigger.type === Notifications.SchedulableTriggerInputTypes.DAILY) {
      return `每日 ${trigger.hour}:${trigger.minute.toString().padStart(2, "0")}`;
    }

    if (trigger.type === Notifications.SchedulableTriggerInputTypes.DATE) {
      const date = new Date(trigger.date);
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    }

    return JSON.stringify(trigger);
  }

  return (
    <ThemedView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* 頂部設計元素 */}
      <LinearGradient
        colors={["rgba(58, 123, 255, 0.1)", "rgba(58, 123, 255, 0)"]}
        style={[styles.headerBackground, { paddingTop: insets.top }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      {/* 頂部標題區 */}
      <View style={[styles.headerContainer, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#3A7BFF" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <ThemedText type="title" style={styles.titleText}>
            開發者工具
          </ThemedText>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionContainer}>
          <ThemedText style={styles.sectionTitle}>本地推播測試</ThemedText>

          <View style={styles.infoContainer}>
            <ThemedText style={styles.infoLabel}>通知權限狀態:</ThemedText>
            <ThemedText style={styles.infoValue}>{notificationPermission === null ? "檢查中..." : notificationPermission ? "已授權" : "未授權"}</ThemedText>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={sendLocalNotification} activeOpacity={0.7}>
              <Ionicons name="notifications" size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>發送即時通知</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={sendDelayedNotification} activeOpacity={0.7}>
              <Ionicons name="time" size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>發送延遲通知</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={sendNotificationWithIcon} activeOpacity={0.7}>
              <Ionicons name="notifications-circle" size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>發送豐富通知</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={sendDailyNotification} activeOpacity={0.7}>
              <Ionicons name="time" size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>設定每日通知</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={dismissAllNotifications} activeOpacity={0.7}>
              <Ionicons name="trash" size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>清除所有通知</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tokenContainer}>
          <ThemedText style={styles.tokenTitle}>Expo Push Token</ThemedText>
          <View style={styles.tokenBox}>
            <ThemedText style={styles.tokenText}>{expoPushToken || "尚未取得權限或Token"}</ThemedText>
          </View>
        </View>

        {/* 添加已排程通知列表 */}
        <View style={styles.notificationsContainer}>
          <View style={styles.notificationsHeaderContainer}>
            <ThemedText style={styles.notificationsTitle}>已排程的通知</ThemedText>
            <TouchableOpacity style={styles.refreshButton} onPress={fetchScheduledNotifications} activeOpacity={0.7}>
              <Ionicons name="refresh" size={20} color="#3A7BFF" />
            </TouchableOpacity>
          </View>

          {scheduledNotifications.length === 0 ? (
            <View style={styles.emptyNotifications}>
              <ThemedText style={styles.emptyNotificationsText}>沒有已排程的通知</ThemedText>
            </View>
          ) : (
            scheduledNotifications.map(notification => (
              <View key={notification.identifier} style={styles.notificationItem}>
                <View style={styles.notificationHeader}>
                  <ThemedText style={styles.notificationTitle}>{notification.content.title || "無標題"}</ThemedText>
                  <TouchableOpacity
                    onPress={async () => {
                      await NotificationService.cancelNotification(notification.identifier);
                      fetchScheduledNotifications();
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close-circle" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
                <ThemedText style={styles.notificationBody}>{notification.content.body || "無內容"}</ThemedText>
                <ThemedText style={styles.notificationId}>ID: {notification.identifier.substring(0, 8)}...</ThemedText>
                <ThemedText style={styles.notificationTrigger}>觸發: {renderTriggerInfo(notification.trigger)}</ThemedText>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  titleText: {
    fontSize: 28,
    fontWeight: "700",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  sectionContainer: {
    marginBottom: 24,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 16,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    color: "#3A7BFF",
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    padding: 12,
    backgroundColor: "rgba(58, 123, 255, 0.05)",
    borderRadius: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginRight: 8,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3A7BFF",
  },
  buttonContainer: {
    marginTop: 8,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3A7BFF",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  dangerButton: {
    backgroundColor: "#EF4444",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 12,
  },
  tokenContainer: {
    marginBottom: 24,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 16,
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
  tokenTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  tokenBox: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  tokenText: {
    fontSize: 12,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    color: "#666",
  },
  notificationsContainer: {
    marginBottom: 24,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 16,
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
  notificationsHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  notificationsTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  refreshButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(58, 123, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyNotifications: {
    padding: 20,
    alignItems: "center",
  },
  emptyNotificationsText: {
    color: "#666",
    fontStyle: "italic",
  },
  notificationItem: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#3A7BFF",
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  notificationTitle: {
    fontWeight: "600",
    fontSize: 15,
  },
  notificationBody: {
    fontSize: 14,
    marginBottom: 8,
  },
  notificationId: {
    fontSize: 12,
    color: "#666",
  },
  notificationTrigger: {
    fontSize: 12,
    color: "#3A7BFF",
    marginTop: 4,
  },
});
