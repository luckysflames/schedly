import React, { useState, useCallback } from "react";
import { View, Dimensions } from "react-native";
import { useScheduleGrid } from "../../../../hooks/useScheduleGrid";
import { ScheduleContentDispatcher } from "./ScheduleContentDispatcher";
import { useSchedlyStore } from "../../../../store/useSchedlyStore";
import { useTheme } from "../../../../hooks/useTheme";

export const SchedulePage = React.memo(
    ({ scheduleData, currentView, offset, onSelectLesson, onLongPressLesson, hiddenSubjects }) => {
        const screenWidth = Dimensions.get("window").width;
        const { theme } = useTheme();
        const { selectedGroup, loadSchedule } = useSchedlyStore();
        const [refreshing, setRefreshing] = useState(false);

        const onRefresh = useCallback(async () => {
            if (!selectedGroup?.id) return;
            setRefreshing(true);
            await loadSchedule(selectedGroup.id);
            setRefreshing(false);
        }, [selectedGroup, loadSchedule]);

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
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    theme={theme}
                />
            </View>
        );
    },
);
