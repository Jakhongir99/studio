import React, { useEffect, useSyncExternalStore } from "react";
import { Box, Modal, Stack, Text, ThemeIcon, UnstyledButton } from "@mantine/core";
import { IconAlertTriangle, IconCheck, IconInfoCircle, IconX } from "@tabler/icons-react";
import { useReducedMotion } from "@mantine/hooks";
import { feedback } from "../lib/feedback.js";

function FeedbackContent({ item }) {
    const color = item.color || "blue";
    const Icon = color === "red" ? IconX : color === "orange" ? IconAlertTriangle : ["teal", "green"].includes(color) ? IconCheck : IconInfoCircle;
    const seconds = Math.max(1, Math.round(item.autoClose / 1000));

    useEffect(() => {
        if (item.autoClose === false) return;
        const timer = setTimeout(() => feedback.dismiss(item.id), item.autoClose);
        return () => clearTimeout(timer);
    }, [item.id, item.autoClose]);

    return (
        <UnstyledButton w="100%" onClick={() => feedback.dismiss(item.id)} aria-label="Oynani yopish" data-autofocus
            sx={{ borderRadius: 20, cursor: "pointer", "&:focus-visible": { outline: "2px solid rgba(34, 193, 114, 0.5)", outlineOffset: 2 } }}>
            <Stack align="center" spacing={16} px="lg" pt="lg" pb="md">
                <ThemeIcon className="feedback-result-icon" size={72} radius={24} color={color} variant="light"><Icon className="feedback-result-mark" size={34} stroke={1.7} /></ThemeIcon>
                <Box ta="center" aria-live="polite" sx={{ overflowWrap: "anywhere" }}>
                    <Text fw={600} fz={21} mb={6}>{item.title || "Bildirishnoma"}</Text>
                    {item.message && <Text c="dimmed" fz={14} lh={1.6}>{item.message}</Text>}
                </Box>
                {item.autoClose !== false && <Box w="100%" mt={4}>
                    <Box h={3} mb={10} sx={(theme) => ({ overflow: "hidden", borderRadius: 4, background: theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[1] })}>
                        <Box className="feedback-countdown" h="100%" sx={(theme) => ({ background: theme.colors[color]?.[6] || theme.colors.blue[6], transformOrigin: "left", animationDuration: `${item.autoClose}ms` })} />
                    </Box>
                    <Text ta="center" fz={11} c="dimmed">{seconds} soniyadan so‘ng yopiladi · yopish uchun bosing</Text>
                </Box>}
            </Stack>
        </UnstyledButton>
    );
}

export default function FeedbackModal() {
    const reducedMotion = useReducedMotion();
    const queue = useSyncExternalStore(feedback.subscribe, feedback.getSnapshot);
    const item = queue[0];
    return <Modal opened={!!item} onClose={() => item && feedback.dismiss(item.id)} centered size={380} radius={24}
        transitionProps={{ transition: "pop", duration: reducedMotion ? 0 : 240 }}
        padding={8} withCloseButton={false} title={item?.title || "Bildirishnoma"}
        styles={{ header: { position: "absolute", width: 1, height: 1, padding: 0, overflow: "hidden", clipPath: "inset(50%)" } }}
        overlayProps={{ opacity: 0.35, blur: 5 }} zIndex={1000}>
        {item && <FeedbackContent key={item.id} item={item} />}
    </Modal>;
}
