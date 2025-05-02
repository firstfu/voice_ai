/**
 * 通知服務
 *
 * 封裝 expo-notifications 功能，提供便捷的通知管理介面
 */

import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";

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

export interface NotificationData {
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: boolean | string;
  badge?: number;
}

class NotificationService {
  /**
   * 初始化通知服務
   * 設定 Android 通知頻道並請求權限
   */
  async init(): Promise<boolean> {
    // 設定 Android 通知頻道
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "一般通知",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#3A7BFF",
        sound: "notification.wav",
      });

      await Notifications.setNotificationChannelAsync("reminders", {
        name: "提醒通知",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF8C00",
        sound: "notification.wav",
      });
    }

    // 請求通知權限
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === "granted";
  }

  /**
   * 檢查通知權限
   */
  async checkPermission(): Promise<boolean> {
    const { status } = await Notifications.getPermissionsAsync();
    return status === "granted";
  }

  /**
   * 發送即時本地通知
   */
  async sendImmediateNotification(notification: NotificationData): Promise<string> {
    return Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        sound: notification.sound ?? true,
        badge: notification.badge,
      },
      trigger: null, // 立即發送
    });
  }

  /**
   * 發送延遲通知
   */
  async sendDelayedNotification(notification: NotificationData, delayInSeconds: number): Promise<string> {
    return Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        sound: notification.sound ?? true,
        badge: notification.badge,
      },
      trigger: {
        seconds: delayInSeconds,
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      },
    });
  }

  /**
   * 排程每日通知
   */
  async scheduleDailyNotification(notification: NotificationData, hour: number, minute: number): Promise<string> {
    return Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        sound: notification.sound ?? true,
        badge: notification.badge,
      },
      trigger: {
        hour,
        minute,
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
      },
    });
  }

  /**
   * 取消所有排程的通知
   */
  async cancelAllNotifications(): Promise<void> {
    return Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * 取消特定通知
   */
  async cancelNotification(notificationId: string): Promise<void> {
    return Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  /**
   * 獲取所有排程的通知
   */
  async getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return Notifications.getAllScheduledNotificationsAsync();
  }

  /**
   * 獲取 Expo Push Token
   */
  async getExpoPushToken(): Promise<string | null> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        return null;
      }

      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      if (!projectId) {
        console.warn("Missing projectId for push notifications");
        return null;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      return tokenData.data;
    } catch (error) {
      console.error("獲取 Expo Push Token 失敗:", error);
      return null;
    }
  }

  /**
   * 清除所有通知
   */
  async dismissAllNotifications(): Promise<void> {
    return Notifications.dismissAllNotificationsAsync();
  }
}

export default new NotificationService();
