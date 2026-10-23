// Minimal stand-in for react-i18next: returns the key with {{var}} placeholders filled in
const interpolate = (key, vars) =>
    typeof key === "string" && vars
        ? key.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, name) => (name in vars ? vars[name] : match))
        : key;

const t = (key, vars) => interpolate(key, vars);

export const useTranslation = () => ({ t });
