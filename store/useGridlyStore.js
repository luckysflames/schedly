import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { sqliteZustandStorage } from "../utils/sqliteStorage";
import { THEMES, DEFAULT_THEME_NAME } from "../theme/themes";
import { fetchSchedule } from "../utils/api";

export const useGridlyStore = create(
    persist(
        (set, get) => ({
            // ==========================================
            // --- STATE ---
            // ==========================================
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

            // ==========================================
            // --- ACTIONS (SYSTEM & SECURITY) ---
            // ==========================================
            setHasHydrated: (state) => set({ _hasHydrated: state }),

            setIsVibration: (value) => set({ isVibration: value }),

            setThemeName: (themeName) => {
                if (THEMES[themeName]) {
                    set({ themeName });
                }
            },

            setCurrentView: (view) => set({ currentView: view }),

            setIsViewChanging: (status) => set({ isViewChanging: status }),

            // ==========================================
            // --- ACTIONS (SCHEDULE & GROUPS) ---
            // ==========================================
            setSelectedGroup: (group) => {
                set({ selectedGroup: group });
                if (group?.id) {
                    get().loadSchedule(group.id);
                }
            },

            setScheduleData: (scheduleData) => set({ scheduleData }),

            loadSchedule: async (idGroup) => {
                set({ isLoading: true, error: null });
                try {
                    const data = await fetchSchedule(idGroup);
                    set({ scheduleData: data || null, isLoading: false });
                } catch (e) {
                    set({ error: e.message, isLoading: false });
                }
            },

            toggleSubjectHidden: (subjectName) => {
                const { hiddenSubjects } = get();
                const isHidden = hiddenSubjects.includes(subjectName);
                const updated = isHidden
                    ? hiddenSubjects.filter((s) => s !== subjectName)
                    : [...hiddenSubjects, subjectName];
                set({ hiddenSubjects: updated });
            },

            resetHiddenSubjects: () => set({ hiddenSubjects: [] }),

            resetFullStore: () =>
                set({
                    isVibration: true,
                    themeName: DEFAULT_THEME_NAME,
                    selectedGroup: null,
                    scheduleData: null,
                    currentView: "week",
                    isViewChanging: false,
                    isLoading: false,
                    error: null,
                }),
        }),
        {
            name: "gridly-schedule-storage",
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
