import {
    IconBolt,
    IconCode,
    IconFiles,
    IconGitBranch,
    IconListCheck,
    IconMessage,
    IconNote,
    IconRepeat,
    IconSquarePlus,
    IconUserPlus,
    IconWorld,
} from "@tabler/icons-react";

export const NOTE_KIND = "note";

// Each kind describes how a node looks and which ports it exposes
export const NODE_CATALOG = {
    trigger: {
        label: "Trigger",
        group: "Boshlash",
        color: "violet",
        Icon: IconBolt,
        inputs: false,
        outputs: ["out"],
        params: [],
        description: "Jarayon faqat qo'lda ishga tushiriladi",
    },
    docs_list: {
        label: "Docs list",
        group: "Ma'lumot",
        color: "teal",
        Icon: IconFiles,
        outputs: ["out"],
        params: [
            { key: "limit", value: "100" },
            { key: "status", value: "pending" },
        ],
        description: "Hujjatlar ro'yxatini status va turi bo'yicha filtrlab oladi",
    },
    list_tasks: {
        label: "List tasks",
        group: "Ma'lumot",
        color: "teal",
        Icon: IconListCheck,
        outputs: ["out"],
        params: [
            { key: "limit", value: "500" },
            { key: "project", value: "" },
        ],
        description: "Loyiha bo'yicha vazifalar ro'yxatini oladi",
    },
    http_request: {
        label: "HTTP request",
        group: "Ma'lumot",
        color: "blue",
        Icon: IconWorld,
        outputs: ["out"],
        params: [
            { key: "method", value: "GET" },
            { key: "url", value: "" },
        ],
        description: "Tashqi API ga so'rov yuboradi",
    },
    script: {
        label: "Script",
        group: "Mantiq",
        color: "gray",
        Icon: IconCode,
        outputs: ["out"],
        params: [{ key: "language", value: "js" }],
        description: "Kiruvchi ma'lumotni skript orqali qayta ishlaydi",
    },
    condition: {
        label: "If / else",
        group: "Mantiq",
        color: "yellow",
        Icon: IconGitBranch,
        outputs: ["true", "false"],
        params: [{ key: "expression", value: "" }],
        description: "Shart bo'yicha oqimni ikkiga ajratadi",
    },
    loop: {
        label: "Loop (for each)",
        group: "Mantiq",
        color: "indigo",
        Icon: IconRepeat,
        outputs: ["each", "done"],
        params: [{ key: "list", value: "" }],
        description: "Ro'yxatning har bir elementi uchun zanjirni bajaradi, so'ng done ga o'tadi",
    },
    create_task: {
        label: "Create task",
        group: "Amallar",
        color: "orange",
        Icon: IconSquarePlus,
        outputs: ["out"],
        params: [
            { key: "description", value: "{{item.task_description}}" },
            { key: "labels", value: "" },
            { key: "project", value: "" },
        ],
        description: "Yangi vazifa yaratadi",
    },
    comment_task: {
        label: "Comment task",
        group: "Amallar",
        color: "orange",
        Icon: IconMessage,
        outputs: ["out"],
        params: [
            { key: "body", value: "{{item.comment_body}}" },
            { key: "id", value: "{{item.existing_card_id}}" },
        ],
        description: "Mavjud vazifaga izoh qo'shadi",
    },
    assign_task: {
        label: "Assign task",
        group: "Amallar",
        color: "orange",
        Icon: IconUserPlus,
        outputs: ["out"],
        params: [
            { key: "assignee", value: "" },
            { key: "id", value: "{{res.id}}" },
        ],
        description: "Vazifaga mas'ul biriktiradi",
    },
    [NOTE_KIND]: {
        label: "Izoh",
        group: "Boshqa",
        color: "yellow",
        Icon: IconNote,
        inputs: false,
        outputs: [],
        params: [],
        description: "",
    },
};

export const CATALOG_GROUPS = ["Boshlash", "Ma'lumot", "Mantiq", "Amallar"];

let idCounter = Date.now();
export const nextId = (prefix = "n") => `${prefix}_${(idCounter++).toString(36)}`;

export const createNode = (kind, position) => {
    const cfg = NODE_CATALOG[kind];
    return {
        id: nextId(kind),
        type: kind === NOTE_KIND ? "note" : "studio",
        position,
        data: {
            kind,
            title: cfg.label,
            params: cfg.params.map((p) => ({ ...p })),
            description: cfg.description,
            text: kind === NOTE_KIND ? "Izoh..." : undefined,
        },
    };
};

const node = (id, kind, x, y, overrides = {}) => {
    const cfg = NODE_CATALOG[kind];
    return {
        id,
        type: "studio",
        position: { x, y },
        data: {
            kind,
            title: cfg.label,
            params: cfg.params.map((p) => ({ ...p })),
            description: cfg.description,
            ...overrides,
        },
    };
};

const edge = (source, target, sourceHandle = "out") => ({
    id: `e_${source}_${sourceHandle}_${target}`,
    source,
    target,
    sourceHandle,
});

const DAY = 24 * 60 * 60 * 1000;
const ago = (ms) => new Date(Date.now() - ms).toISOString();

const mockVersions = (flow, count) =>
    Array.from({ length: count }, (_, i) => ({
        version: i + 1,
        name: flow.name,
        nodes: flow.nodes,
        edges: flow.edges,
        publishedAt: ago((count - i) * 3 * DAY + 2 * 60 * 60 * 1000),
    }));

const mockRuns = (steps, latestVersion, count) =>
    Array.from({ length: count }, (_, i) => {
        const start = Date.now() - (i * 7 + 1) * 60 * 60 * 1000;
        const failed = i % 5 === 3;
        return {
            id: `run_mock_${i}`,
            startedAt: new Date(start).toISOString(),
            finishedAt: new Date(start + 1800 + ((i * 937) % 4200)).toISOString(),
            status: failed ? "error" : "success",
            steps: failed ? Math.max(1, steps - 3) : steps,
            test: i % 3 === 1,
            version: Math.max(1, latestVersion - Math.floor(i / 4)),
        };
    });

const withHistory = (flow, versionCount, runCount) => ({
    ...flow,
    versions: mockVersions(flow, versionCount),
    runs: mockRuns(flow.nodes.length, versionCount, runCount),
});

export const SAMPLE_FLOW_BASE = {
    name: "Kiruvchi hujjatlar — 10 kundan o'tganlar",
    nodes: [
        node("trigger", "trigger", 0, 120),
        node("docs", "docs_list", 290, 80),
        node("tasks", "list_tasks", 580, 80),
        node("script", "script", 870, 110),
        node("loop_create", "loop", 1160, 0, {
            params: [{ key: "list", value: "filtered.to_create" }],
        }),
        node("loop_comment", "loop", 1160, 230, {
            params: [{ key: "list", value: "filtered.to_comment" }],
        }),
        node("create", "create_task", 1450, 0),
        node("comment", "comment_task", 1450, 230),
        node("assign", "assign_task", 1740, 20, {
            params: [
                { key: "assignee", value: "mas'ul xodim" },
                { key: "id", value: "{{res.id}}" },
            ],
        }),
    ],
    edges: [
        edge("trigger", "docs"),
        edge("docs", "tasks"),
        edge("tasks", "script"),
        edge("script", "loop_create"),
        edge("script", "loop_comment"),
        edge("loop_create", "create", "each"),
        edge("loop_comment", "comment", "each"),
        edge("create", "assign"),
    ],
};

export const SAMPLE_FLOW = withHistory(SAMPLE_FLOW_BASE, 5, 12);

export const ONBOARDING_FLOW = withHistory(
    {
        name: "Yangi mijozlar — onboarding",
        nodes: [
            node("ob_trigger", "trigger", 0, 110, { description: "Har kuni soat 09:00 da ishga tushadi" }),
            node("ob_http", "http_request", 290, 70, {
                title: "CRM so'rovi",
                params: [
                    { key: "method", value: "GET" },
                    { key: "url", value: "/api/crm/clients?new=1" },
                ],
                description: "CRM dan oxirgi 24 soatda qo'shilgan mijozlarni oladi",
            }),
            node("ob_cond", "condition", 580, 85, {
                params: [{ key: "expression", value: "client.contract_signed" }],
                description: "Shartnoma imzolangan mijozlarni ajratadi",
            }),
            node("ob_create", "create_task", 870, -20, {
                params: [
                    { key: "description", value: "{{client.name}} — onboarding" },
                    { key: "labels", value: "onboarding" },
                    { key: "project", value: "Sotuv" },
                ],
            }),
            node("ob_comment", "comment_task", 870, 230, {
                params: [
                    { key: "body", value: "Shartnoma kutilmoqda" },
                    { key: "id", value: "{{client.card_id}}" },
                ],
            }),
            node("ob_assign", "assign_task", 1160, -20, {
                params: [
                    { key: "assignee", value: "menejer" },
                    { key: "id", value: "{{res.id}}" },
                ],
            }),
        ],
        edges: [
            edge("ob_trigger", "ob_http"),
            edge("ob_http", "ob_cond"),
            edge("ob_cond", "ob_create", "true"),
            edge("ob_cond", "ob_comment", "false"),
            edge("ob_create", "ob_assign"),
        ],
    },
    2,
    5
);

export const FLOW_TEMPLATES = {
    sample: SAMPLE_FLOW,
    onboarding: ONBOARDING_FLOW,
};
