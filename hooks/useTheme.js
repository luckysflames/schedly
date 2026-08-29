import { useMemo } from "react";
import { useGridlyStore } from "../store/useGridlyStore";
import { getThemeColors } from "../theme/themes";

export const useTheme = () => {
    const themeName = useGridlyStore((state) => state.themeName);
    const setThemeName = useGridlyStore((state) => state.setThemeName);

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
