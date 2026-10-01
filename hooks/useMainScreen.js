import {
    useState,
    useEffect,
    useCallback,
    useMemo,
    useDeferredValue,
    useRef,
} from "react";
import { Vibration } from "react-native";
import { useSchedlyStore } from "../store/useSchedlyStore";
import {
    fetchGroupList,
    fetchSchedule,
    fetchTeacherList,
    fetchTeacherScheduleDates,
    fetchTeacherScheduleByDate,
} from "../utils/api";
import { compareScheduleData } from "../utils/compareScheduleData";
import { useTheme } from "./useTheme";

export const useMainScreen = () => {
    const { theme } = useTheme();
    const {
        selectedGroup,
        favoriteGroups,
        favoriteTeachers,
        groups,
        teachers,
        scheduleData,
        scheduleLoadResult,
        showScheduleUpdateModal,
        setScheduleLoadResult,
        setGroupsIfChanged,
        setTeachersIfChanged,
        isLoading,
        setSelectedGroup,
        toggleFavoriteGroup,
        toggleFavoriteTeacher,
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
    const [searchQuery, setSearchQuery] = useState("");
    const [teacherSearchQuery, setTeacherSearchQuery] = useState("");
    const deferredSearchQuery = useDeferredValue(searchQuery);
    const deferredTeacherSearchQuery = useDeferredValue(teacherSearchQuery);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [refreshResult, setLocalRefreshResult] = useState(null);
    const [subjectForColorChange, setSubjectForColorChange] = useState(null);
    const [comparisonGroup, setComparisonGroup] = useState(null);
    const [comparisonTeacher, setComparisonTeacher] = useState(false);
    const [comparisonScheduleData, setComparisonScheduleData] = useState(null);
    const [isComparisonLoading, setIsComparisonLoading] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [teacherScheduleData, setTeacherScheduleData] = useState(null);
    const [isTeacherLoading, setIsTeacherLoading] = useState(false);
    const teacherScheduleCache = useRef(new Map());
    const teacherRequestSequence = useRef(0);
    const groupListRequest = useRef(null);
    const teacherListRequest = useRef(null);

    const setRefreshResult = useCallback(
        (result) => {
            if (result == null || showScheduleUpdateModal) {
                setLocalRefreshResult(result);
            }
        },
        [showScheduleUpdateModal],
    );

    useEffect(() => {
        setLocalRefreshResult(showScheduleUpdateModal ? scheduleLoadResult : null);
    }, [scheduleLoadResult, showScheduleUpdateModal]);

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

    const groupOptions = useMemo(() => {
        const groupsByKey = new Map();
        groups.forEach((group) => {
            const key = String(getGroupKey(group));
            if (!groupsByKey.has(key)) groupsByKey.set(key, group);
        });

        return [...groupsByKey.entries()].map(([key, group]) => ({
            key,
            group,
            searchName: String(group.name || group.title || "").toLocaleLowerCase("ru-RU"),
        }));
    }, [groups]);

    const visibleGroups = useMemo(() => {
        const normalizedQuery = deferredSearchQuery.trim().toLocaleLowerCase("ru-RU");
        const favoriteKeys = new Set(favoriteGroups.map((group) => String(getGroupKey(group))));
        const matchingFavorites = favoriteGroups.filter((group) =>
            String(group.name || group.title || "")
                .toLocaleLowerCase("ru-RU")
                .includes(normalizedQuery),
        );
        const matchingGroups = groupOptions
            .filter(
                (option) =>
                    !favoriteKeys.has(option.key) && option.searchName.includes(normalizedQuery),
            )
            .map((option) => option.group);

        return [...matchingFavorites, ...matchingGroups];
    }, [deferredSearchQuery, favoriteGroups, groupOptions]);

    const loadGroups = useCallback(() => {
        if (groupListRequest.current) return groupListRequest.current;

        groupListRequest.current = fetchGroupList()
            .then((data) => {
                const list = Array.isArray(data)
                    ? data
                    : Array.isArray(data?.groups)
                      ? data.groups
                      : null;
                if (list) setGroupsIfChanged(list);
            })
            .finally(() => {
                groupListRequest.current = null;
            });
        return groupListRequest.current;
    }, [setGroupsIfChanged]);

    const loadTeachers = useCallback(() => {
        if (teacherListRequest.current) return teacherListRequest.current;

        teacherListRequest.current = fetchTeacherList()
            .then((data) => {
                                const list = Array.isArray(data)
                                        ? data
                                        : Array.isArray(data?.teachers)
                                            ? data.teachers
                                            : Array.isArray(data?.items)
                                                ? data.items
                                                : null;
                                if (list) setTeachersIfChanged(list);
            })
            .finally(() => {
                teacherListRequest.current = null;
            });
        return teacherListRequest.current;
    }, [setTeachersIfChanged]);

    // Обработчик поиска
    const handleSearch = (text) => {
        setSearchQuery(text);
    };

    const getTeacherId = (teacher) =>
        teacher?.id ??
        teacher?.idTeacher ??
        teacher?.teacherId ??
        teacher?.teacherID ??
        teacher?.кодПреподавателя ??
        teacher?.код;
    const getTeacherName = (teacher) =>
        teacher?.name ?? teacher?.title ?? teacher?.fio ?? teacher?.ФИО ?? teacher?.teacher ?? "";

    const teacherOptions = useMemo(() => {
        const getTeacherKey = (teacher) => getTeacherId(teacher) ?? getTeacherName(teacher);
        const teachersByKey = new Map();

        teachers.forEach((teacher) => {
            const key = String(getTeacherKey(teacher));
            if (!teachersByKey.has(key)) teachersByKey.set(key, teacher);
        });

        return [...teachersByKey.entries()].map(([key, teacher]) => ({
            key,
            teacher,
            searchName: String(getTeacherName(teacher)).toLocaleLowerCase("ru-RU"),
        }));
    }, [teachers]);

    const visibleTeachers = useMemo(() => {
        const normalizedQuery = deferredTeacherSearchQuery
            .trim()
            .toLocaleLowerCase("ru-RU");
        const getTeacherKey = (teacher) => getTeacherId(teacher) ?? getTeacherName(teacher);
        const favoriteKeys = new Set(
            favoriteTeachers.map((teacher) => String(getTeacherKey(teacher))),
        );
        const matchingFavorites = favoriteTeachers.filter((teacher) =>
            String(getTeacherName(teacher)).toLocaleLowerCase("ru-RU").includes(normalizedQuery),
        );
        const matchingTeachers = teacherOptions
            .filter(
                (option) =>
                    !favoriteKeys.has(option.key) && option.searchName.includes(normalizedQuery),
            )
            .map((option) => option.teacher);

        return [...matchingFavorites, ...matchingTeachers];
    }, [deferredTeacherSearchQuery, favoriteTeachers, teacherOptions]);

    const loadTeacherSchedule = useCallback(async (teacherId) => {
        const cacheKey = String(teacherId);
        if (!teacherScheduleCache.current.has(cacheKey)) {
            const request = (async () => {
                const response = await fetchTeacherScheduleDates(teacherId);
                const availableDates = Array.isArray(response)
                    ? response
                    : response?.dates || [];
                const dates = availableDates
                    .map((item) =>
                        typeof item === "string"
                            ? item
                            : item?.date ?? item?.sdate ?? item?.value,
                    )
                    .filter(Boolean);

                if (!dates.length && response?.selDate) dates.push(response.selDate);

                const lessons = [];
                for (let index = 0; index < dates.length; index += 6) {
                    const schedules = await Promise.all(
                        dates.slice(index, index + 6).map((date) =>
                            fetchTeacherScheduleByDate(teacherId, date),
                        ),
                    );
                    schedules.forEach((schedule) => {
                        const dayLessons = schedule?.rasp || schedule?.data?.rasp || [];
                        lessons.push(...dayLessons);
                    });
                }

                const uniqueLessons = new Map();
                lessons.forEach((lesson, index) => {
                    uniqueLessons.set(String(lesson.код ?? `${lesson.дата}-${index}`), lesson);
                });
                return { rasp: [...uniqueLessons.values()] };
            })();
            teacherScheduleCache.current.set(cacheKey, request);
            request.catch(() => teacherScheduleCache.current.delete(cacheKey));
        }
        return teacherScheduleCache.current.get(cacheKey);
    }, []);

    const selectGroup = useCallback(
        (group) => {
            teacherRequestSequence.current += 1;
            setSelectedTeacher(null);
            setTeacherScheduleData(null);
            setIsTeacherLoading(false);
            setSelectedGroup(group);
        },
        [setSelectedGroup],
    );

    const selectTeacher = useCallback(async (teacher) => {
        const teacherId = getTeacherId(teacher);
        if (teacherId === undefined || teacherId === null) return;

        const requestSequence = ++teacherRequestSequence.current;
        setSelectedTeacher(teacher);
        setTeacherScheduleData(null);
        setIsTeacherLoading(true);
        try {
            const data = await loadTeacherSchedule(teacherId);
            if (requestSequence === teacherRequestSequence.current) setTeacherScheduleData(data);
        } catch {
            if (requestSequence === teacherRequestSequence.current) {
                setScheduleLoadResult({ reason: "unavailable", hasLocalData: false });
            }
        } finally {
            if (requestSequence === teacherRequestSequence.current) setIsTeacherLoading(false);
        }
    }, [loadTeacherSchedule, setScheduleLoadResult]);

    const startGroupComparison = useCallback(
        async (secondGroup) => {
            if (!selectedGroup?.id || !secondGroup?.id || selectedGroup.id === secondGroup.id) {
                return;
            }

            setComparisonGroup(secondGroup);
            setComparisonTeacher(false);
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
                setScheduleLoadResult({ reason: "unavailable", hasLocalData: Boolean(scheduleData) });
            } finally {
                setIsComparisonLoading(false);
            }
        },
        [scheduleData, selectedGroup, setScheduleLoadResult, theme],
    );

    const startTeacherComparison = useCallback(
        async (teacher) => {
            const teacherId = getTeacherId(teacher);
            if (!selectedGroup?.id || teacherId === undefined || teacherId === null) return;

            setComparisonGroup(teacher);
            setComparisonTeacher(true);
            setIsComparisonLoading(true);
            try {
                const teacherSchedule = await loadTeacherSchedule(teacherId);
                setComparisonScheduleData(
                    compareScheduleData(scheduleData, teacherSchedule, {
                        firstColor: theme.accent,
                        secondColor: theme.textDark,
                    }),
                );
            } catch {
                setComparisonGroup(null);
                setComparisonTeacher(false);
                setComparisonScheduleData(null);
                setScheduleLoadResult({ reason: "unavailable", hasLocalData: Boolean(scheduleData) });
            } finally {
                setIsComparisonLoading(false);
            }
        },
        [loadTeacherSchedule, scheduleData, selectedGroup, setScheduleLoadResult, theme],
    );

    const exitGroupComparison = useCallback(() => {
        setComparisonGroup(null);
        setComparisonTeacher(false);
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
        if (scheduleLoadResult?.status === "updated") return "Расписание изменено";
        if (scheduleLoadResult?.status === "unchanged") return "Расписание без изменений";
        if (scheduleLoadResult?.reason === "offline") return "Нет интернет-соединения";
        return "Не удалось обновить расписание";
    };

    const getAlertMessage = () => {
        if (scheduleLoadResult?.status === "updated")
            return "Загружены свежие данные от API с изменениями.";
        if (scheduleLoadResult?.status === "unchanged")
            return "Данные от API совпадают с сохранённой версией.";
        return scheduleLoadResult?.hasLocalData
            ? "Будет показана последняя сохранённая версия расписания."
            : "Сохранённой версии расписания пока нет.";
    };

    return {
        // Стейты
        selectedGroup,
        selectedTeacher,
        selectedSchedule: selectedTeacher || selectedGroup,
        comparisonGroup,
        comparisonTeacher,
        comparisonScheduleData,
        isComparisonLoading,
        isTeacherLoading,
        isSearchingGroups: searchQuery !== deferredSearchQuery,
        isSearchingTeachers: teacherSearchQuery !== deferredTeacherSearchQuery,
        favoriteGroups,
        favoriteTeachers,
        scheduleData,
        selectedScheduleData: selectedTeacher ? teacherScheduleData : scheduleData,
        isLoading,
        currentView,
        currentOffset,
        modals,
        groups: visibleGroups,
        teachers: visibleTeachers,
        searchQuery,
        teacherSearchQuery,
        selectedLesson,
        refreshResult,
        showScheduleUpdateModal,
        subjectForColorChange,
        customSubjectColors,
        hiddenSubjects,

        // Сеттеры и методы
        setCurrentOffset,
        loadGroups,
        loadTeachers,
        setSelectedGroup,
        selectGroup,
        selectTeacher,
        toggleFavoriteGroup,
        toggleFavoriteTeacher,
        toggleSubjectHidden,
        setCurrentView,
        setSubjectColor,
        setSelectedLesson,
        setRefreshResult,
        setScheduleLoadResult,
        setSubjectForColorChange,
        toggleModal,
        handleSearch,
        setTeacherSearchQuery,
        startGroupComparison,
        startTeacherComparison,
        exitGroupComparison,
        handleLongPressLesson,
        handleWeekDayPress,
        getAlertTitle,
        getAlertMessage,
    };
};
