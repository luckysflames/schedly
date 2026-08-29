import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { useTheme } from "../../../hooks/useTheme";

export const TopBar = ({ selectedGroup, monthTitle, onOpenGroupModal, onPressCurrentDay }) => {
    const { theme, createStyles } = useTheme();
    const styles = createStyles(createLocalStyles);

    const currentDayMsk = new Intl.DateTimeFormat("ru-RU", {
        timeZone: "Europe/Moscow",
        day: "numeric",
    }).format(new Date());

    return (
        <View style={styles.topBar}>
            <View style={styles.headerLeftContainer}>
                <View style={styles.groupSelectorRow}>
                    <Text style={styles.monthTitle}>{monthTitle || "Расписание"}</Text>
                </View>

                <TouchableOpacity style={styles.groupSelectButton} onPress={onOpenGroupModal}>
                    <Text style={styles.selectedGroupNameSub}>
                        {selectedGroup ? selectedGroup.name : "Выберите группу"}
                    </Text>
                    <ChevronRight
                        size={14}
                        color={theme.accentMuted}
                        style={{ transform: [{ rotate: "90deg" }], marginLeft: 2 }}
                    />
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={styles.weekBadge}
                onPress={onPressCurrentDay}
                activeOpacity={0.7}
            >
                <Text style={styles.weekBadgeText}>{currentDayMsk}</Text>
            </TouchableOpacity>
        </View>
    );
};

const createLocalStyles = (theme) =>
    StyleSheet.create({
        topBar: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingVertical: 12,
            backgroundColor: theme.dark,
        },
        headerLeftContainer: { flexDirection: "column" },
        groupSelectorRow: { flexDirection: "row", alignItems: "center" },
        monthTitle: { fontSize: 20, fontWeight: "bold", color: theme.accent },
        groupSelectButton: {
            flexDirection: "row",
            alignItems: "center",
            marginTop: 2,
        },
        selectedGroupNameSub: { fontSize: 12, color: theme.accentMuted },
        weekBadge: {
            backgroundColor: theme.main,
            borderRadius: 8,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderWidth: 1,
            borderColor: theme.accentMuted,
        },
        weekBadgeText: { color: theme.text, fontWeight: "bold", fontSize: 16 },
    });
