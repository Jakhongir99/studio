import React, { forwardRef, useCallback, useState } from "react";
import {
    ActionIcon,
    Badge,
    SegmentedControl,
    Avatar,
    Box,
    Button,
    Group,
    Image,
    Indicator,
    Kbd,
    Menu,
    Modal,
    Popover,
    ScrollArea,
    Stack,
    Text,
    Tooltip,
    UnstyledButton,
    useMantineTheme,
} from "@mantine/core";
import {
    IconBell,
    IconBellOff,
    IconBook,
    IconBuildingStore,
    IconCheck,
    IconChecks,
    IconChevronDown,
    IconHeadset,
    IconHelpCircle,
    IconKeyboard,
    IconLayoutSidebarLeftCollapse,
    IconLayoutSidebarLeftExpand,
    IconLogout,
    IconMoon,
    IconPalette,
    IconSettings,
    IconSun,
    IconUser,
} from "@tabler/icons-react";
import { useReducedMotion } from "@mantine/hooks";
import ChatWidget from "./ChatPanel.jsx";
import EmptyState from "../components/EmptyState.jsx";
import "./shell.css";
import { feedback } from "../lib/feedback.js";
import { useTranslation } from "../lib/i18n.js";
import { useDarkMode } from "../lib/useDarkMode.js";
import StudioPage from "../editor/StudioEditor.jsx";
import { FLOW_TEMPLATES } from "../editor/catalog.jsx";
import HomePage from "../pages/HomePage.jsx";
import TasksPage from "../pages/TasksPage.jsx";
import CalendarPage from "../pages/CalendarPage.jsx";
import NotificationsPage, { NotificationItem } from "../pages/NotificationsPage.jsx";
import ProfilePage from "../pages/ProfilePage.jsx";
import SettingsPage from "../pages/SettingsPage.jsx";
import PlaceholderPage from "../pages/PlaceholderPage.jsx";
import { initials } from "../pages/mockData.js";
import BrowserTabs from "./BrowserTabs.jsx";
import BackgroundGallery from "./BackgroundGallery.jsx";
import useTabs, { flowStorageKey, isStudioTab } from "./useTabs.js";
import { useAppState } from "./AppState.jsx";
import { useAuth } from "../auth/AuthProvider.jsx";
import { NAV_ITEMS, PAGES, STUDIO_KEY } from "./navigation.js";
import { resolveBackground } from "./backgrounds.js";
import logo from "../assets/xb_logo.svg";

const RAIL_WIDTH = 76;
const RAIL_WIDTH_COLLAPSED = 60;

const EMPTY_FLOW = { name: "Yangi jarayon", nodes: [], edges: [] };

const WORKSPACES = ["AI Business Assistant", "Xalq banki — Bosh ofis", "Xalq banki — Toshkent filiali"];

const SHORTCUTS = [
    { keys: ["Ctrl", "S"], label: "Jarayonni saqlash" },
    { keys: ["Ctrl", "Z"], label: "Bekor qilish" },
    { keys: ["Ctrl", "Shift", "Z"], label: "Qaytarish" },
    { keys: ["Delete"], label: "Tanlangan tugunni o'chirish" },
    { keys: ["Shift", "Sichqoncha"], label: "Bir nechta tugunni tanlash" },
    { keys: ["G'ildirak"], label: "Kattalashtirish / kichraytirish" },
];

const PAGE_COMPONENTS = {
    home: HomePage,
    tasks: TasksPage,
    calendar: CalendarPage,
    notifications: NotificationsPage,
    profile: ProfilePage,
    settings: SettingsPage,
};

const glass = {
    color: "#FFFFFF",
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.18)",
    backdropFilter: "blur(6px)",
    "&:hover": { background: "rgba(255,255,255,0.2)" },
};

const iconButton = { color: "#FFFFFF", "&:hover": { background: "rgba(255,255,255,0.16)" } };

const TopIcon = forwardRef(function TopIcon({ label, onClick, children, ...props }, ref) {
    return (
        <Tooltip label={label} withArrow>
            <ActionIcon
                ref={ref}
                size={34}
                radius={10}
                variant="transparent"
                aria-label={label}
                onClick={onClick}
                sx={iconButton}
                {...props}
            >
                {children}
            </ActionIcon>
        </Tooltip>
    );
});

function RailItem({ icon, label, active, badge, collapsed, onClick }) {
    return (
        <Tooltip label={label} position="right" withArrow disabled={!collapsed}>
            <UnstyledButton
                aria-label={label}
                aria-current={active ? "page" : undefined}
                onClick={onClick}
                sx={{
                    width: collapsed ? 44 : 64,
                    padding: collapsed ? "10px 0" : "7px 2px",
                    borderRadius: 12,
                    color: active ? "#FFFFFF" : "rgba(255,255,255,0.78)",
                    background: active ? "rgba(255,255,255,0.2)" : "transparent",
                    boxShadow: active ? "inset 0 0 0 1px rgba(255,255,255,0.18)" : "none",
                    transition: "width 150ms ease, background 150ms ease",
                    "&:hover": { background: "rgba(255,255,255,0.12)", color: "#FFFFFF" },
                }}
            >
                <Stack spacing={3} align="center">
                    <Indicator
                        disabled={!badge}
                        label={badge}
                        size={15}
                        offset={2}
                        color="red"
                        styles={{ indicator: { fontSize: 9, fontWeight: 600, padding: "0 4px" } }}
                    >
                        {icon}
                    </Indicator>
                    {collapsed ? null : (
                        <Text fz={10} fw={active ? 600 : 400} c="inherit" truncate maw={62}>
                            {label}
                        </Text>
                    )}
                </Stack>
            </UnstyledButton>
        </Tooltip>
    );
}

function NotificationsPopover({ onOpenPage }) {
    const { t } = useTranslation();
    const { notifications, unreadCount, markRead, markAllRead } = useAppState();
    const [opened, setOpened] = useState(false);
    const [filter, setFilter] = useState("unread");
    const reducedMotion = useReducedMotion();
    const visible = (filter === "unread" ? notifications.filter((item) => !item.read) : notifications).slice(0, 6);
    return <Popover opened={opened} onChange={setOpened} position="bottom-end" shadow="xl" width={390} withArrow radius={18}
        transitionProps={{ transition: "pop-top-right", duration: reducedMotion ? 0 : 180 }}>
        <Popover.Target>
            <Indicator disabled={!unreadCount} label={unreadCount} size={16} offset={4} color="red" styles={{ indicator: { fontSize: 9, fontWeight: 600, pointerEvents: "none" } }}>
                <TopIcon label={t("Bildirishnomalar")} aria-expanded={opened} onClick={() => setOpened((value) => !value)}><IconBell className={unreadCount ? "notification-bell" : undefined} size={19} /></TopIcon>
            </Indicator>
        </Popover.Target>
        <Popover.Dropdown p={0} sx={{ maxWidth: "calc(100vw - 24px)", overflow: "hidden" }}>
            <Box p={18} sx={(theme) => ({ background: theme.colorScheme === "dark" ? "#192f28" : "#f1f8f4" })}>
                <Group position="apart"><Box><Text fz={15} fw={600}>Yangiliklar markazi</Text><Text fz={11} c="dimmed" mt={3}>{unreadCount ? `${unreadCount} ta xabar e’tiboringizni kutmoqda` : "Barcha xabarlardan xabardorsiz"}</Text></Box><Badge color="teal" variant="light">{unreadCount} yangi</Badge></Group>
                <Group position="apart" mt={16}><SegmentedControl size="xs" value={filter} onChange={setFilter} data={[{ value: "unread", label: "Yangi" }, { value: "all", label: "Barchasi" }]} /><Tooltip label="Barchasini o‘qilgan qilish"><ActionIcon color="teal" variant="light" radius={9} disabled={!unreadCount} aria-label="Barchasini o‘qilgan qilish" onClick={markAllRead}><IconChecks size={17} /></ActionIcon></Tooltip></Group>
            </Box>
            <ScrollArea.Autosize mah={340} px={10} py={10}>
                {visible.length ? <Stack spacing={8}>{visible.map((item, index) => <NotificationItem key={item.id} index={index} notification={item} onRead={markRead} compact />)}</Stack> : <EmptyState compact Icon={IconBellOff} title="Hammasi ko‘rib chiqildi" description="Yangi xabarlar shu yerda paydo bo‘ladi." />}
            </ScrollArea.Autosize>
            <Box px={12} py={10} sx={(theme) => ({ borderTop: `1px solid ${theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[2]}` })}><Button variant="subtle" color="teal" fullWidth size="xs" onClick={() => { setOpened(false); onOpenPage("notifications"); }}>Barcha bildirishnomalarni ochish</Button></Box>
        </Popover.Dropdown>
    </Popover>;
}

function BackgroundPicker({ onOpenPage }) {
    const { t } = useTranslation();
    const [opened, setOpened] = useState(false);

    return (
        <Popover opened={opened} onChange={setOpened} position="bottom-end" shadow="lg" width={300} withArrow radius={14}>
            <Popover.Target>
                <TopIcon label={t("Fon")} onClick={() => setOpened((o) => !o)}>
                    <IconPalette size={19} />
                </TopIcon>
            </Popover.Target>
            <Popover.Dropdown p={14} sx={{ maxWidth: "calc(100vw - 24px)" }}>
                <BackgroundGallery />
                <Button
                    variant="subtle"
                    size="xs"
                    fullWidth
                    mt={10}
                    onClick={() => {
                        setOpened(false);
                        onOpenPage("settings");
                    }}
                >
                    {t("Barcha ko'rinish sozlamalari")}
                </Button>
            </Popover.Dropdown>
        </Popover>
    );
}

function HelpMenu() {
    const { t } = useTranslation();
    const [shortcutsOpened, setShortcutsOpened] = useState(false);

    return (
        <>
            <Menu shadow="md" width={230} position="bottom-end">
                <Menu.Target>
                    <ActionIcon size={34} radius={10} variant="transparent" aria-label={t("Yordam")} sx={iconButton}>
                        <IconHelpCircle size={19} />
                    </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                    <Menu.Label>{t("Yordam")}</Menu.Label>
                    <Menu.Item icon={<IconKeyboard size={16} />} onClick={() => setShortcutsOpened(true)}>
                        {t("Tezkor tugmalar")}
                    </Menu.Item>
                    <Menu.Item
                        icon={<IconBook size={16} />}
                        onClick={() => feedback.show({ title: t("Qo'llanma"), message: t("Hujjatlar bo'limi tez orada qo'shiladi") })}
                    >
                        {t("Qo'llanma")}
                    </Menu.Item>
                    <Menu.Item
                        icon={<IconHeadset size={16} />}
                        onClick={() => feedback.show({ color: "teal", title: t("Qo'llab-quvvatlash"), message: "(71) 210-20-02 · info@xb.uz" })}
                    >
                        {t("Qo'llab-quvvatlash")}
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Label>Studiya v1.4.0</Menu.Label>
                </Menu.Dropdown>
            </Menu>
            <Modal opened={shortcutsOpened} onClose={() => setShortcutsOpened(false)} title={t("Tezkor tugmalar")} radius={14} centered>
                <Stack spacing={10}>
                    {SHORTCUTS.map((shortcut) => (
                        <Group key={shortcut.label} position="apart">
                            <Text fz={14}>{t(shortcut.label)}</Text>
                            <Group spacing={4}>
                                {shortcut.keys.map((key) => (
                                    <Kbd key={key}>{t(key)}</Kbd>
                                ))}
                            </Group>
                        </Group>
                    ))}
                </Stack>
            </Modal>
        </>
    );
}

function ProfileMenu({ onOpenPage }) {
    const { t } = useTranslation();
    const { user } = useAppState();
    const { logout, session } = useAuth();
    const [confirmOpened, setConfirmOpened] = useState(false);
    const fullName = `${user.firstName} ${user.lastName}`.trim();

    return (
        <>
            <Modal
                opened={confirmOpened}
                onClose={() => setConfirmOpened(false)}
                title={t("Tizimdan chiqish")}
                radius={14}
                size={380}
                centered
            >
                <Text fz={14} c="dimmed">
                    {t("Haqiqatan ham chiqmoqchimisiz? Saqlanmagan o'zgarishlar yo'qolishi mumkin.")}
                </Text>
                <Group position="right" mt={20}>
                    <Button variant="default" onClick={() => setConfirmOpened(false)}>
                        {t("Bekor qilish")}
                    </Button>
                    <Button color="red" leftIcon={<IconLogout size={16} />} onClick={logout}>
                        {t("Chiqish")}
                    </Button>
                </Group>
            </Modal>
            <Menu shadow="lg" radius={16} width={280} position="bottom-end">
                <Menu.Target>
                    <UnstyledButton className="profile-chip" aria-label={t("Profil")}>
                        <span className="profile-chip-avatar"><Avatar radius="xl" size={30} color={user.color} variant="filled">{initials(fullName)}</Avatar><i /></span>
                        <span className="profile-chip-info"><strong>{user.firstName}</strong><small>{session?.role === "admin" ? "Administrator" : "Kuzatuvchi"}</small></span>
                        <span className="profile-chip-chevron"><IconChevronDown size={13} stroke={2.2} /></span>
                    </UnstyledButton>
                </Menu.Target>
                <Menu.Dropdown>
                    <Group className="profile-menu-card" spacing={12} noWrap px={12} py={16}>
                        <Avatar radius={14} size={44} color={user.color} variant="filled">
                            {initials(fullName)}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                            <Text fz={14} fw={600} truncate>
                                {fullName}
                            </Text>
                            <Text fz={12} c="dimmed" truncate>
                                {user.email}
                            </Text>
                        </Box>
                    </Group>
                    <Menu.Divider />
                    <Menu.Item icon={<IconUser size={16} />} onClick={() => onOpenPage("profile")}>
                        {t("Mening profilim")}
                    </Menu.Item>
                    <Menu.Item icon={<IconSettings size={16} />} onClick={() => onOpenPage("settings")}>
                        {t("Sozlamalar")}
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item color="red" icon={<IconLogout size={16} />} onClick={() => setConfirmOpened(true)}>
                        {t("Chiqish")}
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>
        </>
    );
}

function TopBarActions({ darkMode, onToggleColorScheme, onOpenPage }) {
    const { t } = useTranslation();
    const [workspace, setWorkspace] = useState(WORKSPACES[0]);

    return (
        <Group className="header-dock" spacing={8} noWrap sx={{ flexShrink: 0, alignSelf: "center", paddingLeft: 12 }}>
            <Menu shadow="md" width={260} position="bottom-end">
                <Menu.Target>
                    <UnstyledButton className="workspace-switch" aria-label="Ish maydonini tanlash" sx={{ ...glass, height: 38, padding: "0 10px", borderRadius: 12 }}>
                        <Group spacing={8} noWrap>
                            <IconBuildingStore size={16} />
                            <Text className="workspace-switch-label" fz={11} fw={500} c="inherit" maw={145} truncate>
                                {workspace}
                            </Text>
                            <IconChevronDown size={14} />
                        </Group>
                    </UnstyledButton>
                </Menu.Target>
                <Menu.Dropdown>
                    <Menu.Label>{t("Kompaniyalar")}</Menu.Label>
                    {WORKSPACES.map((name) => (
                        <Menu.Item
                            key={name}
                            onClick={() => setWorkspace(name)}
                            rightSection={name === workspace ? <IconCheck size={14} /> : null}
                        >
                            {name}
                        </Menu.Item>
                    ))}
                </Menu.Dropdown>
            </Menu>

            <Group className="header-utilities" spacing={2} noWrap>
                <NotificationsPopover onOpenPage={onOpenPage} />
                <BackgroundPicker onOpenPage={onOpenPage} />
                <span className="header-help"><HelpMenu /></span>
                <TopIcon label={darkMode ? t("Yorug' rejim") : t("Tungi rejim")} onClick={onToggleColorScheme}>{darkMode ? <IconSun size={19} /> : <IconMoon size={19} />}</TopIcon>
            </Group>
            <ProfileMenu onOpenPage={onOpenPage} />
        </Group>
    );
}

function StudioShell({ onToggleColorScheme }) {
    const { t } = useTranslation();
    const theme = useMantineTheme();
    const darkMode = useDarkMode();
    const { background, customImage, railCollapsed: collapsed, setRailCollapsed } = useAppState();
    const { tabs, activeTab, openTab, openPage, openStudio, selectTab, closeTab, renameTab } = useTabs();
    const [dirtyMap, setDirtyMap] = useState({});
    const surface = darkMode ? theme.colors.dark[7] : "#FFFFFF";

    const activeId = activeTab.id;
    const firstTabActive = tabs[0]?.id === activeId;
    const activeNav = isStudioTab(activeTab) ? STUDIO_KEY : activeTab.page;

    const handleMetaChange = useCallback(
        (id, { name, dirty }) => {
            renameTab(id, name);
            setDirtyMap((m) => (m[id] === dirty ? m : { ...m, [id]: dirty }));
        },
        [renameTab]
    );

    const handleOpenPage = useCallback(
        (key) => (key === STUDIO_KEY ? openStudio() : openPage(key, PAGES[key]?.label || key)),
        [openPage, openStudio]
    );

    const handleClose = (id) => {
        if (dirtyMap[id] && !window.confirm(t("Saqlanmagan o'zgarishlar yo'qoladi. Yopilsinmi?"))) return;
        setDirtyMap(({ [id]: _removed, ...rest }) => rest);
        closeTab(id);
    };

    const renderTab = (tab) => {
        if (isStudioTab(tab)) {
            return (
                <StudioPage
                    tabId={tab.id}
                    storageKey={flowStorageKey(tab.id)}
                    initialFlow={FLOW_TEMPLATES[tab.template] || { ...EMPTY_FLOW, name: tab.name }}
                    active={tab.id === activeId}
                    onMetaChange={handleMetaChange}
                />
            );
        }
        const PageComponent = PAGE_COMPONENTS[tab.page];
        if (PageComponent) {
            return <PageComponent onOpenPage={handleOpenPage} onOpenStudio={openTab} onToggleColorScheme={onToggleColorScheme} />;
        }
        return <PlaceholderPage page={PAGES[tab.page] || PAGES.home} onOpenPage={handleOpenPage} />;
    };

    const collapseLabel = collapsed ? t("Menyuni yoyish") : t("Menyuni yig'ish");

    return (
        <Box
            sx={{
                height: "100dvh",
                display: "flex",
                background: resolveBackground(background, customImage, darkMode),
                transition: "background 300ms ease",
                overflow: "hidden",
            }}
        >
            <Stack
                spacing={2}
                align="center"
                sx={{
                    width: collapsed ? RAIL_WIDTH_COLLAPSED : RAIL_WIDTH,
                    "@media (max-width: 600px)": { width: 54 },
                    flexShrink: 0,
                    paddingTop: 12,
                    paddingBottom: 10,
                    transition: "width 150ms ease",
                }}
            >
                <UnstyledButton mb={10} aria-label={t("Bosh sahifa")} onClick={() => handleOpenPage("home")}>
                    <Image
                        src={logo}
                        alt="XB"
                        width={42}
                        height={42}
                        radius={12}
                        sx={{ filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.25))" }}
                    />
                </UnstyledButton>
                <Stack
                    spacing={2}
                    align="center"
                    sx={{
                        flex: 1,
                        minHeight: 0,
                        overflowY: "auto",
                        scrollbarWidth: "none",
                        "&::-webkit-scrollbar": { display: "none" },
                    }}
                >
                    {NAV_ITEMS.map(({ key, label, Icon, badge }) => (
                        <RailItem
                            key={key}
                            icon={<Icon size={22} stroke={1.5} />}
                            label={t(label)}
                            badge={badge}
                            collapsed={collapsed}
                            active={key === activeNav}
                            onClick={() => handleOpenPage(key)}
                        />
                    ))}
                </Stack>
                <Tooltip label={collapseLabel} position="right" withArrow>
                    <ActionIcon
                        size={36}
                        radius={10}
                        variant="transparent"
                        aria-label={collapseLabel}
                        onClick={() => setRailCollapsed((c) => !c)}
                        sx={{ ...iconButton, color: "rgba(255,255,255,0.85)" }}
                    >
                        {collapsed ? <IconLayoutSidebarLeftExpand size={20} /> : <IconLayoutSidebarLeftCollapse size={20} />}
                    </ActionIcon>
                </Tooltip>
            </Stack>

            <Box
                sx={{
                    flex: 1,
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                    paddingTop: 8,
                    paddingRight: 12,
                    paddingBottom: 12,
                }}
            >
                <Box className="shell-header" sx={{ display: "flex", alignItems: "flex-end", flexShrink: 0, minHeight: 48 }}>
                    <BrowserTabs
                        tabs={tabs}
                        activeId={activeId}
                        dirtyMap={dirtyMap}
                        surface={surface}
                        darkMode={darkMode}
                        onSelect={selectTab}
                        onClose={handleClose}
                        onOpen={openTab}
                    />
                    <TopBarActions darkMode={darkMode} onToggleColorScheme={onToggleColorScheme} onOpenPage={handleOpenPage} />
                </Box>

                <Box
                    component="main"
                    sx={{
                        flex: 1,
                        minHeight: 0,
                        borderRadius: 14,
                        borderTopLeftRadius: firstTabActive ? 0 : 14,
                        overflow: "hidden",
                        background: surface,
                        boxShadow: "0 18px 50px rgba(0, 0, 0, 0.3)",
                    }}
                >
                    {tabs.map((tab) => (
                        <Box key={tab.id} sx={{ height: "100%", display: tab.id === activeId ? "block" : "none" }}>
                            {renderTab(tab)}
                        </Box>
                    ))}
                </Box>
            </Box>
            <ChatWidget onOpenPage={handleOpenPage} />
        </Box>
    );
}

export default StudioShell;
