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
                    if (data) {
                        set({ scheduleData: data, isLoading: false });
                    } else {
                        set({ isLoading: false });
                    }
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
                    isLoading: false,
                    error: null,
                }),
        }),
        {
            name: "gridly-schedule-storage",
            storage: createJSONStorage(() => sqliteZustandStorage),
            partialize: (state) => {
                // Сохраняем группу и настройки, исключая временные флаги загрузки и гидратации
                const { _hasHydrated, isLoading, error, ...rest } = state;
                return rest;
            },
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
                // Если группа уже была сохранена в SQLite, автоматически подгружаем расписание при старте
                const currentGroup = state?.selectedGroup;
                if (currentGroup?.id) {
                    state.loadSchedule(currentGroup.id);
                }
            },
        },
    ),
);
