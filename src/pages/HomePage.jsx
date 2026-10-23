import React from "react";
import {
    Avatar,
    Badge,
    Box,
    Button,
    Group,
    Progress,
    SimpleGrid,
    Stack,
    Text,
    ThemeIcon,
    Tooltip,
    UnstyledButton,
} from "@mantine/core";
import {
    IconArrowDownRight,
    IconArrowUpRight,
    IconCalendarEvent,
    IconChevronRight,
    IconPlus,
    IconSitemap,
    IconBolt,
    IconListCheck,
    IconChartBar,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { useTranslation } from "../lib/i18n.js";
import { useAppState } from "../shell/AppState.jsx";
import PageLayout, { cardSx, usePageColors } from "./PageLayout.jsx";
import {
    ACTIVE_FLOWS,
    CALENDAR_EVENTS,
    DASHBOARD_STATS,
    INITIAL_TASKS,
    PRIORITIES,
    WEEKLY_RUNS,
    initials,
    personById,
} from "./mockData.js";

const MONTHS_SHORT = ["Yan", "Fev", "Mar", "Apr", "May", "Iyn", "Iyl", "Avg", "Sen", "Okt", "Noy", "Dek"];

const greeting = () => {
    const hour = dayjs().hour();
    if (hour < 12) return "Xayrli tong";
    if (hour < 18) return "Xayrli kun";
    return "Xayrli kech";
};

function SectionCard({ title, action, children }) {
    const colors = usePageColors();
    return (
        <Box p={18} sx={cardSx(colors)}>
            <Group position="apart" mb={14}>
                <Text fw={600} fz={15}>
                    {title}
                </Text>
                {action}
            </Group>
            {children}
        </Box>
    );
}

function WeeklyChart() {
    const { t } = useTranslation();
    const max = Math.max(...WEEKLY_RUNS.map((d) => d.success + d.failed));
    return (
        <Group spacing={14} align="flex-end" noWrap h={170} px={4}>
            {WEEKLY_RUNS.map((d) => (
                <Tooltip key={d.day} label={t("{{s}} muvaffaqiyatli, {{f}} xato", { s: d.success, f: d.failed })} withArrow>
                    <Stack spacing={6} align="center" sx={{ flex: 1, height: "100%", justifyContent: "flex-end" }}>
                        <Box
                            sx={{
                                width: "100%",
                                maxWidth: 34,
                                height: `${((d.success + d.failed) / max) * 100}%`,
                                display: "flex",
                                flexDirection: "column",
                                borderRadius: 8,
                                overflow: "hidden",
                            }}
                        >
                            <Box sx={{ flex: d.failed, background: "#FA5252" }} />
                            <Box sx={{ flex: d.success, background: "linear-gradient(180deg, #2BC47A, #0E8A4A)" }} />
                        </Box>
                        <Text fz={12} c="dimmed">
                            {d.day}
                        </Text>
                    </Stack>
                </Tooltip>
            ))}
        </Group>
    );
}

function HomePage({ onOpenPage, onOpenStudio }) {
    const { t } = useTranslation();
    const colors = usePageColors();
    const { user } = useAppState();
    const myTasks = INITIAL_TASKS.filter((task) => task.column !== "done").slice(0, 5);
    const upcoming = CALENDAR_EVENTS.filter((e) => dayjs(e.start).isAfter(dayjs().startOf("day")))
        .sort((a, b) => dayjs(a.start).diff(dayjs(b.start)))
        .slice(0, 4);

    return (
        <PageLayout
            title={`${t(greeting())}, ${user.firstName}!`}
            subtitle={dayjs().format("DD.MM.YYYY") + " · " + t("Bugungi ko'rsatkichlar va vazifalar")}
            actions={
                <>
                    <Button variant="default" leftIcon={<IconCalendarEvent size={16} />} onClick={() => onOpenPage("calendar")}>
                        {t("Kalendar")}
                    </Button>
                    <Button leftIcon={<IconPlus size={16} />} onClick={onOpenStudio}>
                        {t("Yangi jarayon")}
                    </Button>
                </>
            }
        >
            <SimpleGrid cols={4} spacing={16} breakpoints={[{ maxWidth: 1100, cols: 2 }]}>
                {DASHBOARD_STATS.map((stat, index) => (
                    <Box className="dashboard-stat" key={stat.label} p={20} sx={cardSx(colors)}>
                        <Group position="apart" mb={18}><ThemeIcon size={38} radius={12} variant="light" color={["teal", "blue", "orange", "grape"][index]}>{React.createElement([IconSitemap, IconBolt, IconListCheck, IconChartBar][index], { size: 20, stroke: 1.6 })}</ThemeIcon><Text fz={10} c="dimmed">BUGUN</Text></Group>
                        <Text fz={13} c="dimmed">
                            {t(stat.label)}
                        </Text>
                        <Group position="apart" align="flex-end" mt={8}>
                            <Text fz={30} fw={600} lh={1}>
                                {stat.value}
                            </Text>
                            <Badge
                                color={stat.up ? "teal" : "orange"}
                                variant="light"
                                leftSection={stat.up ? <IconArrowUpRight size={12} /> : <IconArrowDownRight size={12} />}
                            >
                                {stat.diff}
                            </Badge>
                        </Group>
                    </Box>
                ))}
            </SimpleGrid>

            <SimpleGrid cols={2} spacing={16} mt={16} breakpoints={[{ maxWidth: 1100, cols: 1 }]}>
                <SectionCard
                    title={t("Haftalik ishga tushirishlar")}
                    action={
                        <Group spacing={12}>
                            <Group spacing={6}>
                                <Box w={8} h={8} sx={{ borderRadius: 4, background: "#12B886" }} />
                                <Text fz={12} c="dimmed">{t("Muvaffaqiyatli")}</Text>
                            </Group>
                            <Group spacing={6}>
                                <Box w={8} h={8} sx={{ borderRadius: 4, background: "#FA5252" }} />
                                <Text fz={12} c="dimmed">{t("Xato")}</Text>
                            </Group>
                        </Group>
                    }
                >
                    <WeeklyChart />
                </SectionCard>

                <SectionCard
                    title={t("Faol jarayonlar")}
                    action={
                        <Button variant="subtle" size="xs" rightIcon={<IconChevronRight size={14} />} onClick={onOpenStudio}>
                            {t("Studiya")}
                        </Button>
                    }
                >
                    <Stack spacing={12}>
                        {ACTIVE_FLOWS.map((flow) => (
                            <Group key={flow.name} noWrap spacing={12}>
                                <ThemeIcon variant="light" radius={10} size={36}>
                                    <IconSitemap size={18} />
                                </ThemeIcon>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Group position="apart" noWrap>
                                        <Text fz={13} fw={500} truncate>
                                            {flow.name}
                                        </Text>
                                        <Text fz={12} c="dimmed" sx={{ flexShrink: 0 }}>
                                            v{flow.version} · {flow.runs} {t("marta")}
                                        </Text>
                                    </Group>
                                    <Progress
                                        mt={6}
                                        size={6}
                                        radius="xl"
                                        value={flow.success}
                                        color={flow.success > 95 ? "teal" : "yellow"}
                                    />
                                </Box>
                            </Group>
                        ))}
                    </Stack>
                </SectionCard>

                <SectionCard
                    title={t("Mening vazifalarim")}
                    action={
                        <Button variant="subtle" size="xs" rightIcon={<IconChevronRight size={14} />} onClick={() => onOpenPage("tasks")}>
                            {t("Barchasi")}
                        </Button>
                    }
                >
                    <Stack spacing={4}>
                        {myTasks.map((task) => {
                            const person = personById(task.assignee);
                            return (
                                <UnstyledButton
                                    key={task.id}
                                    onClick={() => onOpenPage("tasks")}
                                    sx={{ padding: "8px 10px", borderRadius: 10, "&:hover": { background: colors.muted } }}
                                >
                                    <Group noWrap spacing={12}>
                                        <Box w={4} h={30} sx={{ borderRadius: 2 }} bg={`${PRIORITIES[task.priority].color}.5`} />
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Text fz={13} fw={500} truncate>
                                                {task.title}
                                            </Text>
                                            <Text fz={12} c="dimmed">
                                                {task.label} · {dayjs(task.due).format("DD.MM, HH:mm")}
                                            </Text>
                                        </Box>
                                        <Avatar size={28} radius="xl" color={person.color}>
                                            {initials(person.name)}
                                        </Avatar>
                                    </Group>
                                </UnstyledButton>
                            );
                        })}
                    </Stack>
                </SectionCard>

                <SectionCard
                    title={t("Yaqin tadbirlar")}
                    action={
                        <Button variant="subtle" size="xs" rightIcon={<IconChevronRight size={14} />} onClick={() => onOpenPage("calendar")}>
                            {t("Kalendar")}
                        </Button>
                    }
                >
                    <Stack spacing={10}>
                        {upcoming.map((event) => (
                            <Group key={event.id} noWrap spacing={12}>
                                <Stack
                                    spacing={0}
                                    align="center"
                                    justify="center"
                                    w={48}
                                    h={48}
                                    sx={{ borderRadius: 12, background: colors.muted, flexShrink: 0 }}
                                >
                                    <Text fz={16} fw={600} lh={1.1}>
                                        {dayjs(event.start).format("DD")}
                                    </Text>
                                    <Text fz={10} c="dimmed" tt="uppercase">
                                        {t(MONTHS_SHORT[dayjs(event.start).month()])}
                                    </Text>
                                </Stack>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Text fz={13} fw={500} truncate>
                                        {event.title}
                                    </Text>
                                    <Text fz={12} c="dimmed">
                                        {dayjs(event.start).format("HH:mm")}
                                    </Text>
                                </Box>
                                <Box w={10} h={10} sx={{ borderRadius: 5, flexShrink: 0 }} bg={`${event.color}.5`} />
                            </Group>
                        ))}
                    </Stack>
                </SectionCard>
            </SimpleGrid>
        </PageLayout>
    );
}

export default HomePage;
