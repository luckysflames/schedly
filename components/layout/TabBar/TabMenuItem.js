import React from "react";
import { TouchableOpacity, StyleSheet, View, Animated } from "react-native";
import * as LucideIcons from "lucide-react-native";

export const TabMenuItem = ({ onPress, isFocused, iconSet, ICON_CONTAINER_SIZE, theme }) => {
    const IconComponent = iconSet || LucideIcons.Home;
    const scaleValue = React.useRef(new Animated.Value(1)).current;

    const onPressIn = () => {
        Animated.spring(scaleValue, {
            toValue: 0.7,
            useNativeDriver: true,
        }).start();
    };

    const onPressOut = () => {
        Animated.spring(scaleValue, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    const styles = createStyles(theme, ICON_CONTAINER_SIZE);

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
                    styles.center,
                    {
                        transform: [{ scale: scaleValue }],
                    },
                ]}
            >
                {isFocused && <View style={styles.activeIndicator} />}

                {/* СЛОЙ ИКОНКИ */}
                <IconComponent size={22} color={theme.accent} strokeWidth={isFocused ? 2.5 : 2} />
            </Animated.View>
        </TouchableOpacity>
    );
};

const createStyles = (theme, containerSize) =>
    StyleSheet.create({
        tabItem: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
        },
        center: {
            alignItems: "center",
            justifyContent: "center",
            aspectRatio: 1,
            width: containerSize,
            height: containerSize,
        },
        activeIndicator: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: theme.accentMuted,
            borderRadius: containerSize / 2,
        },
    });
