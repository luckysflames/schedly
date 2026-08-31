import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { BookOpen } from "lucide-react-native";

import { useTheme } from "../hooks/useTheme";
import { useGridlyStore } from "../store/useGridlyStore";
import { fetchGroupList } from "../utils/api";
import { TopBar } from "../components/screens/Main/TopBar";
import { ScheduleGrid } from "../components/screens/Main/ScheduleGrid";
import { LessonDetailsModal } from "../components/screens/Main/Modals/LessonDetailsModal";
import { GroupSelectModal } from "../components/screens/Main/Modals/GroupSelectModal";
import { SubjectsFilterModal } from "../components/screens/Main/Modals/SubjectsFilterModal";

export default function MainScreen() {
    const { theme, createStyles } = useTheme();
    const styles = createStyles(createLocalStyles);

    const {
        selectedGroup,
        scheduleData,
        isLoading,
        setSelectedGroup,
        hiddenSubjects,
        toggleSubjectHidden,
        currentView,
        setCurrentView,
    } = useGridlyStore();

    const [dayOffset, setDayOffset] = useState(0);
    const [weekOffset, setWeekOffset] = useState(0);
    const [monthOffset, setMonthOffset] = useState(0);

    // Вычисляем активный офсет для текущего режима:
    const currentOffset =
        currentView === "day" ? dayOffset : currentView === "month" ? monthOffset : weekOffset;
    const setCurrentOffset =
        currentView === "day"
            ? setDayOffset
            : currentView === "month"
              ? setMonthOffset
              : setWeekOffset;

    const [isGroupModalVisible, setIsGroupModalVisible] = useState(false);
    const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

    const [groups, setGroups] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredGroups, setFilteredGroups] = useState([]);
    const [selectedLesson, setSelectedLesson] = useState(null);

    useEffect(() => {
        fetchGroupList().then((data) => {
            const list = Array.isArray(data) ? data : data?.groups || [];
            setGroups(list);
            setFilteredGroups(list);
        });
    }, []);

    const handleSearch = (text) => {
        setSearchQuery(text);
        if (!text) {
            setFilteredGroups(groups);
        } else {
            const filtered = groups.filter((g) =>
                (g.name || g.title || "").toLowerCase().includes(text.toLowerCase()),
            );
            setFilteredGroups(filtered);
        }
    };

    return (
        <View style={styles.container}>
            <TopBar
                selectedGroup={selectedGroup}
                currentView={currentView}
                offset={currentOffset}
                onOpenGroupModal={() => setIsGroupModalVisible(true)}
                onOpenFilters={() => setIsFilterModalVisible(true)}
                onPressCurrentDay={() => setCurrentOffset(0)}
            />

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.accent} />
                    <Text style={[styles.placeholderText, { marginTop: 12 }]}>
                        Загружаем сетку пар...
                    </Text>
                </View>
            ) : !selectedGroup ? (
                <View style={styles.center}>
                    <BookOpen size={48} color={theme.accentMuted} />
                    <Text style={styles.placeholderText}>
                        Выберите учебную группу, чтобы отобразить сетку расписания
                    </Text>
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: theme.accent }]}
                        onPress={() => setIsGroupModalVisible(true)}
                    >
                        <Text style={[styles.buttonText, { color: theme.textDark }]}>
                            Выбрать группу
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScheduleGrid
                    scheduleData={scheduleData}
                    hiddenSubjects={hiddenSubjects}
                    onSelectLesson={(lesson) => setSelectedLesson(lesson)}
                    currentView={currentView}
                    offset={currentOffset}
                    onChangeOffset={setCurrentOffset}
                />
            )}

            <LessonDetailsModal
                selectedLesson={selectedLesson}
                selectedGroup={selectedGroup}
                onClose={() => setSelectedLesson(null)}
            />

            <GroupSelectModal
                visible={isGroupModalVisible}
                groups={filteredGroups}
                searchQuery={searchQuery}
                onSearch={handleSearch}
                onSelectGroup={(item) => {
                    setSelectedGroup(item);
                    setIsGroupModalVisible(false);
                }}
                onClose={() => setIsGroupModalVisible(false)}
            />

            <SubjectsFilterModal
                visible={isFilterModalVisible}
                scheduleData={scheduleData}
                hiddenSubjects={hiddenSubjects}
                onToggleSubject={toggleSubjectHidden}
                onClose={() => setIsFilterModalVisible(false)}
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
            color: theme.accentMuted,
        },
        button: { marginTop: 20, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
        buttonText: { fontWeight: "600", fontSize: 16 },
    });
