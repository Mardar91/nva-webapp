// types/notifications.ts

// Definizioni per i tipi base di OneSignal
export interface OneSignalType {
  User: {
    PushSubscription: PushSubscriptionType;
    addTag: (key: string, value: string) => Promise<void>;
    addTags: (tags: Record<string, string>) => Promise<void>;
    removeTag: (key: string) => Promise<void>;
    removeTags: (keys: string[]) => Promise<void>;
  };
  Notifications: NotificationsType;
  login: (externalId: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Dichiarazione globale per Window
declare global {
  interface Window {
    OneSignal: OneSignalType;
    OneSignalDeferred: ((OneSignal: OneSignalType) => void)[];
  }
}

// Tipi per le sottoscrizioni push
export interface PushSubscriptionType {
  id: string | null;
  token: string | null;
  optedIn: boolean;
  optIn: () => Promise<void>;
  optOut: () => Promise<void>;
}

// Interfaccia per gli eventi delle notifiche
export interface NotificationEvent {
  notification: {
    display: () => void;
    url?: string;
    [key: string]: any;
  };
}

// Interfaccia per il payload delle notifiche
export interface NotificationPayload {
  title: string;
  message: string;
  url?: string;
  icon?: string;
  image?: string;
  data?: Record<string, any>;
  notificationId?: string;
  sound?: string;
}

// Tipi per le notifiche
export interface NotificationsType {
  permission: boolean;
  permissionNative: NotificationPermission;
  setDefaultUrl: (url: string) => Promise<void>;
  setDefaultTitle: (title: string) => Promise<void>;
  isPushSupported: () => boolean;
  requestPermission: () => Promise<boolean>;
  addEventListener: {
    (event: 'permissionChange', listener: (permission: boolean) => void): void;
    (event: 'click', listener: (event: NotificationEvent) => void): void;
    (event: 'foregroundWillDisplay', listener: (event: NotificationEvent) => void): void;
    (event: 'dismiss', listener: (event: NotificationEvent) => void): void;
    (event: 'permissionPromptDisplay', listener: () => void): void;
  };
  removeEventListener: {
    (event: 'permissionChange', listener: (permission: boolean) => void): void;
    (event: 'click', listener: (event: NotificationEvent) => void): void;
    (event: 'foregroundWillDisplay', listener: (event: NotificationEvent) => void): void;
    (event: 'dismiss', listener: (event: NotificationEvent) => void): void;
    (event: 'permissionPromptDisplay', listener: () => void): void;
  };
}

// Interfaccia per le notifiche di check-in
export interface CheckInNotification extends NotificationPayload {
  checkInDate: string;
  deviceId: string;
  type: 'check_in_reminder';
}

// Stato delle notifiche di check-in
export interface CheckInNotificationState {
  deviceId: string | null;
  notificationSent: boolean;
  lastNotificationDate: string | null;
  checkInDate: string | null;
}

// Response API per le notifiche
export interface NotificationApiResponse {
  success: boolean;
  message: string;
  data?: {
    id?: string;
    recipients?: number;
    external_id?: string;
  };
  error?: string;
}

// Configurazione per OneSignal
export interface OneSignalConfig {
  appId: string;
  safariWebId?: string;
  defaultUrl?: string;
  defaultTitle?: string;
  autoRegister?: boolean;
}
