import { cleanTeacherName, getLessonTypeFullName } from "./lessonFormatters";

export const normalizeScheduleData = (apiData, customSubjectColors = {}) => {
    const normalizedDays = Array.isArray(apiData)
        ? apiData.every((item) => item?.date && Array.isArray(item.lessons))
            ? apiData
            : null
        : null;

    if (normalizedDays) {
        return normalizedDays.map((day) => ({
            ...day,
            lessons: day.lessons.map((lesson) => ({
                ...lesson,
                color: customSubjectColors[lesson.subject] || lesson.color,
            })),
        }));
    }

    // Вспомогательная функция для первой заглавной буквы и форматирования аудиторий
    const capitalizeAuditory = (value) => {
        if (!value) return "";
        let str = String(value).trim();
        if (str.length === 0) return "";

        // Ставим пробел после запятой, если его нет (например, "25-511,25-511а" -> "25-511, 25-511а")
        str = str.replace(/,\s*/g, ", ");

        // Делаем первую букву строки заглавной
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    const raspList = Array.isArray(apiData) ? apiData : apiData?.rasp || [];

    if (raspList.length === 0) return [];

    const predefinedPalette = [
        "#670099",
        "#66cc9a",
        "#669934",
        "#42cabc",
        "#990000",
        "#653366",
        "#ffcc00",
        "#336699",
        "#ff6666",
        "#339966",
        "#cc66cc",
        "#ff9900",
        "#00cccc",
        "#993333",
        "#6666ff",
    ];

    const subjectColors = {};
    let paletteCounter = 0;

    raspList.forEach((item) => {
        const rawSubject = item.дисциплина || "";
        const cleanSubject = rawSubject.replace(/^(лек|пр|лаб)\s*/i, "").trim();

        if (cleanSubject && !subjectColors[cleanSubject]) {
            // Если пользователь задал цвет вручную — приоритет ему
            if (customSubjectColors[cleanSubject]) {
                subjectColors[cleanSubject] = customSubjectColors[cleanSubject];
            } else {
                const colorIndex = paletteCounter % predefinedPalette.length;
                subjectColors[cleanSubject] = predefinedPalette[colorIndex];
                paletteCounter++;
            }
        }
    });

    const groupedMap = {};

    raspList.forEach((item) => {
        const rawDate = item.дата || item.датаНачала;
        if (!rawDate) return;

        const dateKey = rawDate.split("T")[0];

        if (!groupedMap[dateKey]) {
            groupedMap[dateKey] = {
                date: rawDate,
                lessons: [],
            };
        }

        const cleanSubject = (item.дисциплина || "").replace(/^(лек|пр|лаб)\s*/i, "").trim();
        // Финальный выбор цвета для урока
        const finalColor =
            customSubjectColors[cleanSubject] ||
            subjectColors[cleanSubject] ||
            predefinedPalette[0];

        groupedMap[dateKey].lessons.push({
            id: item.код,
            time: `${item.начало || ""} - ${item.конец || ""}`.trim(),
            number: item.номерЗанятия,
            type: (item.дисциплина || "").split(" ")[0],
            subject: cleanSubject,
            teacher: item.преподаватель,
            group: item.группа,
            auditory: capitalizeAuditory(item.аудитория),
            color: finalColor,
        });
    });

    return Object.values(groupedMap);
};

const getDateKey = (date) => {
    const value = String(date || "");
    const isoDate = value.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
    if (isoDate) return isoDate;

    const parsedDate = new Date(value);
    return Number.isNaN(parsedDate.getTime()) ? value : parsedDate.toISOString().slice(0, 10);
};

export const getComparableScheduleData = (scheduleData) =>
    normalizeScheduleData(scheduleData)
        .flatMap((day) =>
            day.lessons.map((lesson) => ({
                date: getDateKey(day.date),
                subject: normalizeComparableText(lesson.subject ?? lesson.name),
                number: normalizeComparableText(lesson.number),
                time: normalizeComparableText(lesson.time).replace(/\s*-\s*/g, " - "),
                auditory: normalizeComparableText(lesson.auditory).replace(/,\s*/g, ", "),
                type:
                    getLessonTypeFullName(lesson.type) || normalizeComparableText(lesson.type),
                teacher: cleanTeacherName(lesson.teacher) || "",
            })),
        )
        .map((lesson) => ({ lesson, sortKey: JSON.stringify(lesson) }))
        .sort((first, second) => first.sortKey.localeCompare(second.sortKey))
        .map(({ lesson }) => lesson);

const normalizeComparableText = (value) => String(value ?? "").replace(/\s+/g, " ").trim();

export const areSchedulesEqual = (firstSchedule, secondSchedule) =>
    JSON.stringify(getComparableScheduleData(firstSchedule)) ===
    JSON.stringify(getComparableScheduleData(secondSchedule));
