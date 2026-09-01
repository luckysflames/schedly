import React from "react";
import { DayViewContent } from "../Views/DayViewContent";
import { WeekViewContent } from "../Views/WeekViewContent";
import { MonthViewContent } from "../Views/MonthViewContent";

export const ScheduleContentDispatcher = (props) => {
    const { currentView, refreshing, onRefresh, theme } = props;

    if (currentView === "day") {
        return <DayViewContent {...props} refreshing={refreshing} onRefresh={onRefresh} theme={theme} />;
    }
    if (currentView === "month") {
        return <MonthViewContent {...props} refreshing={refreshing} onRefresh={onRefresh} theme={theme} />;
    }

    return <WeekViewContent {...props} refreshing={refreshing} onRefresh={onRefresh} theme={theme} />;
};
