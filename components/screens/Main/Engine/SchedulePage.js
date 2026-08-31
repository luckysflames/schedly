import React from "react";
import { View, Dimensions } from "react-native";
import { useScheduleGrid } from "../../../../hooks/useScheduleGrid";
import { ScheduleContentDispatcher } from "./ScheduleContentDispatcher";

export const SchedulePage = React.memo(
    ({ scheduleData, currentView, offset, onSelectLesson, hiddenSubjects }) => {
        const screenWidth = Dimensions.get("window").width;

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
                    hiddenSubjects={hiddenSubjects}
                    currentView={currentView}
                />
            </View>
        );
    },
);
