import React, { useEffect, useRef, useState } from "react";
import { ActionIcon, Badge, Box, Button, Group, Stack, Text, Textarea, ThemeIcon, Tooltip, Transition, useMantineTheme } from "@mantine/core";
import { useReducedMotion, useWindowEvent } from "@mantine/hooks";
import { IconArrowUpRight, IconMessageCircle, IconSend, IconTrash, IconX } from "@tabler/icons-react";
import { useDarkMode } from "../lib/useDarkMode.js";

// Above page content and React Flow panels, below Mantine dropdowns (1000) and modals
export const CHAT_Z = 300;

const WELCOME = { id: "welcome", role: "assistant", text: "Salom! Studio bo‘limlari bo‘yicha yo‘l ko‘rsataman. Nimadan boshlaymiz?" };
const SUGGESTIONS = ["Jarayon qanday yaratiladi?", "Vazifalarim qayerda?", "Profilni o‘zgartirish"];
const replyFor = (text) => {
    const query = text.toLowerCase();
    if (/vazifa|task/.test(query)) return { text: "Vazifalar bo‘limida yangi vazifa yarating, ijrochini tanlang va kartani kerakli ustunga ko‘chiring.", page: "tasks", label: "Vazifalarni ochish" };
    if (/profil|ism|avatar|parol/.test(query)) return { text: "Profil sahifasida shaxsiy ma’lumot va avatar rangini o‘zgartiring. Yakunda “Saqlash” tugmasini bosing.", page: "profile", label: "Profilni ochish" };
    if (/kalendar|uchrashuv|taqvim/.test(query)) return { text: "Kalendar bo‘limida rejalashtirilgan uchrashuvlarni kunlar bo‘yicha ko‘rishingiz mumkin.", page: "calendar", label: "Kalendarni ochish" };
    if (/fon|rang|sozlama/.test(query)) return { text: "Sozlamalar orqali fon, rang rejimi va bildirishnoma parametrlarini o‘zingizga moslang.", page: "settings", label: "Sozlamalarni ochish" };
    if (/jarayon|studi|boshl/.test(query)) return { text: "Studiya bo‘limini oching. “+” orqali tugun qo‘shing, qadamlarni bog‘lang va jarayonni test rejimida sinab ko‘ring.", page: "studio", label: "Studiyani ochish" };
    return { text: "Bu demo yordamchi tayyor yo‘riqnomalarni ko‘rsatadi. Jarayon, vazifa, kalendar, profil yoki sozlamalar haqida so‘rang." };
};

export default function ChatWidget({ onOpenPage }) {
    const theme = useMantineTheme();
    const darkMode = useDarkMode();
    const reducedMotion = useReducedMotion();
    const [opened, setOpened] = useState(false);
    const [unread, setUnread] = useState(1);
    const [messages, setMessages] = useState([WELCOME]);
    const [draft, setDraft] = useState("");
    const [typing, setTyping] = useState(false);
    const timer = useRef(null);
    const busy = useRef(false);
    const sequence = useRef(0);
    const viewport = useRef(null);
    const openedRef = useRef(opened);
    openedRef.current = opened;

    const colors = {
        panel: darkMode ? theme.colors.dark[7] : "#FFFFFF",
        border: darkMode ? theme.colors.dark[4] : "#E3EAE6",
        header: darkMode ? "linear-gradient(135deg, #15382B, #10261E)" : "linear-gradient(135deg, #E9F6EF, #F6FBF8)",
        muted: darkMode ? theme.colors.dark[6] : "#F8FAF9",
    };

    useEffect(() => () => clearTimeout(timer.current), []);
    useEffect(() => {
        viewport.current?.scrollTo({ top: viewport.current.scrollHeight, behavior: reducedMotion ? "auto" : "smooth" });
    }, [messages, typing, opened, reducedMotion]);
    useWindowEvent("keydown", (event) => {
        if (event.key === "Escape" && openedRef.current) setOpened(false);
    });

    const toggle = () => {
        setOpened((value) => !value);
        setUnread(0);
    };

    const send = (text) => {
        const value = text.trim();
        if (!value || busy.current) return;
        busy.current = true;
        setDraft("");
        setMessages((list) => [...list, { id: `user-${++sequence.current}`, role: "user", text: value }]);
        setTyping(true);
        timer.current = setTimeout(() => {
            setMessages((list) => [...list, { id: `assistant-${++sequence.current}`, role: "assistant", ...replyFor(value) }]);
            setTyping(false);
            busy.current = false;
            if (!openedRef.current) setUnread((count) => count + 1);
        }, 800);
    };

    const clear = () => {
        clearTimeout(timer.current);
        busy.current = false;
        setTyping(false);
        setDraft("");
        setMessages([WELCOME]);
    };

    return (
        <>
            <Transition mounted={opened} transition="pop-bottom-right" duration={reducedMotion ? 0 : 200}>
                {(styles) => (
                    <Box
                        role="dialog"
                        aria-label="Studio yordamchi"
                        className={`chat-widget ${darkMode ? "chat-widget--dark" : ""}`}
                        style={styles}
                        sx={{
                            position: "fixed",
                            right: 24,
                            bottom: 92,
                            zIndex: CHAT_Z,
                            width: "min(380px, calc(100vw - 32px))",
                            height: "min(580px, calc(100dvh - 130px))",
                            display: "flex",
                            flexDirection: "column",
                            overflow: "hidden",
                            borderRadius: 20,
                            background: colors.panel,
                            border: `1px solid ${colors.border}`,
                            boxShadow: darkMode ? "0 24px 60px rgba(0,0,0,0.55)" : "0 24px 60px rgba(16, 40, 30, 0.22)",
                            "@media (max-width: 500px)": { right: 16, bottom: 84 },
                        }}
                    >
                        <Group position="apart" noWrap px={16} py={14} sx={{ background: colors.header, borderBottom: `1px solid ${colors.border}` }}>
                            <Group spacing={10} noWrap>
                                <ThemeIcon size={38} radius={12} color="teal" variant={darkMode ? "light" : "filled"}>
                                    <IconMessageCircle size={21} />
                                </ThemeIcon>
                                <Box>
                                    <Text fz={14} fw={600}>Studio yordamchi</Text>
                                    <Group spacing={6}>
                                        <Box w={7} h={7} sx={{ borderRadius: 4, background: "#2FB979" }} />
                                        <Text fz={11} c="dimmed">Onlayn · demo</Text>
                                    </Group>
                                </Box>
                            </Group>
                            <Group spacing={2} noWrap>
                                <Tooltip label="Suhbatni tozalash">
                                    <ActionIcon aria-label="Suhbatni tozalash" variant="subtle" color="gray" radius={10} onClick={clear}>
                                        <IconTrash size={16} />
                                    </ActionIcon>
                                </Tooltip>
                                <Tooltip label="Yopish">
                                    <ActionIcon aria-label="Chatni yopish" variant="subtle" color="gray" radius={10} onClick={() => setOpened(false)}>
                                        <IconX size={17} />
                                    </ActionIcon>
                                </Tooltip>
                            </Group>
                        </Group>

                        <Box ref={viewport} className="chat-thread" px={16} py={16} sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                            <Stack spacing={12}>
                                {messages.map((message) => (
                                    <Box key={message.id} className={`chat-message chat-message--${message.role}`}>
                                        <Text fz={9} fw={600} mb={4} c={message.role === "user" ? "inherit" : "teal"} sx={{ opacity: message.role === "user" ? 0.75 : 1 }}>
                                            {message.role === "user" ? "SIZ" : "STUDIO"}
                                        </Text>
                                        <Text fz={13} lh={1.6} sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                                            {message.text}
                                        </Text>
                                        {message.page ? (
                                            <Button
                                                mt={10}
                                                size="xs"
                                                variant="light"
                                                color="teal"
                                                rightIcon={<IconArrowUpRight size={14} />}
                                                onClick={() => {
                                                    onOpenPage(message.page);
                                                    setOpened(false);
                                                }}
                                            >
                                                {message.label}
                                            </Button>
                                        ) : null}
                                    </Box>
                                ))}
                                {typing ? (
                                    <div className="chat-typing" role="status" aria-label="Javob tayyorlanmoqda">
                                        <i /><i /><i /><span>Javob tayyorlanmoqda</span>
                                    </div>
                                ) : null}
                            </Stack>
                        </Box>

                        <Box px={14} pt={10} pb={12} sx={{ borderTop: `1px solid ${colors.border}`, background: colors.muted }}>
                            <Group spacing={6} mb={10} noWrap sx={{ overflowX: "auto", scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } }}>
                                {SUGGESTIONS.map((text) => (
                                    <Button key={text} variant="default" size="xs" radius="xl" disabled={typing} onClick={() => send(text)} sx={{ flexShrink: 0 }}>
                                        {text}
                                    </Button>
                                ))}
                            </Group>
                            <form
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    send(draft);
                                }}
                            >
                                <Group align="flex-end" spacing={8} noWrap>
                                    <Textarea
                                        aria-label="Yordamchiga xabar"
                                        placeholder="Savolingizni yozing..."
                                        value={draft}
                                        maxLength={1000}
                                        autosize
                                        minRows={1}
                                        maxRows={4}
                                        radius={14}
                                        sx={{ flex: 1 }}
                                        onChange={(event) => setDraft(event.currentTarget.value)}
                                        onKeyDown={(event) => {
                                            if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                                                event.preventDefault();
                                                send(draft);
                                            }
                                        }}
                                    />
                                    <ActionIcon aria-label="Xabarni yuborish" type="submit" size={38} radius={12} color="teal" variant="filled" disabled={!draft.trim() || typing}>
                                        <IconSend size={18} />
                                    </ActionIcon>
                                </Group>
                            </form>
                            <Text ta="center" c="dimmed" fz={10} mt={8}>
                                Mahalliy demo · Xabarlar tashqi xizmatga yuborilmaydi
                            </Text>
                        </Box>
                    </Box>
                )}
            </Transition>

            <Tooltip label={opened ? "Chatni yopish" : "Studio yordamchi"} position="left" withArrow>
                <ActionIcon
                    className={opened ? "chat-fab" : "chat-fab chat-fab--idle"}
                    aria-label={opened ? "Chatni yopish" : "Studio yordamchi"}
                    aria-expanded={opened}
                    onClick={toggle}
                    size={56}
                    radius={28}
                    variant="filled"
                    sx={{
                        position: "fixed",
                        right: 24,
                        bottom: 24,
                        zIndex: CHAT_Z,
                        color: "#FFFFFF",
                        background: opened
                            ? darkMode ? "#2C2E33" : "#192F28"
                            : "radial-gradient(circle at 30% 25%, #3BDB8C 0%, #16A35F 45%, #0B6B3D 100%)",
                        boxShadow: opened
                            ? "0 8px 22px rgba(0, 0, 0, 0.3)"
                            : "0 10px 26px rgba(11, 122, 69, 0.42), inset 0 1px 0 rgba(255, 255, 255, 0.35)",
                        transition: "background 200ms ease, box-shadow 200ms ease",
                        "&:hover": {
                            background: opened
                                ? darkMode ? "#373A40" : "#21403A"
                                : "radial-gradient(circle at 30% 25%, #4AE89A 0%, #1BB56A 45%, #0E7A46 100%)",
                            boxShadow: opened ? "0 10px 26px rgba(0, 0, 0, 0.35)" : "0 14px 32px rgba(11, 122, 69, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.35)",
                        },
                        "@media (max-width: 500px)": { right: 16, bottom: 16, width: 50, height: 50, minWidth: 50, minHeight: 50 },
                    }}
                >
                    <span className="chat-fab-icon">
                        {opened ? <IconX size={24} stroke={2.2} /> : <IconMessageCircle size={26} stroke={1.9} />}
                    </span>
                    {!opened && unread ? (
                        <span className={darkMode ? "chat-fab-badge chat-fab-badge--dark" : "chat-fab-badge"}>{unread > 9 ? "9+" : unread}</span>
                    ) : null}
                </ActionIcon>
            </Tooltip>
        </>
    );
}
