import React from "react";
import { View, Dimensions } from "react-native";
import { WeekContent } from "./WeekContent";
import { useScheduleGrid } from "../../../hooks/useScheduleGrid";

export const SchedulePage = React.memo(
    ({ scheduleData, offset, onSelectLesson, hiddenSubjects }) => {
        const screenWidth = Dimensions.get("window").width;

        const { HOURS, daysList, weekNumber, getLessonPosition } = useScheduleGrid(
            scheduleData,
            offset,
            hiddenSubjects,
        );

        return (
            <View style={{ width: screenWidth, flex: 1 }}>
                <WeekContent
                    daysList={daysList}
                    hours={HOURS}
                    weekNumber={weekNumber}
                    getLessonPosition={getLessonPosition}
                    onSelectLesson={onSelectLesson}
                    hiddenSubjects={hiddenSubjects}
                />
            </View>
        );
    },
);
