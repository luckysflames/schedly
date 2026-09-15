import { normalizeScheduleData } from "./normalizeScheduleData";

const getDateKey = (date) => {
    const value = new Date(date);
    if (isNaN(value.getTime())) return String(date || "").split("T")[0];
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(
        value.getDate(),
    ).padStart(2, "0")}`;
};

export const compareScheduleData = (
    firstSchedule,
    secondSchedule,
    { firstColor, secondColor },
) => {
    const firstDays = normalizeScheduleData(firstSchedule);
    const secondDays = normalizeScheduleData(secondSchedule);
    const days = new Map();

    const addLessons = (sourceDays, groupKey, color) => {
        sourceDays.forEach((day) => {
            const dateKey = getDateKey(day.date);
            if (!days.has(dateKey)) {
                days.set(dateKey, { date: day.date, lessons: [] });
            }

            const targetDay = days.get(dateKey);
            day.lessons.forEach((lesson) => {
                targetDay.lessons.push({
                    ...lesson,
                    color,
                    comparisonGroup: groupKey,
                });
            });
        });
    };

    addLessons(firstDays, "first", firstColor);
    addLessons(secondDays, "second", secondColor);

    return [...days.values()].map((day) => ({
        date: day.date,
        lessons: day.lessons,
    }));
};