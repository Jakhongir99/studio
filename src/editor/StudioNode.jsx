import React, { memo } from "react";
import { Box, Group, Text, ThemeIcon, useMantineTheme } from "@mantine/core";
import { Handle, Position } from "@xyflow/react";
import { get } from "lodash";
import { useTranslation } from "../lib/i18n.js";
import { useDarkMode } from "../lib/useDarkMode.js";
import { NODE_CATALOG } from "./catalog.jsx";

const STATUS_COLORS = {
    running: "#00A1DF",
    success: "#12B886",
    error: "#FA5252",
};

const handleStyle = (darkMode) => ({
    width: 10,
    height: 10,
    background: darkMode ? "#25262B" : "#FFFFFF",
    border: "2px solid #ADB5BD",
});

function StudioNode({ data, selected }) {
    const { t } = useTranslation();
    const theme = useMantineTheme();
    const darkMode = useDarkMode();
    const cfg = NODE_CATALOG[data.kind] || NODE_CATALOG.script;
    const { Icon } = cfg;
    const status = data.runStatus;
    const borderColor = STATUS_COLORS[status] || (selected ? "#00A1DF" : darkMode ? theme.colors.dark[4] : "#E3E8EE");
    const multiOutput = cfg.outputs.length > 1;
    const params = (data.params || []).filter((p) => p.key);

    return (
        <Box
            sx={{
                width: 230,
                borderRadius: 10,
                background: darkMode ? theme.colors.dark[6] : "#FFFFFF",
                border: `1.5px solid ${borderColor}`,
                boxShadow: selected || status
                    ? `0 0 0 3px ${borderColor}33`
                    : "0 1px 3px rgba(16, 24, 40, 0.08)",
                transition: "border-color 150ms ease, box-shadow 150ms ease",
                fontSize: 11,
            }}
        >
            {cfg.inputs !== false ? (
                <Handle type="target" position={Position.Left} style={handleStyle(darkMode)} />
            ) : null}

            <Group spacing={8} noWrap px={10} pt={10} pb={6}>
                <ThemeIcon size={22} radius={6} color={cfg.color} variant="filled">
                    <Icon size={13} stroke={2} />
                </ThemeIcon>
                <Text
                    fz={10}
                    fw={600}
                    tt="uppercase"
                    c={darkMode ? "gray.4" : "gray.7"}
                    lineClamp={1}
                    sx={{ letterSpacing: 0.4, flex: 1 }}
                >
                    {t(data.title || cfg.label)}
                </Text>
                {status ? (
                    <Box
                        w={8}
                        h={8}
                        sx={{
                            borderRadius: "50%",
                            background: STATUS_COLORS[status],
                            animation: status === "running" ? "studio-pulse 1s infinite" : undefined,
                        }}
                    />
                ) : null}
            </Group>

            {params.map((param) => (
                <Group
                    key={param.key}
                    position="apart"
                    noWrap
                    px={10}
                    py={4}
                    sx={{ borderTop: `1px solid ${darkMode ? theme.colors.dark[5] : "#F1F3F5"}` }}
                >
                    <Text fz={10} tt="uppercase" c="dimmed" sx={{ flexShrink: 0 }}>
                        {param.key}
                    </Text>
                    <Text fz={10} fw={500} lineClamp={1} ta="right" sx={{ wordBreak: "break-all" }}>
                        {param.value || "—"}
                    </Text>
                </Group>
            ))}

            {data.description ? (
                <Text
                    fz={10}
                    c="dimmed"
                    lh={1.45}
                    px={10}
                    py={8}
                    lineClamp={3}
                    sx={{ borderTop: `1px solid ${darkMode ? theme.colors.dark[5] : "#F1F3F5"}` }}
                >
                    {t(data.description)}
                </Text>
            ) : null}

            {multiOutput ? (
                <Box sx={{ borderTop: `1px solid ${darkMode ? theme.colors.dark[5] : "#F1F3F5"}` }} py={4}>
                    {cfg.outputs.map((output) => (
                        <Box key={output} pos="relative" px={10} py={4}>
                            <Text fz={10} c="dimmed" ta="right" pr={4}>
                                {output}
                            </Text>
                            <Handle
                                id={output}
                                type="source"
                                position={Position.Right}
                                style={{ ...handleStyle(darkMode), top: "50%" }}
                            />
                        </Box>
                    ))}
                </Box>
            ) : cfg.outputs.length ? (
                <Handle id={cfg.outputs[0]} type="source" position={Position.Right} style={handleStyle(darkMode)} />
            ) : null}
        </Box>
    );
}

function NoteNode({ data, selected }) {
    const darkMode = useDarkMode();
    return (
        <Box
            sx={{
                width: 200,
                minHeight: 90,
                padding: 12,
                borderRadius: 8,
                background: darkMode ? "rgba(250, 176, 5, 0.18)" : "#FFF9DB",
                border: `1.5px solid ${selected ? "#FAB005" : darkMode ? "rgba(250, 176, 5, 0.35)" : "#FFE066"}`,
                boxShadow: "0 1px 3px rgba(16, 24, 40, 0.08)",
            }}
        >
            <Text fz={12} lh={1.5} sx={{ whiteSpace: "pre-wrap" }}>
                {data.text}
            </Text>
        </Box>
    );
}

export const nodeTypes = {
    studio: memo(StudioNode),
    note: memo(NoteNode),
};
