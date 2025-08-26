"use client";

import { ExpoNotificationManagerWrapper } from "@/components/ExpoNotificationManagerWrapper";
import { NotificationManager } from "@/components/notification-manager";

export default function Home() {
  return (
    <div>
      <h1>Capacitor Page</h1>
      <p>This page is designed to work with Capacitor.</p>
      <NotificationManager hidden={false} />
      <br />
      <br />
      <br />
      <br />
      <h2>Expo Notification Manager</h2>
      <p>
        If you are using Expo, you should see the Expo Notification Manager
        below.
      </p>
      <br />
      <ExpoNotificationManagerWrapper hidden={false} />
    </div>
  );
}
