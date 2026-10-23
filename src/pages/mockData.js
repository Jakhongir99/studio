import dayjs from "dayjs";

const at = (days, hour = 10, minute = 0) =>
    dayjs().add(days, "day").hour(hour).minute(minute).second(0).toISOString();
const ago = (minutes) => dayjs().subtract(minutes, "minute").toISOString();

export const DEFAULT_USER = {
    firstName: "Jahongir",
    lastName: "Abdullayev",
    email: "j.abdullayev@xb.uz",
    phone: "+998 90 123 45 67",
    position: "Biznes-jarayonlar tahlilchisi",
    department: "Raqamli transformatsiya departamenti",
    color: "green",
};

export const PEOPLE = [
    { id: "ja", name: "Jahongir Abdullayev", color: "green" },
    { id: "dk", name: "Dilnoza Karimova", color: "pink" },
    { id: "sr", name: "Sardor Rahimov", color: "blue" },
    { id: "mt", name: "Malika Tursunova", color: "grape" },
    { id: "ou", name: "Otabek Usmonov", color: "orange" },
];

export const personById = (id) => PEOPLE.find((p) => p.id === id) || PEOPLE[0];

export const initials = (name) =>
    name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

export const NOTIFICATION_TYPES = {
    run_failed: { color: "red", label: "Xatolik" },
    run_success: { color: "teal", label: "Jarayon" },
    task: { color: "blue", label: "Vazifa" },
    mention: { color: "grape", label: "Eslatma" },
    system: { color: "gray", label: "Tizim" },
};

export const INITIAL_NOTIFICATIONS = [
    {
        id: "nt1",
        type: "run_failed",
        title: "«Kiruvchi hujjatlar» jarayoni xato bilan yakunlandi",
        body: "Comment task qadamida API 504 javob qaytardi. Qayta urinish rejalashtirildi.",
        createdAt: ago(6),
        read: false,
    },
    {
        id: "nt2",
        type: "mention",
        title: "Dilnoza Karimova sizni eslatdi",
        body: "«Kredit arizalarini tekshirish» vazifasida: @Jahongir, shablonni ko'rib chiqing.",
        createdAt: ago(42),
        read: false,
    },
    {
        id: "nt3",
        type: "task",
        title: "Sizga yangi vazifa biriktirildi",
        body: "Filiallar bo'yicha oylik hisobotni tayyorlash — muddat: ertaga 18:00.",
        createdAt: ago(95),
        read: false,
    },
    {
        id: "nt4",
        type: "run_success",
        title: "«Yangi mijozlar — onboarding» v2 nashr qilindi",
        body: "Sardor Rahimov jarayonning yangi versiyasini nashr qildi.",
        createdAt: ago(60 * 5),
        read: true,
    },
    {
        id: "nt5",
        type: "system",
        title: "Tizim yangilanishi",
        body: "Shanba kuni 02:00–04:00 oralig'ida rejalashtirilgan texnik ishlar o'tkaziladi.",
        createdAt: ago(60 * 26),
        read: true,
    },
    {
        id: "nt6",
        type: "task",
        title: "Vazifa bajarildi",
        body: "Malika Tursunova «KYC hujjatlarini yangilash» vazifasini yopdi.",
        createdAt: ago(60 * 50),
        read: true,
    },
];

export const TASK_COLUMNS = [
    { key: "new", label: "Yangi", color: "gray" },
    { key: "progress", label: "Jarayonda", color: "blue" },
    { key: "review", label: "Tekshiruvda", color: "orange" },
    { key: "done", label: "Bajarildi", color: "teal" },
];

export const PRIORITIES = {
    high: { label: "Yuqori", color: "red" },
    medium: { label: "O'rta", color: "yellow" },
    low: { label: "Past", color: "gray" },
};

export const INITIAL_TASKS = [
    { id: "t1", title: "Kredit arizalarini tekshirish shabloni", column: "new", priority: "high", label: "Kredit", assignee: "ja", due: at(1, 18) },
    { id: "t2", title: "Filiallar bo'yicha oylik hisobot", column: "new", priority: "medium", label: "Hisobot", assignee: "sr", due: at(3) },
    { id: "t3", title: "Mijoz shikoyatlarini tasniflash", column: "new", priority: "low", label: "Mijozlar", assignee: "dk", due: at(6) },
    { id: "t4", title: "Onboarding jarayonini CRM bilan ulash", column: "progress", priority: "high", label: "Studiya", assignee: "ja", due: at(0, 17) },
    { id: "t5", title: "Kassa operatsiyalari limitlarini yangilash", column: "progress", priority: "medium", label: "Operatsiyalar", assignee: "ou", due: at(2) },
    { id: "t6", title: "KYC hujjatlari ro'yxatini qayta ko'rib chiqish", column: "review", priority: "medium", label: "Komplayens", assignee: "mt", due: at(1) },
    { id: "t7", title: "Mobil ilova push-xabarlari matni", column: "review", priority: "low", label: "Marketing", assignee: "dk", due: at(4) },
    { id: "t8", title: "Depozit stavkalari jadvalini yangilash", column: "done", priority: "high", label: "Depozit", assignee: "sr", due: at(-1) },
    { id: "t9", title: "Ichki audit uchun hujjatlar to'plami", column: "done", priority: "medium", label: "Audit", assignee: "mt", due: at(-3) },
];

export const CALENDAR_EVENTS = [
    { id: "ev1", title: "Boshqaruv yig'ilishi", start: at(0, 10), color: "blue" },
    { id: "ev2", title: "Studiya demo", start: at(0, 15, 30), color: "green" },
    { id: "ev3", title: "Kredit qo'mitasi", start: at(1, 11), color: "orange" },
    { id: "ev4", title: "Filiallar bilan videoaloqa", start: at(2, 14), color: "grape" },
    { id: "ev5", title: "Sprint rejalashtirish", start: at(4, 9, 30), color: "blue" },
    { id: "ev6", title: "Audit hisobotini topshirish", start: at(6, 17), color: "red" },
    { id: "ev7", title: "Jamoa nonushtasi", start: at(-2, 9), color: "teal" },
    { id: "ev8", title: "Xavfsizlik treningi", start: at(9, 13), color: "orange" },
    { id: "ev9", title: "Choraklik natijalar", start: at(12, 11), color: "green" },
    { id: "ev10", title: "Mijozlar bilan uchrashuv", start: at(-5, 16), color: "pink" },
];

export const DASHBOARD_STATS = [
    { label: "Faol jarayonlar", value: "8", diff: "+2", up: true },
    { label: "Bugungi ishga tushirishlar", value: "46", diff: "+12%", up: true },
    { label: "Ochiq vazifalar", value: "23", diff: "-4", up: false },
    { label: "Muvaffaqiyat darajasi", value: "97.4%", diff: "+0.6%", up: true },
];

export const WEEKLY_RUNS = [
    { day: "Du", success: 38, failed: 2 },
    { day: "Se", success: 44, failed: 1 },
    { day: "Ch", success: 41, failed: 3 },
    { day: "Pa", success: 52, failed: 1 },
    { day: "Ju", success: 47, failed: 2 },
    { day: "Sh", success: 18, failed: 0 },
    { day: "Ya", success: 12, failed: 0 },
];

export const ACTIVE_FLOWS = [
    { name: "Kiruvchi hujjatlar — 10 kundan o'tganlar", version: 5, runs: 128, success: 96 },
    { name: "Yangi mijozlar — onboarding", version: 2, runs: 54, success: 100 },
    { name: "Kredit arizalari — avtomatik tekshiruv", version: 7, runs: 312, success: 98 },
    { name: "Shikoyatlarni yo'naltirish", version: 3, runs: 87, success: 93 },
];
