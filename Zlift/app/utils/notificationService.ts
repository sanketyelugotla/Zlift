// notificationService.ts

import * as Notifications from 'expo-notifications';

/**
 * Send a local notification immediately.
 * @param title Title of the notification.
 * @param body Body/content of the notification.
 */

export const sendNotification = async (title: string, body: string) => {
    await Notifications.scheduleNotificationAsync({
        content: {
            title,
            body,
            sound: 'default',
        },
        trigger: null, // send immediately
    });
};

/**
 * Request notification permissions (should be called before sending).
 * @returns true if granted, false otherwise.
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
};
