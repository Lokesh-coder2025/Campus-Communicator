export interface AnnouncementSettings {
  text: string;
  voiceName: string | null;
  volume: number;
  rate: number;
  pitch: number;
}

export interface AnnouncementHistoryEntry extends AnnouncementSettings {
  id: number;
  timestamp: string;
}

const SETTINGS_STORAGE_KEY = 'announcementBotSettings';
const HISTORY_STORAGE_KEY = 'announcementBotHistory';
const MAX_HISTORY_ITEMS = 20;

export const saveAnnouncementSettings = (settings: AnnouncementSettings): void => {
  try {
    const settingsJson = JSON.stringify(settings);
    localStorage.setItem(SETTINGS_STORAGE_KEY, settingsJson);
  } catch (error) {
    console.error("Failed to save settings to local storage:", error);
  }
};

export const loadAnnouncementSettings = (): AnnouncementSettings | null => {
  try {
    const settingsJson = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (settingsJson) {
      return JSON.parse(settingsJson) as AnnouncementSettings;
    }
    return null;
  } catch (error) {
    console.error("Failed to load settings from local storage:", error);
    return null;
  }
};

export const hasSavedSettings = (): boolean => {
  return localStorage.getItem(SETTINGS_STORAGE_KEY) !== null;
};

export const loadHistory = (): AnnouncementHistoryEntry[] => {
    try {
        const historyJson = localStorage.getItem(HISTORY_STORAGE_KEY);
        return historyJson ? JSON.parse(historyJson) : [];
    } catch (error) {
        console.error("Failed to load history from local storage:", error);
        return [];
    }
};

export const saveToHistory = (settings: AnnouncementSettings): void => {
    try {
        const history = loadHistory();
        const newEntry: AnnouncementHistoryEntry = {
            ...settings,
            id: Date.now(),
            timestamp: new Date().toISOString(),
        };
        const newHistory = [newEntry, ...history];
        const trimmedHistory = newHistory.slice(0, MAX_HISTORY_ITEMS);
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(trimmedHistory));
    } catch (error) {
        console.error("Failed to save to history:", error);
    }
};
