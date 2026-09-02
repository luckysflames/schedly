import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { User, Settings } from "lucide-react-native";
import { useTheme } from "../../../hooks/useTheme";

export default function ProfileHeader({ userInfo, onSettingsPress }) {
    const { theme, createStyles } = useTheme();
    const styles = createStyles(createLocalStyles);

    return (
        <View style={styles.headerCard}>
            <TouchableOpacity
                style={styles.settingsButton}
                onPress={onSettingsPress}
                activeOpacity={0.7}
            >
                <Settings size={20} color={theme.text} />
            </TouchableOpacity>

            <View style={styles.avatarContainer}>
                <User size={36} color={theme.text} />
            </View>
            <Text style={styles.fullName}>{userInfo.fullName}</Text>

            <View style={styles.infoPillsContainer}>
                <View style={styles.pill}>
                    <Text style={styles.pillLabel}>Группа</Text>
                    <Text style={styles.pillValue}>{userInfo.group?.item1 || "—"}</Text>
                </View>
                <View style={styles.pillDivider} />
                <View style={styles.pill}>
                    <Text style={styles.pillLabel}>Курс</Text>
                    <Text style={styles.pillValue}>{userInfo.course || "—"}</Text>
                </View>
            </View>
        </View>
    );
}

const createLocalStyles = (theme) => ({
    headerCard: {
        alignItems: "center",
        borderRadius: 20,
        padding: 24,
        marginBottom: 16,
        elevation: 3,
        backgroundColor: theme.main,
        position: "relative",
    },
    settingsButton: {
        position: "absolute",
        top: 16,
        right: 16,
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: theme.dark,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 14,
        backgroundColor: theme.accent,
    },
    fullName: {
        fontSize: 20,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 14,
        color: theme.text,
    },
    infoPillsContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: theme.dark,
        borderRadius: 14,
        paddingVertical: 10,
        paddingHorizontal: 0,
        width: "100%",
    },
    pill: {
        width: "50%",
        alignItems: "center",
        justifyContent: "center",
    },
    pillDivider: {
        width: 1,
        height: 28,
        backgroundColor: theme.accentMuted,
    },
    pillLabel: {
        fontSize: 11,
        fontWeight: "600",
        color: theme.text,
        textTransform: "uppercase",
        marginBottom: 2,
    },
    pillValue: {
        fontSize: 14,
        fontWeight: "700",
        color: theme.accent,
    },
});
