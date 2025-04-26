import { useState } from "react";
import { Button } from "@/components/ui/button";
import { subscribeToPushNotifications } from "@/lib/notifications";

interface NotificationBannerProps {
  steamId: string;
  onClose: () => void;
}

export default function NotificationBanner({ steamId, onClose }: NotificationBannerProps) {
  const [loading, setLoading] = useState(false);

  const handleEnableNotifications = async () => {
    setLoading(true);
    try {
      const success = await subscribeToPushNotifications(steamId);
      if (success) {
        onClose();
      } else {
        console.error("Failed to subscribe to notifications");
      }
    } catch (error) {
      console.error("Error enabling notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-primary bg-opacity-90 rounded-lg shadow-lg p-4 flex items-center justify-between z-50">
      <div className="flex items-center">
        <div className="text-accent mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <div>
          <h4 className="font-medium">Enable Notifications</h4>
          <p className="text-sm text-gray-300">Get alerts when it's your turn</p>
        </div>
      </div>
      <Button
        onClick={handleEnableNotifications}
        className="bg-accent hover:bg-accent/90 text-white"
        disabled={loading}
      >
        {loading ? "Enabling..." : "Enable"}
      </Button>
    </div>
  );
}
