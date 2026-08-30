import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useTheme } from "../../../hooks/useTheme";

export const LessonCard = ({ lesson, position, onPress }) => {
    const { theme, createStyles } = useTheme();
    const styles = createStyles(createLocalStyles);

    const isLecture = lesson.type?.toLowerCase().includes("лек");
    const defaultBg = isLecture ? theme.main : theme.accentMuted;
    const cardBg = lesson.color || defaultBg;

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
                },
            ]}
        >
            <Text style={styles.cardSubject} numberOfLines={2}>
                {lesson.subject || lesson.name}
            </Text>
            <Text style={styles.cardInfo} numberOfLines={1}>
                {lesson.auditory || lesson.time}
            </Text>
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
            padding: 4,
            justifyContent: "space-between",
        },
        cardSubject: {
            color: theme.text,
            fontSize: 9,
            fontWeight: "bold",
        },
        cardInfo: {
            color: theme.text,
            fontSize: 8,
        },
    });
