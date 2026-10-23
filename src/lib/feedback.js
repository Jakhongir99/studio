let queue = [];
let nextId = 0;
const listeners = new Set();
const emit = () => listeners.forEach((listener) => listener());

export const feedback = {
    show(options) {
        const id = ++nextId;
        queue = [...queue, { ...options, id, autoClose: options.autoClose ?? (options.color === "red" ? 6000 : 3500) }];
        emit();
        return id;
    },
    dismiss(id) {
        queue = queue.filter((item) => item.id !== id);
        emit();
    },
    subscribe(listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },
    getSnapshot: () => queue,
};
