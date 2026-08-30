import { useMemo } from "react";
import { normalizeScheduleData } from "../utils/normalizeScheduleData";

const HOUR_HEIGHT = 70;
const HOURS = [
    "8",
    "9",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "19",
    "20",
    "21",
    "22",
];

export const useScheduleGrid = (scheduleData, weekOffset = 0, hiddenSubjects = []) => {
    const daysList = useMemo(() => {
        const getWeekDaysWithDates = (offset) => {
            const now = new Date();
            const currentDayOfWeek = now.getDay();
            const distanceToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;

            const monday = new Date(now);
            monday.setDate(monday.getDate() + distanceToMonday + offset * 7);
            monday.setHours(0, 0, 0, 0);

            const template = [
                { day: "ПН", fullName: "Понедельник" },
                { day: "ВТ", fullName: "Вторник" },
                { day: "СР", fullName: "Среда" },
                { day: "ЧТ", fullName: "Четверг" },
                { day: "ПТ", fullName: "Пятница" },
                { day: "СБ", fullName: "Суббота" },
                { day: "ВС", fullName: "Воскресенье" },
            ];

            return template.map((item, index) => {
                const date = new Date(monday);
                date.setDate(monday.getDate() + index);
                return {
                    ...item,
                    date: date.toISOString(),
                    dateObj: date,
                    lessons: [],
                };
            });
        };

        const fullWeekTemplate = getWeekDaysWithDates(weekOffset);
        if (!scheduleData) return fullWeekTemplate;

        const rawList = normalizeScheduleData(scheduleData);

        return fullWeekTemplate.map((templateDay) => {
            const matchedGroup = rawList.find((group) => {
                const lessonDate = new Date(group.date);
                if (isNaN(lessonDate.getTime())) return false;

                return (
                    lessonDate.getDate() === templateDay.dateObj.getDate() &&
                    lessonDate.getMonth() === templateDay.dateObj.getMonth() &&
                    lessonDate.getFullYear() === templateDay.dateObj.getFullYear()
                );
            });

            // Фильтруем занятия, исключая те, чьи предметы находятся в списке скрытых
            const filteredLessons = matchedGroup
                ? matchedGroup.lessons.filter((lesson) => !hiddenSubjects.includes(lesson.subject))
                : [];

            return {
                ...templateDay,
                lessons: filteredLessons,
            };
        });
    }, [scheduleData, weekOffset, hiddenSubjects]);

    const monthTitle = useMemo(() => {
        if (!daysList || daysList.length === 0) return "";

        const firstDayDate = new Date(daysList[0].date || daysList[0].dateObj);
        const lastDayDate = new Date(
            daysList[daysList.length - 1].date || daysList[daysList.length - 1].dateObj,
        );

        if (isNaN(firstDayDate.getTime())) return "";

        const formatterMonth = new Intl.DateTimeFormat("ru-RU", {
            month: "long",
            timeZone: "Europe/Moscow",
        });

        const formatterYear = new Intl.DateTimeFormat("ru-RU", {
            year: "numeric",
            timeZone: "Europe/Moscow",
        });

        const yearStr = formatterYear.format(firstDayDate);
        const firstMonthStr = formatterMonth.format(firstDayDate);

        const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

        if (isNaN(lastDayDate.getTime()) || firstDayDate.getMonth() === lastDayDate.getMonth()) {
            return `${capitalize(firstMonthStr)} ${yearStr}`;
        }

        const lastMonthStr = formatterMonth.format(lastDayDate);
        const lastYearStr = formatterYear.format(lastDayDate);

        if (yearStr !== lastYearStr) {
            return `${capitalize(firstMonthStr)} ${yearStr} - ${capitalize(lastMonthStr)} ${lastYearStr}`;
        }

        return `${capitalize(firstMonthStr)} - ${capitalize(lastMonthStr)} ${yearStr}`;
    }, [daysList]);

    const weekNumber = useMemo(() => {
        if (!daysList || daysList.length === 0) return 1;
        const targetDate = new Date(daysList[0].date || daysList[0].dateObj);
        if (isNaN(targetDate.getTime())) return 1;

        const d = new Date(
            Date.UTC(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()),
        );
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    }, [daysList]);

    const getLessonPosition = (timeStr) => {
        if (!timeStr) return { top: 0, height: 60 };
        const parts = timeStr.split("-");
        if (parts.length < 2) return { top: 0, height: 60 };

        const [startH, startM] = parts[0].trim().split(":").map(Number);
        const [endH, endM] = parts[1].trim().split(":").map(Number);

        if (isNaN(startH) || isNaN(endH)) return { top: 0, height: 60 };

        const startHourIndex = startH - 8 + (startM || 0) / 60;
        const durationHours = endH - startH + ((endM || 0) - (startM || 0)) / 60;

        return {
            top: startHourIndex * HOUR_HEIGHT,
            height: Math.max(durationHours * HOUR_HEIGHT, 55),
        };
    };

    return {
        HOURS,
        daysList,
        monthTitle,
        weekNumber,
        getLessonPosition,
    };
};
