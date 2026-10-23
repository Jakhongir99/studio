import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

const SESSION_KEY = "egaro-studio-session";
const PASSWORDS_KEY = "egaro-studio-passwords";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const REMEMBER_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const LATENCY_MS = 700;

// Mock accounts until the backend auth API is available
export const DEMO_ACCOUNTS = [
    { email: "j.abdullayev@xb.uz", password: "Studio2026!", name: "Jahongir Abdullayev", role: "admin" },
    { email: "demo@xb.uz", password: "demo1234", name: "Demo foydalanuvchi", role: "viewer" },
];

const AuthContext = createContext(null);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const makeToken = () =>
    Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, "0")).join("");

const readJson = (storage, key) => {
    try {
        return JSON.parse(storage.getItem(key));
    } catch {
        return null;
    }
};

const loadSession = () => {
    const session = readJson(localStorage, SESSION_KEY) || readJson(sessionStorage, SESSION_KEY);
    if (!session || Date.parse(session.expiresAt) < Date.now()) return null;
    return session;
};

const clearSession = () => {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
};

const passwordFor = (account) => (readJson(localStorage, PASSWORDS_KEY) || {})[account.email] ?? account.password;

const findAccount = (email) =>
    DEMO_ACCOUNTS.find((account) => account.email.toLowerCase() === email.trim().toLowerCase());

export class AuthError extends Error {}

export function AuthProvider({ children }) {
    const [session, setSession] = useState(loadSession);

    const login = useCallback(async ({ email, password, remember }) => {
        await sleep(LATENCY_MS);
        const account = findAccount(email);
        if (!account || passwordFor(account) !== password) {
            throw new AuthError("Email yoki parol noto'g'ri");
        }
        const next = {
            email: account.email,
            name: account.name,
            role: account.role,
            token: makeToken(),
            remember: !!remember,
            loggedInAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + (remember ? REMEMBER_TTL_MS : SESSION_TTL_MS)).toISOString(),
        };
        clearSession();
        (remember ? localStorage : sessionStorage).setItem(SESSION_KEY, JSON.stringify(next));
        setSession(next);
        return next;
    }, []);

    // Local SSO simulation for the prototype; no external provider is contacted.
    const loginSSO = useCallback(async () => {
        await sleep(2300);
        const account = DEMO_ACCOUNTS[0];
        const next = {
            email: account.email,
            name: account.name,
            role: account.role,
            token: makeToken(),
            remember: false,
            loggedInAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
        };
        clearSession();
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(next));
        setSession(next);
        return next;
    }, []);

    const logout = useCallback(() => {
        clearSession();
        setSession(null);
    }, []);

    const changePassword = useCallback(
        async (current, next) => {
            await sleep(LATENCY_MS);
            const account = session && findAccount(session.email);
            if (!account || passwordFor(account) !== current) throw new AuthError("Joriy parol noto'g'ri");
            const passwords = readJson(localStorage, PASSWORDS_KEY) || {};
            localStorage.setItem(PASSWORDS_KEY, JSON.stringify({ ...passwords, [account.email]: next }));
        },
        [session]
    );

    const requestPasswordReset = useCallback(async (email) => {
        await sleep(LATENCY_MS);
        if (!findAccount(email)) throw new AuthError("Bu email bilan foydalanuvchi topilmadi");
    }, []);

    const value = useMemo(
        () => ({ session, login, loginSSO, logout, changePassword, requestPasswordReset }),
        [session, login, loginSSO, logout, changePassword, requestPasswordReset]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
