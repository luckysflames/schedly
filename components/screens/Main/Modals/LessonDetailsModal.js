import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Clock, MapPin, Info, Users, GraduationCap } from "lucide-react-native";
import { useTheme } from "../../../../hooks/useTheme";
import { BottomSheet } from "../../../shared/Modals/BottomSheet";
import { getLessonTypeFullName, cleanTeacherName } from "../../../../utils/lessonFormatters";
import { useSchedlyStore } from "../../../../store/useSchedlyStore";

export const LessonDetailsModal = ({
    selectedLesson,
    selectedGroup,
    comparisonGroup,
    comparisonMode = false,
    onClose,
}) => {
    const { theme, createStyles } = useTheme();
    const styles = createStyles(createLocalStyles);

    const customSubjectColors = useSchedlyStore((state) => state.customSubjectColors);

    const subjectName = selectedLesson?.subject || selectedLesson?.name;
    const isLecture = selectedLesson?.type?.toLowerCase().includes("лек");

    // Проверяем кастомный цвет для предмета в сторе, затем цвет из объекта урока, и дефолтные варианты
    const defaultBg = isLecture ? theme.main : theme.accentMuted;
    const bulletColor = comparisonMode
        ? selectedLesson?.color || defaultBg
        : (subjectName && customSubjectColors[subjectName]) || selectedLesson?.color || defaultBg;

    const lessonGroup =
        comparisonMode && selectedLesson?.comparisonGroup === "second"
            ? comparisonGroup
            : selectedGroup;
    const lessonGroupName =
        selectedLesson?.group ||
        lessonGroup?.name ||
        lessonGroup?.title ||
        lessonGroup?.fio ||
        "Группа не указана";

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
                <Text style={styles.bottomSheetTitle}>{subjectName}</Text>
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
                {lessonTypeName && (
                    <View style={styles.bsRow}>
                        <Info size={20} color={theme.accent} />
                        <Text style={styles.bsText}>{lessonTypeName}</Text>
                    </View>
                )}
                {lessonTeacher && (
                    <View style={styles.bsRow}>
                        <GraduationCap size={20} color={theme.accent} />
                        <Text style={styles.bsText}>{lessonTeacher}</Text>
                    </View>
                )}
                <View style={styles.bsRow}>
                    <Users size={20} color={theme.accent} />
                    <Text style={styles.bsText}>{lessonGroupName}</Text>
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
