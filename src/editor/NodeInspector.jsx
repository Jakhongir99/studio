import React from "react";
import {
    ActionIcon,
    Box,
    Button,
    Divider,
    Group,
    Paper,
    ScrollArea,
    Stack,
    Text,
    TextInput,
    Textarea,
    ThemeIcon,
} from "@mantine/core";
import { IconCopy, IconPlus, IconTrash, IconX } from "@tabler/icons-react";
import { useTranslation } from "../lib/i18n.js";
import { NODE_CATALOG, NOTE_KIND } from "./catalog.jsx";

// onEditStart fires once per focus so a whole edit session is one undo step
function NodeInspector({ node, onChange, onEditStart, onDelete, onDuplicate, onClose }) {
    const { t } = useTranslation();
    const { data } = node;
    const cfg = NODE_CATALOG[data.kind] || NODE_CATALOG.script;
    const { Icon } = cfg;
    const isNote = data.kind === NOTE_KIND;
    const params = data.params || [];

    const setParam = (index, patch) =>
        onChange({ params: params.map((p, i) => (i === index ? { ...p, ...patch } : p)) });

    return (
        <Paper
            shadow="md"
            radius={12}
            w={320}
            sx={(theme) => ({
                border: `1px solid ${theme.colorScheme === "dark" ? theme.colors.dark[4] : "#E3E8EE"}`,
                display: "flex",
                flexDirection: "column",
                maxHeight: "100%",
            })}
        >
            <Group position="apart" noWrap p={14} pb={10}>
                <Group spacing={10} noWrap>
                    <ThemeIcon size={30} radius={8} color={cfg.color} variant="filled">
                        <Icon size={17} />
                    </ThemeIcon>
                    <Box>
                        <Text fw={600} fz={14} lineClamp={1}>
                            {t(isNote ? cfg.label : data.title || cfg.label)}
                        </Text>
                        <Text fz={11} c="dimmed" tt="uppercase">
                            {t(cfg.label)}
                        </Text>
                    </Box>
                </Group>
                <ActionIcon onClick={onClose} aria-label={t("Close")}>
                    <IconX size={18} />
                </ActionIcon>
            </Group>
            <Divider />

            <ScrollArea.Autosize mah="calc(100vh - 360px)" type="auto">
                <Stack spacing={12} p={14}>
                    {isNote ? (
                        <Textarea
                            label={t("Matn")}
                            autosize
                            minRows={4}
                            value={data.text || ""}
                            onFocus={onEditStart}
                            onChange={(e) => onChange({ text: e.currentTarget.value })}
                        />
                    ) : (
                        <>
                            <TextInput
                                label={t("Nomi")}
                                value={data.title || ""}
                                onFocus={onEditStart}
                                onChange={(e) => onChange({ title: e.currentTarget.value })}
                            />
                            <Box>
                                <Group position="apart" mb={6}>
                                    <Text fz={14} fw={500}>
                                        {t("Parametrlar")}
                                    </Text>
                                    <Button
                                        size="xs"
                                        variant="light"
                                        leftIcon={<IconPlus size={14} />}
                                        onClick={() => {
                                            onEditStart();
                                            onChange({ params: [...params, { key: "", value: "" }] });
                                        }}
                                    >
                                        {t("Qo'shish")}
                                    </Button>
                                </Group>
                                <Stack spacing={6}>
                                    {params.length ? (
                                        params.map((param, index) => (
                                            <Group key={index} spacing={6} noWrap>
                                                <TextInput
                                                    size="xs"
                                                    placeholder="key"
                                                    value={param.key}
                                                    onFocus={onEditStart}
                                                    onChange={(e) => setParam(index, { key: e.currentTarget.value })}
                                                    sx={{ flex: 1 }}
                                                />
                                                <TextInput
                                                    size="xs"
                                                    placeholder="value"
                                                    value={param.value}
                                                    onFocus={onEditStart}
                                                    onChange={(e) => setParam(index, { value: e.currentTarget.value })}
                                                    sx={{ flex: 1.4 }}
                                                />
                                                <ActionIcon
                                                    size="sm"
                                                    color="red"
                                                    variant="subtle"
                                                    aria-label={t("Delete")}
                                                    onClick={() => {
                                                        onEditStart();
                                                        onChange({ params: params.filter((_, i) => i !== index) });
                                                    }}
                                                >
                                                    <IconTrash size={14} />
                                                </ActionIcon>
                                            </Group>
                                        ))
                                    ) : (
                                        <Text fz={12} c="dimmed">
                                            {t("Parametrlar yo'q")}
                                        </Text>
                                    )}
                                </Stack>
                            </Box>
                            <Textarea
                                label={t("Tavsif")}
                                autosize
                                minRows={2}
                                value={data.description || ""}
                                onFocus={onEditStart}
                                onChange={(e) => onChange({ description: e.currentTarget.value })}
                            />
                        </>
                    )}
                </Stack>
            </ScrollArea.Autosize>

            <Divider />
            <Group grow spacing={8} p={14}>
                <Button variant="default" leftIcon={<IconCopy size={16} />} onClick={onDuplicate}>
                    {t("Nusxa")}
                </Button>
                <Button color="red" variant="light" leftIcon={<IconTrash size={16} />} onClick={onDelete}>
                    {t("O'chirish")}
                </Button>
            </Group>
        </Paper>
    );
}

export default NodeInspector;
