import {
    IconBell,
    IconBook2,
    IconBox,
    IconCalculator,
    IconCalendar,
    IconGitMerge,
    IconLayoutGrid,
    IconListCheck,
    IconMail,
    IconMessageCircle,
    IconSettings,
    IconShieldCheck,
    IconSitemap,
    IconUser,
    IconUsers,
} from "@tabler/icons-react";

export const STUDIO_KEY = "studio";

export const NAV_ITEMS = [
    { key: "home", label: "Bosh sahifa", Icon: IconLayoutGrid },
    { key: "accounting", label: "Buxgalteriya", Icon: IconCalculator },
    { key: "warehouse", label: "Ombor", Icon: IconBox },
    { key: "management", label: "Boshqaruv", Icon: IconUsers },
    { key: "bpm", label: "BPM", Icon: IconGitMerge },
    { key: "tasks", label: "Vazifalar", Icon: IconListCheck, badge: 4 },
    { key: "wiki", label: "Wiki", Icon: IconBook2 },
    { key: "calendar", label: "Kalendar", Icon: IconCalendar },
    { key: "messenger", label: "Messenjer", Icon: IconMessageCircle, badge: 3 },
    { key: "mail", label: "Pochta", Icon: IconMail, badge: 12 },
    { key: STUDIO_KEY, label: "Studiya", Icon: IconSitemap },
    { key: "audit", label: "Audit", Icon: IconShieldCheck },
];

const EXTRA_PAGES = [
    { key: "notifications", label: "Bildirishnomalar", Icon: IconBell },
    { key: "profile", label: "Profil", Icon: IconUser },
    { key: "settings", label: "Sozlamalar", Icon: IconSettings },
];

export const PAGES = Object.fromEntries([...NAV_ITEMS, ...EXTRA_PAGES].map((item) => [item.key, item]));
