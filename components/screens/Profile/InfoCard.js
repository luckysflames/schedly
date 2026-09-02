import React from "react";
import { Text, TouchableOpacity, View, Vibration } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useTheme } from "../../../hooks/useTheme";

export default function InfoCard({ icon, label, value, fullWidth, onCopy }) {
    const { theme, createStyles } = useTheme();
    const styles = createStyles(createLocalStyles);

    const handleCopy = async () => {
        if (!value || value === "—") return;
        Vibration.vibrate([0, 30, 1, 30]);
        await Clipboard.setStringAsync(String(value));
        if (onCopy) onCopy(label, value);
    };

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onLongPress={handleCopy}
            style={[styles.card, fullWidth && styles.fullWidthCard]}
        >
            <View style={styles.headerRow}>
                {icon}
                <Text style={styles.label}>{label}</Text>
            </View>
            <Text style={styles.value} numberOfLines={2}>
                {value || "—"}
            </Text>
        </TouchableOpacity>
    );
}

const createLocalStyles = (theme) => ({
    card: {
        flex: 1,
        minWidth: "47%",
        backgroundColor: theme.main,
        borderRadius: 16,
        padding: 14,
        justifyContent: "space-between",
        gap: 8,
        elevation: 2,
    },
    fullWidthCard: {
        flexBasis: "100%",
        minWidth: "100%",
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    label: {
        fontSize: 12,
        color: theme.text + "88",
        fontWeight: "600",
        textTransform: "uppercase",
    },
    value: {
        fontSize: 15,
        fontWeight: "600",
        color: theme.text,
    },
});
