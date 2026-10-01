import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Menu, X, User, Users } from "lucide-react-native";
import { useTheme } from "../../../hooks/useTheme";
import { getTeacherShortName } from "../../../utils/lessonFormatters";

export const TopBar = ({
    selectedGroup,
    isTeacherSchedule = false,
    currentView = "week",
    offset = 0,
    onOpenGroupModal,
    onPressCurrentDay,
    onOpenFilters,
    comparisonGroup,
    comparisonTeacher = false,
    onExitComparison,
}) => {
    const { theme, createStyles } = useTheme();
    const styles = createStyles(createLocalStyles);

    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    // Вычисляем заголовок месяца/недели/года в зависимости от режимов и смещения
    const monthTitle = useMemo(() => {
        const now = new Date();
        const formatterMonth = new Intl.DateTimeFormat("ru-RU", {
            month: "long",
            timeZone: "Europe/Moscow",
        });
        const formatterYear = new Intl.DateTimeFormat("ru-RU", {
            year: "numeric",
            timeZone: "Europe/Moscow",
        });

        if (currentView === "day") {
            const targetDate = new Date(now);
            targetDate.setDate(now.getDate() + offset);
            const monthStr = formatterMonth.format(targetDate);
            const yearStr = formatterYear.format(targetDate);
            return `${capitalize(monthStr)} ${yearStr}`;
        }

        if (currentView === "month") {
            const targetDate = new Date(now.getFullYear(), now.getMonth() + offset, 1);
            const monthStr = formatterMonth.format(targetDate);
            const yearStr = formatterYear.format(targetDate);
            return `${capitalize(monthStr)} ${yearStr}`;
        }

        // Режим недели
        const currentDayOfWeek = now.getDay();
        const distanceToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
        const monday = new Date(now);
        monday.setDate(monday.getDate() + distanceToMonday + offset * 7);

        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);

        const yearStr = formatterYear.format(monday);
        const firstMonthStr = formatterMonth.format(monday);

        if (monday.getMonth() === sunday.getMonth()) {
            return `${capitalize(firstMonthStr)} ${yearStr}`;
        }

        const lastMonthStr = formatterMonth.format(sunday);
        const lastYearStr = formatterYear.format(sunday);

        if (yearStr !== lastYearStr) {
            return `${capitalize(firstMonthStr)} ${yearStr} - ${capitalize(lastMonthStr)} ${lastYearStr}`;
        }

        return `${capitalize(firstMonthStr)} - ${capitalize(lastMonthStr)} ${yearStr}`;
    }, [currentView, offset]);

    // Всегда актуальное число текущего дня по Москве
    const currentDayMsk = new Intl.DateTimeFormat("ru-RU", {
        timeZone: "Europe/Moscow",
        day: "numeric",
    }).format(new Date());

    const selectedName = selectedGroup?.name || selectedGroup?.title || selectedGroup?.fio;
    const comparisonName = comparisonTeacher
        ? getTeacherShortName(comparisonGroup?.name || comparisonGroup?.title || comparisonGroup?.fio)
        : comparisonGroup?.name || comparisonGroup?.title || comparisonGroup?.fio;

    return (
        <View style={styles.topBar}>
            <View style={styles.headerLeftContainer}>
                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={onOpenFilters}
                    activeOpacity={0.7}
                >
                    <Menu size={24} color={theme.accent} />
                </TouchableOpacity>

                <View style={styles.monthRow}>
                    <Text style={styles.monthTitle}>{monthTitle || "Расписание"}</Text>
                    <TouchableOpacity 
                        style={styles.groupSelectButton} 
                        onPress={onOpenGroupModal}
                        activeOpacity={0.8}
                    >
                        {isTeacherSchedule && !comparisonGroup ? (
                            <User size={12} color={theme.accent} />
                        ) : (
                            <Users size={12} color={theme.accent} />
                        )}
                        <Text style={styles.selectedGroupNameSub} numberOfLines={1}>
                            {comparisonGroup
                                ? `${selectedName} + ${comparisonName}`
                                : selectedGroup
                                ? isTeacherSchedule
                                    ? getTeacherShortName(selectedName)
                                    : selectedName
                                : "Выберите расписание"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {comparisonGroup ? (
                <TouchableOpacity
                    style={styles.todayButton}
                    onPress={onExitComparison}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={
                        comparisonTeacher
                            ? "Закрыть сравнение с преподавателем"
                            : "Закрыть сравнение групп"
                    }
                >
                    <X size={22} color={theme.accent} />
                </TouchableOpacity>
            ) : (
                <TouchableOpacity
                    style={styles.todayButton}
                    onPress={onPressCurrentDay}
                    activeOpacity={0.7}
                >
                    <Text style={styles.todayButtonText}>{currentDayMsk}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const createLocalStyles = (theme) =>
    StyleSheet.create({
        topBar: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingVertical: 12,
            backgroundColor: theme.dark,
        },
        headerLeftContainer: { 
            flexDirection: "row", 
            gap: 8, 
            alignItems: "center",
            flex: 1,
            marginRight: 8,
        },
        monthRow: { 
            flexDirection: "column",
            flex: 1,
        },
        monthTitle: { 
            fontSize: 20, 
            fontWeight: "bold", 
            color: theme.accent,
        },
        groupSelectButton: {
            flexDirection: "row",
            alignItems: "center",
            marginTop: 5,
            alignSelf: "flex-start",
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: theme.accent,
            gap: 6,
        },
        selectedGroupNameSub: { 
            fontSize: 12, 
            color: theme.text,
            fontWeight: "700",
        },
        iconButton: {
            borderRadius: 8,
            width: 44,
            height: 44,
            justifyContent: "center",
            alignItems: "center",
        },
        todayButton: {
            borderRadius: 8,
            width: 44,
            height: 44,
            marginRight: 10,
            borderWidth: 1,
            borderColor: theme.accent,
            justifyContent: "center",
            alignItems: "center",
        },
        todayButtonText: { color: theme.text, fontWeight: "bold", fontSize: 16 },
    });