import EmptyState from "../components/EmptyState.jsx";
import React, { useState } from "react";
import {
    ActionIcon,
    Avatar,
    Badge,
    Box,
    Button,
    Group,
    Menu,
    Modal,
    SegmentedControl,
    Select,
    Stack,
    Text,
    TextInput,
    Tooltip,
} from "@mantine/core";
import { feedback } from "../lib/feedback.js";
import { IconCalendar, IconDots, IconPlus, IconSearch, IconTrash } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useTranslation } from "../lib/i18n.js";
import PageLayout, { cardSx, usePageColors } from "./PageLayout.jsx";
import { INITIAL_TASKS, PEOPLE, PRIORITIES, TASK_COLUMNS, initials, personById } from "./mockData.js";

const EMPTY_DRAFT = { title: "", column: "new", priority: "medium", assignee: "ja", label: "" };

function TaskCard({ task, onMove, onDelete }) {
    const { t } = useTranslation();
    const colors = usePageColors();
    const person = personById(task.assignee);
    const priority = PRIORITIES[task.priority];
    const overdue = task.column !== "done" && dayjs(task.due).isBefore(dayjs());

    return (
        <Box
            draggable
            onDragStart={(event) => event.dataTransfer.setData("text/plain", task.id)}
            p={12}
            sx={{
                ...cardSx(colors),
                borderRadius: 12,
                cursor: "grab",
                transition: "box-shadow 120ms ease, transform 120ms ease",
                "&:hover": { boxShadow: "0 6px 16px rgba(16, 24, 40, 0.08)" },
                "&:active": { cursor: "grabbing" },
            }}
        >
            <Group position="apart" noWrap align="flex-start" spacing={6}>
                <Text fz={13} fw={500} lh={1.4} sx={{ flex: 1 }}>
                    {task.title}
                </Text>
                <Menu shadow="md" width={190} position="bottom-end" withinPortal>
                    <Menu.Target>
                        <ActionIcon size={24} radius={6} variant="subtle" color="gray" aria-label={t("Amallar")}>
                            <IconDots size={15} />
                        </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Label>{t("Ko'chirish")}</Menu.Label>
                        {TASK_COLUMNS.filter((c) => c.key !== task.column).map((column) => (
                            <Menu.Item key={column.key} onClick={() => onMove(task.id, column.key)}>
                                {t(column.label)}
                            </Menu.Item>
                        ))}
                        <Menu.Divider />
                        <Menu.Item color="red" icon={<IconTrash size={14} />} onClick={() => onDelete(task.id)}>
                            {t("O'chirish")}
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </Group>
            <Group spacing={6} mt={8}>
                <Badge size="sm" radius="sm" variant="light" color={priority.color}>
                    {t(priority.label)}
                </Badge>
                {task.label ? (
                    <Badge size="sm" radius="sm" variant="outline" color="gray">
                        {task.label}
                    </Badge>
                ) : null}
            </Group>
            <Group position="apart" mt={10}>
                <Group spacing={4} c={overdue ? "red" : "dimmed"}>
                    <IconCalendar size={13} />
                    <Text fz={12} c="inherit">
                        {dayjs(task.due).format("DD.MM, HH:mm")}
                    </Text>
                </Group>
                <Tooltip label={person.name} withArrow>
                    <Avatar size={24} radius="xl" color={person.color}>
                        {initials(person.name)}
                    </Avatar>
                </Tooltip>
            </Group>
        </Box>
    );
}

function TasksPage() {
    const { t } = useTranslation();
    const colors = usePageColors();
    const [tasks, setTasks] = useState(INITIAL_TASKS);
    const [query, setQuery] = useState("");
    const [scope, setScope] = useState("all");
    const [dropTarget, setDropTarget] = useState(null);
    const [draft, setDraft] = useState(null);

    const visible = tasks.filter(
        (task) =>
            (scope === "all" || task.assignee === "ja") &&
            task.title.toLowerCase().includes(query.trim().toLowerCase())
    );

    const moveTask = (id, column) => setTasks((list) => list.map((task) => (task.id === id ? { ...task, column } : task)));
    const deleteTask = (id) => setTasks((list) => list.filter((task) => task.id !== id));

    const createTask = () => {
        if (!draft.title.trim()) return;
        setTasks((list) => [
            { ...draft, id: `t_${Date.now().toString(36)}`, title: draft.title.trim(), due: dayjs().add(2, "day").hour(18).minute(0).toISOString() },
            ...list,
        ]);
        setDraft(null);
        feedback.show({ color: "teal", title: t("Vazifa yaratildi"), message: draft.title.trim() });
    };

    return (
        <PageLayout
            title={t("Vazifalar")}
            subtitle={t("{{count}} ta vazifa · kartani ustunlar orasida sudrab ko'chiring", { count: tasks.length })}
            actions={
                <>
                    <TextInput
                        placeholder={t("Qidirish...")}
                        icon={<IconSearch size={15} />}
                        value={query}
                        onChange={(e) => setQuery(e.currentTarget.value)}
                        w={220}
                    />
                    <SegmentedControl
                        value={scope}
                        onChange={setScope}
                        data={[
                            { value: "all", label: t("Barchasi") },
                            { value: "mine", label: t("Meniki") },
                        ]}
                    />
                    <Button leftIcon={<IconPlus size={16} />} onClick={() => setDraft(EMPTY_DRAFT)}>
                        {t("Vazifa qo'shish")}
                    </Button>
                </>
            }
        >
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 16, alignItems: "start", "@media (max-width: 1150px)": { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }, "@media (max-width: 650px)": { gridTemplateColumns: "1fr" } }}>
                {TASK_COLUMNS.map((column) => {
                    const items = visible.filter((task) => task.column === column.key);
                    return (
                        <Box
                            key={column.key}
                            onDragOver={(event) => {
                                event.preventDefault();
                                setDropTarget(column.key);
                            }}
                            onDragLeave={() => setDropTarget((c) => (c === column.key ? null : c))}
                            onDrop={(event) => {
                                event.preventDefault();
                                moveTask(event.dataTransfer.getData("text/plain"), column.key);
                                setDropTarget(null);
                            }}
                            p={10}
                            sx={{
                                borderRadius: 14,
                                minHeight: 240,
                                background: colors.muted,
                                outline: dropTarget === column.key ? "2px dashed #339AF0" : "none",
                                outlineOffset: -2,
                            }}
                        >
                            <Group position="apart" px={4} mb={10}>
                                <Group spacing={8}>
                                    <Box w={8} h={8} sx={{ borderRadius: 4 }} bg={`${column.color}.5`} />
                                    <Text fz={13} fw={600}>
                                        {t(column.label)}
                                    </Text>
                                    <Badge size="sm" variant="filled" color="gray" radius="xl">
                                        {items.length}
                                    </Badge>
                                </Group>
                                <ActionIcon
                                    size={24}
                                    radius={6}
                                    variant="subtle"
                                    color="gray"
                                    aria-label={t("Vazifa qo'shish")}
                                    onClick={() => setDraft({ ...EMPTY_DRAFT, column: column.key })}
                                >
                                    <IconPlus size={14} />
                                </ActionIcon>
                            </Group>
                            <Stack spacing={8}>
                                {items.map((task) => (
                                    <TaskCard key={task.id} task={task} onMove={moveTask} onDelete={deleteTask} />
                                ))}
                                {!items.length ? (
                                    <EmptyState compact title={query ? "Mos vazifa topilmadi" : "Bu ustun hali bo‘sh"}
                                        description={query ? "Boshqa so‘z bilan qidirib ko‘ring." : "Vazifa qo‘shing yoki kartani shu yerga ko‘chiring."}
                                        actions={<Button size="xs" color="teal" variant="subtle" onClick={() => query ? setQuery("") : setDraft({ ...EMPTY_DRAFT, column: column.key })}>{query ? "Qidiruvni tozalash" : "+ Vazifa qo‘shish"}</Button>} />
                                ) : null}
                            </Stack>
                        </Box>
                    );
                })}
            </Box>

            <Modal opened={!!draft} onClose={() => setDraft(null)} title={t("Yangi vazifa")} radius={14} centered>
                {draft ? (
                    <Stack spacing={12}>
                        <TextInput
                            label={t("Nomi")}
                            placeholder={t("Masalan: Hisobotni tayyorlash")}
                            value={draft.title}
                            onChange={(e) => setDraft({ ...draft, title: e.currentTarget.value })}
                            data-autofocus
                        />
                        <Group grow>
                            <Select
                                label={t("Ustun")}
                                value={draft.column}
                                onChange={(column) => setDraft({ ...draft, column })}
                                data={TASK_COLUMNS.map((c) => ({ value: c.key, label: t(c.label) }))}
                            />
                            <Select
                                label={t("Muhimlik")}
                                value={draft.priority}
                                onChange={(priority) => setDraft({ ...draft, priority })}
                                data={Object.entries(PRIORITIES).map(([value, p]) => ({ value, label: t(p.label) }))}
                            />
                        </Group>
                        <Group grow>
                            <Select
                                label={t("Mas'ul")}
                                value={draft.assignee}
                                onChange={(assignee) => setDraft({ ...draft, assignee })}
                                data={PEOPLE.map((p) => ({ value: p.id, label: p.name }))}
                            />
                            <TextInput
                                label={t("Teg")}
                                value={draft.label}
                                onChange={(e) => setDraft({ ...draft, label: e.currentTarget.value })}
                            />
                        </Group>
                        <Group position="right" mt={6}>
                            <Button variant="default" onClick={() => setDraft(null)}>
                                {t("Bekor qilish")}
                            </Button>
                            <Button onClick={createTask} disabled={!draft.title.trim()}>
                                {t("Yaratish")}
                            </Button>
                        </Group>
                    </Stack>
                ) : null}
            </Modal>
        </PageLayout>
    );
}

export default TasksPage;
