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

const initialState = {
    _hasHydrated: false,
    isVibration: true,
    showScheduleUpdateModal: true,
    themeName: DEFAULT_THEME_NAME,
    selectedGroup: null,
    favoriteGroups: [],
    favoriteTeachers: [],
    scheduleData: null,
    scheduleLoadResult: null,
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
                    set({ selectedGroup });
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

                setScheduleData: (scheduleData) => set({ scheduleData }),

                loadSchedule: async (idGroup) => {
                    set({ isLoading: true, error: null, scheduleLoadResult: null });
                    const previousData = get().scheduleData;

                    try {
                        const data = await fetchSchedule(idGroup);
                        const hasData =
                            data &&
                            (Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0);
                        const hasPreviousData =
                            previousData &&
                            (Array.isArray(previousData)
                                ? previousData.length > 0
                                : Object.keys(previousData).length > 0);

                        if (!hasData) {
                            const result = {
                                status: "fallback",
                                reason: "empty",
                                hasLocalData: Boolean(hasPreviousData),
                            };
                            set({
                                isLoading: false,
                                scheduleLoadResult: get().showScheduleUpdateModal ? result : null,
                            });
                            return get().scheduleLoadResult;
                        }

                        const isUnchanged = areSchedulesEqual(previousData, data);

                        set({
                            scheduleData: data,
                            isLoading: false,
                            scheduleLoadResult: get().showScheduleUpdateModal
                                ? { status: isUnchanged ? "unchanged" : "updated" }
                                : null,
                        });
                        return get().scheduleLoadResult;
                    } catch (e) {
                        const result = {
                            status: "fallback",
                            reason: e.code === "NETWORK_ERROR" ? "offline" : "unavailable",
                            hasLocalData: Boolean(previousData),
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
                if (currentGroup?.id) {
                    state.loadSchedule(currentGroup.id);
                }
            },
        },
    ),
);
