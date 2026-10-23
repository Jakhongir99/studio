import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useLocalStorage } from "@mantine/hooks";
import { CUSTOM_BACKGROUND, DEFAULT_BACKGROUND } from "./backgrounds.js";
import { DEFAULT_USER, INITIAL_NOTIFICATIONS } from "../pages/mockData.js";

const CUSTOM_IMAGE_KEY = "egaro-studio-bg-image";

const AppStateContext = createContext(null);

const readCustomImage = () => {
    try {
        return localStorage.getItem(CUSTOM_IMAGE_KEY) || null;
    } catch {
        return null;
    }
};

export const BACKGROUND_KEY = "egaro-studio-background";

export const readCustomBackground = readCustomImage;

const userDefaults = (account) => {
    if (!account || account.email === DEFAULT_USER.email) return DEFAULT_USER;
    const [firstName = "", ...rest] = account.name.split(" ");
    return { ...DEFAULT_USER, firstName, lastName: rest.join(" "), email: account.email, position: "", color: "gray" };
};

export function AppStateProvider({ account, children }) {
    const [background, setBackground] = useLocalStorage({
        key: BACKGROUND_KEY,
        defaultValue: DEFAULT_BACKGROUND,
        getInitialValueInEffect: false,
    });
    const [customImage, setCustomImageState] = useState(readCustomImage);
    const [railCollapsed, setRailCollapsed] = useLocalStorage({
        key: "egaro-studio-rail-collapsed",
        defaultValue: false,
    });
    const [user, setUser] = useLocalStorage({
        key: `egaro-studio-user:${account?.email ?? "guest"}`,
        defaultValue: userDefaults(account),
        getInitialValueInEffect: false,
    });
    const [preferences, setPreferences] = useLocalStorage({
        key: "egaro-studio-preferences",
        defaultValue: {
            language: "uz",
            notifyRunFailed: true,
            notifyRunSuccess: false,
            notifyTasks: true,
            notifyMentions: true,
            emailDigest: "daily",
            sound: true,
            twoFactor: false,
        },
    });
    const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

    // Returns false when the image does not fit into localStorage
    const setCustomImage = useCallback(
        (dataUrl) => {
            try {
                if (dataUrl) localStorage.setItem(CUSTOM_IMAGE_KEY, dataUrl);
                else localStorage.removeItem(CUSTOM_IMAGE_KEY);
            } catch {
                return false;
            }
            setCustomImageState(dataUrl);
            if (dataUrl) setBackground(CUSTOM_BACKGROUND);
            else setBackground((current) => (current === CUSTOM_BACKGROUND ? DEFAULT_BACKGROUND : current));
            return true;
        },
        [setBackground]
    );

    const markRead = useCallback(
        (id) => setNotifications((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n))),
        []
    );
    const markAllRead = useCallback(() => setNotifications((list) => list.map((n) => ({ ...n, read: true }))), []);
    const removeNotification = useCallback((id) => setNotifications((list) => list.filter((n) => n.id !== id)), []);

    const value = useMemo(
        () => ({
            background,
            setBackground,
            customImage,
            setCustomImage,
            railCollapsed,
            setRailCollapsed,
            user,
            setUser,
            preferences,
            setPreferences,
            notifications,
            unreadCount: notifications.filter((n) => !n.read).length,
            markRead,
            markAllRead,
            removeNotification,
        }),
        [
            background,
            setBackground,
            customImage,
            setCustomImage,
            railCollapsed,
            setRailCollapsed,
            user,
            setUser,
            preferences,
            setPreferences,
            notifications,
            markRead,
            markAllRead,
            removeNotification,
        ]
    );

    return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export const useAppState = () => useContext(AppStateContext);
