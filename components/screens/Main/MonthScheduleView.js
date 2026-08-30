import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useTheme } from "../../../hooks/useTheme";
import { normalizeScheduleData } from "../../../utils/normalizeScheduleData";

export const MonthScheduleView = ({ scheduleData, hiddenSubjects, onSelectLesson }) => {
    const { theme } = useTheme();
    const normalized = normalizeScheduleData(scheduleData);

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.dark }]}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Расписание на месяц</Text>
            <View style={styles.grid}>
                {normalized.map((dayItem, index) => {
                    const lessons = dayItem.lessons || [];
                    return (
                        <View
                            key={index}
                            style={[styles.dayCell, { borderColor: theme.accentMuted + "33" }]}
                        >
                            <Text style={[styles.dayDate, { color: theme.accent }]}>
                                {dayItem.title || index + 1}
                            </Text>
                            {lessons.map((lesson, lIdx) => {
                                if (hiddenSubjects?.includes(lesson.title || lesson.name))
                                    return null;
                                return (
                                    <TouchableOpacity
                                        key={lIdx}
                                        onPress={() => onSelectLesson(lesson)}
                                        style={[
                                            styles.lessonBadge,
                                            { backgroundColor: theme.accent + "33" },
                                        ]}
                                    >
                                        <Text
                                            numberOfLines={1}
                                            style={[styles.lessonText, { color: theme.text }]}
                                        >
                                            {lesson.title || lesson.name}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    );
                })}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10 },
    headerTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
    grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
    dayCell: {
        width: "31%",
        minHeight: 100,
        borderWidth: 1,
        borderRadius: 8,
        padding: 6,
        marginBottom: 10,
    },
    dayDate: { fontSize: 12, fontWeight: "bold", marginBottom: 4 },
    lessonBadge: { paddingHorizontal: 4, paddingVertical: 2, borderRadius: 4, marginBottom: 3 },
    lessonText: { fontSize: 10 },
});
