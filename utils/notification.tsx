import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export interface Task {
  id: string;
  title: string;
  deadline?: string; // ISO string
  notificationId?: string;
  [key: string]: any;
}

export async function scheduleTaskNotification(task: Task): Promise<string | undefined> {
  if (!task.deadline) return;

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    console.warn('Không được cấp quyền gửi thông báo');
    return;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    });
  }

  const deadlineDate = new Date(task.deadline);
  const now = new Date();
  const triggerTime = new Date(deadlineDate.getTime() - 1 * 60 * 1000);

  if (triggerTime <= now) return;

  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '📌 Nhắc nhở công việc',
        body: `Sắp đến hạn: ${task.title}`,
        sound: 'thap.mp3',
      },
      trigger: {
        // Ép kiểu theo chuẩn DateTriggerInput của expo-notifications
        type: 'date',
        date: triggerTime,
      } as Notifications.DateTriggerInput,
    });
    return notificationId;
  } catch (err) {
    console.error('Lỗi khi đặt lịch thông báo:', err);
    return;
  }
}

export async function cancelTaskNotification(notificationId?: string) {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (err) {
    console.error('Lỗi khi hủy thông báo:', err);
  }
}
