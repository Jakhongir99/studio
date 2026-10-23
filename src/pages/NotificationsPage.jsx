import React, { useEffect, useRef, useState } from "react";
import { ActionIcon, Badge, Box, Button, Group, SimpleGrid, SegmentedControl, Stack, Text, ThemeIcon, Tooltip, UnstyledButton } from "@mantine/core";
import {
    IconAlertTriangle,
    IconAt,
    IconBellOff,
    IconBell,
    IconChecks,
    IconCircleCheck,
    IconInfoCircle,
    IconListCheck,
    IconX,
} from "@tabler/icons-react";
import EmptyState from "../components/EmptyState.jsx";
import dayjs from "dayjs";
import { useTranslation } from "../lib/i18n.js";
import { useAppState } from "../shell/AppState.jsx";
import PageLayout, { cardSx, usePageColors } from "./PageLayout.jsx";
import { NOTIFICATION_TYPES } from "./mockData.js";

const TYPE_ICONS = {
    run_failed: IconAlertTriangle,
    run_success: IconCircleCheck,
    task: IconListCheck,
    mention: IconAt,
    system: IconInfoCircle,
};

export const timeAgo = (iso) => {
    const minutes = dayjs().diff(dayjs(iso), "minute");
    if (minutes < 1) return "hozirgina";
    if (minutes < 60) return `${minutes} daqiqa oldin`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} soat oldin`;
    return dayjs(iso).format("DD.MM.YYYY HH:mm");
};

export function NotificationItem({ notification, onRead, onRemove, compact, index = 0 }) {
    const { t } = useTranslation();
    const colors = usePageColors();
    const type = NOTIFICATION_TYPES[notification.type];
    const Icon = TYPE_ICONS[notification.type];

    const [leaving, setLeaving] = useState(false);
    const removalTimer = useRef(null);
    useEffect(() => () => clearTimeout(removalTimer.current), []);

    return (
        <Box className={`notification-row ${leaving ? "notification-row--leaving" : ""}`}
            style={{ "--row-delay": `${Math.min(index, 6) * 45}ms` }}
            sx={{ display: "flex", alignItems: "center", gap: 8, borderRadius: 14,
                border: `1px solid ${notification.read ? colors.border : colors.darkMode ? "#264e43" : "#dcece3"}`,
                background: notification.read ? colors.card : colors.darkMode ? "#172d26" : "#f3faf5",
                "&:hover": { borderColor: colors.darkMode ? "#557465" : "#bfd8c8" } }}>
            <UnstyledButton onClick={() => onRead(notification.id)} disabled={leaving}
                aria-label={`${notification.title}${notification.read ? "" : ", o‘qilgan deb belgilash"}`}
                sx={{ display: "flex", alignItems: "flex-start", gap: compact ? 10 : 16, flex: 1, minWidth: 0, padding: compact ? 12 : 20, borderRadius: 14 }}>
                <ThemeIcon size={compact ? 34 : 44} radius={14} variant="light" color={type.color} sx={{ flexShrink: 0 }}><Icon size={compact ? 17 : 21} /></ThemeIcon>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Group position="apart" noWrap spacing={8}>
                        <Text fz={compact ? 12 : 13} fw={notification.read ? 500 : 600} lh={1.5} lineClamp={compact ? 2 : undefined}>{notification.title}</Text>
                        {!notification.read && <span className="notification-unread-dot" />}
                    </Group>
                    <Text fz={12} c="dimmed" mt={5} lh={1.6} lineClamp={compact ? 2 : undefined}>{notification.body}</Text>
                    <Group spacing={10} mt={10}><Text fz={10} c="dimmed">{t(timeAgo(notification.createdAt))}</Text>
                        {!compact && <Badge size="xs" variant="light" color={type.color}>{t(type.label)}</Badge>}
                        {!compact && notification.read && <Text fz={10} c="teal">O‘qilgan</Text>}
                    </Group>
                </Box>
            </UnstyledButton>
            {onRemove && <Tooltip label={t("O'chirish")} withArrow><ActionIcon aria-label={t("Bildirishnomani o‘chirish")} disabled={leaving} size={30} mr={12} radius="xl" variant="subtle" color="gray"
                onClick={() => { setLeaving(true); removalTimer.current = setTimeout(() => onRemove(notification.id), 200); }}><IconX size={15} /></ActionIcon></Tooltip>}
        </Box>
    );
}

function NotificationsPage() {
    const { t } = useTranslation();
    const colors = usePageColors();
    const { notifications, unreadCount, markRead, markAllRead, removeNotification } = useAppState();
    const [filter, setFilter] = useState("all");
    const list = filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

    return (
        <PageLayout
            title={t("Bildirishnomalar")}
            subtitle={t("{{count}} ta o'qilmagan", { count: unreadCount })}
            actions={
                <>
                    <SegmentedControl
                        value={filter}
                        onChange={setFilter}
                        data={[
                            { value: "all", label: t("Barchasi") },
                            { value: "unread", label: t("O'qilmagan") },
                        ]}
                    />
                    <Button variant="default" leftIcon={<IconChecks size={16} />} onClick={markAllRead} disabled={!unreadCount}>
                        {t("Barchasini o'qilgan qilish")}
                    </Button>
                </>
            }
        >
            <SimpleGrid cols={3} spacing={16} mb={22} breakpoints={[{ maxWidth: 650, cols: 1 }]}>
                {[{ label: "Barcha xabarlar", value: notifications.length, Icon: IconBell, color: "blue" }, { label: "E’tiboringizni kutmoqda", value: unreadCount, Icon: IconAt, color: "orange" }, { label: "O‘qilgan", value: notifications.length - unreadCount, Icon: IconChecks, color: "teal" }].map(({ label, value, Icon, color }) => <Box key={label} p={18} sx={cardSx(colors)}><Group spacing={14}><ThemeIcon variant="light" color={color} radius={14} size={44}><Icon size={22} /></ThemeIcon><Box><Text fz={11} c="dimmed">{label}</Text><Text fz={25} fw={600}>{value}</Text></Box></Group></Box>)}
            </SimpleGrid>
            <Group position="apart" mb={14}><Text fz={13} fw={600}>{filter === "unread" ? "O‘qilmagan xabarlar" : "So‘nggi yangiliklar"}</Text><Text fz={11} c="dimmed">Xabarni bosib, o‘qilgan deb belgilang</Text></Group>
            <Box>
                {list.length ? (
                    <SimpleGrid cols={2} spacing={12} breakpoints={[{ maxWidth: 1100, cols: 1 }]}>
                        {list.map((n, index) => (
                            <NotificationItem index={index} key={n.id} notification={n} onRead={markRead} onRemove={removeNotification} />
                        ))}
                    </SimpleGrid>
                ) : (
                    <EmptyState Icon={IconBellOff} badge="BARCHASI JOYIDA" title={filter === "unread" ? "Hammasidan xabardorsiz" : "Hozircha xabarlar yo‘q"}
                        description={filter === "unread" ? "Barcha yangiliklarni ko‘rib chiqdingiz. Yangi xabarlar shu yerda paydo bo‘ladi." : "Jarayonlar va vazifalaringizga oid yangiliklarni shu yerda topasiz."}
                        actions={filter === "unread" && <Button variant="light" color="teal" onClick={() => setFilter("all")}>Barcha xabarlarni ko‘rish</Button>} />
                )}
            </Box>
        </PageLayout>
    );
}

export default NotificationsPage;
