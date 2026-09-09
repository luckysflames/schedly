import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { sqliteZustandStorage } from "../utils/sqliteStorage";
import { THEMES, DEFAULT_THEME_NAME } from "../theme/themes";
import { fetchSchedule } from "../utils/api";

const initialState = {
    _hasHydrated: false,
    isVibration: true,
    themeName: DEFAULT_THEME_NAME,
    selectedGroup: null,
    scheduleData: null,
    hiddenSubjects: [],
    isLoading: false,
    error: null,
    currentView: "week",
    isViewChanging: false,
    customSubjectColors: {},
    token: null,
    userInfo: null,
    studentCard: null,
    isAuthLoading: false,
};

export const useSchedlyStore = create(
    persist(
        (set, get) => ({
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
                try {
                    const authData = await apiLoginFunc(username, password);
                    const token = authData?.data.accessToken;
                    const studentID = authData?.data.id;

                    if (studentID !== undefined && token) {
                        const userInfo = await apiUserInfoFunc(studentID, token);
                        const cardData = apiStudentCardFunc
                            ? await apiStudentCardFunc(token)
                            : null;

                        set({
                            token,
                            userInfo,
                            studentCard: cardData?.studentCard || cardData,
                            isAuthLoading: false,
                        });
                        return true;
                    }
                    throw new Error("Не удалось получить токен или ID пользователя");
                } catch (e) {
                    set({ error: e.message, isAuthLoading: false });
                    return false;
                }
            },

            refreshUserInfo: async (apiUserInfoFunc, apiStudentCardFunc) => {
                const { token, userInfo } = get();
                if (!token || !userInfo?.studentID) return;
                try {
                    const freshData = await apiUserInfoFunc(userInfo.studentID, token);
                    const freshCard = apiStudentCardFunc ? await apiStudentCardFunc(token) : null;

                    set({
                        userInfo: freshData || userInfo,
                        studentCard: freshCard?.studentCard || freshCard || get().studentCard,
                    });
                } catch (e) {
                    console.error("Error refreshing user info:", e);
                }
            },

            logout: () => set({ token: null, userInfo: null, studentCard: null }),

            // --- UI & System Actions ---
            setHasHydrated: (status) => set({ _hasHydrated: status }),
            setIsVibration: (isVibration) => set({ isVibration }),
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

            setScheduleData: (scheduleData) => set({ scheduleData }),

            loadSchedule: async (idGroup) => {
                set({ isLoading: true, error: null });
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
                        set({ isLoading: false });
                        return {
                            status: "fallback",
                            reason: "empty",
                            hasLocalData: Boolean(hasPreviousData),
                        };
                    }

                    const isUnchanged = JSON.stringify(previousData) === JSON.stringify(data);

                    set({
                        scheduleData: data,
                        isLoading: false,
                    });
                    return { status: isUnchanged ? "unchanged" : "updated" };
                } catch (e) {
                    set({ error: e.message, isLoading: false });
                    return {
                        status: "fallback",
                        reason: e.code === "NETWORK_ERROR" ? "offline" : "unavailable",
                        hasLocalData: Boolean(previousData),
                    };
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
        }),
        {
            name: "schedly-schedule-storage",
            storage: createJSONStorage(() => sqliteZustandStorage),
            partialize: (state) => {
                const { _hasHydrated, isLoading, error, isViewChanging, isAuthLoading, ...rest } =
                    state;
                return rest;
            },
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
                const currentGroup = state?.selectedGroup;
                if (currentGroup?.id) {
                    state.loadSchedule(currentGroup.id);
                }
            },
        },
    ),
);
