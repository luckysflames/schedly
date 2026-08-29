import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { Sparkles, CheckCircle2, AlertCircle, Copy, Info } from "lucide-react-native";
import { useTheme } from "../../../hooks/useTheme";

export const CustomToast = ({
    visible,
    message,
    type = "copy", // "copy" | "success" | "error" | "info"
    icon,
    duration = 2200,
    onHide,
}) => {
    const { theme, createStyles } = useTheme();
    const styles = createStyles(createLocalStyles);

    // Анимации проявления и вылета
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(-30)).current;
    const scale = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(translateY, {
                    toValue: 0,
                    friction: 7,
                    tension: 80,
                    useNativeDriver: true,
                }),
                Animated.spring(scale, {
                    toValue: 1,
                    friction: 6,
                    tension: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 180,
                    useNativeDriver: true,
                }),
            ]).start();

            const timer = setTimeout(() => {
                hideToast();
            }, duration);

            return () => clearTimeout(timer);
        } else {
            hideToast();
        }
    }, [visible]);

    const hideToast = () => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: -20,
                duration: 180,
                useNativeDriver: true,
            }),
            Animated.timing(scale, {
                toValue: 0.9,
                duration: 180,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start(() => {
            if (onHide && visible) onHide();
        });
    };

    if (!visible) return null;

    const renderIcon = () => {
        if (icon) return icon;

        switch (type) {
            case "copy":
                return <Sparkles size={20} color={theme.accent} />;
            case "success":
                return <CheckCircle2 size={20} color={theme.accent} />;
            case "error":
                return <AlertCircle size={20} color={theme.red} />;
            case "info":
            default:
                return <Info size={20} color={theme.accentMuted} />;
        }
    };

    return (
        <View style={styles.toastPositionWrapper} pointerEvents="none">
            <Animated.View
                style={[
                    styles.container,
                    {
                        opacity,
                        transform: [{ translateY }, { scale }],
                    },
                ]}
            >
                <View style={styles.iconContainer}>{renderIcon()}</View>
                <View style={styles.textContainer}>
                    <Text style={styles.message}>{message}</Text>
                </View>
            </Animated.View>
        </View>
    );
};

const createLocalStyles = (theme) =>
    StyleSheet.create({
        toastPositionWrapper: {
            position: "absolute",
            top: 20,
            left: 16,
            right: 16,
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            elevation: 100,
        },
        container: {
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            backgroundColor: theme.main,
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: theme.accentMuted,
            width: "100%", 
            maxWidth: 420, 
            elevation: 8,
        },
        iconContainer: {
            justifyContent: "center",
            alignItems: "center",
            flexShrink: 0, 
        },
        textContainer: {
            flex: 1, 
        },
        message: {
            fontSize: 14,
            fontWeight: "700",
            color: theme.accent,
            letterSpacing: 0.2,
            flexWrap: "wrap",
        },
    });
