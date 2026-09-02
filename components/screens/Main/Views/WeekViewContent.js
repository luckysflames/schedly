import React from "react";
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from "react-native";
import { LessonCard } from "../LessonCard";
import { useTheme } from "../../../../hooks/useTheme";
import { isLessonPast } from "../../../../utils/lessonFormatters";
import { useSchedlyStore } from "../../../../store/useSchedlyStore";
import { useWeekSchedule } from "../../../../hooks/useWeekSchedule";

export const WeekViewContent = ({
    daysList,
    hours,
    weekNumber,
    getLessonPosition,
    onSelectLesson,
    onLongPressLesson,
    onPressWeekDay,
    hiddenSubjects,
    refreshing,
    onRefresh,
}) => {
    const { theme, createStyles } = useTheme();
    const styles = createStyles(createLocalStyles);
    const customSubjectColors = useSchedlyStore((state) => state.customSubjectColors);

    const HOUR_HEIGHT = 70;
    const { currentTimeTop, getShortDayName, getDayNumber, isToday } = useWeekSchedule(
        hours,
        HOUR_HEIGHT,
    );

    return (
        <View style={styles.container}>
            {/* Закрепленная шапка */}
            <View style={styles.fixedHeaderWrapper}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} scrollEnabled={false}>
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
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.dayColumnHeader}
                                        onPress={() =>
                                            onPressWeekDay?.(dayItem.dateObj || dayItem.date)
                                        }
                                        accessibilityRole="button"
                                        accessibilityLabel={`${dayTitle}, ${dayNum}`}
                                    >
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
                                    </TouchableOpacity>
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
                <ScrollView horizontal showsHorizontalScrollIndicator={false} bounces={false}>
                    <View style={[styles.tableBody, { backgroundColor: theme.dark }]}>
                        {/* Линия текущего времени */}
                        <View style={[styles.currentTimeIndicator, { top: currentTimeTop }]}>
                            <View style={styles.currentTimeDot} />
                            <View style={styles.currentTimeLine} />
                        </View>

                        <View style={styles.timeColumn}>
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
                                    {hours.map((_, index) => (
                                        <View key={index} style={styles.gridLine} />
                                    ))}

                                    {lessons.map((lesson, lessonIndex) => {
                                        const subjectName = lesson.subject || lesson.name;
                                        if (
                                            hiddenSubjects &&
                                            hiddenSubjects.includes(subjectName)
                                        ) {
                                            return null;
                                        }

                                        const pos = getLessonPosition(lesson.time);
                                        const adjustedPos = { ...pos, top: pos.top + HOUR_HEIGHT };
                                        const isLecture = lesson.type
                                            ?.toLowerCase()
                                            .includes("лек");

                                        const cardBg =
                                            customSubjectColors[subjectName] ||
                                            lesson.color ||
                                            (isLecture ? theme.main : theme.accentMuted);

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
                                                customSubjectColors={customSubjectColors}
                                                onPress={() =>
                                                    onSelectLesson({ ...lesson, isPast: past })
                                                }
                                                onLongPress={() => onLongPressLesson?.(lesson)}
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
        container: { flex: 1 },
        fixedHeaderWrapper: { zIndex: 10, flexShrink: 0 },
        verticalScroll: { flex: 1 },
        verticalScrollContent: { flexGrow: 1 },
        tableHeaderContainer: { backgroundColor: theme.dark },
        tableHeaderRow: { flexDirection: "row" },
        timeColumnHeader: {
            width: 45,
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 4,
        },
        weekNumberText: { color: theme.accent, fontSize: 12, fontWeight: "bold" },
        dayColumnHeader: {
            width: 50,
            paddingVertical: 6,
            alignItems: "center",
            justifyContent: "center",
        },
        dayHeaderTitle: { color: theme.text, fontSize: 11, fontWeight: "600", marginBottom: 4 },
        dateCell: {
            width: 28,
            height: 28,
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 14,
        },
        activeDateCell: { backgroundColor: theme.accent },
        dayHeaderDate: { color: theme.text, fontSize: 13, fontWeight: "505" },
        activeDateText: { color: theme.text, fontWeight: "bold" },
        tableBody: { flexDirection: "row", backgroundColor: theme.dark, position: "relative" },
        timeColumn: { width: 45, borderRightWidth: 1, borderRightColor: theme.textDark },
        timeRow: { justifyContent: "flex-start", alignItems: "center" },
        timeTextCell: { color: theme.text, fontSize: 11 },
        dayColumnBody: {
            width: 50,
            position: "relative",
            borderRightWidth: 1,
            borderRightColor: theme.textDark,
        },
        gridLine: { height: 70, borderBottomWidth: 1, borderBottomColor: theme.textDark },
        currentTimeIndicator: {
            position: "absolute",
            left: 0,
            right: 0,
            flexDirection: "row",
            alignItems: "center",
            zIndex: 20,
            marginTop: -4,
        },
        currentTimeDot: {
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: theme.accent,
            marginLeft: 41,
        },
        currentTimeLine: { flex: 1, height: 2, backgroundColor: theme.accentMuted },
    });
