import React from "react";
import { DayViewContent } from "../Views/DayViewContent";
import { WeekViewContent } from "../Views/WeekViewContent";
import { MonthViewContent } from "../Views/MonthViewContent";

export const ScheduleContentDispatcher = (props) => {
    const { currentView } = props;

    if (currentView === "day") {
        return <DayViewContent {...props} />;
    }
    if (currentView === "month") {
        return <MonthViewContent {...props} />;
    }

    return <WeekViewContent {...props} />;
};
