import { useState, useEffect, useCallback } from "react";
import { Vibration } from "react-native";
import { useSchedlyStore } from "../store/useSchedlyStore";
import { fetchGroupList } from "../utils/api";

export const useMainScreen = () => {
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
    const [filteredGroups, setFilteredGroups] = useState([]);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [refreshResult, setRefreshResult] = useState(null);
    const [subjectForColorChange, setSubjectForColorChange] = useState(null);

    // Загрузка списка групп
    useEffect(() => {
        fetchGroupList().then((data) => {
            const list = Array.isArray(data) ? data : data?.groups || [];
            setGroups(list);
            setFilteredGroups(list);
        });
    }, []);

    // Обработчик поиска
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
        scheduleData,
        isLoading,
        currentView,
        currentOffset,
        modals,
        groups: filteredGroups,
        searchQuery,
        selectedLesson,
        refreshResult,
        subjectForColorChange,
        customSubjectColors,
        hiddenSubjects,

        // Сеттеры и методы
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
    };
};
