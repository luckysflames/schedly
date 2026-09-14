export const getLessonTypeFullName = (typeInput) => {
    if (!typeInput) return "Занятие";
    const lower = String(typeInput).toLowerCase().trim();
    if (lower.includes("лек")) return "Лекция";
    if (lower.includes("пр")) return "Практическое занятие";
    if (lower.includes("лаб")) return "Лабораторная работа"; // скорее всего надо будет добавить экзамен, зачёт и тд
    return typeInput;
};

export const cleanTeacherName = (teacherInput) => {
    if (!teacherInput) return "Преподаватель не указан";
    return teacherInput
        .replace(/^(дек\.|зав\.\s*к\.|доц\.|проф\.|ст\.\s*пр\.|преп\.|асс\.|инж\.)\s*/gi, "")
        .trim();
};

export const isLessonPast = (lessonTime, lessonDateObj) => {
    if (!lessonTime || !lessonDateObj) return false;

    const parts = lessonTime.split("-");
    if (parts.length < 2) return false;

    const [endH, endM] = parts[1].trim().split(":").map(Number);
    if (isNaN(endH)) return false;

    // Создаем объект Date для конца конкретного занятия
    const lessonEnd = new Date(lessonDateObj);
    lessonEnd.setHours(endH, endM || 0, 0, 0);

    const now = new Date();
    return now > lessonEnd;
};

export const getConcurrentLessonLayout = (lessons, lessonIndex) => {
    const lesson = lessons[lessonIndex];
    const sameTimeLessons = lessons.filter((item) => item.time === lesson?.time);

    if (!lesson?.time || sameTimeLessons.length < 2) return {};

    const slotIndex = sameTimeLessons.findIndex((item) => item === lesson);
    const slotWidth = 100 / sameTimeLessons.length;

    return {
        left: `${slotIndex * slotWidth}%`,
        right: `${(sameTimeLessons.length - slotIndex - 1) * slotWidth}%`,
        marginHorizontal: 1,
    };
};
