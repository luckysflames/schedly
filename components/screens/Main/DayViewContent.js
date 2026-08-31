import React from "react";
import { View, Text, ScrollView, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { LessonCard } from "./LessonCard";
import { useTheme } from "../../../hooks/useTheme";
import { isLessonPast } from "../../../utils/lessonFormatters";

export const DayViewContent = ({
    daysList,
    hours,
    getLessonPosition,
    onSelectLesson,
    hiddenSubjects,
}) => {
    const { theme, createStyles } = useTheme();
    const styles = createStyles(createLocalStyles);
    const screenWidth = Dimensions.get("window").width;
    const HOUR_HEIGHT = 70;

    // Инициализируем стейт сегодняшней датой один раз при монтировании
    const [selectedDate, setSelectedDate] = React.useState(() => {
        return new Date().toISOString().split("T")[0];
    });

    const currentDayItem = daysList.find((d) => d.date === selectedDate) || daysList[0] || {};
    const lessons = currentDayItem.lessons || [];

    return (
        <View style={styles.container}>
            <View style={[styles.weekHeader, { backgroundColor: theme.dark }]}>
                <View style={styles.weekDaysRow}>
                    {daysList.map((day, index) => {
                        const dayDateObj = day.dateObj ? new Date(day.dateObj) : new Date(day.date);
                        const dayName = !isNaN(dayDateObj.getTime())
                            ? dayDateObj
                                  .toLocaleDateString("ru-RU", { weekday: "long" })
                                  .toUpperCase()
                            : day.day || "";
                        const dayNum = !isNaN(dayDateObj.getTime())
                            ? dayDateObj.getDate()
                            : day.dayNumber || "";

                        const isSelected = day.date === selectedDate;

                        return (
                            <TouchableOpacity
                                key={index}
                                style={styles.dayHeaderItem}
                                onPress={() => setSelectedDate(day.date)} // Переключаем день прямо здесь
                                activeOpacity={0.7}
                            >
                                <Text style={styles.weekDayName}>{dayName}</Text>
                                <View
                                    style={[
                                        styles.dateCircle,
                                        isSelected && { backgroundColor: theme.accent },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.dateNumberText,
                                            isSelected && styles.selectedDateNumberText,
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

            <ScrollView style={styles.verticalScroll} showsVerticalScrollIndicator={false}>
                <View style={[styles.tableBody, { backgroundColor: theme.dark }]}>
                    <View style={styles.timeColumn}>
                        <View style={[styles.timeRow, { height: HOUR_HEIGHT }]} />
                        {hours.map((hour, index) => (
                            <View key={index} style={[styles.timeRow, { height: HOUR_HEIGHT }]}>
                                <Text style={styles.timeTextCell}>{hour}</Text>
                            </View>
                        ))}
                    </View>
                    <View
                        style={[
                            styles.dayColumnBody,
                            { width: screenWidth - 45, height: (hours.length + 1) * HOUR_HEIGHT },
                        ]}
                    >
                        <View style={styles.gridLine} />
                        {hours.map((_, index) => (
                            <View key={index} style={styles.gridLine} />
                        ))}
                        {lessons.map((lesson, lessonIndex) => {
                            if (hiddenSubjects?.includes(lesson.title || lesson.name)) return null;
                            const pos = getLessonPosition(lesson.time);
                            const adjustedPos = { ...pos, top: pos.top + HOUR_HEIGHT };
                            const cardBg = lesson.color || theme.accentMuted;

                            // Проверяем, прошла ли пара
                            const past = isLessonPast(lesson.time, currentDayItem.dateObj);

                            return (
                                <LessonCard
                                    key={lessonIndex}
                                    lesson={lesson}
                                    position={adjustedPos}
                                    backgroundColor={cardBg}
                                    isDayView={true}
                                    isPast={past}
                                    onPress={() => onSelectLesson(lesson)}
                                />
                            );
                        })}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const createLocalStyles = (theme) =>
    StyleSheet.create({
        container: { flex: 1 },
        weekHeader: {
            paddingVertical: 10,
        },
        weekDaysRow: {
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
            paddingHorizontal: 4,
        },
        dayHeaderItem: {
            alignItems: "center",
            flex: 1,
        },
        weekDayName: {
            color: theme.accent,
            fontSize: 12,
            fontWeight: "600",
            marginBottom: 6,
        },
        dateCircle: {
            width: 32,
            height: 32,
            borderRadius: 16,
            justifyContent: "center",
            alignItems: "center",
        },
        selectedDateNumberText: {
            color: theme.textDark,
            fontWeight: "bold",
        },
        dateNumberText: {
            color: theme.text || "#FFFFFF",
            fontSize: 14,
            fontWeight: "500",
        },
        verticalScroll: { flex: 1 },
        tableBody: { flexDirection: "row", backgroundColor: theme.dark },
        timeColumn: { width: 45, borderRightWidth: 1, borderRightColor: theme.textDark },
        timeRow: { justifyContent: "flex-start", alignItems: "center" },
        timeTextCell: { color: theme.text, fontSize: 11 },
        dayColumnBody: {
            position: "relative",
            borderRightWidth: 1,
            borderRightColor: theme.textDark,
        },
        gridLine: { height: 70, borderBottomWidth: 1, borderBottomColor: theme.textDark },
    });
