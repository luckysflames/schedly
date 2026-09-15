import React, { useState } from "react";
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
    const [isGroupModalRequested, setIsGroupModalRequested] = useState(false);
    const {
        selectedGroup,
        comparisonGroup,
        comparisonScheduleData,
        isComparisonLoading,
        favoriteGroups,
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
        toggleFavoriteGroup,
        toggleSubjectHidden,
        setCurrentView,
        setSubjectColor,
        setSelectedLesson,
        setRefreshResult,
        setSubjectForColorChange,
        toggleModal,
        handleSearch,
        startGroupComparison,
        exitGroupComparison,
        handleLongPressLesson,
        handleWeekDayPress,
        getAlertTitle,
        getAlertMessage,
    } = useMainScreen();

    const isComparisonMode = Boolean(comparisonGroup);
    const visibleScheduleData = isComparisonMode ? comparisonScheduleData : scheduleData;
    const handleOpenGroupModal = () => {
        setIsGroupModalRequested(true);
        toggleModal(isComparisonMode ? "comparisonGroup" : "group", true);
    };

    const renderMainContent = () => {
        if (isLoading || isComparisonLoading) {
            return (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.accent} />
                    <Text style={[styles.placeholderText, { marginTop: 12 }]}>
                        Загружаем расписание...
                    </Text>
                </View>
            );
        }

        if (!selectedGroup || (isComparisonMode && !visibleScheduleData)) {
            return (
                <View style={styles.center}>
                    <BookOpen size={48} color={theme.accent} />
                    <Text style={styles.placeholderText}>
                        Выберите учебную группу, чтобы отобразить сетку расписания
                    </Text>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => {
                            setIsGroupModalRequested(true);
                            toggleModal("group", true);
                        }}
                    >
                        <Text style={styles.buttonText}>Выбрать группу</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <ScheduleGrid
                scheduleData={visibleScheduleData}
                hiddenSubjects={hiddenSubjects}
                onSelectLesson={setSelectedLesson}
                onLongPressLesson={handleLongPressLesson}
                currentView={currentView}
                offset={currentOffset}
                onChangeOffset={setCurrentOffset}
                onPressWeekDay={handleWeekDayPress}
                onRefreshResult={setRefreshResult}
                comparisonMode={isComparisonMode}
            />
        );
    };

    return (
        <View style={styles.container}>
            <TopBar
                selectedGroup={selectedGroup}
                comparisonGroup={comparisonGroup}
                currentView={currentView}
                offset={currentOffset}
                onOpenGroupModal={handleOpenGroupModal}
                onOpenFilters={() => toggleModal("filter", true)}
                onPressCurrentDay={() => setCurrentOffset(0)}
                onExitComparison={exitGroupComparison}
            />

            {isComparisonMode && (
                <View style={styles.comparisonLegend}>
                    <Text style={styles.comparisonLegendTitle}>Сравнение расписаний</Text>
                    <View style={styles.comparisonLegendRow}>
                        <View
                            style={[
                                styles.legendSwatch,
                                { backgroundColor: theme.accent },
                            ]}
                        />
                        <Text style={styles.legendText}>{selectedGroup?.name}</Text>
                        <View
                            style={[
                                styles.legendSwatch,
                                { backgroundColor: theme.textDark },
                            ]}
                        />
                        <Text style={styles.legendText}>{comparisonGroup?.name}</Text>
                    </View>
                </View>
            )}

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
                comparisonGroup={comparisonGroup}
                comparisonMode={isComparisonMode}
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
                visible={isGroupModalRequested && (modals.group || modals.comparisonGroup)}
                groups={
                    modals.comparisonGroup
                        ? groups.filter(
                              (group) => String(group.id) !== String(selectedGroup?.id),
                          )
                        : groups
                }
                favoriteGroups={favoriteGroups}
                searchQuery={searchQuery}
                onSearch={handleSearch}
                onSelectGroup={(item) => {
                    if (modals.comparisonGroup) {
                        startGroupComparison(item);
                        toggleModal("comparisonGroup", false);
                        setIsGroupModalRequested(false);
                    } else {
                        setSelectedGroup(item);
                        toggleModal("group", false);
                        setIsGroupModalRequested(false);
                    }
                }}
                onToggleFavorite={toggleFavoriteGroup}
                onClose={() => {
                    toggleModal("group", false);
                    toggleModal("comparisonGroup", false);
                    setIsGroupModalRequested(false);
                }}
                canCompare={Boolean(selectedGroup)}
                comparisonMode={Boolean(modals.comparisonGroup)}
                onCompare={() => {
                    setIsGroupModalRequested(true);
                    const isSelectingComparisonGroup = modals.comparisonGroup;
                    toggleModal("group", isSelectingComparisonGroup);
                    toggleModal("comparisonGroup", !isSelectingComparisonGroup);
                }}
                title={modals.comparisonGroup ? "Выбор второй группы" : "Выбор группы"}
            />

            <SubjectsFilterModal
                visible={modals.filter}
                scheduleData={visibleScheduleData}
                hiddenSubjects={hiddenSubjects}
                onToggleSubject={toggleSubjectHidden}
                onClose={() => toggleModal("filter", false)}
                currentView={currentView}
                onChangeView={setCurrentView}
                comparisonMode={isComparisonMode}
                selectedGroup={selectedGroup}
                comparisonGroup={comparisonGroup}
            />
        </View>
    );
}

const createLocalStyles = (theme) =>
    StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.dark },
        comparisonLegend: {
            alignItems: "center",
            paddingHorizontal: 12,
            paddingBottom: 8,
            backgroundColor: theme.dark,
        },
        comparisonLegendTitle: {
            color: theme.text,
            fontSize: 12,
            fontWeight: "700",
            marginBottom: 5,
            textAlign: "center",
        },
        comparisonLegendRow: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 6,
        },
        legendSwatch: {
            width: 12,
            height: 12,
            borderRadius: 3,
        },
        legendText: { color: theme.text, fontSize: 11, marginRight: 7 },
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
