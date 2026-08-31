import { useMemo } from "react";
import { useSchedlyStore } from "../store/useSchedlyStore";
import { getThemeColors } from "../theme/themes";

export const useTheme = () => {
    const themeName = useSchedlyStore((state) => state.themeName);
    const setThemeName = useSchedlyStore((state) => state.setThemeName);

    const theme = getThemeColors(themeName);

    // Функция-помощник, которая сразу мемоизирует фабрику стилей
    const createStyles = (stylesFactory) => {
        return useMemo(() => stylesFactory(theme), [theme, stylesFactory]);
    };

    return {
        theme,
        themeName,
        setThemeName,
        createStyles,
    };
};
