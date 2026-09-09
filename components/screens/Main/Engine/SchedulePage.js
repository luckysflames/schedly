import React, { useState, useCallback } from "react";
import { View, Dimensions } from "react-native";
import { useScheduleGrid } from "../../../../hooks/useScheduleGrid";
import { ScheduleContentDispatcher } from "./ScheduleContentDispatcher";
import { useSchedlyStore } from "../../../../store/useSchedlyStore";
import { useTheme } from "../../../../hooks/useTheme";

export const SchedulePage = React.memo(
    ({
        scheduleData,
        currentView,
        offset,
        onSelectLesson,
        onLongPressLesson,
        onPressWeekDay,
        hiddenSubjects,
        onRefreshResult,
    }) => {
        const screenWidth = Dimensions.get("window").width;
        const { theme } = useTheme();
        const { selectedGroup, loadSchedule } = useSchedlyStore();
        const [refreshing, setRefreshing] = useState(false);

        const onRefresh = useCallback(async () => {
            if (!selectedGroup?.id) return;
            setRefreshing(true);
            const result = await loadSchedule(selectedGroup.id);
            setRefreshing(false);
            onRefreshResult?.(result);
        }, [selectedGroup, loadSchedule, onRefreshResult]);

        const { HOURS, daysList, weekNumber, getLessonPosition } = useScheduleGrid(
            scheduleData,
            currentView,
            offset,
            hiddenSubjects,
        );

        return (
            <View style={{ width: screenWidth, flex: 1 }}>
                <ScheduleContentDispatcher
                    daysList={daysList}
                    hours={HOURS}
                    weekNumber={weekNumber}
                    getLessonPosition={getLessonPosition}
                    onSelectLesson={onSelectLesson}
                    onLongPressLesson={onLongPressLesson}
                    hiddenSubjects={hiddenSubjects}
                    currentView={currentView}
                    onPressWeekDay={onPressWeekDay}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    theme={theme}
                />
            </View>
        );
    },
);
