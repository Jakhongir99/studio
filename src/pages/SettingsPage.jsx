import React, { useState } from "react";
import {
    Badge,
    Box,
    Button,
    Divider,
    Group,
    NavLink,
    SegmentedControl,
    Select,
    Stack,
    Switch,
    Text,
    ThemeIcon,
} from "@mantine/core";
import { feedback } from "../lib/feedback.js";
import {
    IconBell,
    IconDeviceDesktop,
    IconDeviceMobile,
    IconLanguage,
    IconLogout,
    IconPalette,
    IconShieldLock,
} from "@tabler/icons-react";
import { useTranslation } from "../lib/i18n.js";
import { useDarkMode } from "../lib/useDarkMode.js";
import { useAppState } from "../shell/AppState.jsx";
import BackgroundGallery from "../shell/BackgroundGallery.jsx";
import PageLayout, { cardSx, usePageColors } from "./PageLayout.jsx";

const SECTIONS = [
    { key: "appearance", label: "Ko'rinish", Icon: IconPalette },
    { key: "notifications", label: "Bildirishnomalar", Icon: IconBell },
    { key: "language", label: "Til va hudud", Icon: IconLanguage },
    { key: "security", label: "Xavfsizlik", Icon: IconShieldLock },
];

const SESSIONS = [
    { id: "s1", device: "Chrome · Ubuntu", place: "Toshkent", time: "Hozir faol", current: true, Icon: IconDeviceDesktop },
    { id: "s2", device: "Safari · iPhone 15", place: "Toshkent", time: "2 soat oldin", Icon: IconDeviceMobile },
    { id: "s3", device: "Edge · Windows 11", place: "Samarqand", time: "3 kun oldin", Icon: IconDeviceDesktop },
];

function SettingRow({ title, description, children }) {
    return (
        <Box py={14} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
            <Box sx={{ minWidth: 0, flex: 1 }}>
                <Text fz={14} fw={500}>
                    {title}
                </Text>
                {description ? (
                    <Text fz={12} c="dimmed" mt={2}>
                        {description}
                    </Text>
                ) : null}
            </Box>
            <Box sx={{ flexShrink: 0 }}>{children}</Box>
        </Box>
    );
}

function Section({ title, description, children }) {
    const colors = usePageColors();
    return (
        <Box p={22} sx={cardSx(colors)}>
            <Text fw={600} fz={16}>
                {title}
            </Text>
            {description ? (
                <Text fz={13} c="dimmed" mt={2} mb={8}>
                    {description}
                </Text>
            ) : null}
            {children}
        </Box>
    );
}

function SettingsPage({ onToggleColorScheme }) {
    const { t } = useTranslation();
    const colors = usePageColors();
    const darkMode = useDarkMode();
    const { preferences, setPreferences, railCollapsed, setRailCollapsed } = useAppState();
    const [section, setSection] = useState("appearance");
    const [sessions, setSessions] = useState(SESSIONS);
    const pref = (key) => ({
        checked: !!preferences[key],
        onChange: (e) => setPreferences({ ...preferences, [key]: e.currentTarget.checked }),
    });
    const divider = <Divider color={colors.border} />;

    return (
        <PageLayout title={t("Sozlamalar")} subtitle={t("Ilova ko'rinishi, bildirishnomalar va xavfsizlik")}>
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 20, "@media (max-width: 800px)": { flexDirection: "column" } }}>
                <Box p={6} w={230} sx={{ ...cardSx(colors), flexShrink: 0, position: "sticky", top: 0, "@media (max-width: 800px)": { width: "100%", position: "static" } }}>
                    {SECTIONS.map(({ key, label, Icon }) => (
                        <NavLink
                            key={key}
                            label={t(label)}
                            icon={<Icon size={18} stroke={1.6} />}
                            active={section === key}
                            onClick={() => setSection(key)}
                            sx={{ borderRadius: 8 }}
                        />
                    ))}
                </Box>

                <Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>
                    {section === "appearance" ? (
                        <Stack spacing={16}>
                            <Section title={t("Mavzu")}>
                                <SettingRow title={t("Rang rejimi")} description={t("Yorug' yoki tungi interfeys")}>
                                    <SegmentedControl
                                        value={darkMode ? "dark" : "light"}
                                        onChange={(value) => (value === "dark") !== darkMode && onToggleColorScheme()}
                                        data={[
                                            { value: "light", label: t("Yorug'") },
                                            { value: "dark", label: t("Tungi") },
                                        ]}
                                    />
                                </SettingRow>
                                {divider}
                                <SettingRow title={t("Ixcham menyu")} description={t("Chap menyuda faqat ikonkalar ko'rsatiladi")}>
                                    <Switch
                                        checked={railCollapsed}
                                        onChange={(e) => setRailCollapsed(e.currentTarget.checked)}
                                    />
                                </SettingRow>
                            </Section>
                            <Section
                                title={t("Fon")}
                                description={t("Rang, tayyor rasm yoki o'zingizning rasmingizni tanlang (JPG, PNG, WebP)")}
                            >
                                <Box mt={10}>
                                    <BackgroundGallery cols={4} swatchHeight={72} />
                                </Box>
                            </Section>
                        </Stack>
                    ) : null}

                    {section === "notifications" ? (
                        <Section title={t("Bildirishnomalar")} description={t("Qaysi hodisalar haqida xabar olishni tanlang")}>
                            <SettingRow title={t("Jarayon xatolari")} description={t("Ishga tushirish xato bilan tugaganda")}>
                                <Switch {...pref("notifyRunFailed")} />
                            </SettingRow>
                            {divider}
                            <SettingRow title={t("Muvaffaqiyatli ishga tushirishlar")} description={t("Har bir yakunlangan jarayon haqida")}>
                                <Switch {...pref("notifyRunSuccess")} />
                            </SettingRow>
                            {divider}
                            <SettingRow title={t("Vazifalar")} description={t("Sizga vazifa biriktirilganda yoki muddat yaqinlashganda")}>
                                <Switch {...pref("notifyTasks")} />
                            </SettingRow>
                            {divider}
                            <SettingRow title={t("Eslatmalar")} description={t("Kimdir sizni @ bilan eslatganda")}>
                                <Switch {...pref("notifyMentions")} />
                            </SettingRow>
                            {divider}
                            <SettingRow title={t("Ovozli signal")}>
                                <Switch {...pref("sound")} />
                            </SettingRow>
                            {divider}
                            <SettingRow title={t("Email dayjest")} description={t("Qisqacha xulosa pochtangizga yuboriladi")}>
                                <Select
                                    w={170}
                                    value={preferences.emailDigest}
                                    onChange={(emailDigest) => setPreferences({ ...preferences, emailDigest })}
                                    data={[
                                        { value: "off", label: t("O'chirilgan") },
                                        { value: "daily", label: t("Har kuni") },
                                        { value: "weekly", label: t("Har hafta") },
                                    ]}
                                />
                            </SettingRow>
                        </Section>
                    ) : null}

                    {section === "language" ? (
                        <Section title={t("Til va hudud")}>
                            <SettingRow title={t("Interfeys tili")}>
                                <Select
                                    w={200}
                                    value={preferences.language}
                                    onChange={(language) => {
                                        setPreferences({ ...preferences, language });
                                        feedback.show({
                                            color: "blue",
                                            title: t("Til saqlandi"),
                                            message: t("Tarjimalar keyingi versiyada qo'shiladi"),
                                        });
                                    }}
                                    data={[
                                        { value: "uz", label: "O'zbekcha" },
                                        { value: "uz_cyrl", label: "Ўзбекча" },
                                        { value: "ru", label: "Русский" },
                                        { value: "en", label: "English" },
                                    ]}
                                />
                            </SettingRow>
                            {divider}
                            <SettingRow title={t("Vaqt mintaqasi")}>
                                <Select w={200} defaultValue="tashkent" data={[{ value: "tashkent", label: "Asia/Tashkent (UTC+5)" }]} />
                            </SettingRow>
                            {divider}
                            <SettingRow title={t("Sana formati")}>
                                <Select
                                    w={200}
                                    defaultValue="dmy"
                                    data={[
                                        { value: "dmy", label: "31.12.2026" },
                                        { value: "ymd", label: "2026-12-31" },
                                    ]}
                                />
                            </SettingRow>
                        </Section>
                    ) : null}

                    {section === "security" ? (
                        <Stack spacing={16}>
                            <Section title={t("Ikki bosqichli autentifikatsiya")}>
                                <SettingRow
                                    title={t("SMS orqali tasdiqlash")}
                                    description={t("Har kirishda telefoningizga kod yuboriladi")}
                                >
                                    <Switch {...pref("twoFactor")} />
                                </SettingRow>
                            </Section>
                            <Section title={t("Faol seanslar")} description={t("Hisobingizga kirilgan qurilmalar")}>
                                <Stack spacing={0} mt={6}>
                                    {sessions.map((session, index) => (
                                        <Box key={session.id}>
                                            {index ? divider : null}
                                            <Group position="apart" py={12} noWrap>
                                                <Group spacing={12} noWrap>
                                                    <ThemeIcon variant="light" color="gray" radius={10} size={38}>
                                                        <session.Icon size={19} />
                                                    </ThemeIcon>
                                                    <Box>
                                                        <Group spacing={8}>
                                                            <Text fz={14} fw={500}>
                                                                {session.device}
                                                            </Text>
                                                            {session.current ? (
                                                                <Badge size="xs" color="green" variant="light">
                                                                    {t("Joriy")}
                                                                </Badge>
                                                            ) : null}
                                                        </Group>
                                                        <Text fz={12} c="dimmed">
                                                            {session.place} · {t(session.time)}
                                                        </Text>
                                                    </Box>
                                                </Group>
                                                {!session.current ? (
                                                    <Button
                                                        variant="subtle"
                                                        color="red"
                                                        size="xs"
                                                        leftIcon={<IconLogout size={14} />}
                                                        onClick={() => setSessions((list) => list.filter((s) => s.id !== session.id))}
                                                    >
                                                        {t("Tugatish")}
                                                    </Button>
                                                ) : null}
                                            </Group>
                                        </Box>
                                    ))}
                                </Stack>
                            </Section>
                        </Stack>
                    ) : null}
                </Box>
            </Box>
        </PageLayout>
    );
}

export default SettingsPage;
