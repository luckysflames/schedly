import React from "react";
import { DayViewContent } from "../Views/DayViewContent";
import { WeekViewContent } from "../Views/WeekViewContent";
import { MonthViewContent } from "../Views/MonthViewContent";

export const ScheduleContentDispatcher = (props) => {
    const { currentView, refreshing, onRefresh } = props;

    if (currentView === "day") {
        return <DayViewContent {...props} refreshing={refreshing} onRefresh={onRefresh} />;
    }
    if (currentView === "month") {
        return <MonthViewContent {...props} refreshing={refreshing} onRefresh={onRefresh} />;
    }

    return <WeekViewContent {...props} refreshing={refreshing} onRefresh={onRefresh} />;
};
