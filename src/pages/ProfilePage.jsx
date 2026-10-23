import React, { useState } from "react";
import {
    Avatar,
    Badge,
    Box,
    Button,
    ColorSwatch,
    Divider,
    Group,
    PasswordInput,
    SimpleGrid,
    Stack,
    Text,
    TextInput,
    ThemeIcon,
    Progress,
    useMantineTheme,
} from "@mantine/core";
import { feedback } from "../lib/feedback.js";
import { IconBriefcase, IconCheck, IconMail, IconPhone, IconUser, IconShieldCheck, IconDeviceDesktop, IconDeviceFloppy } from "@tabler/icons-react";
import { useTranslation } from "../lib/i18n.js";
import { useAppState } from "../shell/AppState.jsx";
import { useAuth } from "../auth/AuthProvider.jsx";
import PageLayout, { cardSx, usePageColors } from "./PageLayout.jsx";
import { DASHBOARD_STATS, initials } from "./mockData.js";

const AVATAR_COLORS = ["green", "teal", "blue", "indigo", "grape", "pink", "orange"];

function ProfilePage() {
    const { t } = useTranslation();
    const theme = useMantineTheme();
    const colors = usePageColors();
    const { user, setUser } = useAppState();
    const [form, setForm] = useState(user);
    const auth = useAuth();
    const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
    const [savingPassword, setSavingPassword] = useState(false);
    const fullName = `${user.firstName} ${user.lastName}`;
    const completeness = Math.round(["firstName", "lastName", "email", "phone", "position", "department"].filter((key) => String(form[key] || "").trim()).length / 6 * 100);
    const changed = JSON.stringify(form) !== JSON.stringify(user);
    const field = (key) => ({
        value: form[key],
        onChange: (e) => setForm({ ...form, [key]: e.currentTarget.value }),
    });

    const save = () => {
        setUser(form);
        feedback.show({ color: "teal", title: t("Saqlandi"), message: t("Profil ma'lumotlari yangilandi") });
    };

    const changePassword = async () => {
        if (passwords.next.length < 8) {
            feedback.show({ color: "red", title: t("Xatolik"), message: t("Parol kamida 8 belgidan iborat bo'lsin") });
            return;
        }
        if (passwords.next !== passwords.confirm) {
            feedback.show({ color: "red", title: t("Xatolik"), message: t("Parollar mos kelmadi") });
            return;
        }
        setSavingPassword(true);
        try {
            await auth.changePassword(passwords.current, passwords.next);
            setPasswords({ current: "", next: "", confirm: "" });
            feedback.show({ color: "teal", title: t("Parol o'zgartirildi"), message: t("Keyingi kirishda yangi paroldan foydalaning") });
        } catch (error) {
            feedback.show({ color: "red", title: t("Xatolik"), message: t(error.message) });
        } finally {
            setSavingPassword(false);
        }
    };

    return (
        <PageLayout title={t("Mening profilim")} subtitle={t("Hisobingizni o‘zingizga moslang")}
            actions={<><Badge color={changed ? "orange" : "teal"} variant="light">{changed ? "Saqlanmagan o‘zgarishlar" : "Barchasi saqlangan"}</Badge>
                <Button variant="default" disabled={!changed} onClick={() => setForm(user)}>{t("Bekor qilish")}</Button>
                <Button color="teal" leftIcon={<IconDeviceFloppy size={16} />} disabled={!changed} onClick={save}>{t("Saqlash")}</Button></>}>
            <Box className="profile-hero" sx={{ ...cardSx(colors), background: colors.darkMode ? "linear-gradient(115deg,#15372e,#1f2d2a)" : "linear-gradient(115deg,#eef8f1,#f8fbf6 70%)" }}>
                <Group spacing={20} noWrap className="profile-identity">
                    <Box className="profile-avatar-wrap">
                        <Avatar size={78} radius={26} color={form.color} variant="filled" className="profile-avatar">{initials(`${form.firstName} ${form.lastName}`)}</Avatar>
                        <span className="profile-online" aria-label="Faol sessiya"><IconCheck size={12} /></span>
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                        <Text fz={10} fw={600} c="teal" sx={{ letterSpacing: 2 }} mb={6}>SIZNING PROFILINGIZ</Text>
                        <Text fz={23} fw={600} lh={1.3} sx={{ overflowWrap: "anywhere" }}>{fullName}</Text>
                        <Text fz={12} c="dimmed" mt={5}>{user.position || user.email}</Text>
                        <Group spacing={8} mt={10}><Badge size="sm" color="teal" variant="light">{auth.session?.role === "admin" ? t("Administrator") : t("Kuzatuvchi")}</Badge><Text fz={11} c="dimmed">Xalq banki · Studio</Text></Group>
                    </Box>
                </Group>
                <Box className="profile-completion">
                    <Group position="apart" mb={8}><Text fz={12} fw={500}>Profil to‘liqligi</Text><Text fz={13} fw={600} c="teal">{completeness}%</Text></Group>
                    <Progress value={completeness} color="teal" size={5} radius="xl" />
                    <Text fz={11} c="dimmed" mt={10}>{completeness === 100 ? "Barcha ma’lumotlar to‘ldirilgan" : "Ma’lumotlaringizni to‘ldirib boring"}</Text>
                </Box>
            </Box>

            <Box className="profile-grid" mt={16}>
                <Box p={20} sx={cardSx(colors)}>
                    <Group spacing={12} mb={18}><ThemeIcon size={40} radius={13} color="teal" variant="light"><IconUser size={20} /></ThemeIcon><Box><Text fw={600}>{t("Shaxsiy ma'lumotlar")}</Text><Text fz={11} c="dimmed">Jamoangiz sizni yaxshiroq tanisin</Text></Box></Group>
                    <SimpleGrid cols={2} spacing={14} breakpoints={[{ maxWidth: 650, cols: 1 }]}>
                        <TextInput label={t("Ism")} {...field("firstName")} />
                        <TextInput label={t("Familiya")} {...field("lastName")} />
                        <TextInput label={t("Email")} icon={<IconMail size={15} />} {...field("email")} />
                        <TextInput label={t("Telefon")} icon={<IconPhone size={15} />} {...field("phone")} />
                        <TextInput label={t("Lavozim")} icon={<IconBriefcase size={15} />} {...field("position")} />
                        <TextInput label={t("Bo'lim")} {...field("department")} />
                    </SimpleGrid>
                    <Divider my={16} color={colors.border} />
                    <Group position="apart" spacing={16}>
                        <Box><Text fz={13} fw={500}>{t("Sizning rangingiz")}</Text><Text fz={11} c="dimmed" mt={3}>Profilingizga o‘ziga xoslik bering</Text></Box>
                        <Group spacing={10}>{AVATAR_COLORS.map((color) => <ColorSwatch key={color} component="button" type="button" size={27}
                            aria-label={`Avatar rangi: ${color}`} aria-pressed={form.color === color} className="profile-swatch"
                            color={theme.colors[color][6]} onClick={() => setForm({ ...form, color })}
                            sx={{ color: "#fff", cursor: "pointer", border: "none", outline: form.color === color ? `2px solid ${theme.colors[color][4]}` : "none", outlineOffset: 3 }}>
                            {form.color === color ? <IconCheck size={14} /> : null}
                        </ColorSwatch>)}</Group>
                    </Group>
                </Box>
                <Box p={20} sx={cardSx(colors)}>
                    <Group spacing={12} mb={18}><ThemeIcon size={40} radius={13} color="blue" variant="light"><IconShieldCheck size={20} /></ThemeIcon><Box><Text fw={600}>{t("Hisob xavfsizligi")}</Text><Text fz={11} c="dimmed">Parolingizni shu yerdan yangilang</Text></Box></Group>
                    <Stack spacing={12}>
                        <PasswordInput label={t("Joriy parol")} value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.currentTarget.value })} />
                        <SimpleGrid cols={2} spacing={12} breakpoints={[{ maxWidth: 1250, cols: 1 }]}>
                            <PasswordInput label={t("Yangi parol")} placeholder="Kamida 8 belgi" value={passwords.next} onChange={(e) => setPasswords({ ...passwords, next: e.currentTarget.value })} />
                            <PasswordInput label={t("Parolni tasdiqlash")} value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.currentTarget.value })} />
                        </SimpleGrid>
                        <Button variant="light" color="teal" mt={4} disabled={!passwords.current || !passwords.next || !passwords.confirm} loading={savingPassword} onClick={changePassword}>{t("Parolni yangilash")}</Button>
                    </Stack>
                    <Box mt={22} pt={18} sx={{ borderTop: `1px solid ${colors.border}` }}>
                        <Group spacing={10} noWrap><ThemeIcon variant="light" color="gray" radius={10} size={34}><IconDeviceDesktop size={18} /></ThemeIcon><Box><Text fz={12} fw={500}>Joriy sessiya</Text><Text fz={11} c="dimmed">{auth.session?.loggedInAt ? new Date(auth.session.loggedInAt).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Shu brauzer"}</Text></Box><Badge color="teal" size="sm" ml="auto">Faol</Badge></Group>
                    </Box>
                </Box>
            </Box>
            <SimpleGrid cols={4} spacing={16} mt={16} breakpoints={[{ maxWidth: 850, cols: 2 }]}>
                {DASHBOARD_STATS.map((stat, index) => <Box className="profile-stat" key={stat.label} p={16} sx={cardSx(colors)}>
                    <Text fz={10} c="dimmed" mb={4}>{t(stat.label)}</Text><Group position="apart"><Text fz={23} fw={600}>{stat.value}</Text><span className="mini-bars" aria-hidden="true">{[12,20,15,28,22,34].map((height,i) => <i key={i} style={{ height: height - index * 2, animationDelay: `${i*70}ms` }} />)}</span></Group>
                </Box>)}
            </SimpleGrid>
        </PageLayout>
    );
}

export default ProfilePage;
