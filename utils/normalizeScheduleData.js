export const normalizeScheduleData = (apiData) => {
    const raspList = Array.isArray(apiData) ? apiData : apiData?.rasp || [];

    if (raspList.length === 0) return [];

    // Группируем элементы по точной дате (берем только YYYY-MM-DD часть)
    const groupedMap = {};

    raspList.forEach((item) => {
        const rawDate = item.дата || item.датаНачала;
        if (!rawDate) return;

        const dateKey = rawDate.split("T")[0]; // "2026-09-01"

        if (!groupedMap[dateKey]) {
            groupedMap[dateKey] = {
                date: rawDate,
                lessons: [],
            };
        }

        groupedMap[dateKey].lessons.push({
            id: item.код,
            time: `${item.начало || ""} - ${item.конец || ""}`.trim(),
            number: `${item.номерЗанятия || ""} пара`,
            type: (item.дисциплина || "").split(" ")[0],
            subject: (item.дисциплина || "").replace(/^(лек|пр|лаб)\s*/i, ""),
            teacher: item.преподаватель,
            auditory: item.аудитория,
            color: item.цвет,
        });
    });

    return Object.values(groupedMap);
};
