const COLUMN_GAP = 290;
const ROW_GAP = 210;

// Places every node in a column by its longest distance from a root; notes keep their position
export function autoLayout(nodes, edges, isNote) {
    const flowNodes = nodes.filter((n) => !isNote(n));
    const ids = new Set(flowNodes.map((n) => n.id));
    const incoming = new Map(flowNodes.map((n) => [n.id, 0]));
    const outgoing = new Map(flowNodes.map((n) => [n.id, []]));

    edges.forEach((e) => {
        if (!ids.has(e.source) || !ids.has(e.target)) return;
        outgoing.get(e.source).push(e.target);
        incoming.set(e.target, incoming.get(e.target) + 1);
    });

    const depth = new Map();
    const queue = flowNodes.filter((n) => incoming.get(n.id) === 0).map((n) => n.id);
    queue.forEach((id) => depth.set(id, 0));
    const remaining = new Map(incoming);

    while (queue.length) {
        const id = queue.shift();
        outgoing.get(id).forEach((target) => {
            depth.set(target, Math.max(depth.get(target) ?? 0, depth.get(id) + 1));
            remaining.set(target, remaining.get(target) - 1);
            if (remaining.get(target) === 0) queue.push(target);
        });
    }

    // Nodes inside a cycle never reach zero in-degree; park them after the last column
    const maxDepth = Math.max(0, ...depth.values());
    flowNodes.forEach((n) => {
        if (!depth.has(n.id)) depth.set(n.id, maxDepth + 1);
    });

    const columns = new Map();
    flowNodes.forEach((n) => {
        const col = depth.get(n.id);
        if (!columns.has(col)) columns.set(col, []);
        columns.get(col).push(n);
    });

    const tallest = Math.max(1, ...[...columns.values()].map((c) => c.length));
    const positions = new Map();
    columns.forEach((column, col) => {
        column
            .sort((a, b) => a.position.y - b.position.y)
            .forEach((n, row) => {
                const offset = ((tallest - column.length) * ROW_GAP) / 2;
                positions.set(n.id, { x: col * COLUMN_GAP, y: offset + row * ROW_GAP });
            });
    });

    return nodes.map((n) => (positions.has(n.id) ? { ...n, position: positions.get(n.id) } : n));
}

// Breadth-first order from the roots, used by the test run animation
export function executionOrder(nodes, edges, isNote) {
    const flowNodes = nodes.filter((n) => !isNote(n));
    const targets = new Set(edges.map((e) => e.target));
    const roots = flowNodes.filter((n) => !targets.has(n.id)).map((n) => n.id);
    const seen = new Set();
    const order = [];
    const queue = [...roots];
    while (queue.length) {
        const id = queue.shift();
        if (seen.has(id)) continue;
        seen.add(id);
        order.push(id);
        edges.filter((e) => e.source === id).forEach((e) => queue.push(e.target));
    }
    return order;
}
