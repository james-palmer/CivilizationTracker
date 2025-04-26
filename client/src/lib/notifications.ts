let vapidPublicKey: string | null = null;

// Get the VAPID public key from the server
export async function getVapidPublicKey(): Promise<string> {
  if (vapidPublicKey) return vapidPublicKey;
  
  const response = await fetch('/api/vapid-public-key');
  const data = await response.json();
  vapidPublicKey = data.publicKey;
  return vapidPublicKey;
}

// Convert a base64 string to Uint8Array for the subscription
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    throw new Error('This browser does not support notifications');
  }

  const permission = await Notification.requestPermission();
  return permission;
}

// Subscribe to push notifications
export async function subscribeToPushNotifications(steamId: string): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.error('Push notifications not supported');
    return false;
  }

  try {
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission not granted');
      return false;
    }

    const registration = await navigator.serviceWorker.ready;
    const publicKey = await getVapidPublicKey();
    
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey)
    });

    await saveSubscription(steamId, subscription);
    return true;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return false;
  }
}

// Save subscription to server
async function saveSubscription(steamId: string, subscription: PushSubscription): Promise<void> {
  await fetch('/api/subscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      steamId,
      subscription: subscription.toJSON()
    }),
  });
}

// Send a test notification (for debugging)
export function sendTestNotification(): void {
  if (!('Notification' in window)) {
    alert('This browser does not support notifications');
    return;
  }

  if (Notification.permission === 'granted') {
    new Notification('Civilization VI Turn Tracker', {
      body: 'This is a test notification',
      icon: 'https://img.icons8.com/color/96/000000/sid-meiers-civilization.png'
    });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification('Civilization VI Turn Tracker', {
          body: 'This is a test notification',
          icon: 'https://img.icons8.com/color/96/000000/sid-meiers-civilization.png'
        });
      }
    });
  }
}
