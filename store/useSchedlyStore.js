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
};

export const useSchedlyStore = create(
    persist(
        (set, get) => ({
            ...initialState,

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
                try {
                    const data = await fetchSchedule(idGroup);
                    set({ scheduleData: data || get().scheduleData, isLoading: false });
                } catch (e) {
                    set({ error: e.message, isLoading: false });
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
                const { _hasHydrated, isLoading, error, isViewChanging, ...rest } = state;
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
