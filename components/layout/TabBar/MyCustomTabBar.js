import React from "react";
import { StyleSheet, View } from "react-native";

import { TabMenuItem } from "./TabMenuItem";
import { useTheme } from "../../../hooks/useTheme";
import { TAB_ICONS } from "../../../constants/ui";

export default function MyCustomTabBar({ state, navigation }) {
    const { theme } = useTheme();

    const BAR_HEIGHT = 56;
    const bottomPadding = 0;
    const TOTAL_BAR_HEIGHT = BAR_HEIGHT;

    const styles = createStyles(theme, TOTAL_BAR_HEIGHT, bottomPadding);

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
                            onPress={onPress}
                            theme={theme}
                        />
                    );
                })}
            </View>
        </View>
    );
}

const createStyles = (theme, totalBarHeight, bottomPadding) =>
    StyleSheet.create({
        wrapper: {
            position: "absolute",
            right: 0,
            left: 0,
            bottom: 0,
        },
        mainContainer: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            borderRadius: 0,
            elevation: 20,
            backgroundColor: theme.dark,
            height: totalBarHeight,
            paddingBottom: bottomPadding,
        },
    });
