import React from "react";
import { Box, Group, Text, ThemeIcon, useMantineTheme } from "@mantine/core";
import { IconInbox } from "@tabler/icons-react";

export default function EmptyState({ Icon = IconInbox, title, description, badge, actions, compact = false }) {
    const theme = useMantineTheme();
    return <Box style={{ "--empty-paper": theme.colorScheme === "dark" ? "#253b31" : "#ffffff" }} className={`empty-state ${compact ? "empty-state--compact" : ""}`}>
        <div className="empty-state-art" aria-hidden="true">
            <span className="empty-orbit" /><span className="empty-paper paper-back" />
            <span className="empty-paper paper-front"><i /><i /><i /></span>
            <ThemeIcon className="empty-state-icon" size={compact ? 42 : 64} radius={compact ? 14 : 20} color="teal" variant="light"><Icon size={compact ? 23 : 30} stroke={1.4} /></ThemeIcon>
            <span className="empty-spark">+</span>
        </div>
        {badge && <Text fz={10} fw={600} c="teal" mb={10} sx={{ letterSpacing: 2 }}>{badge}</Text>}
        <Text fz={compact ? 13 : 23} fw={600} lh={1.4}>{title}</Text>
        {description && <Text c="dimmed" fz={compact ? 11 : 13} lh={1.8} mt={compact ? 6 : 12} maw={440} mx="auto">{description}</Text>}
        {actions && <Group position="center" spacing={10} mt={compact ? 14 : 22}>{actions}</Group>}
    </Box>;
}
