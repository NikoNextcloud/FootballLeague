// src/components/NotifyButton.tsx
import { useEffect, useState } from "react";

declare global {
  interface Window {
    OneSignalDeferred?: unknown[];
    __ONESIGNAL_APP_ID__?: string;
  }
}

type OneSignalLike = {
  Notifications: { permission: boolean; requestPermission: () => Promise<void> };
  User: { PushSubscription: { optedIn: boolean } };
};

export default function NotifyButton() {
  const [ready, setReady] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    const appId = window.__ONESIGNAL_APP_ID__;
    if (!appId || appId.includes("VITE_ONESIGNAL")) return; // не е конфигуриран
    setAvailable(true);
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push((OneSignal: OneSignalLike) => {
      setReady(true);
      setSubscribed(Boolean(OneSignal.User?.PushSubscription?.optedIn));
    });
  }, []);

  if (!available) return null;

  const handleClick = () => {
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async (OneSignal: OneSignalLike) => {
      await OneSignal.Notifications.requestPermission();
      setSubscribed(Boolean(OneSignal.User?.PushSubscription?.optedIn));
    });
  };

  return (
    <button
      className={`notify-btn ${subscribed ? "on" : ""}`}
      onClick={handleClick}
      disabled={!ready || subscribed}
      title={subscribed ? "Известията са включени" : "Включи известия за голове и начало на мач"}
    >
      {subscribed ? "🔔" : "🔕"}
    </button>
  );
}
