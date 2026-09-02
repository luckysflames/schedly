import React from "react";
import { View, Text, Switch, TouchableOpacity, StyleSheet } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { useTheme } from "../../../hooks/useTheme";

export const SettingItem = ({
    icon: IconComponent,
    label,
    value,
    onValueChange,
    type = "link",
    onPress,
}) => {
    const { theme, createStyles } = useTheme();
    const styles = createStyles(createLocalStyles);

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            disabled={type === "switch"}
            activeOpacity={0.7}
        >
            <View style={styles.leftContent}>
                <View style={styles.iconWrapper}>
                    {IconComponent && <IconComponent size={18} color={theme.accent} />}
                </View>
                <Text style={styles.label} numberOfLines={1}>
                    {label}
                </Text>
            </View>

            <View style={styles.rightContent}>
                {type === "switch" ? (
                    <Switch
                        value={value}
                        onValueChange={onValueChange}
                        trackColor={{ false: theme.dark, true: theme.accent }}
                        thumbColor={theme.white}
                    />
                ) : (
                    <ChevronRight size={18} color={theme.accent} />
                )}
            </View>
        </TouchableOpacity>
    );
};

const createLocalStyles = (theme) => ({
    card: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: theme.main,
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginBottom: 10,
    },
    leftContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        flex: 1,
        marginRight: 10,
    },
    iconWrapper: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: theme.text,
        flex: 1,
    },
    rightContent: {
        justifyContent: "center",
        alignItems: "center",
    },
});
