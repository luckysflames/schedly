export const BASE_COLORS = {
    white: "#FFFFFF",
    black: "#000000",
    red: "#FF5252",
    orange: "#E89149",
    transparent: "transparent",
};

export const THEMES = {
    schedly: {
        accent: "#0d82fd",
        accentMuted: "#0d82fd85",
        main: "#121212",
        dark: "#000000",
        overlay: "rgba(0, 0, 0, 0.85)",
        text: "#FFFFFF",
        textDark: "#2a2b2d",
    },
    geekly: {
        accent: "#7d8aff",
        accentMuted: "#7d8aff85",
        main: "#0b1534",
        dark: "#050b28",
        overlay: "rgba(2, 4, 10, 0.85)",
        text: "#FFFFFF",
        textDark: "#7f7f7f",
    },
    leafly: {
        accent: "#e3cfa8",
        accentMuted: "#e3cfa885",
        main: "#132a22",
        dark: "#0a1813",
        overlay: "rgba(5, 12, 10, 0.85)",
        text: "#FFFFFF",
        textDark: "#335647",
    },
    finik: {
        accent: "#f5caa7",
        accentMuted: "#f5caa785",
        main: "#385144",
        dark: "#2d4237",
        overlay: "rgba(0, 0, 0, 0.8)",
        text: "#FFFFFF",
        textDark: "#2d7049",
    },
    vladonikc: {
        accent: "#f5caa7",
        accentMuted: "#f5caa785",
        main: "#27334b",
        dark: "#1e273a",
        overlay: "rgba(11, 16, 26, 0.85)",
        text: "#FFFFFF",
        textDark: "#526280",
    },
    berry: {
        accent: "#f0cdd2",
        accentMuted: "#f0cdd285",
        main: "#3c1950",
        dark: "#4a2461",
        overlay: "rgba(0, 0, 0, 0.85)",
        text: "#FFFFFF",
        textDark: "#9a55c3",
    },
    coffee: {
        accent: "#eccdb1",
        accentMuted: "#eccdb185",
        main: "#44252b",
        dark: "#2e1116",
        overlay: "rgba(0, 0, 0, 0.85)",
        text: "#FFFFFF",
        textDark: "#855a63",
    },
    pumpkin: {
        accent: "#ffb07c",
        accentMuted: "#ffb07c85",
        main: "#2d1f1e",
        dark: "#1f1414",
        overlay: "rgba(15, 10, 10, 0.85)",
        text: "#FFFFFF",
        textDark: "#5b2e28",
    },
    sakura: {
        accent: "#fbcad0",
        accentMuted: "#fbcad085",
        main: "#211c27",
        dark: "#17131c",
        overlay: "rgba(10, 8, 13, 0.85)",
        text: "#FFFFFF",
        textDark: "#332326",
    },
    violet: {
        accent: "#b388ff",
        accentMuted: "#b388ff85",
        main: "#1c132b",
        dark: "#0f0a1c",
        overlay: "rgba(10, 6, 20, 0.85)",
        text: "#FFFFFF",
        textDark: "#7f7f7f",
    },
    discord: {
        accent: "#5865f2", // Фирменный Blurple
        accentMuted: "#5865f285",
        main: "#313338", // Классический темный фон чатов Discord
        dark: "#2b2d31", // Цвет панелей и вложений
        overlay: "rgba(0, 0, 0, 0.85)",
        text: "#ffffff",
        textDark: "#949ba4",
    },
    spotify: {
        accent: "#1db954", // Фирменный Spotify Green
        accentMuted: "#1db95485",
        main: "#121212", // Базовый угольно-черный фон плеера
        dark: "#000000",
        overlay: "rgba(0, 0, 0, 0.85)",
        text: "#ffffff",
        textDark: "#939393",
    },
    netflix: {
        accent: "#e50914",
        accentMuted: "#e5091485",
        main: "#141414",
        dark: "#000000",
        overlay: "rgba(0, 0, 0, 0.85)",
        text: "#ffffff",
        textDark: "#808080",
    },
    steam: {
        accent: "#66c0f4", // Фирменный темно-синий Steam (или можно использовать акцентную кнопку #66c0f4)
        accentMuted: "#66c0f485",
        main: "#171a21", // Классический темный фон клиента Steam
        dark: "#0f1015", // Более глубокий фоновый оттенок
        overlay: "rgba(0, 0, 0, 0.85)",
        text: "#ffffff",
        textDark: "#8f98a0", // Фирменный приглушенный серый текст Steam
    },
};

export const DEFAULT_THEME_NAME = "schedly";

export const getThemeColors = (themeName = DEFAULT_THEME_NAME) => ({
    ...BASE_COLORS,
    ...(THEMES[themeName] || THEMES[DEFAULT_THEME_NAME]),
});
