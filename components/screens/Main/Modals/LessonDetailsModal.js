import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Clock, MapPin, Info, Users, GraduationCap } from "lucide-react-native";
import { useTheme } from "../../../../hooks/useTheme";
import { BottomSheet } from "../../../shared/Modals/BottomSheet";

export const LessonDetailsModal = ({ selectedLesson, selectedGroup, onClose }) => {
    const { theme, createStyles } = useTheme();
    const styles = createStyles(createLocalStyles);

    const getLessonTypeFullName = (typeInput) => {
        if (!typeInput) return "Занятие";
        const lower = String(typeInput).toLowerCase().trim();
        if (lower.includes("лек")) return "Лекция";
        if (lower.includes("пр")) return "Практическое занятие";
        if (lower.includes("лаб")) return "Лабораторная работа";
        return typeInput;
    };

    const cleanTeacherName = (teacherInput) => {
        if (!teacherInput) return "Преподаватель не указан";
        return teacherInput
            .replace(/^(доц\.|проф\.|ст\.\s*преп\.|преп\.|асс\.|инж\.)\s*/gi, "")
            .trim();
    };

    const isLecture = selectedLesson?.type?.toLowerCase().includes("лек");
    const defaultBg = isLecture ? theme.main : theme.accentMuted;
    const bulletColor = selectedLesson?.color || defaultBg;
    const lessonTypeName = getLessonTypeFullName(selectedLesson?.type);
    const lessonTeacher = cleanTeacherName(selectedLesson?.teacher);

    if (!selectedLesson) return null;

    return (
        <BottomSheet
            visible={!!selectedLesson}
            onClose={onClose}
            containerStyle={[styles.bottomSheetContainer, { backgroundColor: theme.main }]}
        >
            <View style={styles.bottomSheetHeader}>
                <View style={[styles.bsIconBullet, { backgroundColor: bulletColor }]} />
                <Text style={styles.bottomSheetTitle}>
                    {selectedLesson?.subject || selectedLesson?.name}
                </Text>
            </View>

            <View style={styles.bottomSheetContent}>
                <View style={styles.bsRow}>
                    <Clock size={20} color={theme.accent} />
                    <Text style={styles.bsText}>{selectedLesson?.time || "—"}</Text>
                </View>
                <View style={styles.bsRow}>
                    <MapPin size={20} color={theme.accent} />
                    <Text style={styles.bsText}>
                        {selectedLesson?.auditory || "Аудитория не указана"}
                    </Text>
                </View>
                <View style={styles.bsRow}>
                    <Info size={20} color={theme.accent} />
                    <Text style={styles.bsText}>{lessonTypeName}</Text>
                </View>
                <View style={styles.bsRow}>
                    <GraduationCap size={20} color={theme.accent} />
                    <Text style={styles.bsText}>{lessonTeacher}</Text>
                </View>
                <View style={styles.bsRow}>
                    <Users size={20} color={theme.accent} />
                    <Text style={styles.bsText}>
                        {selectedGroup
                            ? selectedGroup.name || selectedGroup.title
                            : "Группа не указана"}
                    </Text>
                </View>
            </View>
        </BottomSheet>
    );
};

const createLocalStyles = (theme) =>
    StyleSheet.create({
        bottomSheetContainer: {
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingHorizontal: 20,
            paddingBottom: 20,
        },
        bottomSheetHeader: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 20,
            gap: 10,
        },
        bsIconBullet: {
            width: 10,
            height: 10,
            borderRadius: 5,
        },
        bottomSheetTitle: {
            fontSize: 18,
            fontWeight: "bold",
            color: theme.text,
            flex: 1,
        },
        bottomSheetContent: {
            gap: 16,
        },
        bsRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
        },
        bsText: {
            fontSize: 15,
            color: theme.text,
        },
    });
