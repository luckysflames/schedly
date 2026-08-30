import React from "react";
import { TouchableOpacity, StyleSheet, Animated } from "react-native";
import * as LucideIcons from "lucide-react-native";

export const TabMenuItem = ({ onPress, isFocused, iconSet, theme }) => {
    const IconComponent = iconSet || LucideIcons.Home;
    const scaleValue = React.useRef(new Animated.Value(1)).current;

    const onPressIn = () => {
        Animated.spring(scaleValue, {
            toValue: 0.85,
            useNativeDriver: true,
        }).start();
    };

    const onPressOut = () => {
        Animated.spring(scaleValue, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    const styles = createStyles(theme);

    return (
        <TouchableOpacity
            onPress={onPress}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            activeOpacity={1}
            style={styles.tabItem}
        >
            <Animated.View
                style={[
                    styles.contentContainer,
                    {
                        transform: [{ scale: scaleValue }],
                    },
                ]}
            >
                <IconComponent
                    size={22}
                    color={isFocused ? theme.accent : theme.textDark}
                    strokeWidth={isFocused ? 2.5 : 2}
                />
            </Animated.View>
        </TouchableOpacity>
    );
};

const createStyles = (theme) =>
    StyleSheet.create({
        tabItem: {
            flex: 1,
            height: 56,
            alignItems: "center",
            justifyContent: "center",
        },
        contentContainer: {
            alignItems: "center",
            justifyContent: "center",
        },
        label: {
            fontSize: 11,
            fontWeight: "500",
        },
    });
