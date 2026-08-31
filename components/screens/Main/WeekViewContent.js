import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { LessonCard } from "./LessonCard";
import { useTheme } from "../../../hooks/useTheme";
import { isLessonPast } from "../../../utils/lessonFormatters";

export const WeekViewContent = ({
    daysList,
    hours,
    weekNumber,
    getLessonPosition,
    onSelectLesson,
    hiddenSubjects,
}) => {
    const { theme, createStyles } = useTheme();
    const styles = createStyles(createLocalStyles);

    const HOUR_HEIGHT = 70;

    const getShortDayName = (dayInput) => {
        if (!dayInput) return "";
        const mapping = {
            понедельник: "ПН",
            вторник: "ВТ",
            среда: "СР",
            четверг: "ЧТ",
            пятница: "ПТ",
            суббота: "СБ",
            воскресенье: "ВС",
        };
        const lower = String(dayInput).toLowerCase().trim();
        return mapping[lower] || String(dayInput).slice(0, 2).toUpperCase();
    };

    const getDayNumber = (dayItem, index) => {
        const dateInput = dayItem.date || dayItem.day || dayItem.title;
        if (
            dateInput &&
            typeof dateInput === "string" &&
            (dateInput.includes("-") || dateInput.includes("T"))
        ) {
            const dateObj = new Date(dateInput);
            if (!isNaN(dateObj)) return dateObj.getDate();
        }
        return dayItem.dayNumber || index + 1;
    };

    const isToday = (dayItem) => {
        const dateInput = dayItem.date || dayItem.day || dayItem.title;
        if (!dateInput || typeof dateInput !== "string") return false;
        const dateObj = new Date(dateInput);
        if (isNaN(dateObj)) return false;
        const today = new Date();
        return (
            dateObj.getDate() === today.getDate() &&
            dateObj.getMonth() === today.getMonth() &&
            dateObj.getFullYear() === today.getFullYear()
        );
    };

    return (
        <View style={styles.container}>
            {/* Закрепленная шапка */}
            <View style={styles.fixedHeaderWrapper}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={false}
                >
                    <View style={styles.tableHeaderContainer}>
                        <View style={styles.tableHeaderRow}>
                            <View style={styles.timeColumnHeader}>
                                <Text style={styles.weekNumberText}>{weekNumber}</Text>
                            </View>
                            {daysList.map((dayItem, index) => {
                                const dayTitle = getShortDayName(
                                    dayItem.title || dayItem.day || dayItem.name,
                                );
                                const dayNum = getDayNumber(dayItem, index);
                                const active = isToday(dayItem);

                                return (
                                    <View key={index} style={styles.dayColumnHeader}>
                                        <Text style={styles.dayHeaderTitle}>{dayTitle}</Text>
                                        <View
                                            style={[
                                                styles.dateCell,
                                                active && styles.activeDateCell,
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.dayHeaderDate,
                                                    active && styles.activeDateText,
                                                ]}
                                            >
                                                {dayNum}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                </ScrollView>
            </View>

            {/* Тело расписания со скроллом */}
            <ScrollView
                style={styles.verticalScroll}
                contentContainerStyle={styles.verticalScrollContent}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
            >
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                >
                    <View style={[styles.tableBody, { backgroundColor: theme.dark }]}>
                        <View style={styles.timeColumn}>
                            {/* Верхняя пустая ячейка синхронизирована с шапкой сетки */}
                            <View style={[styles.timeRow, { height: HOUR_HEIGHT }]} />
                            {hours.map((hour, index) => (
                                <View key={index} style={[styles.timeRow, { height: HOUR_HEIGHT }]}>
                                    <Text style={styles.timeTextCell}>{hour}</Text>
                                </View>
                            ))}
                        </View>

                        {daysList.map((dayItem, dayIndex) => {
                            const lessons =
                                dayItem.lessons || dayItem.pairs || dayItem.classes || [];
                            return (
                                <View
                                    key={dayIndex}
                                    style={[
                                        styles.dayColumnBody,
                                        { height: (hours.length + 1) * HOUR_HEIGHT },
                                    ]}
                                >
                                    <View style={styles.gridLine} />

                                    {hours.map((hour, index) => (
                                        <View key={index} style={styles.gridLine} />
                                    ))}

                                    {lessons.map((lesson, lessonIndex) => {
                                        if (
                                            hiddenSubjects &&
                                            hiddenSubjects.includes(lesson.title || lesson.name)
                                        ) {
                                            return null;
                                        }

                                        const pos = getLessonPosition(lesson.time);
                                        const adjustedPos = {
                                            ...pos,
                                            top: pos.top + HOUR_HEIGHT,
                                        };
                                        const isLecture = lesson.type
                                            ?.toLowerCase()
                                            .includes("лек");
                                        const cardBg =
                                            lesson.color ||
                                            (isLecture ? theme.main : theme.accentMuted);

                                        // Проверяем, прошел ли урок, передавая дату конкретного дня недели
                                        const past = isLessonPast(
                                            lesson.time,
                                            dayItem.dateObj || dayItem.date,
                                        );

                                        return (
                                            <LessonCard
                                                key={lessonIndex}
                                                lesson={lesson}
                                                position={adjustedPos}
                                                backgroundColor={cardBg}
                                                isPast={past}
                                                onPress={() =>
                                                    onSelectLesson({ ...lesson, isPast: past })
                                                }
                                            />
                                        );
                                    })}
                                </View>
                            );
                        })}
                    </View>
                </ScrollView>
            </ScrollView>
        </View>
    );
};

const createLocalStyles = (theme) =>
    StyleSheet.create({
        container: {
            flex: 1,
        },
        fixedHeaderWrapper: {
            zIndex: 10,
            flexShrink: 0,
        },
        verticalScroll: {
            flex: 1,
        },
        verticalScrollContent: {
            flexGrow: 1,
        },
        tableHeaderContainer: {
            backgroundColor: theme.dark,
        },
        tableHeaderRow: {
            flexDirection: "row",
        },
        timeColumnHeader: {
            width: 45,
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 4,
        },
        weekNumberText: {
            color: theme.accent,
            fontSize: 12,
            fontWeight: "bold",
        },
        dayColumnHeader: {
            width: 50,
            paddingVertical: 6,
            alignItems: "center",
            justifyContent: "center",
        },
        dayHeaderTitle: {
            color: theme.text,
            fontSize: 11,
            fontWeight: "600",
            marginBottom: 4,
        },
        dateCell: {
            width: 28,
            height: 28,
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 14,
        },
        activeDateCell: {
            backgroundColor: theme.accent,
        },
        dayHeaderDate: {
            color: theme.text,
            fontSize: 13,
            fontWeight: "505",
        },
        activeDateText: {
            color: theme.text,
            fontWeight: "bold",
        },
        tableBody: {
            flexDirection: "row",
            backgroundColor: theme.dark,
        },
        timeColumn: {
            width: 45,
            borderRightWidth: 1,
            borderRightColor: theme.textDark,
        },
        timeRow: {
            justifyContent: "flex-start",
            alignItems: "center",
        },
        timeTextCell: {
            color: theme.text,
            fontSize: 11,
        },
        dayColumnBody: {
            width: 50,
            position: "relative",
            borderRightWidth: 1,
            borderRightColor: theme.textDark,
        },
        gridLine: {
            height: 70,
            borderBottomWidth: 1,
            borderBottomColor: theme.textDark,
        },
    });
