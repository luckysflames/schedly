import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { useTheme } from "../../../../hooks/useTheme";
import { isLessonPast } from "../../../../utils/lessonFormatters";
import { useSchedlyStore } from "../../../../store/useSchedlyStore";
import { getSubjectFilterKey } from "../../../../utils/subjectFilter";

export const MonthViewContent = ({
    daysList,
    onSelectLesson,
    onPressWeekDay,
    hiddenSubjects,
    refreshing,
    onRefresh,
    comparisonMode = false,
}) => {
    const { theme, createStyles } = useTheme();
    const styles = createStyles(createLocalStyles);

    const customSubjectColors = useSchedlyStore((state) => state.customSubjectColors);

    const weekDays = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"];

    if (!daysList || daysList.length === 0) {
        return <View style={styles.container} />;
    }

    const firstDayIndex = daysList[0].dateObj.getDay();
    const adjustedFirstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    const firstDateObj = daysList[0].dateObj;
    const prevMonthDays = [];
    for (let i = adjustedFirstDayIndex; i > 0; i--) {
        const dateObj = new Date(firstDateObj);
        dateObj.setDate(firstDateObj.getDate() - i);
        prevMonthDays.push({
            dateObj,
            lessons: [],
            isOtherMonth: true,
        });
    }

    const lastDateObj = daysList[daysList.length - 1].dateObj;
    const lastDayIndex = lastDateObj.getDay();
    const adjustedLastDayIndex = lastDayIndex === 0 ? 0 : 7 - lastDayIndex;

    const nextMonthDays = [];
    for (let i = 1; i <= adjustedLastDayIndex; i++) {
        const dateObj = new Date(lastDateObj);
        dateObj.setDate(lastDateObj.getDate() + i);
        nextMonthDays.push({
            dateObj,
            lessons: [],
            isOtherMonth: true,
        });
    }

    const paddedDaysList = [
        ...prevMonthDays,
        ...daysList.map((d) => ({ ...d, isOtherMonth: false })),
        ...nextMonthDays,
    ];

    const weeks = [];
    for (let i = 0; i < paddedDaysList.length; i += 7) {
        weeks.push(paddedDaysList.slice(i, i + 7));
    }

    return (
        <View style={styles.container}>
            <View style={styles.weekDaysHeader}>
                {weekDays.map((day, index) => (
                    <Text key={index} style={styles.weekDayText}>
                        {day}
                    </Text>
                ))}
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.scrollContainer}
                refreshControl={
                    onRefresh && (
                        <RefreshControl
                            refreshing={refreshing || false}
                            onRefresh={onRefresh}
                            progressBackgroundColor={theme.main}
                            colors={[theme.accentMuted, theme.accent]}
                        />
                    )
                }
            >
                {weeks.map((week, weekIndex) => (
                    <View key={weekIndex} style={styles.weekRow}>
                        {week.map((dayItem, dayIndex) => {
                            const lessons = dayItem.lessons || [];
                            const isToday =
                                new Date().toDateString() === dayItem.dateObj.toDateString();

                            return (
                                <View key={dayIndex} style={styles.dayCell}>
                                    <TouchableOpacity
                                        style={[
                                            styles.dateContainer,
                                            isToday && {
                                                backgroundColor: theme.accent,
                                                borderRadius: 12,
                                            },
                                        ]}
                                        onPress={() =>
                                            onPressWeekDay?.(dayItem.dateObj || dayItem.date)
                                        }
                                        activeOpacity={0.8}
                                        accessibilityRole="button"
                                        accessibilityLabel={`Перейти к ${dayItem.dateObj.toLocaleDateString("ru-RU")}`}
                                    >
                                        <Text
                                            style={[
                                                styles.dateText,
                                                dayItem.isOtherMonth && {
                                                    color: theme.textDark,
                                                },
                                                isToday && {
                                                    color: theme.text,
                                                    fontWeight: "bold",
                                                },
                                            ]}
                                        >
                                            {dayItem.dateObj.getDate()}
                                        </Text>
                                    </TouchableOpacity>

                                    <View style={styles.lessonsContainer}>
                                        {Array.from({ length: 7 }).map((_, slotIndex) => {
                                            const targetNumber = slotIndex + 1;
                                            const slotLessons = lessons.filter(
                                                (l) => l.number === targetNumber,
                                            );

                                            if (slotLessons.length === 0) {
                                                return (
                                                    <View
                                                        key={`empty-${slotIndex}`}
                                                        style={styles.lessonPlaceholder}
                                                    />
                                                );
                                            }

                                            const visibleLessons = slotLessons.filter((lesson) => {
                                                const title = lesson.subject || lesson.name;
                                                return !hiddenSubjects?.includes(
                                                    getSubjectFilterKey(lesson, comparisonMode),
                                                );
                                            });

                                            if (visibleLessons.length === 0) {
                                                return (
                                                    <View
                                                        key={`empty-${slotIndex}`}
                                                        style={styles.lessonPlaceholder}
                                                    />
                                                );
                                            }

                                            return (
                                                <View key={`slot-${slotIndex}`} style={styles.lessonSlot}>
                                                    {visibleLessons.map((lesson, lessonIndex) => {
                                                        const title = lesson.subject || lesson.name;
                                                        const past = isLessonPast(
                                                            lesson.time,
                                                            dayItem.dateObj,
                                                        );
                                                                                                                const lessonBg = comparisonMode
                                                                                                                        ? lesson.color || theme.accentMuted
                                                                                                                        : customSubjectColors[title] ||
                                                                                                                            lesson.color ||
                                                                                                                            theme.accentMuted;

                                                        return (
                                                            <TouchableOpacity
                                                                key={lesson.id || `${slotIndex}-${lessonIndex}`}
                                                                style={[
                                                                    styles.lessonBar,
                                                                    {
                                                                        backgroundColor: lessonBg,
                                                                        opacity: past ? 0.25 : 1,
                                                                    },
                                                                ]}
                                                                onPress={() =>
                                                                    onSelectLesson({
                                                                        ...lesson,
                                                                        isPast: past,
                                                                    })
                                                                }
                                                                activeOpacity={0.8}
                                                            >
                                                                <Text
                                                                    style={styles.lessonBarText}
                                                                    numberOfLines={1}
                                                                >
                                                                    {lesson.auditory || "—"}
                                                                </Text>
                                                            </TouchableOpacity>
                                                        );
                                                    })}
                                                </View>
                                            );
                                        })}
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const createLocalStyles = (theme) =>
    StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.dark, paddingHorizontal: 4 },
        weekDaysHeader: {
            flexDirection: "row",
            justifyContent: "space-around",
            paddingVertical: 10,
            borderBottomWidth: 1,
            borderBottomColor: theme.textDark,
        },
        weekDayText: {
            flex: 1,
            textAlign: "center",
            color: theme.text,
            fontSize: 12,
            fontWeight: "600",
        },
        scrollContainer: { flex: 1 },
        weekRow: {
            flexDirection: "row",
            height: 115,
            borderBottomWidth: 1,
            borderBottomColor: theme.textDark,
            borderLeftWidth: 1,
            borderLeftColor: theme.textDark,
        },
        dayCell: {
            flex: 1,
            paddingHorizontal: 1,
            paddingVertical: 2,
            borderRightWidth: 1,
            borderRightColor: theme.textDark,
            alignItems: "center",
        },
        dateContainer: {
            width: 22,
            height: 22,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 2,
        },
        dateText: {
            color: theme.text,
            fontSize: 11,
        },
        lessonsContainer: {
            width: "100%",
            gap: 1.5,
        },
        lessonSlot: {
            width: "100%",
            height: 11,
            flexDirection: "row",
        },
        lessonPlaceholder: {
            height: 11,
            borderRadius: 2,
        },
        lessonBar: {
            flex: 1,
            height: 11,
            borderRadius: 2,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 1,
            marginHorizontal: 1,
        },
        lessonBarText: {
            color: "#fff",
            fontSize: 8,
            fontWeight: "bold",
        },
    });
