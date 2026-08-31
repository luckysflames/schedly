import React from "react";
import { DayViewContent } from "./DayViewContent";
import { WeekViewContent } from "./WeekViewContent";
import { MonthViewContent } from "./MonthViewContent";

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
