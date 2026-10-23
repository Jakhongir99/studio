import React from "react";
import { MantineProvider } from "@mantine/core";
import FeedbackModal from "./components/FeedbackModal.jsx";
import { useLocalStorage } from "@mantine/hooks";
import StudioShell from "./shell/StudioShell.jsx";
import { AppStateProvider } from "./shell/AppState.jsx";
import { AuthProvider, useAuth } from "./auth/AuthProvider.jsx";
import LoginPage from "./auth/LoginPage.jsx";

const FONT_FAMILY = "Poppins, 'Montserrat Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

// Dropdowns must sit above the editor card, React Flow panels and the floating chat
const OVERLAY_Z = 1000;

const components = {
    TextInput: { defaultProps: { radius: 10 }, styles: { label: { marginBottom: 6, fontWeight: 500 }, input: { transition: "border-color 150ms ease, box-shadow 150ms ease", "&:focus": { boxShadow: "0 0 0 3px rgba(34,139,230,0.12)" } } } },
    PasswordInput: { defaultProps: { radius: 10 }, styles: { label: { marginBottom: 6, fontWeight: 500 } } },
    Modal: { defaultProps: { radius: 20, overlayProps: { opacity: 0.35, blur: 4 } } },
    Button: {
        defaultProps: { radius: 8 },
        styles: (theme, params, { variant }) => ({
            root: {
                fontWeight: 500,
                ...(variant === "default"
                    ? {
                          color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.colors.gray[7],
                          borderColor: theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[3],
                      }
                    : {}),
            },
            leftIcon: { marginRight: 8 },
        }),
    },
    SegmentedControl: {
        defaultProps: { radius: 10, transitionDuration: 220 },
        styles: (theme) => {
            const dark = theme.colorScheme === "dark";
            const border = dark ? theme.colors.dark[4] : theme.colors.gray[3];
            const activeSurface = {
                border: `1px solid ${dark ? theme.colors.dark[3] : theme.colors.gray[3]}`,
                backgroundColor: dark ? theme.colors.dark[5] : theme.white,
                boxShadow: dark ? "0 1px 3px rgba(0, 0, 0, 0.4)" : "0 1px 3px rgba(16, 24, 40, 0.08)",
            };
            return {
                root: {
                    padding: 3,
                    border: `1px solid ${border}`,
                    backgroundColor: dark ? theme.colors.dark[7] : theme.colors.gray[0],
                },
                indicator: activeSurface,
                control: {
                    "&:not(:first-of-type)": { borderColor: "transparent" },
                },
                controlActive: activeSurface,
                label: {
                    fontWeight: 500,
                    color: dark ? theme.colors.dark[1] : theme.colors.gray[6],
                    "&:hover": { color: dark ? theme.white : theme.colors.gray[9] },
                    "&[data-active]": {
                        "&, &:hover": {
                            fontWeight: 600,
                            color: dark ? theme.colors.green[4] : theme.colors.green[8],
                        },
                    },
                },
            };
        },
    },
    Badge: { styles: { root: { fontWeight: 600, letterSpacing: 0.2 } } },
    Menu: { defaultProps: { withinPortal: true, zIndex: OVERLAY_Z }, styles: { item: { fontSize: 13 } } },
    Popover: { defaultProps: { withinPortal: true, zIndex: OVERLAY_Z } },
    Tooltip: { defaultProps: { withinPortal: true, zIndex: OVERLAY_Z + 10 } },
    HoverCard: { defaultProps: { withinPortal: true, zIndex: OVERLAY_Z } },
    Select: { defaultProps: { radius: 10, withinPortal: true, zIndex: OVERLAY_Z }, styles: { label: { marginBottom: 6 } } },
};

function AuthGate({ onToggleColorScheme }) {
    const { session } = useAuth();
    if (!session) return <LoginPage />;
    return (
        <AppStateProvider key={session.email} account={session}>
            <StudioShell onToggleColorScheme={onToggleColorScheme} />
        </AppStateProvider>
    );
}

function App() {
    const [colorScheme, setColorScheme] = useLocalStorage({
        key: "egaro-studio-color-scheme",
        defaultValue: "light",
        getInitialValueInEffect: false,
    });

    const toggleColorScheme = () => setColorScheme((current) => (current === "dark" ? "light" : "dark"));

    return (
        <MantineProvider
            withGlobalStyles
            withNormalizeCSS
            theme={{
                colorScheme,
                primaryColor: "blue",
                fontFamily: FONT_FAMILY,
                headings: { fontFamily: FONT_FAMILY, fontWeight: 600 },
                globalStyles: () => ({
                    body: { WebkitFontSmoothing: "antialiased" },
                }),
                components,
            }}
        >
            <FeedbackModal />
            <AuthProvider>
                <AuthGate onToggleColorScheme={toggleColorScheme} />
            </AuthProvider>
        </MantineProvider>
    );
}

export default App;
