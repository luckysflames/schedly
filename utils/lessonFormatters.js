export const getLessonTypeFullName = (typeInput) => {
    if (!typeInput) return null;
    const lower = String(typeInput).toLowerCase().trim();

    // Основные занятия
    if (lower.includes("лек")) return "Лекция";
    if (lower.includes("пр")) return "Практическое занятие";
    if (lower.includes("лаб")) return "Лабораторная работа";

    // Контроль знаний и сессия
    if (lower.includes("экз")) return "Экзамен";

    // Зачёты
    if (
        lower.includes("диф") ||
        (lower.includes("зач") && (lower.includes("оценк") || lower.includes("обязательн")))
    ) {
        return "Зачёт с оценкой";
    }
    if (lower.includes("зач")) return "Зачёт";

    if (lower.includes("конс")) return "Консультация";
    if (lower.includes("коллок")) return "Коллоквиум";
    if (lower.includes("модуль")) return "Модульный контроль";

    // Семинары и работы
    if (lower.includes("сем")) return "Семинар";
    if (lower.includes("курс")) return "Курсовая работа";

    // Практики
    if (lower.includes("практ") && !lower.includes("практич")) return "Производственная практика";

    // Разное
    if (lower.includes("самост")) return "Самостоятельная работа";

    return null;
};

const cleanSingleTeacher = (str) => {
    let cleaned = str
        .replace(
            /(?:дек\.|зав\.\s*к\.|доц\.|проф\.|пр\.|ст\.\s*пр\.|преп\.|асс\.|инж\.|рф|старший\s+преподаватель|профессор|доцент|ассистент)\.?\s*/gi,
            "",
        )
        .replace(/\s+/g, " ")
        .trim();

    // Если это системная заглушка-вакансия — считаем, что преподавателя нет
    if (/вакансия/i.test(cleaned)) {
        return "";
    }

    // 1. Ставим пробел между фамилией и инициалами (если слитно: "НейдоА." -> "Нейдо А.")
    cleaned = cleaned.replace(/([а-яё])([А-ЯЁ]\.)/g, "$1 $2");

    // 2. Ставим пробел между инициалами (если слитно: "А.Р." -> "А. Р.")
    cleaned = cleaned.replace(/([А-ЯЁ]\.)([А-ЯЁ]\.)/g, "$1 $2");

    return cleaned;
};

export const cleanTeacherName = (teacherInput) => {
    if (!teacherInput) return null;

    const parts = String(teacherInput).split(/[,;]|\s+и\s+/gi);

    const cleanedParts = parts.map((part) => cleanSingleTeacher(part)).filter(Boolean);

    if (cleanedParts.length === 0) return null;

    return cleanedParts.join(", ");
};

export const getTeacherShortName = (teacherInput) => {
    const cleanedName = cleanTeacherName(teacherInput);
    if (!cleanedName) return null;

    return cleanedName
        .split(",")
        .map((teacher) => {
            const [surname, ...nameParts] = teacher.trim().split(/\s+/);
            if (!nameParts.length) return surname;

            const initials = nameParts
                .map((part) => {
                    if (/^[А-ЯЁ]\.?$/i.test(part)) return `${part.replace(/\.$/, "")}.`;
                    return `${part.charAt(0).toLocaleUpperCase("ru-RU").replace(/\.$/, "")}.`;
                })
                .join(" ");

            return `${surname} ${initials}`;
        })
        .join(", ");
};

export const isLessonPast = (lessonTime, lessonDateObj) => {
    if (!lessonTime || !lessonDateObj) return false;

    const parts = lessonTime.split("-");
    if (parts.length < 2) return false;

    const [endH, endM] = parts[1].trim().split(":").map(Number);
    if (isNaN(endH)) return false;

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
