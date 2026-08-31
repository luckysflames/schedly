import React from "react";
import { TouchableOpacity, Text, View, StyleSheet } from "react-native";
import { useTheme } from "../../../hooks/useTheme";
import { getLessonTypeFullName, cleanTeacherName } from "../../../utils/lessonFormatters";

export const LessonCard = ({ lesson, position, onPress, isDayView = false, isPast = false }) => {
    const { theme, createStyles } = useTheme();
    const styles = createStyles(createLocalStyles);

    const isLecture = lesson.type?.toLowerCase().includes("лек");
    const defaultBg = isLecture ? theme.main : theme.accentMuted;
    const cardBg = lesson.color || defaultBg;

    const lessonTypeName = getLessonTypeFullName(lesson.type);
    const teacherName = cleanTeacherName(lesson.teacher);

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            style={[
                styles.lessonCardGrid,
                {
                    top: position.top,
                    height: position.height,
                    backgroundColor: cardBg,
                    opacity: isPast ? 0.5 : 1,
                },
            ]}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.cardSubject} numberOfLines={2}>
                    {lesson.subject || lesson.name}
                </Text>
                {isDayView && lesson.time && <Text style={styles.cardTime}>{lesson.time}</Text>}
            </View>

            {isDayView ? (
                <View style={styles.detailsContainer}>
                    {lesson.auditory && (
                        <Text style={styles.cardDetailText} numberOfLines={1}>
                            {lesson.auditory}
                        </Text>
                    )}
                    {lesson.type && (
                        <Text style={styles.cardDetailText} numberOfLines={1}>
                            {lessonTypeName}
                        </Text>
                    )}
                    {lesson.teacher && (
                        <Text style={styles.cardDetailText} numberOfLines={1}>
                            {teacherName}
                        </Text>
                    )}
                </View>
            ) : (
                <Text style={styles.cardInfo} numberOfLines={1}>
                    {lesson.auditory || lesson.time}
                </Text>
            )}
        </TouchableOpacity>
    );
};

const createLocalStyles = (theme) =>
    StyleSheet.create({
        lessonCardGrid: {
            position: "absolute",
            left: 2,
            right: 2,
            borderRadius: 6,
            padding: 6,
            justifyContent: "space-between",
        },
        cardHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
        },
        cardSubject: {
            color: theme.text,
            fontSize: 11,
            fontWeight: "bold",
            flex: 1,
        },
        cardTime: {
            color: theme.text,
            fontSize: 10,
            fontWeight: "600",
            marginLeft: 4,
            opacity: 0.9,
        },
        detailsContainer: {
            marginTop: 4,
            gap: 2,
        },
        cardDetailText: {
            color: theme.text,
            fontSize: 9,
            opacity: 0.85,
        },
        cardInfo: {
            color: theme.text,
            fontSize: 8,
        },
    });
