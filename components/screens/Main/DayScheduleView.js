import React from "react";
import { View, Text, ScrollView, StyleSheet, Dimensions } from "react-native";
import { useTheme } from "../../../hooks/useTheme";
import { useScheduleGrid } from "../../../hooks/useScheduleGrid";
import { LessonCard } from "./LessonCard";

export const DayScheduleView = ({
    scheduleData,
    hiddenSubjects,
    onSelectLesson,
    weekOffset,
    onChangeWeekOffset,
}) => {
    const { theme } = useTheme();
    const screenWidth = Dimensions.get("window").width;

    // Используем тот же хук, но можно адаптировать под вывод конкретного дня
    const { HOURS, daysList, getLessonPosition } = useScheduleGrid(
        scheduleData,
        weekOffset,
        hiddenSubjects,
    );

    const HOUR_HEIGHT = 80;

    // Для простоты выведем первый день недели или текущий день из daysList
    const currentDay = daysList[0] || { lessons: [] };
    const lessons = currentDay.lessons || currentDay.pairs || currentDay.classes || [];

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.dark }]}>
            <View style={[styles.bodyContainer, { height: (HOURS.length + 1) * HOUR_HEIGHT }]}>
                {HOURS.map((hour, index) => (
                    <View key={index} style={[styles.hourRow, { height: HOUR_HEIGHT }]}>
                        <Text style={styles.hourText}>{hour}</Text>
                        <View style={styles.hourLine} />
                    </View>
                ))}

                {lessons.map((lesson, lessonIndex) => {
                    if (hiddenSubjects && hiddenSubjects.includes(lesson.title || lesson.name)) {
                        return null;
                    }
                    const pos = getLessonPosition(lesson.time);
                    return (
                        <LessonCard
                            key={lessonIndex}
                            lesson={lesson}
                            position={{ ...pos, left: 60, right: 20 }}
                            backgroundColor={lesson.color || theme.accentMuted}
                            onPress={() => onSelectLesson(lesson)}
                        />
                    );
                })}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    bodyContainer: { position: "relative", paddingVertical: 10 },
    hourRow: { flexDirection: "row", alignItems: "flex-start", paddingHorizontal: 10 },
    hourText: { width: 45, fontSize: 12, color: "#888" },
    hourLine: { flex: 1, height: 1, backgroundColor: "#222", marginTop: 8 },
});
