import React from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TabMenuItem } from "./TabMenuItem";
import { useTheme } from "../../../hooks/useTheme";
import { TAB_ICONS } from "../../../constants/ui";

export default function MyCustomTabBar({ state, navigation }) {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();

    const BAR_HEIGHT = 64;
    const TOTAL_BAR_HEIGHT = BAR_HEIGHT + (insets.bottom > 0 ? insets.bottom : 10);
    const ICON_CONTAINER_SIZE = 44;
    const wrapperBottomOffset = insets.bottom > 0 ? insets.bottom : 20;

    const styles = createStyles(theme, TOTAL_BAR_HEIGHT, wrapperBottomOffset);

    return (
        <View style={styles.wrapper}>
            <View style={styles.mainContainer}>
                {state.routes.map((route, index) => {
                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: "tabPress",
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (event.defaultPrevented) return;

                        if (!isFocused) {
                            navigation.navigate(route.name);
                        } else {
                            if (route.name === "Home") {
                                navigation.navigate("Home", {
                                    screen: "Main",
                                });
                            }
                        }
                    };

                    return (
                        <TabMenuItem
                            key={route.key}
                            routeName={route.name}
                            isFocused={isFocused}
                            iconSet={TAB_ICONS[route.name]}
                            ICON_CONTAINER_SIZE={ICON_CONTAINER_SIZE}
                            onPress={onPress}
                            theme={theme}
                        />
                    );
                })}
            </View>
        </View>
    );
}

const createStyles = (theme, totalBarHeight, bottomOffset) =>
    StyleSheet.create({
        wrapper: {
            position: "absolute",
            right: 20,
            left: 20,
            bottom: bottomOffset,
        },
        mainContainer: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            borderRadius: 32,
            borderWidth: 2,
            elevation: 20,
            backgroundColor: theme.main,
            borderColor: theme.accent, 
            height: totalBarHeight,
        },
    });
