import React from "react";
import { ActionIcon, Box, CloseButton, Text, Tooltip, UnstyledButton } from "@mantine/core";
import { IconPlus, IconSitemap } from "@tabler/icons-react";
import { get } from "lodash";
import { useTranslation } from "../lib/i18n.js";
import { PAGES } from "./navigation.js";

const TAB_HEIGHT = 40;
const CURVE = 10;

function BrowserTab({ tab, active, first, dirty, surface, darkMode, onSelect, onClose }) {
    const { t } = useTranslation();
    const Icon = tab.kind === "page" ? get(PAGES, [tab.page, "Icon"], IconSitemap) : IconSitemap;

    return (
        <UnstyledButton
            component="div"
            role="tab"
            aria-selected={active}
            onClick={onSelect}
            onAuxClick={(event) => {
                if (event.button === 1) onClose();
            }}
            tabIndex={0}
            onKeyDown={(event) => {
                if (event.target !== event.currentTarget) return;
                if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelect(); }
            }}
            sx={{
                position: "relative",
                height: TAB_HEIGHT,
                flex: "0 1 220px",
                minWidth: 64,
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "0 8px 0 12px",
                borderRadius: `${CURVE}px ${CURVE}px 0 0`,
                background: active ? surface : "transparent",
                color: active ? (darkMode ? "#E9ECEF" : "#343A40") : "rgba(255,255,255,0.88)",
                cursor: "default",
                userSelect: "none",
                zIndex: active ? 2 : 1,
                "&:hover": active ? undefined : { background: "rgba(255,255,255,0.14)" },
                // Concave bottom corners so the active tab flows into the card like a browser tab
                ...(active
                    ? {
                          "&::before, &::after": {
                              content: '""',
                              position: "absolute",
                              bottom: 0,
                              width: CURVE,
                              height: CURVE,
                              pointerEvents: "none",
                          },
                          "&::before": {
                              display: first ? "none" : "block",
                              left: -CURVE,
                              background: `radial-gradient(circle at 0 0, transparent ${CURVE}px, ${surface} ${CURVE + 0.5}px)`,
                          },
                          "&::after": {
                              right: -CURVE,
                              background: `radial-gradient(circle at 100% 0, transparent ${CURVE}px, ${surface} ${CURVE + 0.5}px)`,
                          },
                      }
                    : {}),
            }}
        >
            <Icon size={16} stroke={1.7} style={{ flexShrink: 0 }} color={active ? "#1C7ED6" : "currentColor"} />
            <Text title={tab.name} fz={13} fw={500} c="inherit" truncate sx={{ flex: 1, minWidth: 0 }}>
                {tab.name || t("Nomsiz")}
            </Text>
            {dirty ? (
                <Box
                    title={t("Saqlanmagan")}
                    sx={{ width: 7, height: 7, borderRadius: "50%", background: "#FD7E14", flexShrink: 0 }}
                />
            ) : null}
            <CloseButton
                size="sm"
                radius="xl"
                className="browser-tab-close"
                aria-label={`${tab.name || t("Nomsiz")} — ${t("Yopish")}`}
                title={t("Tabni yopish")}
                onAuxClick={(event) => event.stopPropagation()}
                sx={{
                    flexShrink: 0,
                    color: active ? (darkMode ? "#E9ECEF" : "#495057") : "#FFFFFF",
                    background: "transparent",
                    transition: "background 120ms ease, color 120ms ease",
                    "&:hover": {
                        color: active ? (darkMode ? "#FFFFFF" : "#263238") : "#FFFFFF",
                        background: active ? (darkMode ? "rgba(255,255,255,0.14)" : "#E9EDF0") : "rgba(0,0,0,0.24)",
                    },
                }}
                onClick={(event) => {
                    event.stopPropagation();
                    onClose();
                }}
            />
        </UnstyledButton>
    );
}

function BrowserTabs({ tabs, activeId, dirtyMap, surface, darkMode, onSelect, onClose, onOpen }) {
    const { t } = useTranslation();

    return (
        <Box
            className="browser-tabs"
            role="tablist"
            sx={{
                display: "flex",
                alignItems: "flex-end",
                gap: 2,
                minWidth: 0,
                flex: 1,
                height: TAB_HEIGHT,
                overflowX: "auto",
                overflowY: "hidden",
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": { display: "none" },
            }}
        >
            {tabs.map((tab, index) => (
                <BrowserTab
                    key={tab.id}
                    tab={tab}
                    first={index === 0}
                    active={tab.id === activeId}
                    dirty={!!dirtyMap[tab.id]}
                    surface={surface}
                    darkMode={darkMode}
                    onSelect={() => onSelect(tab.id)}
                    onClose={() => onClose(tab.id)}
                />
            ))}
            <Tooltip label={t("Yangi jarayon")} withArrow>
                <ActionIcon
                    size={30}
                    radius="xl"
                    variant="transparent"
                    aria-label={t("Yangi jarayon")}
                    onClick={onOpen}
                    sx={{
                        alignSelf: "center",
                        marginLeft: 4,
                        color: "#FFFFFF",
                        "&:hover": { background: "rgba(255,255,255,0.18)" },
                    }}
                >
                    <IconPlus size={18} />
                </ActionIcon>
            </Tooltip>
        </Box>
    );
}

export default BrowserTabs;
