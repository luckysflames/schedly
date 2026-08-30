import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { useTheme } from "../../../hooks/useTheme";

export const TopBar = ({ selectedGroup, weekOffset = 0, onOpenGroupModal, onPressCurrentDay }) => {
    const { theme, createStyles } = useTheme();
    const styles = createStyles(createLocalStyles);

    // Автономно вычисляем monthTitle для текущего weekOffset прямо в шапке
    const monthTitle = useMemo(() => {
        const now = new Date();
        const currentDayOfWeek = now.getDay();
        const distanceToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;

        const monday = new Date(now);
        monday.setDate(monday.getDate() + distanceToMonday + weekOffset * 7);

        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);

        const formatterMonth = new Intl.DateTimeFormat("ru-RU", {
            month: "long",
            timeZone: "Europe/Moscow",
        });

        const formatterYear = new Intl.DateTimeFormat("ru-RU", {
            year: "numeric",
            timeZone: "Europe/Moscow",
        });

        const yearStr = formatterYear.format(monday);
        const firstMonthStr = formatterMonth.format(monday);
        const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

        if (monday.getMonth() === sunday.getMonth()) {
            return `${capitalize(firstMonthStr)} ${yearStr}`;
        }

        const lastMonthStr = formatterMonth.format(sunday);
        const lastYearStr = formatterYear.format(sunday);

        if (yearStr !== lastYearStr) {
            return `${capitalize(firstMonthStr)} ${yearStr} - ${capitalize(lastMonthStr)} ${lastYearStr}`;
        }

        return `${capitalize(firstMonthStr)} - ${capitalize(lastMonthStr)} ${yearStr}`;
    }, [weekOffset]);

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
            borderRadius: 8,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderWidth: 1,
            borderColor: theme.accent,
        },
        weekBadgeText: { color: theme.text, fontWeight: "bold", fontSize: 16 },
    });
