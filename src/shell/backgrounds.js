import seaImage from "../assets/backgrounds/bg_sea.jpg";
import mountainsImage from "../assets/backgrounds/bg_mountains.jpg";
import wavesImage from "../assets/backgrounds/bg_waves.jpg";

export const CUSTOM_BACKGROUND = "custom";

const imageLayer = (src, darkMode) =>
    `linear-gradient(rgba(0,0,0,${darkMode ? 0.45 : 0.15}), rgba(0,0,0,${darkMode ? 0.55 : 0.3})), url("${src}") center / cover no-repeat`;

export const IMAGE_BACKGROUNDS = [
    { key: "img_sea", label: "Dengiz surati", src: seaImage },
    { key: "img_mountains", label: "Tog'lar", src: mountainsImage },
    { key: "img_waves", label: "To'lqinlar", src: wavesImage },
];

export const BACKGROUNDS = [
    {
        key: "xb",
        label: "Xalq banki",
        swatch: "linear-gradient(135deg, #1FB86A, #00592C)",
        light: [
            "radial-gradient(900px 520px at 8% -8%, rgba(120, 230, 160, 0.32), transparent 62%)",
            "radial-gradient(800px 600px at 105% 110%, rgba(0, 48, 24, 0.7), transparent 60%)",
            "linear-gradient(155deg, #0E8A4A 0%, #046B37 45%, #013F20 100%)",
        ].join(", "),
        dark: [
            "radial-gradient(900px 520px at 8% -8%, rgba(31, 184, 106, 0.22), transparent 62%)",
            "linear-gradient(155deg, #0B3320 0%, #072215 50%, #03120B 100%)",
        ].join(", "),
    },
    {
        key: "sea",
        label: "Dengiz",
        swatch: "linear-gradient(135deg, #2F7A84, #133F4C)",
        light: [
            "radial-gradient(900px 520px at 8% -8%, rgba(120, 214, 214, 0.38), transparent 62%)",
            "radial-gradient(800px 600px at 105% 110%, rgba(8, 52, 66, 0.75), transparent 60%)",
            "linear-gradient(155deg, #2F7A84 0%, #1E5B68 42%, #133F4C 100%)",
        ].join(", "),
        dark: [
            "radial-gradient(900px 520px at 8% -8%, rgba(56, 140, 150, 0.28), transparent 62%)",
            "linear-gradient(155deg, #12333B 0%, #0C232A 50%, #071519 100%)",
        ].join(", "),
    },
    {
        key: "ocean",
        label: "Okean",
        swatch: "linear-gradient(135deg, #2B8FE0, #0B3A75)",
        light: [
            "radial-gradient(900px 520px at 8% -8%, rgba(130, 200, 255, 0.35), transparent 62%)",
            "linear-gradient(155deg, #1F6FC0 0%, #144F93 45%, #0B3366 100%)",
        ].join(", "),
        dark: "linear-gradient(155deg, #10284A 0%, #0A1B33 50%, #050E1C 100%)",
    },
    {
        key: "indigo",
        label: "Binafsha",
        swatch: "linear-gradient(135deg, #7B6CF0, #2E2470)",
        light: [
            "radial-gradient(900px 520px at 8% -8%, rgba(180, 170, 255, 0.35), transparent 62%)",
            "linear-gradient(155deg, #5B4FD0 0%, #40369E 45%, #261F66 100%)",
        ].join(", "),
        dark: "linear-gradient(155deg, #221C4A 0%, #161233 50%, #0B091C 100%)",
    },
    {
        key: "sunset",
        label: "Shafaq",
        swatch: "linear-gradient(135deg, #F08A4B, #8E2E4F)",
        light: [
            "radial-gradient(900px 520px at 8% -8%, rgba(255, 200, 140, 0.4), transparent 62%)",
            "linear-gradient(155deg, #D9653B 0%, #B0424A 50%, #6E2445 100%)",
        ].join(", "),
        dark: "linear-gradient(155deg, #3E1B22 0%, #2A1218 50%, #16090D 100%)",
    },
    {
        key: "graphite",
        label: "Grafit",
        swatch: "linear-gradient(135deg, #5C6670, #1E2328)",
        light: "linear-gradient(155deg, #4A535C 0%, #343B42 50%, #1E2328 100%)",
        dark: "linear-gradient(155deg, #23272C 0%, #181B1F 50%, #0D0F11 100%)",
    },
];

export const DEFAULT_BACKGROUND = BACKGROUNDS[0].key;

export const getBackground = (key) => BACKGROUNDS.find((b) => b.key === key) || BACKGROUNDS[0];

export const resolveBackground = (key, customImage, darkMode) => {
    if (key === CUSTOM_BACKGROUND && customImage) return imageLayer(customImage, darkMode);
    const image = IMAGE_BACKGROUNDS.find((b) => b.key === key);
    if (image) return imageLayer(image.src, darkMode);
    return getBackground(key)[darkMode ? "dark" : "light"];
};

const MAX_IMAGE_WIDTH = 1920;

// Downscales an uploaded file to a JPEG data URL small enough for localStorage
export const fileToBackground = (file) =>
    new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new window.Image();
        img.onload = () => {
            const scale = Math.min(1, MAX_IMAGE_WIDTH / img.width);
            const canvas = document.createElement("canvas");
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);
            canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(url);
            resolve(canvas.toDataURL("image/jpeg", 0.82));
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("invalid image"));
        };
        img.src = url;
    });


// Auth uses the same saved background, with matching accents and a neutral contrast layer.
const AUTH_PALETTES = {
    xb: ["#204e3e", "#c4f5c9", "32,78,62"],
    sea: ["#215967", "#bfeef1", "33,89,103"],
    ocean: ["#255c96", "#c8e7ff", "37,92,150"],
    indigo: ["#514399", "#e0d6ff", "81,67,153"],
    sunset: ["#93485b", "#ffe0c2", "147,72,91"],
    graphite: ["#414e5b", "#e0e7ef", "65,78,91"],
};

export const authBackgroundStyle = (key, customImage, darkMode) => {
    const paletteKey = { img_sea: "sea", img_mountains: "graphite", img_waves: "indigo", custom: "graphite" }[key] || key;
    const [ink, accent, rgb] = AUTH_PALETTES[paletteKey] || AUTH_PALETTES.xb;
    return {
        background: resolveBackground(key, customImage, darkMode),
        "--auth-ink": ink,
        "--auth-accent": accent,
        "--auth-rgb": rgb,
        "--auth-card": darkMode ? `color-mix(in srgb, ${ink} 28%, #15191f)` : "#fcfdfb",
        "--auth-text": darkMode ? "#edf2f7" : ink,
        "--auth-muted": darkMode ? "#b8c4d0" : "#64717c",
    };
};
