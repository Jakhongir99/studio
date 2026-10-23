import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActionIcon,
    Badge,
    Box,
    Button,
    Divider,
    Drawer,
    FileButton,
    Global,
    Group,
    Menu,
    Paper,
    Popover,
    ScrollArea,
    Stack,
    Switch,
    Text,
    TextInput,
    ThemeIcon,
    Tooltip,
    UnstyledButton,
    useMantineTheme,
} from "@mantine/core";
import { feedback } from "../lib/feedback.js";
import {
    IconArrowBackUp,
    IconArrowForwardUp,
    IconChevronDown,
    IconDeviceFloppy,
    IconDots,
    IconDownload,
    IconFileImport,
    IconGitBranch,
    IconHandStop,
    IconHistory,
    IconMaximize,
    IconMinus,
    IconNote,
    IconPlayerPlay,
    IconPlus,
    IconPointer,
    IconRefresh,
    IconSitemap,
    IconTrash,
    IconUpload,
} from "@tabler/icons-react";
import {
    Background,
    BackgroundVariant,
    MarkerType,
    MiniMap,
    Panel,
    ReactFlow,
    ReactFlowProvider,
    addEdge,
    useEdgesState,
    useNodesState,
    useReactFlow,
    useViewport,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import dayjs from "dayjs";
import { get } from "lodash";
import { useTranslation } from "../lib/i18n.js";
import { useDarkMode } from "../lib/useDarkMode.js";
import {
    CATALOG_GROUPS,
    NODE_CATALOG,
    NOTE_KIND,
    SAMPLE_FLOW,
    createNode,
    nextId,
} from "./catalog.jsx";
import { nodeTypes } from "./StudioNode.jsx";
import NodeInspector from "./NodeInspector.jsx";
import useHistory from "./useHistory.js";
import { autoLayout, executionOrder } from "./layout.js";

const STEP_MS = 450;
const EDGE_COLOR = "#ADB5BD";
// Leaves room for the floating chat button in the bottom-right corner
const MINIMAP_RIGHT_GAP = 84;

const isNote = (node) => get(node, "data.kind") === NOTE_KIND;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const loadDraft = (storageKey) => {
    try {
        return JSON.parse(localStorage.getItem(storageKey)) || null;
    } catch {
        return null;
    }
};

const cleanNodes = (nodes) =>
    nodes.map(({ selected, dragging, measured, ...node }) => {
        const { runStatus, ...data } = node.data;
        return { ...node, data };
    });

const cleanEdges = (edges) => edges.map(({ selected, animated, ...edge }) => edge);

function ToolButton({ label, active, onClick, position = "right", children }) {
    const theme = useMantineTheme();
    const darkMode = useDarkMode();
    const idle = darkMode ? theme.colors.dark[0] : theme.colors.gray[7];
    const hover = darkMode ? theme.colors.dark[5] : theme.colors.gray[1];

    return (
        <Tooltip label={label} position={position} withArrow openDelay={300}>
            <ActionIcon
                size={34}
                radius={9}
                onClick={onClick}
                aria-label={label}
                aria-pressed={active}
                sx={{
                    color: active ? "#FFFFFF" : idle,
                    background: active ? theme.colors.blue[6] : "transparent",
                    transition: "background 120ms ease, color 120ms ease",
                    "&:hover": { background: active ? theme.colors.blue[7] : hover },
                }}
            >
                {children}
            </ActionIcon>
        </Tooltip>
    );
}

function ZoomBar({ panelSx, onFit }) {
    const { t } = useTranslation();
    const { zoomIn, zoomOut } = useReactFlow();
    const { zoom } = useViewport();

    return (
        <Paper radius={12} p={4} sx={panelSx}>
            <Group spacing={2} noWrap>
                <ToolButton label={t("Kichraytirish")} position="top" onClick={() => zoomOut({ duration: 200 })}>
                    <IconMinus size={16} />
                </ToolButton>
                <Text fz={12} fw={600} ta="center" w={44} sx={{ fontVariantNumeric: "tabular-nums" }}>
                    {Math.round(zoom * 100)}%
                </Text>
                <ToolButton label={t("Kattalashtirish")} position="top" onClick={() => zoomIn({ duration: 200 })}>
                    <IconPlus size={16} />
                </ToolButton>
                <Divider orientation="vertical" mx={2} />
                <ToolButton label={t("Hammasini ko'rsatish")} position="top" onClick={onFit}>
                    <IconMaximize size={16} />
                </ToolButton>
            </Group>
        </Paper>
    );
}

function StudioEditor({ storageKey, initialFlow, active, onMetaChange }) {
    const { t } = useTranslation();
    const theme = useMantineTheme();
    const darkMode = useDarkMode();
    const { screenToFlowPosition, fitView } = useReactFlow();

    const draft = useMemo(() => loadDraft(storageKey), [storageKey]);
    const [name, setName] = useState(get(draft, "name") ?? initialFlow.name);
    const [nodes, setNodes, onNodesChange] = useNodesState(get(draft, "nodes") ?? initialFlow.nodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(get(draft, "edges") ?? initialFlow.edges);
    const [versions, setVersions] = useState(get(draft, "versions") ?? initialFlow.versions ?? []);
    const [runs, setRuns] = useState(get(draft, "runs") ?? initialFlow.runs ?? []);
    const [testMode, setTestMode] = useState(false);
    const [tool, setTool] = useState("pan");
    const [dirty, setDirty] = useState(false);
    const [running, setRunning] = useState(false);
    const [runsOpened, setRunsOpened] = useState(false);
    const [addOpened, setAddOpened] = useState(false);
    const wrapperRef = useRef(null);
    const mountedRef = useRef(true);

    const history = useHistory({ nodes, edges, setNodes, setEdges });
    const latestVersion = versions.length ? versions[versions.length - 1].version : 0;
    const selectedNodes = nodes.filter((n) => n.selected);
    const selected = selectedNodes.length === 1 ? selectedNodes[0] : null;
    const border = darkMode ? theme.colors.dark[4] : "#E3E8EE";
    const surface = darkMode ? theme.colors.dark[7] : "#FFFFFF";
    const panelSx = {
        background: darkMode ? theme.colors.dark[6] : "#FFFFFF",
        border: `1px solid ${border}`,
        boxShadow: darkMode ? "0 6px 20px rgba(0,0,0,0.35)" : "0 6px 20px rgba(16, 24, 40, 0.08)",
    };

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        onMetaChange?.({ name, dirty });
    }, [name, dirty, onMetaChange]);

    const handleNodesChange = useCallback(
        (changes) => {
            if (changes.some((c) => !["select", "dimensions"].includes(c.type))) setDirty(true);
            onNodesChange(changes);
        },
        [onNodesChange]
    );

    const handleEdgesChange = useCallback(
        (changes) => {
            if (changes.some((c) => c.type !== "select")) setDirty(true);
            onEdgesChange(changes);
        },
        [onEdgesChange]
    );

    const onConnect = useCallback(
        (connection) => {
            history.takeSnapshot();
            setEdges((eds) => addEdge({ ...connection, id: nextId("e") }, eds));
            setDirty(true);
        },
        [history, setEdges]
    );

    const onBeforeDelete = useCallback(async () => {
        history.takeSnapshot();
        return true;
    }, [history]);

    const viewportCenter = () => {
        const rect = wrapperRef.current?.getBoundingClientRect();
        if (!rect) return { x: 0, y: 0 };
        const point = screenToFlowPosition({
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
        });
        return { x: point.x - 115 + (Math.random() * 40 - 20), y: point.y - 60 + (Math.random() * 40 - 20) };
    };

    const addNode = (kind) => {
        history.takeSnapshot();
        const node = { ...createNode(kind, viewportCenter()), selected: true };
        setNodes((ns) => [...ns.map((n) => ({ ...n, selected: false })), node]);
        setAddOpened(false);
        setDirty(true);
    };

    const updateNode = (id, patch) => {
        setNodes((ns) => ns.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)));
        setDirty(true);
    };

    const deleteNode = (id) => {
        history.takeSnapshot();
        setNodes((ns) => ns.filter((n) => n.id !== id));
        setEdges((es) => es.filter((e) => e.source !== id && e.target !== id));
        setDirty(true);
    };

    const duplicateNode = (node) => {
        history.takeSnapshot();
        const copy = {
            ...node,
            id: nextId(node.data.kind),
            position: { x: node.position.x + 40, y: node.position.y + 40 },
            data: { ...node.data, params: (node.data.params || []).map((p) => ({ ...p })) },
            selected: true,
        };
        setNodes((ns) => [...ns.map((n) => ({ ...n, selected: false })), copy]);
        setDirty(true);
    };

    const handleAutoLayout = () => {
        history.takeSnapshot();
        setNodes((ns) => autoLayout(ns, edges, isNote));
        setDirty(true);
        setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 50);
    };

    const persist = (override = {}) => {
        const payload = {
            name,
            nodes: cleanNodes(nodes),
            edges: cleanEdges(edges),
            versions,
            runs,
            ...override,
        };
        localStorage.setItem(storageKey, JSON.stringify(payload));
        setDirty(false);
    };

    const handleSave = () => {
        persist();
        feedback.show({ color: "teal", title: t("Saqlandi"), message: t("Qoralama brauzerda saqlandi") });
    };

    const handlePublish = () => {
        const version = {
            version: latestVersion + 1,
            name,
            nodes: cleanNodes(nodes),
            edges: cleanEdges(edges),
            publishedAt: new Date().toISOString(),
        };
        const nextVersions = [...versions, version];
        setVersions(nextVersions);
        persist({ versions: nextVersions });
        feedback.show({
            color: "blue",
            title: t("Nashr qilindi"),
            message: t("Versiya v{{version}} yaratildi", { version: version.version }),
        });
    };

    const restoreVersion = (version) => {
        history.takeSnapshot();
        setName(version.name);
        setNodes(version.nodes);
        setEdges(version.edges);
        setDirty(true);
        setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 50);
    };

    const handleTestRun = async () => {
        if (running) return;
        const order = executionOrder(nodes, edges, isNote);
        if (!order.length) {
            feedback.show({ color: "orange", title: t("Bo'sh jarayon"), message: t("Avval tugun qo'shing") });
            return;
        }
        const startedAt = new Date().toISOString();
        setRunning(true);
        const setStatus = (id, runStatus) =>
            setNodes((ns) => ns.map((n) => (n.id === id ? { ...n, data: { ...n.data, runStatus } } : n)));

        setNodes((ns) => ns.map((n) => ({ ...n, data: { ...n.data, runStatus: undefined } })));
        for (const id of order) {
            if (!mountedRef.current) return;
            setStatus(id, "running");
            setEdges((es) => es.map((e) => ({ ...e, animated: e.source === id })));
            await sleep(STEP_MS);
            setStatus(id, "success");
        }
        if (!mountedRef.current) return;
        setEdges((es) => es.map((e) => ({ ...e, animated: false })));
        setRuns((prev) =>
            [
                {
                    id: nextId("run"),
                    startedAt,
                    finishedAt: new Date().toISOString(),
                    status: "success",
                    steps: order.length,
                    test: testMode,
                    version: latestVersion || null,
                },
                ...prev,
            ].slice(0, 50)
        );
        setRunning(false);
        feedback.show({
            color: "teal",
            title: t("Test-ishga tushirish yakunlandi"),
            message: t("{{count}} ta qadam bajarildi", { count: order.length }),
        });
        setTimeout(() => {
            if (mountedRef.current) {
                setNodes((ns) => ns.map((n) => ({ ...n, data: { ...n.data, runStatus: undefined } })));
            }
        }, 2500);
    };

    const handleExport = () => {
        const blob = new Blob(
            [JSON.stringify({ name, nodes: cleanNodes(nodes), edges: cleanEdges(edges) }, null, 2)],
            { type: "application/json" }
        );
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${name || "studio"}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleImport = async (file) => {
        if (!file) return;
        try {
            const parsed = JSON.parse(await file.text());
            if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) throw new Error("invalid");
            history.takeSnapshot();
            setName(parsed.name || name);
            setNodes(parsed.nodes);
            setEdges(parsed.edges);
            setDirty(true);
            setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 50);
        } catch {
            feedback.show({ color: "red", title: t("Xatolik"), message: t("Fayl formati noto'g'ri") });
        }
    };

    const replaceFlow = (flow) => {
        history.takeSnapshot();
        setName(flow.name);
        setNodes(flow.nodes);
        setEdges(flow.edges);
        setDirty(true);
        setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 50);
    };

    useEffect(() => {
        const onKeyDown = (event) => {
            if (!active) return;
            const tag = event.target?.tagName;
            if (tag === "INPUT" || tag === "TEXTAREA" || event.target?.isContentEditable) return;
            const mod = event.ctrlKey || event.metaKey;
            if (!mod) return;
            const key = event.key.toLowerCase();
            if (key === "z" && !event.shiftKey) {
                event.preventDefault();
                history.undo();
            } else if ((key === "z" && event.shiftKey) || key === "y") {
                event.preventDefault();
                history.redo();
            } else if (key === "s") {
                event.preventDefault();
                handleSave();
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    });

    const minimapColor = (node) => {
        const color = get(NODE_CATALOG, [get(node, "data.kind"), "color"], "gray");
        return get(theme.colors, [color, 5], "#ADB5BD");
    };

    return (
        <Box
            sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                background: surface,
            }}
        >
            <Global
                styles={{
                    "@keyframes studio-pulse": {
                        "0%, 100%": { opacity: 1 },
                        "50%": { opacity: 0.3 },
                    },
                }}
            />

            <Group position="apart" noWrap px={14} py={10} sx={{ borderBottom: `1px solid ${border}` }}>
                <Group spacing={10} noWrap sx={{ minWidth: 0 }}>
                    <TextInput
                        value={name}
                        onChange={(e) => {
                            setName(e.currentTarget.value);
                            setDirty(true);
                        }}
                        radius={8}
                        w={360}
                        styles={{ input: { fontWeight: 500 } }}
                        aria-label={t("Nomi")}
                    />
                    <Menu shadow="md" width={240} position="bottom-start">
                        <Menu.Target>
                            <Button
                                variant="default"
                                radius={8}
                                leftIcon={<IconGitBranch size={16} />}
                                rightIcon={<IconChevronDown size={14} />}
                            >
                                {latestVersion ? `v${latestVersion}` : t("Qoralama")}
                            </Button>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Label>{t("Versiyalar")}</Menu.Label>
                            {versions.length ? (
                                [...versions].reverse().map((v) => (
                                    <Menu.Item key={v.version} onClick={() => restoreVersion(v)}>
                                        <Group position="apart" noWrap>
                                            <Text fw={600}>v{v.version}</Text>
                                            <Text fz={12} c="dimmed">
                                                {dayjs(v.publishedAt).format("DD.MM.YYYY HH:mm")}
                                            </Text>
                                        </Group>
                                    </Menu.Item>
                                ))
                            ) : (
                                <Menu.Item disabled>{t("Hali nashr qilinmagan")}</Menu.Item>
                            )}
                        </Menu.Dropdown>
                    </Menu>
                    <Group spacing={2} noWrap>
                        <Tooltip label={t("Bekor qilish (Ctrl+Z)")} withArrow>
                            <ActionIcon size={36} radius={8} disabled={!history.canUndo} onClick={history.undo}>
                                <IconArrowBackUp size={18} />
                            </ActionIcon>
                        </Tooltip>
                        <Tooltip label={t("Qaytarish (Ctrl+Shift+Z)")} withArrow>
                            <ActionIcon size={36} radius={8} disabled={!history.canRedo} onClick={history.redo}>
                                <IconArrowForwardUp size={18} />
                            </ActionIcon>
                        </Tooltip>
                    </Group>
                    <Switch
                        checked={testMode}
                        onChange={(e) => setTestMode(e.currentTarget.checked)}
                        label={t("Test rejimi")}
                        sx={{ whiteSpace: "nowrap" }}
                    />
                    {dirty ? (
                        <Badge color="orange" variant="light" radius="sm">
                            {t("Saqlanmagan")}
                        </Badge>
                    ) : null}
                </Group>

                <Group spacing={8} noWrap>
                    <Button variant="default" radius={8} leftIcon={<IconHistory size={16} />} onClick={() => setRunsOpened(true)}>
                        {t("Ishga tushirishlar")}
                    </Button>
                    <Button
                        variant="default"
                        radius={8}
                        leftIcon={<IconPlayerPlay size={16} />}
                        loading={running}
                        onClick={handleTestRun}
                    >
                        {t("Test-ishga tushirish")}
                    </Button>
                    <Button variant="default" radius={8} leftIcon={<IconDeviceFloppy size={16} />} onClick={handleSave}>
                        {t("Saqlash")}
                    </Button>
                    <Button radius={8} leftIcon={<IconUpload size={16} />} onClick={handlePublish}>
                        {t("Nashr qilish")}
                    </Button>
                    <Menu shadow="md" width={220} position="bottom-end">
                        <Menu.Target>
                            <ActionIcon size={36} radius={8} variant="default" aria-label={t("Yana")}>
                                <IconDots size={18} />
                            </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Item icon={<IconDownload size={16} />} onClick={handleExport}>
                                {t("JSON eksport")}
                            </Menu.Item>
                            <FileButton onChange={handleImport} accept="application/json">
                                {(props) => (
                                    <Menu.Item {...props} icon={<IconFileImport size={16} />} closeMenuOnClick={false}>
                                        {t("JSON import")}
                                    </Menu.Item>
                                )}
                            </FileButton>
                            <Menu.Item icon={<IconRefresh size={16} />} onClick={() => replaceFlow(SAMPLE_FLOW)}>
                                {t("Namunani tiklash")}
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Item
                                color="red"
                                icon={<IconTrash size={16} />}
                                onClick={() => replaceFlow({ name, nodes: [], edges: [] })}
                            >
                                {t("Kanvasni tozalash")}
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </Group>
            </Group>

            <Box ref={wrapperRef} sx={{ flex: 1, position: "relative", minHeight: 0 }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    onNodesChange={handleNodesChange}
                    onEdgesChange={handleEdgesChange}
                    onConnect={onConnect}
                    onNodeDragStart={history.takeSnapshot}
                    onBeforeDelete={onBeforeDelete}
                    onPaneClick={() => setAddOpened(false)}
                    colorMode={darkMode ? "dark" : "light"}
                    fitView
                    fitViewOptions={{ padding: 0.12 }}
                    minZoom={0.2}
                    maxZoom={2}
                    panOnDrag={tool === "pan" ? true : [1, 2]}
                    selectionOnDrag={tool === "select"}
                    deleteKeyCode={["Backspace", "Delete"]}
                    defaultEdgeOptions={{
                        markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16, color: EDGE_COLOR },
                        style: { stroke: EDGE_COLOR, strokeWidth: 1.5 },
                    }}
                    proOptions={{ hideAttribution: true }}
                    style={{ background: darkMode ? theme.colors.dark[8] : "#FAFBFC" }}
                >
                    <Background
                        variant={BackgroundVariant.Dots}
                        gap={16}
                        size={1.3}
                        color={darkMode ? theme.colors.dark[4] : "#D5DBE1"}
                    />

                    <Panel position="top-left">
                        <Paper radius={12} p={4} sx={panelSx}>
                            <Stack spacing={2}>
                                <Popover
                                    opened={addOpened}
                                    onChange={setAddOpened}
                                    position="right-start"
                                    shadow="md"
                                    width={260}
                                    withinPortal
                                >
                                    <Popover.Target>
                                        <div>
                                            <ToolButton
                                                label={t("Tugun qo'shish")}
                                                active={addOpened}
                                                onClick={() => setAddOpened((o) => !o)}
                                            >
                                                <IconPlus size={18} />
                                            </ToolButton>
                                        </div>
                                    </Popover.Target>
                                    <Popover.Dropdown p={6}>
                                        <ScrollArea.Autosize mah={420}>
                                            {CATALOG_GROUPS.map((group) => (
                                                <Box key={group} mb={4}>
                                                    <Text fz={11} fw={600} c="dimmed" tt="uppercase" px={8} py={4}>
                                                        {t(group)}
                                                    </Text>
                                                    {Object.entries(NODE_CATALOG)
                                                        .filter(([, cfg]) => cfg.group === group)
                                                        .map(([kind, cfg]) => (
                                                            <UnstyledButton
                                                                key={kind}
                                                                onClick={() => addNode(kind)}
                                                                sx={{
                                                                    display: "block",
                                                                    width: "100%",
                                                                    padding: "6px 8px",
                                                                    borderRadius: 8,
                                                                    "&:hover": {
                                                                        background: darkMode ? theme.colors.dark[5] : theme.colors.gray[0],
                                                                    },
                                                                }}
                                                            >
                                                                <Group spacing={10} noWrap>
                                                                    <ThemeIcon size={26} radius={6} color={cfg.color}>
                                                                        <cfg.Icon size={15} />
                                                                    </ThemeIcon>
                                                                    <Box sx={{ minWidth: 0 }}>
                                                                        <Text fz={13} fw={500}>
                                                                            {t(cfg.label)}
                                                                        </Text>
                                                                        <Text fz={11} c="dimmed" lineClamp={1}>
                                                                            {t(cfg.description)}
                                                                        </Text>
                                                                    </Box>
                                                                </Group>
                                                            </UnstyledButton>
                                                        ))}
                                                </Box>
                                            ))}
                                        </ScrollArea.Autosize>
                                    </Popover.Dropdown>
                                </Popover>
                                <ToolButton label={t("Izoh qo'shish")} onClick={() => addNode(NOTE_KIND)}>
                                    <IconNote size={18} />
                                </ToolButton>
                                <Divider my={3} mx={6} />
                                <ToolButton label={t("Tanlash")} active={tool === "select"} onClick={() => setTool("select")}>
                                    <IconPointer size={18} />
                                </ToolButton>
                                <ToolButton label={t("Siljitish")} active={tool === "pan"} onClick={() => setTool("pan")}>
                                    <IconHandStop size={18} />
                                </ToolButton>
                                <Divider my={3} mx={6} />
                                <ToolButton label={t("Avto joylashtirish")} onClick={handleAutoLayout}>
                                    <IconSitemap size={18} />
                                </ToolButton>
                            </Stack>
                        </Paper>
                    </Panel>

                    <Panel position="bottom-left">
                        <ZoomBar panelSx={panelSx} onFit={() => fitView({ padding: 0.12, duration: 300 })} />
                    </Panel>

                    {nodes.length ? (
                        <MiniMap
                            pannable
                            zoomable
                            position="bottom-right"
                            nodeColor={minimapColor}
                            nodeBorderRadius={6}
                            nodeStrokeWidth={0}
                            bgColor={surface}
                            maskColor={darkMode ? "rgba(0,0,0,0.5)" : "rgba(233, 236, 239, 0.65)"}
                            maskStrokeColor={theme.colors.blue[5]}
                            maskStrokeWidth={2}
                            style={{ ...panelSx, width: 190, height: 120, borderRadius: 12, overflow: "hidden", marginRight: MINIMAP_RIGHT_GAP }}
                        />
                    ) : (
                        <Panel position="top-center" style={{ top: "38%", margin: 0 }}>
                            <Paper radius={16} p={24} sx={{ ...panelSx, textAlign: "center", width: 320 }}>
                                <ThemeIcon size={48} radius={14} variant="light" mx="auto" mb={12}>
                                    <IconSitemap size={26} />
                                </ThemeIcon>
                                <Text fw={700} fz={15}>
                                    {t("Jarayon hali bo'sh")}
                                </Text>
                                <Text fz={13} c="dimmed" mt={4} mb={16}>
                                    {t("Birinchi tugunni qo'shing yoki tayyor namunadan boshlang")}
                                </Text>
                                <Group spacing={8} position="center">
                                    <Button radius={9} leftIcon={<IconPlus size={16} />} onClick={() => setAddOpened(true)}>
                                        {t("Tugun qo'shish")}
                                    </Button>
                                    <Button radius={9} variant="default" onClick={() => replaceFlow(SAMPLE_FLOW)}>
                                        {t("Namuna")}
                                    </Button>
                                </Group>
                            </Paper>
                        </Panel>
                    )}

                    {selected ? (
                        <Panel position="top-right" style={{ maxHeight: "calc(100% - 200px)" }}>
                            <NodeInspector
                                key={selected.id}
                                node={selected}
                                onChange={(patch) => updateNode(selected.id, patch)}
                                onEditStart={history.takeSnapshot}
                                onDelete={() => deleteNode(selected.id)}
                                onDuplicate={() => duplicateNode(selected)}
                                onClose={() => setNodes((ns) => ns.map((n) => ({ ...n, selected: false })))}
                            />
                        </Panel>
                    ) : null}
                </ReactFlow>
            </Box>

            <Drawer
                opened={runsOpened}
                onClose={() => setRunsOpened(false)}
                title={t("Ishga tushirishlar")}
                position="right"
                size={420}
                padding="lg"
            >
                {runs.length ? (
                    <Stack spacing={10}>
                        {runs.map((run) => (
                            <Paper key={run.id} withBorder radius={10} p={12}>
                                <Group position="apart" noWrap>
                                    <Group spacing={8}>
                                        <Badge color={run.status === "success" ? "teal" : "red"} variant="light">
                                            {run.status === "success" ? t("Muvaffaqiyatli") : t("Xatolik")}
                                        </Badge>
                                        {run.test ? (
                                            <Badge color="orange" variant="outline">
                                                {t("Test")}
                                            </Badge>
                                        ) : null}
                                        {run.version ? (
                                            <Badge color="gray" variant="outline">
                                                v{run.version}
                                            </Badge>
                                        ) : null}
                                    </Group>
                                    <Text fz={12} c="dimmed">
                                        {dayjs(run.startedAt).format("DD.MM.YYYY HH:mm:ss")}
                                    </Text>
                                </Group>
                                <Text fz={13} mt={6}>
                                    {t("{{count}} ta qadam", { count: run.steps })} ·{" "}
                                    {((dayjs(run.finishedAt).diff(dayjs(run.startedAt))) / 1000).toFixed(1)}s
                                </Text>
                            </Paper>
                        ))}
                    </Stack>
                ) : (
                    <Text c="dimmed" ta="center" py={40}>
                        {t("Hali ishga tushirilmagan")}
                    </Text>
                )}
            </Drawer>
        </Box>
    );
}

function StudioPage({ tabId, storageKey, initialFlow = SAMPLE_FLOW, active = true, onMetaChange }) {
    const reportMeta = useCallback((meta) => onMetaChange?.(tabId, meta), [tabId, onMetaChange]);

    return (
        <ReactFlowProvider>
            <StudioEditor
                storageKey={storageKey}
                initialFlow={initialFlow}
                active={active}
                onMetaChange={reportMeta}
            />
        </ReactFlowProvider>
    );
}

export default StudioPage;
