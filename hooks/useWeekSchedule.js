import { useState, useEffect } from "react";

export const useWeekSchedule = (hours, HOUR_HEIGHT = 70) => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 300000); // 5 минут

        return () => clearInterval(timer);
    }, []);

    const getCurrentTimeTop = () => {
        const hoursNum = currentTime.getHours();
        const minutes = currentTime.getMinutes();
        const firstHourStr = hours[0] ? parseInt(hours[0].split(":")[0], 10) : 8;

        const totalHours = hoursNum - firstHourStr + 1 + minutes / 60;
        return totalHours * HOUR_HEIGHT;
    };

    const getShortDayName = (dayInput) => {
        if (!dayInput) return "";
        const mapping = {
            понедельник: "ПН",
            вторник: "ВТ",
            среда: "СР",
            четверг: "ЧТ",
            пятница: "ПТ",
            суббота: "СБ",
            воскресенье: "ВС",
        };
        const lower = String(dayInput).toLowerCase().trim();
        return mapping[lower] || String(dayInput).slice(0, 2).toUpperCase();
    };

    const getDayNumber = (dayItem, index) => {
        const dateInput = dayItem.date || dayItem.day || dayItem.title;
        if (
            dateInput &&
            typeof dateInput === "string" &&
            (dateInput.includes("-") || dateInput.includes("T"))
        ) {
            const dateObj = new Date(dateInput);
            if (!isNaN(dateObj)) return dateObj.getDate();
        }
        return dayItem.dayNumber || index + 1;
    };

    const isToday = (dayItem) => {
        const dateInput = dayItem.date || dayItem.day || dayItem.title;
        if (!dateInput || typeof dateInput !== "string") return false;
        const dateObj = new Date(dateInput);
        if (isNaN(dateObj)) return false;
        const today = new Date();
        return (
            dateObj.getDate() === today.getDate() &&
            dateObj.getMonth() === today.getMonth() &&
            dateObj.getFullYear() === today.getFullYear()
        );
    };

    return {
        currentTimeTop: getCurrentTimeTop(),
        getShortDayName,
        getDayNumber,
        isToday,
    };
};
