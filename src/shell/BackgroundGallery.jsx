import React, { useState } from "react";
import { ActionIcon, Box, FileButton, SimpleGrid, Stack, Text, Tooltip, UnstyledButton } from "@mantine/core";
import { feedback } from "../lib/feedback.js";
import { IconCheck, IconPhotoPlus, IconTrash } from "@tabler/icons-react";
import { useTranslation } from "../lib/i18n.js";
import { useAppState } from "./AppState.jsx";
import { BACKGROUNDS, CUSTOM_BACKGROUND, IMAGE_BACKGROUNDS, fileToBackground } from "./backgrounds.js";

function Swatch({ label, preview, selected, onClick, height }) {
    return (
        <UnstyledButton onClick={onClick} aria-label={label} aria-pressed={selected}>
            <Stack spacing={4} align="center">
                <Box
                    sx={{
                        width: "100%",
                        height,
                        borderRadius: 10,
                        background: preview,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#FFFFFF",
                        outline: selected ? "2px solid #228BE6" : "1px solid rgba(0,0,0,0.06)",
                        outlineOffset: selected ? 2 : 0,
                        transition: "transform 120ms ease",
                        "&:hover": { transform: "translateY(-1px)" },
                    }}
                >
                    {selected ? (
                        <Box sx={{ background: "rgba(0,0,0,0.35)", borderRadius: 20, padding: 3, display: "flex" }}>
                            <IconCheck size={15} />
                        </Box>
                    ) : null}
                </Box>
                <Text fz={11} fw={selected ? 600 : 400} truncate maw="100%">
                    {label}
                </Text>
            </Stack>
        </UnstyledButton>
    );
}

const imagePreview = (src) => `url("${src}") center / cover no-repeat`;

function BackgroundGallery({ cols = 3, swatchHeight = 40 }) {
    const { t } = useTranslation();
    const { background, setBackground, customImage, setCustomImage } = useAppState();
    const [loading, setLoading] = useState(false);

    const handleUpload = async (file) => {
        if (!file) return;
        setLoading(true);
        try {
            const dataUrl = await fileToBackground(file);
            if (!setCustomImage(dataUrl)) {
                feedback.show({ color: "red", title: t("Xatolik"), message: t("Rasm juda katta, kichikroq rasm tanlang") });
            }
        } catch {
            feedback.show({ color: "red", title: t("Xatolik"), message: t("Rasmni o'qib bo'lmadi") });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Stack spacing={14}>
            <Box>
                <Text fz={11} fw={600} c="dimmed" tt="uppercase" mb={8}>
                    {t("Ranglar")}
                </Text>
                <SimpleGrid cols={cols} spacing={10}>
                    {BACKGROUNDS.map((bg) => (
                        <Swatch
                            key={bg.key}
                            label={t(bg.label)}
                            preview={bg.swatch}
                            height={swatchHeight}
                            selected={background === bg.key}
                            onClick={() => setBackground(bg.key)}
                        />
                    ))}
                </SimpleGrid>
            </Box>
            <Box>
                <Text fz={11} fw={600} c="dimmed" tt="uppercase" mb={8}>
                    {t("Rasmlar")}
                </Text>
                <SimpleGrid cols={cols} spacing={10}>
                    {IMAGE_BACKGROUNDS.map((bg) => (
                        <Swatch
                            key={bg.key}
                            label={t(bg.label)}
                            preview={imagePreview(bg.src)}
                            height={swatchHeight}
                            selected={background === bg.key}
                            onClick={() => setBackground(bg.key)}
                        />
                    ))}
                    {customImage ? (
                        <Box pos="relative">
                            <Swatch
                                label={t("Mening rasmim")}
                                preview={imagePreview(customImage)}
                                height={swatchHeight}
                                selected={background === CUSTOM_BACKGROUND}
                                onClick={() => setBackground(CUSTOM_BACKGROUND)}
                            />
                            <Tooltip label={t("Rasmni o'chirish")} withArrow>
                                <ActionIcon
                                    size={20}
                                    radius="xl"
                                    variant="filled"
                                    color="dark"
                                    pos="absolute"
                                    top={-6}
                                    right={-6}
                                    onClick={() => setCustomImage(null)}
                                    aria-label={t("Rasmni o'chirish")}
                                >
                                    <IconTrash size={11} />
                                </ActionIcon>
                            </Tooltip>
                        </Box>
                    ) : null}
                    <FileButton onChange={handleUpload} accept="image/png,image/jpeg,image/webp">
                        {(props) => (
                            <UnstyledButton {...props} disabled={loading} aria-label={t("Rasm yuklash")}>
                                <Stack spacing={4} align="center">
                                    <Box
                                        sx={(theme) => ({
                                            width: "100%",
                                            height: swatchHeight,
                                            borderRadius: 10,
                                            border: `1.5px dashed ${theme.colors.gray[5]}`,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: theme.colors.gray[6],
                                            "&:hover": { borderColor: theme.colors.blue[5], color: theme.colors.blue[6] },
                                        })}
                                    >
                                        <IconPhotoPlus size={18} />
                                    </Box>
                                    <Text fz={11}>{loading ? t("Yuklanmoqda...") : t("Yuklash")}</Text>
                                </Stack>
                            </UnstyledButton>
                        )}
                    </FileButton>
                </SimpleGrid>
            </Box>
        </Stack>
    );
}

export default BackgroundGallery;
