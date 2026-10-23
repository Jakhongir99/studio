import React, { useState } from "react";
import { ActionIcon, Box, Button, Group, Stack, Text } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useTranslation } from "../lib/i18n.js";
import PageLayout, { cardSx, usePageColors } from "./PageLayout.jsx";
import { CALENDAR_EVENTS } from "./mockData.js";

const WEEKDAYS = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];
const MONTHS = [
    "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
    "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr",
];

// Monday-first grid covering the whole month
const monthGrid = (month) => {
    const start = month.startOf("month");
    const offset = (start.day() + 6) % 7;
    const first = start.subtract(offset, "day");
    const weeks = Math.ceil((offset + month.daysInMonth()) / 7);
    return Array.from({ length: weeks * 7 }, (_, i) => first.add(i, "day"));
};

function CalendarPage() {
    const { t } = useTranslation();
    const colors = usePageColors();
    const [month, setMonth] = useState(() => dayjs().startOf("month"));
    const today = dayjs();
    const days = monthGrid(month);

    return (
        <PageLayout
            title={t("Kalendar")}
            subtitle={t("Yig'ilishlar, muddatlar va tadbirlar")}
            actions={
                <>
                    <Button variant="default" onClick={() => setMonth(dayjs().startOf("month"))}>
                        {t("Bugun")}
                    </Button>
                    <ActionIcon size={36} variant="default" radius={8} onClick={() => setMonth((m) => m.subtract(1, "month"))}>
                        <IconChevronLeft size={18} />
                    </ActionIcon>
                    <Text fw={600} w={140} ta="center">
                        {t(MONTHS[month.month()])} {month.year()}
                    </Text>
                    <ActionIcon size={36} variant="default" radius={8} onClick={() => setMonth((m) => m.add(1, "month"))}>
                        <IconChevronRight size={18} />
                    </ActionIcon>
                </>
            }
        >
            <Box sx={{ ...cardSx(colors), overflow: "hidden" }}>
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: `1px solid ${colors.border}` }}>
                    {WEEKDAYS.map((day) => (
                        <Text key={day} fz={12} fw={600} c="dimmed" ta="center" py={10}>
                            {t(day)}
                        </Text>
                    ))}
                </Box>
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
                    {days.map((day, index) => {
                        const inMonth = day.month() === month.month();
                        const isToday = day.isSame(today, "day");
                        const events = CALENDAR_EVENTS.filter((e) => dayjs(e.start).isSame(day, "day"));
                        return (
                            <Box
                                key={day.toISOString()}
                                p={8}
                                sx={{
                                    minHeight: 112,
                                    borderRight: index % 7 === 6 ? "none" : `1px solid ${colors.border}`,
                                    borderBottom: `1px solid ${colors.border}`,
                                    background: inMonth ? "transparent" : colors.muted,
                                }}
                            >
                                <Text
                                    fz={12}
                                    fw={isToday ? 700 : 500}
                                    c={isToday ? "white" : inMonth ? undefined : "dimmed"}
                                    w={24}
                                    h={24}
                                    ta="center"
                                    lh="24px"
                                    sx={{ borderRadius: 12, background: isToday ? "#228BE6" : "transparent" }}
                                >
                                    {day.date()}
                                </Text>
                                <Stack spacing={4} mt={6}>
                                    {events.map((event) => (
                                        <Box
                                            key={event.id}
                                            px={6}
                                            py={3}
                                            sx={(theme) => ({
                                                borderRadius: 6,
                                                borderLeft: `3px solid ${theme.colors[event.color][5]}`,
                                                background: theme.fn.rgba(theme.colors[event.color][5], 0.12),
                                            })}
                                        >
                                            <Text fz={11} fw={500} truncate>
                                                {dayjs(event.start).format("HH:mm")} {event.title}
                                            </Text>
                                        </Box>
                                    ))}
                                </Stack>
                            </Box>
                        );
                    })}
                </Box>
            </Box>
        </PageLayout>
    );
}

export default CalendarPage;
