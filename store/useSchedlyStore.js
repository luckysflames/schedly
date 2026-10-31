import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { sqliteZustandStorage } from "../utils/sqliteStorage";
import { THEMES, DEFAULT_THEME_NAME } from "../theme/themes";
import {
    clearAuthCredentials,
    fetchSchedule,
    saveAuthCredentials,
    setAuthStateUpdater,
} from "../utils/api";
import { areSchedulesEqual } from "../utils/normalizeScheduleData";
import {
    compareScheduleUpdatesById,
    getScheduleLessonKey,
} from "../utils/compareScheduleUpdates";

const initialState = {
    _hasHydrated: false,
    isVibration: true,
    showScheduleUpdateModal: true,
    showScheduleChangeHighlights: false,
    showSeasonalEffects: false,
    showSecretEffect: false,
    themeName: DEFAULT_THEME_NAME,
    selectedGroup: null,
    scheduleDataGroupId: null,
    favoriteGroups: [],
    favoriteTeachers: [],
    scheduleData: null,
    scheduleLoadResult: null,
    scheduleChangeHighlights: [],
    hiddenSubjects: [],
    isLoading: false,
    error: null,
    currentView: "week",
    isViewChanging: false,
    customSubjectColors: {},
    token: null,
    studentID: null,
    userInfo: null,
    studentCard: null,
    isAuthLoading: false,
};

export const useSchedlyStore = create(
    persist(
        (set, get) => {
            setAuthStateUpdater((authState) => {
                if (authState) {
                    set({ token: authState.token, studentID: authState.studentID });
                    return;
                }

                set({ token: null, studentID: null, userInfo: null, studentCard: null });
            });

            return {
                ...initialState,

                // --- Auth ---
                login: async (
                    username,
                    password,
                    apiLoginFunc,
                    apiUserInfoFunc,
                    apiStudentCardFunc,
                ) => {
                    set({ isAuthLoading: true, error: null });
                    let credentialsSaved = false;
                    try {
                        const authData = await apiLoginFunc(username, password);
                        const token = authData?.data.accessToken;
                        const studentID = authData?.data.id;

                        if (studentID !== undefined && token) {
                            await saveAuthCredentials(username, password);
                            credentialsSaved = true;
                            set({ token, studentID });
                            const userInfo = await apiUserInfoFunc(studentID, token);
                            const cardData = apiStudentCardFunc
                                ? await apiStudentCardFunc(token)
                                : null;

                            set({
                                token,
                                studentID,
                                userInfo,
                                studentCard: cardData?.studentCard || cardData,
                                isAuthLoading: false,
                            });
                            return true;
                        }
                        throw new Error("Не удалось получить токен или ID пользователя");
                    } catch (e) {
                        if (!credentialsSaved) await clearAuthCredentials();
                        set({
                            token: null,
                            studentID: null,
                            userInfo: null,
                            studentCard: null,
                            error: e.message,
                            isAuthLoading: false,
                        });
                        return false;
                    }
                },

                refreshUserInfo: async (apiUserInfoFunc, apiStudentCardFunc) => {
                    const { token, studentID, userInfo } = get();
                    const currentStudentID = studentID || userInfo?.studentID;
                    if (!token || !currentStudentID) return;
                    try {
                        const freshData = await apiUserInfoFunc(currentStudentID, token);
                        const freshCard = apiStudentCardFunc
                            ? await apiStudentCardFunc(token)
                            : null;

                        set({
                            userInfo: freshData || userInfo,
                            studentCard: freshCard?.studentCard || freshCard || get().studentCard,
                        });
                    } catch (e) {
                        console.error("Error refreshing user info:", e);
                    }
                },

                logout: async () => {
                    await clearAuthCredentials();
                    set({ token: null, studentID: null, userInfo: null, studentCard: null });
                },

                // --- UI & System Actions ---
                setHasHydrated: (status) => set({ _hasHydrated: status }),
                setIsVibration: (isVibration) => set({ isVibration }),
                setShowScheduleUpdateModal: (showScheduleUpdateModal) =>
                    set({ showScheduleUpdateModal, scheduleLoadResult: null }),
                setShowScheduleChangeHighlights: (showScheduleChangeHighlights) =>
                    set({
                        showScheduleChangeHighlights,
                        ...(!showScheduleChangeHighlights ? { scheduleChangeHighlights: [] } : {}),
                    }),
                setScheduleDataGroupId: (scheduleDataGroupId) => set({ scheduleDataGroupId }),
                setShowSeasonalEffects: (showSeasonalEffects) => set({ showSeasonalEffects }),
                setShowSecretEffect: (showSecretEffect) => set({ showSecretEffect }),
                setScheduleLoadResult: (scheduleLoadResult) =>
                    set({
                        scheduleLoadResult: get().showScheduleUpdateModal
                            ? scheduleLoadResult
                            : null,
                    }),
                setCurrentView: (currentView) => set({ currentView }),
                setIsViewChanging: (isViewChanging) => set({ isViewChanging }),

                setThemeName: (themeName) => {
                    if (THEMES[themeName]) set({ themeName });
                },

                // --- Schedule & Groups Actions ---
                setSelectedGroup: (selectedGroup) => {
                    const selectedId = selectedGroup?.id;
                    const currentId = get().selectedGroup?.id;
                    set({
                        selectedGroup,
                        ...(String(selectedId) !== String(currentId)
                            ? { scheduleChangeHighlights: [] }
                            : {}),
                    });
                    if (selectedGroup?.id) {
                        get().loadSchedule(selectedGroup.id);
                    }
                },

                toggleFavoriteGroup: (group) => {
                    if (!group) return;

                    const groupKey = group.id ?? group.name ?? group.title;
                    if (groupKey === undefined || groupKey === null) return;

                    const { favoriteGroups } = get();
                    const isFavorite = favoriteGroups.some(
                        (favoriteGroup) =>
                            String(
                                favoriteGroup.id ?? favoriteGroup.name ?? favoriteGroup.title,
                            ) === String(groupKey),
                    );

                    set({
                        favoriteGroups: isFavorite
                            ? favoriteGroups.filter(
                                  (favoriteGroup) =>
                                      String(
                                          favoriteGroup.id ??
                                              favoriteGroup.name ??
                                              favoriteGroup.title,
                                      ) !== String(groupKey),
                              )
                            : [...favoriteGroups, group],
                    });
                },

                toggleFavoriteTeacher: (teacher) => {
                    if (!teacher) return;

                    const teacherKey =
                        teacher.id ??
                        teacher.idTeacher ??
                        teacher.teacherId ??
                        teacher.teacherID ??
                        teacher.кодПреподавателя ??
                        teacher.name;
                    if (teacherKey === undefined || teacherKey === null) return;

                    const { favoriteTeachers } = get();
                    const isFavorite = favoriteTeachers.some(
                        (favoriteTeacher) =>
                            String(
                                favoriteTeacher.id ??
                                    favoriteTeacher.idTeacher ??
                                    favoriteTeacher.teacherId ??
                                    favoriteTeacher.teacherID ??
                                    favoriteTeacher.кодПреподавателя ??
                                    favoriteTeacher.name,
                            ) === String(teacherKey),
                    );

                    set({
                        favoriteTeachers: isFavorite
                            ? favoriteTeachers.filter(
                                  (favoriteTeacher) =>
                                      String(
                                          favoriteTeacher.id ??
                                              favoriteTeacher.idTeacher ??
                                              favoriteTeacher.teacherId ??
                                              favoriteTeacher.teacherID ??
                                              favoriteTeacher.кодПреподавателя ??
                                              favoriteTeacher.name,
                                      ) !== String(teacherKey),
                              )
                            : [...favoriteTeachers, teacher],
                    });
                },

                setScheduleData: (scheduleData) =>
                    set({
                        scheduleData,
                        scheduleDataGroupId: get().selectedGroup?.id ?? null,
                        scheduleChangeHighlights: [],
                    }),

                loadSchedule: async (idGroup) => {
                    set({ isLoading: true, error: null, scheduleLoadResult: null });
                    const previousData = get().scheduleData;
                    const previousDataGroupId = get().scheduleDataGroupId;
                    const hasPreviousDataForGroup =
                        previousDataGroupId !== null &&
                        previousDataGroupId !== undefined &&
                        idGroup !== null &&
                        idGroup !== undefined &&
                        String(previousDataGroupId) === String(idGroup);
                    const hasPreviousData =
                        previousData &&
                        (Array.isArray(previousData)
                            ? previousData.length > 0
                            : Object.keys(previousData).length > 0);

                    try {
                        const data = await fetchSchedule(idGroup);
                        const hasData =
                            data &&
                            (Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0);

                        if (!hasData) {
                            const result = {
                                status: "fallback",
                                reason: "empty",
                                hasLocalData: Boolean(hasPreviousData && hasPreviousDataForGroup),
                            };
                            set({
                                isLoading: false,
                                scheduleLoadResult: get().showScheduleUpdateModal ? result : null,
                            });
                            return get().scheduleLoadResult;
                        }

                        const hasComparablePrevious =
                            hasPreviousData && hasPreviousDataForGroup;
                        const isUnchanged =
                            hasComparablePrevious && areSchedulesEqual(previousData, data);
                        const result = {
                            status: !hasComparablePrevious
                                ? "loaded"
                                : isUnchanged
                                  ? "unchanged"
                                  : "updated",
                            ...(hasComparablePrevious &&
                            !isUnchanged &&
                            get().showScheduleChangeHighlights
                                ? {
                                      changes: compareScheduleUpdatesById(previousData, data),
                                  }
                                : {}),
                        };
                        const scheduleChangeHighlights = (result.changes || [])
                            .filter(
                                (change) =>
                                    change.type === "changed" || change.type === "added",
                            )
                            .map((change) => {
                                const lesson =
                                    change.type === "changed"
                                        ? change.nextLesson
                                        : change.lesson;
                                return {
                                    key: getScheduleLessonKey(
                                        lesson,
                                        lesson.comparable.date,
                                    ),
                                    type: change.type,
                                    fields:
                                        change.type === "changed"
                                            ? change.fields.map((field) => field.field)
                                            : ["new"],
                                };
                            });

                        set({
                            scheduleData: data,
                            scheduleDataGroupId: idGroup,
                            scheduleChangeHighlights,
                            isLoading: false,
                            scheduleLoadResult: get().showScheduleUpdateModal ? result : null,
                        });
                        return get().scheduleLoadResult;
                    } catch (e) {
                        const result = {
                            status: "fallback",
                            reason: e.code === "NETWORK_ERROR" ? "offline" : "unavailable",
                            hasLocalData: Boolean(hasPreviousData && hasPreviousDataForGroup),
                        };
                        set({
                            error: e.message,
                            isLoading: false,
                            scheduleLoadResult: get().showScheduleUpdateModal ? result : null,
                        });
                        return get().scheduleLoadResult;
                    }
                },

                // --- Subject Filters & Customization ---
                toggleSubjectHidden: (subjectName) => {
                    const { hiddenSubjects } = get();
                    const isHidden = hiddenSubjects.includes(subjectName);
                    const updated = isHidden
                        ? hiddenSubjects.filter((s) => s !== subjectName)
                        : [...hiddenSubjects, subjectName];

                    set({ hiddenSubjects: updated });
                },

                resetHiddenSubjects: () => set({ hiddenSubjects: [] }),

                setSubjectColor: (subjectName, color) => {
                    const { customSubjectColors } = get();
                    set({
                        customSubjectColors: {
                            ...customSubjectColors,
                            [subjectName]: color,
                        },
                    });
                },

                resetCustomSubjectColors: () => set({ customSubjectColors: {} }),

                // --- Reset ---
                resetFullStore: () => set(initialState),
            };
        },
        {
            name: "schedly-schedule-storage",
            storage: createJSONStorage(() => sqliteZustandStorage),
            partialize: (state) => {
                const {
                    _hasHydrated,
                    isLoading,
                    error,
                    scheduleLoadResult,
                    scheduleChangeHighlights,
                    isViewChanging,
                    isAuthLoading,
                    groups,
                    teachers,
                    ...rest
                } = state;
                return rest;
            },
            onRehydrateStorage: () => (state) => {
                const currentGroup = state?.selectedGroup;
                state?.setHasHydrated(true);
                if (state?.scheduleData && currentGroup?.id && !state.scheduleDataGroupId) {
                    state.setScheduleDataGroupId(currentGroup.id);
                }
                if (currentGroup?.id) {
                    state.loadSchedule(currentGroup.id);
                }
            },
        },
    ),
);
