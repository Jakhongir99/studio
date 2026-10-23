import React, { useEffect, useRef, useState } from "react";
import {
    Box,
    Button,
    Group,
    Image,
    Text,
} from "@mantine/core";
import { feedback } from "../lib/feedback.js";
import {
    IconArrowUpRight,
    IconBolt,
    IconCheck,
    IconLock,
    IconShieldCheck,
    IconSitemap,
} from "@tabler/icons-react";
import { useTranslation } from "../lib/i18n.js";
import { useDarkMode } from "../lib/useDarkMode.js";
import { useLocalStorage } from "@mantine/hooks";
import { BACKGROUND_KEY, readCustomBackground } from "../shell/AppState.jsx";
import { DEFAULT_BACKGROUND, authBackgroundStyle } from "../shell/backgrounds.js";
import { useAuth } from "./AuthProvider.jsx";
import logo from "../assets/xb_logo.svg";
import "./login.css";

function LoginPage() {
    const { t } = useTranslation();
    const darkMode = useDarkMode();
    const [background] = useLocalStorage({ key: BACKGROUND_KEY, defaultValue: DEFAULT_BACKGROUND, getInitialValueInEffect: false });
    const [customImage] = useState(readCustomBackground);
    const { loginSSO } = useAuth();
    const [stage, setStage] = useState("idle");
    const pending = useRef(false);
    const busy = stage !== "idle";

    useEffect(() => {
        if (stage !== "connecting") return;
        const verifying = setTimeout(() => setStage("verifying"), 650);
        return () => clearTimeout(verifying);
    }, [stage]);

    useEffect(() => {
        if (stage !== "verifying") return;
        const success = setTimeout(() => setStage("success"), 800);
        return () => clearTimeout(success);
    }, [stage]);

    const handleSSO = async () => {
        if (pending.current) return;
        pending.current = true;
        setStage("connecting");
        try {
            const session = await loginSSO();
            const firstName = session.name?.split(" ")[0];
            feedback.show({
                color: "teal",
                title: firstName ? `${t("Xush kelibsiz")}, ${firstName}!` : t("Xush kelibsiz!"),
                message: t("Tizimga muvaffaqiyatli kirdingiz. Ish maydoningiz tayyor."),
                autoClose: 2000,
            });
        } catch (error) {
            setStage("idle");
            pending.current = false;
            feedback.show({ color: "red", title: t("Kirish amalga oshmadi"), message: t(error.message) });
        }
    };

    const status = {
        idle: "Korporativ hisobingiz bilan davom eting",
        connecting: "SSO bilan bog‘lanmoqda...",
        verifying: "Hisobingiz tasdiqlanmoqda...",
        success: "Tayyor! Ish maydoni ochilmoqda...",
    }[stage];

    return (
        <Box className="login-scene" data-theme={darkMode ? "dark" : "light"} style={authBackgroundStyle(background, customImage, darkMode)}>
            <header className="login-header">
                <Group spacing={12}><Image src={logo} alt="Xalq banki" width={40} height={40} /><span className="login-wordmark">studio<span> / Xalq banki</span></span></Group>
                <span className="login-header-note"><span className="login-status-dot" /> Yagona raqamli ish maydoni</span>
            </header>
            <main className="login-main">
                <section className="login-story">
                    <div className="login-eyebrow"><span /> ISHNING YANGI RITMI</div>
                    <h1>G‘oyadan natijaga.<br /><em>Barchasi bir oqimda.</em></h1>
                    <p className="login-description">Jarayonlar, jamoa va kundalik vazifalar —<br className="desktop-break" /> bir-biriga bog‘langan yagona ish maydonida.</p>
                    <div className="login-workflow" aria-label="Jarayon: yarating, bog‘lang, ishga tushiring">
                        <div className="workflow-track" aria-hidden="true"><span /></div>
                        {[
                            { Icon: IconSitemap, title: "Yarating", label: "G‘oyangizni loyihalang", number: "01" },
                            { Icon: IconBolt, title: "Bog‘lang", label: "Qadamlarni birlashtiring", number: "02" },
                            { Icon: IconCheck, title: "Ishga tushiring", label: "Natijaga birga erishing", number: "03" },
                        ].map(({ Icon, title, label, number }, index) => <div className="workflow-step" key={number} style={{ "--step": index }}>
                            <div className="workflow-icon"><Icon size={24} stroke={1.5} /><span>{number}</span></div>
                            <strong>{title}</strong><small>{label}</small>
                        </div>)}
                    </div>
                    <div className="login-story-footer"><span className="story-symbol">✳</span><span>Kamroq takroriy ish.<br /><strong>Muhim ishlar uchun ko‘proq vaqt.</strong></span></div>
                </section>
                <section className="access-stack" aria-label="Tizimga kirish">
                    <div className="access-backplate" aria-hidden="true" />
                    <div className="access-card">
                        <div className="access-topline"><span>STUDIO ACCESS</span><span className="access-tag">SSO</span></div>
                        <div className={`access-art ${busy ? "is-connecting" : ""} ${stage === "success" ? "is-complete" : ""}`} aria-hidden="true">
                            <div className="access-orbit orbit-outer" /><div className="access-orbit orbit-inner" />
                            <span className="orbit-dot dot-one" /><span className="orbit-dot dot-two" />
                            <div className="access-key">{stage === "success" ? <IconCheck size={38} stroke={1.6} /> : <IconLock size={36} stroke={1.5} />}</div>
                            <span className="access-spark spark-one">+</span><span className="access-spark spark-two">+</span>
                        </div>
                        <div className="access-copy"><span>SIZNING ISH MAYDONINGIZ</span><h2>Xush kelibsiz.</h2><p>Bir hisob. Barcha imkoniyatlar.<br />Davom etish uchun tizimga kiring.</p></div>
                        <Button type="button" className="access-button" color="teal" size="lg" radius={14} fullWidth
                            leftIcon={busy ? null : <IconShieldCheck size={21} stroke={1.7} />}
                            rightIcon={busy ? null : <IconArrowUpRight size={20} />}
                            onClick={handleSSO} loading={busy && stage !== "success"} disabled={stage === "success"}>
                            {t(stage === "success" ? "Kirish tasdiqlandi" : "SSO orqali kirish")}
                        </Button>
                        <div className="access-status" role="status" aria-live="polite" aria-atomic="true">
                            <Text key={stage} className="sso-status" fz={11} ta="center">{t(status)}</Text>
                            {busy && <Box className="sso-progress" mt={10}><Box className="sso-progress-fill" /></Box>}
                        </div>
                        <div className="access-ticket-footer"><IconShieldCheck size={15} /><span>Xalq banki · Korporativ kirish</span><span className="ticket-bars" aria-hidden="true" /></div>
                    </div>
                </section>
            </main>
            <footer className="login-footer"><span>© {new Date().getFullYear()} Xalq banki</span><span>G‘oyalarni ishlaydigan jarayonlarga aylantiring.</span><span>STUDIO / 01</span></footer>
        </Box>
    );
}

export default LoginPage;
