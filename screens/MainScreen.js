import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Vibration,
} from "react-native";
import { BookOpen } from "lucide-react-native";

import { useTheme } from "../hooks/useTheme";
import { useSchedlyStore } from "../store/useSchedlyStore";
import { fetchGroupList } from "../utils/api";
import { TopBar } from "../components/screens/Main/TopBar";
import { ScheduleGrid } from "../components/screens/Main/Engine/ScheduleGrid";
import { LessonDetailsModal } from "../components/screens/Main/Modals/LessonDetailsModal";
import { GroupSelectModal } from "../components/screens/Main/Modals/GroupSelectModal";
import { SubjectsFilterModal } from "../components/screens/Main/Modals/SubjectsFilterModal";
import { SubjectColorPickerModal } from "../components/screens/Main/Modals/SubjectColorPickerModal";

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
        setSubjectColor,
        customSubjectColors,
    } = useSchedlyStore();

    const [dayOffset, setDayOffset] = useState(0);
    const [weekOffset, setWeekOffset] = useState(0);
    const [monthOffset, setMonthOffset] = useState(0);

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
    const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);
    const [subjectForColorChange, setSubjectForColorChange] = useState(null);

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

    const handleLongPressLesson = (lesson) => {
        if (lesson?.subject) {
            Vibration.vibrate([0, 30, 1, 30]);

            setSubjectForColorChange(lesson.subject);
            setIsColorPickerVisible(true);
        }
    };

    const handleWeekDayPress = (date) => {
        const selectedDate = new Date(date);
        const today = new Date();
        selectedDate.setHours(12, 0, 0, 0);
        today.setHours(12, 0, 0, 0);
        setDayOffset(Math.round((selectedDate - today) / 86400000));
        setCurrentView("day");
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
                        Загружаем расписание...
                    </Text>
                </View>
            ) : !selectedGroup ? (
                <View style={styles.center}>
                    <BookOpen size={48} color={theme.accent} />
                    <Text style={styles.placeholderText}>
                        Выберите учебную группу, чтобы отобразить сетку расписания
                    </Text>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => setIsGroupModalVisible(true)}
                    >
                        <Text style={styles.buttonText}>Выбрать группу</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScheduleGrid
                    scheduleData={scheduleData}
                    hiddenSubjects={hiddenSubjects}
                    onSelectLesson={(lesson) => setSelectedLesson(lesson)}
                    onLongPressLesson={handleLongPressLesson}
                    currentView={currentView}
                    offset={currentOffset}
                    onChangeOffset={setCurrentOffset}
                    onPressWeekDay={handleWeekDayPress}
                />
            )}

            <LessonDetailsModal
                selectedLesson={selectedLesson}
                selectedGroup={selectedGroup}
                onClose={() => setSelectedLesson(null)}
            />

            <SubjectColorPickerModal
                visible={isColorPickerVisible}
                subjectName={subjectForColorChange}
                currentColor={
                    subjectForColorChange ? customSubjectColors[subjectForColorChange] : null
                }
                onClose={() => {
                    setIsColorPickerVisible(false);
                    setSubjectForColorChange(null);
                }}
                onSelectColor={(subject, color) => {
                    setSubjectColor(subject, color);
                }}
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
