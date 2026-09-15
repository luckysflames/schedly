import { useState, useEffect, useCallback, useMemo } from "react";
import { Vibration } from "react-native";
import { useSchedlyStore } from "../store/useSchedlyStore";
import { fetchGroupList, fetchSchedule } from "../utils/api";
import { compareScheduleData } from "../utils/compareScheduleData";
import { useTheme } from "./useTheme";

export const useMainScreen = () => {
    const { theme } = useTheme();
    const {
        selectedGroup,
        favoriteGroups,
        scheduleData,
        scheduleLoadResult,
        isLoading,
        setSelectedGroup,
        toggleFavoriteGroup,
        hiddenSubjects,
        toggleSubjectHidden,
        currentView,
        setCurrentView,
        setSubjectColor,
        customSubjectColors,
    } = useSchedlyStore();

    // Навигационные офсеты (день, неделя, месяц)
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

    // Состояние модальных окон
    const [modals, setModals] = useState({
        group: false,
        filter: false,
        colorPicker: false,
    });

    const toggleModal = (modalName, value) => {
        setModals((prev) => ({ ...prev, [modalName]: value }));
    };

    // Локальные данные
    const [groups, setGroups] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [refreshResult, setRefreshResult] = useState(null);
    const [subjectForColorChange, setSubjectForColorChange] = useState(null);
    const [comparisonGroup, setComparisonGroup] = useState(null);
    const [comparisonScheduleData, setComparisonScheduleData] = useState(null);
    const [isComparisonLoading, setIsComparisonLoading] = useState(false);

    useEffect(() => {
        if (scheduleLoadResult) setRefreshResult(scheduleLoadResult);
    }, [scheduleLoadResult]);

    useEffect(() => {
        if (!comparisonScheduleData) return;

        setComparisonScheduleData((currentData) =>
            currentData?.map((day) => ({
                ...day,
                lessons: day.lessons.map((lesson) => ({
                    ...lesson,
                    color:
                        lesson.comparisonGroup === "second"
                            ? theme.textDark
                            : theme.accent,
                })),
            })),
        );
    }, [theme.accent, theme.textDark]);

    const getGroupKey = (group) => group.id ?? group.name ?? group.title;

    const visibleGroups = useMemo(() => {
        const favoriteKeys = new Set(favoriteGroups.map((group) => String(getGroupKey(group))));
        const groupsByKey = new Map();

        favoriteGroups.forEach((group) => groupsByKey.set(String(getGroupKey(group)), group));
        groups.forEach((group) => {
            const key = String(getGroupKey(group));
            if (!groupsByKey.has(key)) groupsByKey.set(key, group);
        });

        const normalizedQuery = searchQuery.toLowerCase();
        const matchingFavorites = [];
        const matchingGroups = [];

        groupsByKey.forEach((group) => {
            if (!(group.name || group.title || "").toLowerCase().includes(normalizedQuery)) return;

            if (favoriteKeys.has(String(getGroupKey(group)))) {
                matchingFavorites.push(group);
            } else {
                matchingGroups.push(group);
            }
        });

        return [...matchingFavorites, ...matchingGroups];
    }, [favoriteGroups, groups, searchQuery]);

    // Загрузка списка групп
    useEffect(() => {
        fetchGroupList().then((data) => {
            const list = Array.isArray(data) ? data : data?.groups || [];
            setGroups(list);
        });
    }, []);

    // Обработчик поиска
    const handleSearch = (text) => {
        setSearchQuery(text);
    };

    const startGroupComparison = useCallback(
        async (secondGroup) => {
            if (!selectedGroup?.id || !secondGroup?.id || selectedGroup.id === secondGroup.id) {
                return;
            }

            setComparisonGroup(secondGroup);
            setIsComparisonLoading(true);
            try {
                const secondSchedule = await fetchSchedule(secondGroup.id);
                setComparisonScheduleData(
                    compareScheduleData(scheduleData, secondSchedule, {
                        firstColor: theme.accent,
                        secondColor: theme.textDark,
                    }),
                );
            } catch {
                setComparisonGroup(null);
                setComparisonScheduleData(null);
                setRefreshResult({ reason: "unavailable", hasLocalData: Boolean(scheduleData) });
            } finally {
                setIsComparisonLoading(false);
            }
        },
        [scheduleData, selectedGroup, theme],
    );

    const exitGroupComparison = useCallback(() => {
        setComparisonGroup(null);
        setComparisonScheduleData(null);
    }, []);

    // Длинный тап по уроку (вызов пикера цвета)
    const handleLongPressLesson = useCallback((lesson) => {
        if (lesson?.subject) {
            Vibration.vibrate([0, 30, 1, 30]);
            setSubjectForColorChange(lesson.subject);
            toggleModal("colorPicker", true);
        }
    }, []);

    // Нажатие на день недели в сетке
    const handleWeekDayPress = useCallback(
        (date) => {
            const selectedDate = new Date(date);
            const today = new Date();
            selectedDate.setHours(12, 0, 0, 0);
            today.setHours(12, 0, 0, 0);
            setDayOffset(Math.round((selectedDate - today) / 86400000));
            setCurrentView("day");
        },
        [setCurrentView],
    );

    // Тексты для алертов обновления
    const getAlertTitle = () => {
        if (refreshResult?.status === "updated") return "Расписание изменено";
        if (refreshResult?.status === "unchanged") return "Расписание без изменений";
        if (refreshResult?.reason === "offline") return "Нет интернет-соединения";
        return "Не удалось обновить расписание";
    };

    const getAlertMessage = () => {
        if (refreshResult?.status === "updated")
            return "Загружены свежие данные от API с изменениями.";
        if (refreshResult?.status === "unchanged")
            return "Данные от API совпадают с сохранённой версией.";
        return refreshResult?.hasLocalData
            ? "Будет показана последняя сохранённая версия расписания."
            : "Сохранённой версии расписания пока нет.";
    };

    return {
        // Стейты
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
        groups: visibleGroups,
        searchQuery,
        selectedLesson,
        refreshResult,
        subjectForColorChange,
        customSubjectColors,
        hiddenSubjects,

        // Сеттеры и методы
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
    };
};
