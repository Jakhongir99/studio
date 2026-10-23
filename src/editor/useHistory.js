import { useCallback, useRef, useState } from "react";

const MAX_HISTORY = 100;

// Snapshot-based undo/redo: call takeSnapshot() right before any change that should be undoable
export default function useHistory({ nodes, edges, setNodes, setEdges }) {
    const past = useRef([]);
    const future = useRef([]);
    const [, force] = useState(0);
    const rerender = () => force((n) => n + 1);

    const takeSnapshot = useCallback(() => {
        past.current = [...past.current.slice(-(MAX_HISTORY - 1)), { nodes, edges }];
        future.current = [];
        rerender();
    }, [nodes, edges]);

    const undo = useCallback(() => {
        const prev = past.current[past.current.length - 1];
        if (!prev) return;
        past.current = past.current.slice(0, -1);
        future.current = [...future.current, { nodes, edges }];
        setNodes(prev.nodes);
        setEdges(prev.edges);
        rerender();
    }, [nodes, edges, setNodes, setEdges]);

    const redo = useCallback(() => {
        const next = future.current[future.current.length - 1];
        if (!next) return;
        future.current = future.current.slice(0, -1);
        past.current = [...past.current, { nodes, edges }];
        setNodes(next.nodes);
        setEdges(next.edges);
        rerender();
    }, [nodes, edges, setNodes, setEdges]);

    const reset = useCallback(() => {
        past.current = [];
        future.current = [];
        rerender();
    }, []);

    return {
        takeSnapshot,
        undo,
        redo,
        reset,
        canUndo: past.current.length > 0,
        canRedo: future.current.length > 0,
    };
}
