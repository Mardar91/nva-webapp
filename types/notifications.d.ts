// types/notifications.d.ts

// Estendi l'interfaccia Window per includere OneSignal
declare global {
  interface Window {
    OneSignal: OneSignalType;
    OneSignalDeferred: ((OneSignal: OneSignalType) => void)[];
  }
}

// Definizioni per i tipi base di OneSignal
interface OneSignalType {
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

// Tipi per le sottoscrizioni push
interface PushSubscriptionType {
  id: string | null;
  token: string | null;
  optedIn: boolean;
  optIn: () => Promise<void>;
  optOut: () => Promise<void>;
}

// Tipi per le notifiche
interface NotificationsType {
  permission: boolean;
  permissionNative: NotificationPermission;
  setDefaultUrl: (url: string) => Promise<void>;
  setDefaultTitle: (title: string) => Promise<void>;
  isPushSupported: () => boolean;
  requestPermission: () => Promise<boolean>;
  addEventListener: (event: NotificationEventType, listener: NotificationEventListener) => void;
  removeEventListener: (event: NotificationEventType, listener: NotificationEventListener) => void;
}

// Tipi per gli eventi delle notifiche
type NotificationEventType = 
  | 'click'
  | 'foregroundWillDisplay'
  | 'dismiss'
  | 'permissionChange'
  | 'permissionPromptDisplay';

// Tipi per i listener degli eventi
type NotificationEventListener = (event: NotificationEvent) => void;

// Interfaccia per gli eventi delle notifiche
interface NotificationEvent {
  notification: NotificationPayload;
  result?: NotificationClickResult;
  permission?: boolean;
}

// Interfaccia per il payload delle notifiche
interface NotificationPayload {
  title: string;
  message: string;
  url?: string;
  icon?: string;
  image?: string;
  data?: Record<string, any>;
  notificationId?: string;
  sound?: string;
  buttons?: NotificationButton[];
}

// Interfaccia per i pulsanti delle notifiche
interface NotificationButton {
  id: string;
  text: string;
  icon?: string;
}

// Interfaccia per il risultato del click sulla notifica
interface NotificationClickResult {
  actionId?: string;
  url?: string;
}

// Definizioni per le notifiche di check-in
interface CheckInNotification extends NotificationPayload {
  checkInDate: string;
  deviceId: string;
  type: 'check_in_reminder';
}

// Stato delle notifiche di check-in
interface CheckInNotificationState {
  deviceId: string | null;
  notificationSent: boolean;
  lastNotificationDate: string | null;
  checkInDate: string | null;
}

// Response API per le notifiche
interface NotificationApiResponse {
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
interface OneSignalConfig {
  appId: string;
  safariWebId?: string;
  defaultUrl?: string;
  defaultTitle?: string;
  autoRegister?: boolean;
  notifyButton?: {
    enable: boolean;
    size?: 'small' | 'medium' | 'large';
    position?: 'bottom-left' | 'bottom-right';
    showCredit?: boolean;
    text?: {
      [key: string]: string;
    };
  };
}

// Esporta tutti i tipi
export type {
  OneSignalType,
  PushSubscriptionType,
  NotificationsType,
  NotificationEventType,
  NotificationEventListener,
  NotificationEvent,
  NotificationPayload,
  NotificationButton,
  NotificationClickResult,
  CheckInNotification,
  CheckInNotificationState,
  NotificationApiResponse,
  OneSignalConfig,
};
