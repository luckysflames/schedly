export const getSubjectFilterKey = (lesson, comparisonMode = false) => {
    const subjectName = lesson.subject || lesson.name;
    if (!comparisonMode) return subjectName;

    return `${lesson.comparisonGroup || "first"}:${subjectName}`;
};