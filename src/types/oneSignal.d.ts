declare global {
  interface Window {
    OneSignalDeferred: ((OneSignal: {
      Notifications: {
        permission: boolean;
        requestPermission: () => Promise<void>;
        schedule: (options: {
          title: string;
          body: string;
          url?: string;
          icon?: string;
          sendAfter: string;
        }) => Promise<void>;
      };
    }) => void)[];
  }
}

export {};
