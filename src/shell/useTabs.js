import { useCallback, useEffect, useState } from "react";

const TABS_KEY = "egaro-studio-tabs-v2";

export const flowStorageKey = (tabId) => `egaro-studio-flow-${tabId}`;

const makeId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const makeTab = (template, name) => ({ id: makeId(), kind: "studio", name, template });

export const isStudioTab = (tab) => (tab.kind || "studio") === "studio";

const loadState = () => {
    try {
        const saved = JSON.parse(localStorage.getItem(TABS_KEY));
        if (saved?.tabs?.length) return saved;
    } catch {
        // fall through to the default state
    }
    const home = { id: makeId(), kind: "page", page: "home", name: "Bosh sahifa" };
    const first = makeTab("sample", "Kiruvchi hujjatlar");
    const second = makeTab("onboarding", "Yangi mijozlar — onboarding");
    return { tabs: [home, first, second], activeId: first.id };
};

export default function useTabs() {
    const [state, setState] = useState(loadState);

    useEffect(() => {
        localStorage.setItem(TABS_KEY, JSON.stringify(state));
    }, [state]);

    const openTab = useCallback(() => {
        const tab = makeTab("empty", "Yangi jarayon");
        setState((s) => ({ tabs: [...s.tabs, tab], activeId: tab.id }));
    }, []);

    const openPage = useCallback((page, name) => {
        setState((s) => {
            const existing = s.tabs.find((tab) => tab.kind === "page" && tab.page === page);
            if (existing) return { ...s, activeId: existing.id };
            const tab = { id: makeId(), kind: "page", page, name };
            return { tabs: [...s.tabs, tab], activeId: tab.id };
        });
    }, []);

    // Activates the most recently opened flow, or creates one when none is open
    const openStudio = useCallback(() => {
        setState((s) => {
            const active = s.tabs.find((tab) => tab.id === s.activeId);
            if (active && isStudioTab(active)) return s;
            const flows = s.tabs.filter(isStudioTab);
            if (flows.length) return { ...s, activeId: flows[flows.length - 1].id };
            const tab = makeTab("empty", "Yangi jarayon");
            return { tabs: [...s.tabs, tab], activeId: tab.id };
        });
    }, []);

    const selectTab = useCallback((id) => setState((s) => ({ ...s, activeId: id })), []);

    const closeTab = useCallback((id) => {
        localStorage.removeItem(flowStorageKey(id));
        setState((s) => {
            const index = s.tabs.findIndex((tab) => tab.id === id);
            const tabs = s.tabs.filter((tab) => tab.id !== id);
            if (!tabs.length) {
                const fresh = makeTab("empty", "Yangi jarayon");
                return { tabs: [fresh], activeId: fresh.id };
            }
            const activeId = s.activeId === id ? tabs[Math.max(0, index - 1)].id : s.activeId;
            return { tabs, activeId };
        });
    }, []);

    const renameTab = useCallback((id, name) => {
        setState((s) =>
            s.tabs.some((tab) => tab.id === id && tab.name !== name)
                ? { ...s, tabs: s.tabs.map((tab) => (tab.id === id ? { ...tab, name } : tab)) }
                : s
        );
    }, []);

    const activeTab = state.tabs.find((tab) => tab.id === state.activeId) || state.tabs[0];

    return { tabs: state.tabs, activeTab, openTab, openPage, openStudio, selectTab, closeTab, renameTab };
}
