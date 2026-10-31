import { normalizeScheduleData } from "./normalizeScheduleData";
import { cleanTeacherName, getLessonTypeFullName } from "./lessonFormatters";

const comparableFields = [
    ["date", "дата"],
    ["number", "номер пары"],
    ["subject", "предмет"],
    ["time", "время"],
    ["auditory", "аудитория"],
    ["type", "тип занятия"],
    ["teacher", "преподаватель"],
];

const normalizeText = (value) => String(value ?? "").replace(/\s+/g, " ").trim();

const getDateKey = (date) => {
    const value = String(date || "");
    const isoDate = value.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
    if (isoDate) return isoDate;

    const parsedDate = new Date(value);
    return Number.isNaN(parsedDate.getTime()) ? value : parsedDate.toISOString().slice(0, 10);
};

export const getScheduleLessonKey = (lesson, date) =>
    JSON.stringify({
        date: getDateKey(date),
        subject: normalizeText(lesson.subject ?? lesson.name),
        number: normalizeText(lesson.number),
        time: normalizeText(lesson.time).replace(/\s*-\s*/g, " - "),
        auditory: normalizeText(lesson.auditory).replace(/,\s*/g, ", "),
        type: getLessonTypeFullName(lesson.type) || normalizeText(lesson.type),
        teacher: cleanTeacherName(lesson.teacher) || "",
    });

const getLessons = (schedule) => {
    return normalizeScheduleData(schedule).flatMap((day) =>
        day.lessons.map((lesson) => ({
            ...lesson,
            scheduleLessonKey: getScheduleLessonKey(lesson, day.date),
            comparable: {
                date: getDateKey(day.date),
                subject: normalizeText(lesson.subject ?? lesson.name),
                number: normalizeText(lesson.number),
                time: normalizeText(lesson.time).replace(/\s*-\s*/g, " - "),
                auditory: normalizeText(lesson.auditory).replace(/,\s*/g, ", "),
                type:
                    getLessonTypeFullName(lesson.type) || normalizeText(lesson.type),
                teacher: cleanTeacherName(lesson.teacher) || "",
            },
        })),
    );
};

const getIdKey = (lesson) => {
    if (lesson.id === undefined || lesson.id === null || String(lesson.id).trim() === "") {
        return null;
    }
    return String(lesson.id);
};

const getIdCounts = (lessons) => {
    const counts = new Map();
    lessons.forEach((lesson) => {
        const id = getIdKey(lesson);
        if (id !== null) counts.set(id, (counts.get(id) || 0) + 1);
    });
    return counts;
};

export const compareScheduleUpdatesById = (previousSchedule, nextSchedule) => {
    const previousLessons = getLessons(previousSchedule);
    const nextLessons = getLessons(nextSchedule);
    const previousCounts = getIdCounts(previousLessons);
    const nextCounts = getIdCounts(nextLessons);
    const nextById = new Map(
        nextLessons
            .filter((lesson) => getIdKey(lesson) !== null)
            .map((lesson) => [getIdKey(lesson), lesson]),
    );
    const matchedNextIds = new Set();
    const matchedPreviousIndexes = new Set();
    const changes = [];

    previousLessons.forEach((previousLesson, index) => {
        const id = getIdKey(previousLesson);
        const canMatch =
            id !== null && previousCounts.get(id) === 1 && nextCounts.get(id) === 1;
        const nextLesson = canMatch ? nextById.get(id) : null;

        if (!nextLesson) {
            return;
        }

        matchedPreviousIndexes.add(index);
        matchedNextIds.add(id);
        const fields = comparableFields.flatMap(([field, label]) => {
            const previousValue = previousLesson.comparable[field];
            const nextValue = nextLesson.comparable[field];
            if (previousValue === nextValue) return [];
            return [
                {
                    field,
                    label,
                    previousValue,
                    nextValue,
                },
            ];
        });

        if (fields.length) {
            changes.push({
                type: "changed",
                id,
                previousLesson,
                nextLesson,
                fields,
            });
        }
    });

    const unmatchedPrevious = previousLessons.filter(
        (_, index) => !matchedPreviousIndexes.has(index),
    );
    const unmatchedNext = nextLessons.filter((lesson) => {
        const id = getIdKey(lesson);
        return id === null || !matchedNextIds.has(id);
    });

    const getComparableKey = (lesson) => JSON.stringify(lesson.comparable);
    const previousByComparable = new Map();
    unmatchedPrevious.forEach((lesson) => {
        const key = getComparableKey(lesson);
        const matchingLessons = previousByComparable.get(key) || [];
        matchingLessons.push(lesson);
        previousByComparable.set(key, matchingLessons);
    });

    const unmatchedAfterExactMatches = [];
    unmatchedNext.forEach((lesson) => {
        const key = getComparableKey(lesson);
        const matchingLessons = previousByComparable.get(key);
        if (matchingLessons?.length) {
            matchingLessons.pop();
        } else {
            unmatchedAfterExactMatches.push(lesson);
        }
    });
    const removedAfterExactMatches = [...previousByComparable.values()].flat();

    if (removedAfterExactMatches.length && unmatchedAfterExactMatches.length) {
        changes.push({ type: "uncertain" });
        return changes;
    }

    removedAfterExactMatches.forEach((lesson) => {
        changes.push({ type: "removed", lesson });
    });
    unmatchedAfterExactMatches.forEach((lesson) => {
        changes.push({ type: "added", lesson });
    });

    return changes;
};
