import { useMantineTheme } from "@mantine/core";

export const useDarkMode = () => useMantineTheme().colorScheme === "dark";
