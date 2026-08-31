export const normalizeScheduleData = (apiData) => {
    const raspList = Array.isArray(apiData) ? apiData : apiData?.rasp || [];

    if (raspList.length === 0) return [];

    // Расширенная палитра уникальных цветов
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

    // Шаг 1: Назначаем уникальный цвет каждому предмету по порядку
    let paletteCounter = 0;
    raspList.forEach((item) => {
        const rawSubject = item.дисциплина || "";
        const cleanSubject = rawSubject.replace(/^(лек|пр|лаб)\s*/i, "").trim();

        if (cleanSubject && !subjectColors[cleanSubject]) {
            // Берем цвет по индексу счетчика. Если предметов больше, чем цветов,
            // идем по кругу с помощью остатка от деления (%)
            const colorIndex = paletteCounter % predefinedPalette.length;
            subjectColors[cleanSubject] = predefinedPalette[colorIndex];
            paletteCounter++;
        }
    });

    // Шаг 2: Группируем элементы по дате и проставляем цвета
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

        groupedMap[dateKey].lessons.push({
            id: item.код,
            time: `${item.начало || ""} - ${item.конец || ""}`.trim(),
            number: item.номерЗанятия,
            type: (item.дисциплина || "").split(" ")[0],
            subject: cleanSubject,
            teacher: item.преподаватель,
            auditory: item.аудитория,
            color: subjectColors[cleanSubject] || predefinedPalette[0],
        });
    });

    return Object.values(groupedMap);
};
