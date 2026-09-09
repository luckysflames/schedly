import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { BookOpen } from "lucide-react-native";

import { useTheme } from "../hooks/useTheme";
import { useMainScreen } from "../hooks/useMainScreen";

import { TopBar } from "../components/screens/Main/TopBar";
import { ScheduleGrid } from "../components/screens/Main/Engine/ScheduleGrid";
import { LessonDetailsModal } from "../components/screens/Main/Modals/LessonDetailsModal";
import { GroupSelectModal } from "../components/screens/Main/Modals/GroupSelectModal";
import { SubjectsFilterModal } from "../components/screens/Main/Modals/SubjectsFilterModal";
import { SubjectColorPickerModal } from "../components/screens/Main/Modals/SubjectColorPickerModal";
import { CustomAlertModal } from "../components/shared/Modals/CustomAlertModal";

export default function MainScreen() {
    const { theme, createStyles } = useTheme();
    const styles = createStyles(createLocalStyles);

    const {
        selectedGroup,
        scheduleData,
        isLoading,
        currentView,
        currentOffset,
        modals,
        groups,
        searchQuery,
        selectedLesson,
        refreshResult,
        subjectForColorChange,
        customSubjectColors,
        hiddenSubjects,
        setCurrentOffset,
        setSelectedGroup,
        toggleSubjectHidden,
        setCurrentView,
        setSubjectColor,
        setSelectedLesson,
        setRefreshResult,
        setSubjectForColorChange,
        toggleModal,
        handleSearch,
        handleLongPressLesson,
        handleWeekDayPress,
        getAlertTitle,
        getAlertMessage,
    } = useMainScreen();

    const renderMainContent = () => {
        if (isLoading) {
            return (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.accent} />
                    <Text style={[styles.placeholderText, { marginTop: 12 }]}>
                        Загружаем расписание...
                    </Text>
                </View>
            );
        }

        if (!selectedGroup) {
            return (
                <View style={styles.center}>
                    <BookOpen size={48} color={theme.accent} />
                    <Text style={styles.placeholderText}>
                        Выберите учебную группу, чтобы отобразить сетку расписания
                    </Text>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => toggleModal("group", true)}
                    >
                        <Text style={styles.buttonText}>Выбрать группу</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <ScheduleGrid
                scheduleData={scheduleData}
                hiddenSubjects={hiddenSubjects}
                onSelectLesson={setSelectedLesson}
                onLongPressLesson={handleLongPressLesson}
                currentView={currentView}
                offset={currentOffset}
                onChangeOffset={setCurrentOffset}
                onPressWeekDay={handleWeekDayPress}
                onRefreshResult={setRefreshResult}
            />
        );
    };

    return (
        <View style={styles.container}>
            <TopBar
                selectedGroup={selectedGroup}
                currentView={currentView}
                offset={currentOffset}
                onOpenGroupModal={() => toggleModal("group", true)}
                onOpenFilters={() => toggleModal("filter", true)}
                onPressCurrentDay={() => setCurrentOffset(0)}
            />

            {renderMainContent()}

            <CustomAlertModal
                visible={Boolean(refreshResult)}
                title={getAlertTitle()}
                message={getAlertMessage()}
                buttons={[{ text: "Понятно", style: "default" }]}
                onClose={() => setRefreshResult(null)}
            />

            <LessonDetailsModal
                selectedLesson={selectedLesson}
                selectedGroup={selectedGroup}
                onClose={() => setSelectedLesson(null)}
            />

            <SubjectColorPickerModal
                visible={modals.colorPicker}
                subjectName={subjectForColorChange}
                currentColor={
                    subjectForColorChange ? customSubjectColors[subjectForColorChange] : null
                }
                onClose={() => {
                    toggleModal("colorPicker", false);
                    setSubjectForColorChange(null);
                }}
                onSelectColor={(subject, color) => setSubjectColor(subject, color)}
            />

            <GroupSelectModal
                visible={modals.group}
                groups={groups}
                searchQuery={searchQuery}
                onSearch={handleSearch}
                onSelectGroup={(item) => {
                    setSelectedGroup(item);
                    toggleModal("group", false);
                }}
                onClose={() => toggleModal("group", false)}
            />

            <SubjectsFilterModal
                visible={modals.filter}
                scheduleData={scheduleData}
                hiddenSubjects={hiddenSubjects}
                onToggleSubject={toggleSubjectHidden}
                onClose={() => toggleModal("filter", false)}
                currentView={currentView}
                onChangeView={setCurrentView}
            />
        </View>
    );
}

const createLocalStyles = (theme) =>
    StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.dark },
        center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
        placeholderText: {
            textAlign: "center",
            marginTop: 12,
            fontSize: 14,
            color: theme.accent,
        },
        button: {
            marginTop: 20,
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 12,
            backgroundColor: theme.accent,
        },
        buttonText: { fontWeight: "600", fontSize: 16, color: theme.text },
    });
