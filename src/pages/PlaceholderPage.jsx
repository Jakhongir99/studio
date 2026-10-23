import React from "react";
import { Box, Button, Group, SimpleGrid, Text, ThemeIcon, UnstyledButton } from "@mantine/core";
import { IconArrowUpRight, IconCalendar, IconListCheck, IconSitemap } from "@tabler/icons-react";
import PageLayout, { cardSx, usePageColors } from "./PageLayout.jsx";
import EmptyState from "../components/EmptyState.jsx";

const SHORTCUTS = [
    { key: "studio", title: "Studiya", description: "Keyingi jarayoningizni loyihalang", Icon: IconSitemap, color: "teal" },
    { key: "tasks", title: "Vazifalar", description: "Jamoa ishlarini tartibga soling", Icon: IconListCheck, color: "blue" },
    { key: "calendar", title: "Kalendar", description: "Kuningizni oldindan rejalang", Icon: IconCalendar, color: "grape" },
];

export default function PlaceholderPage({ page, onOpenPage }) {
    const colors = usePageColors();
    return <PageLayout title={page.label} subtitle="Ish maydoningiz kengayib bormoqda">
        <Box className="module-preview" sx={{ ...cardSx(colors), background: colors.darkMode ? "linear-gradient(135deg,#172c26,#202428)" : "linear-gradient(135deg,#f0f8f4,#ffffff 65%)" }}>
            <div className="module-preview-top"><span>STUDIO / {page.key.toUpperCase()}</span><span className="module-status"><i /> Tayyorlanmoqda</span></div>
            <EmptyState Icon={page.Icon} badge="YANGI IMKONIYATLAR OLDINDA" title={`${page.label} uchun yangi makon`}
                description="Bu bo‘lim hali ishga tushmagan. Hozircha tayyor vositalar bilan ishni davom ettirishingiz mumkin."
                actions={<><Button color="teal" radius={10} rightIcon={<IconArrowUpRight size={16} />} onClick={() => onOpenPage("studio")}>Studiyani ochish</Button><Button variant="default" radius={10} onClick={() => onOpenPage("home")}>Bosh sahifaga</Button></>} />
        </Box>
        <Group position="apart" mt={26} mb={14}><Text fz={13} fw={600}>Hozir boshlashingiz mumkin</Text><Text fz={11} c="dimmed">Ishingizni to‘xtatmasdan davom eting</Text></Group>
        <SimpleGrid cols={3} spacing={16} breakpoints={[{ maxWidth: 850, cols: 1 }]}>
            {SHORTCUTS.map(({ key, title, description, Icon, color }) => <UnstyledButton key={key} className="module-shortcut" p={20} sx={cardSx(colors)} onClick={() => onOpenPage(key)}>
                <Group noWrap spacing={14}><ThemeIcon size={44} radius={14} variant="light" color={color}><Icon size={22} stroke={1.5} /></ThemeIcon><Box sx={{ flex: 1 }}><Text fz={14} fw={500}>{title}</Text><Text fz={11} c="dimmed" mt={4}>{description}</Text></Box><IconArrowUpRight size={18} opacity={0.5} /></Group>
            </UnstyledButton>)}
        </SimpleGrid>
    </PageLayout>;
}
