import React from "react";
import { Box, Group, Text, Title, useMantineTheme } from "@mantine/core";
import { useDarkMode } from "../lib/useDarkMode.js";

export const usePageColors = () => {
    const theme = useMantineTheme();
    const darkMode = useDarkMode();
    return {
        darkMode,
        border: darkMode ? theme.colors.dark[4] : "#E9ECEF",
        canvas: darkMode ? theme.colors.dark[8] : "#F8F9FB",
        card: darkMode ? theme.colors.dark[6] : "#FFFFFF",
        muted: darkMode ? theme.colors.dark[5] : theme.colors.gray[0],
    };
};

export const cardSx = (colors) => ({
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: 16,
    boxShadow: colors.darkMode ? "none" : "0 3px 16px rgba(22,40,70,0.035)",
});

function PageLayout({ title, subtitle, actions, children }) {
    const colors = usePageColors();

    return (
        <Box className="workspace-page" sx={{ height: "100%", minHeight: 0, display: "flex", flexDirection: "column", background: colors.canvas }}>
            <Group
                position="apart"
                px={24}
                py={16}
                sx={{ borderBottom: `1px solid ${colors.border}`, background: colors.card, flexShrink: 0, gap: 16, "@media (max-width: 600px)": { padding: 16 } }}
            >
                <Box sx={{ minWidth: 0 }}>
                    <Title order={3} fz={22} fw={600}>
                        {title}
                    </Title>
                    {subtitle ? (
                        <Text fz={13} c="dimmed" mt={2}>
                            {subtitle}
                        </Text>
                    ) : null}
                </Box>
                {actions ? (
                    <Group spacing={8}>
                        {actions}
                    </Group>
                ) : null}
            </Group>
            <Box className="page-scroll" sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>
                <Box className="page-content" p={24} sx={{ "@media (max-width: 600px)": { padding: 16 } }}>
                    {children}
                </Box>
            </Box>
        </Box>
    );
}

export default PageLayout;
