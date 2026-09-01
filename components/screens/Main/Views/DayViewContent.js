import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, Dimensions, TouchableOpacity, RefreshControl } from "react-native";
import { LessonCard } from "../LessonCard";
import { useTheme } from "../../../../hooks/useTheme";
import { isLessonPast } from "../../../../utils/lessonFormatters";

export const DayViewContent = ({
    daysList,
    hours,
    getLessonPosition,
    onSelectLesson,
    hiddenSubjects,
    refreshing,
    onRefresh,
    theme: themeFromProps,
}) => {
    const { theme, createStyles } = useTheme();
    const styles = createStyles(createLocalStyles);
    const screenWidth = Dimensions.get("window").width;
    const displayTheme = themeFromProps || theme;
    const HOUR_HEIGHT = 70;

    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 300000);
        return () => clearInterval(timer);
    }, []);

    // Надежное приведение любой даты к строке YYYY-MM-DD в локальном часовом поясе
    const formatDateToLocalString = (dateInput) => {
        if (!dateInput) return "";
        const d = new Date(dateInput);
        if (isNaN(d.getTime())) return String(dateInput).split("T")[0];

        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    // Синхронизируем выбранную дату: если в daysList есть сегодняшний день, выбираем его по умолчанию
    const [selectedDate, setSelectedDate] = useState(() => {
        const todayStr = formatDateToLocalString(new Date());
        const found = daysList.find(
            (d) => formatDateToLocalString(d.date || d.dateObj) === todayStr,
        );
        return found ? found.date || found.dateObj : daysList[0]?.date || daysList[0]?.dateObj;
    });

    // Автоматически переключаемся на первый день нового листа при смене недели/месяца, если текущая дата ушла за рамки
    useEffect(() => {
        if (!daysList || daysList.length === 0) return;
        const exists = daysList.some(
            (d) =>
                formatDateToLocalString(d.date || d.dateObj) ===
                formatDateToLocalString(selectedDate),
        );
        if (!exists) {
            setSelectedDate(daysList[0].date || daysList[0].dateObj);
        }
    }, [daysList]);

    // Ищем текущий день по безопасному сравнению строк
    const currentDayItem =
        daysList.find(
            (d) =>
                formatDateToLocalString(d.date || d.dateObj) ===
                formatDateToLocalString(selectedDate),
        ) ||
        daysList[0] ||
        {};

    const lessons = currentDayItem.lessons || [];

    // Расчет вертикальной позиции линии текущего времени без лишнего смещения +1
    const getCurrentTimeTop = () => {
        const hoursNum = currentTime.getHours();
        const minutes = currentTime.getMinutes();
        const firstHourStr = hours[0] ? parseInt(hours[0], 10) : 8;

        const totalHours = hoursNum - firstHourStr + minutes / 60;
        return totalHours * HOUR_HEIGHT;
    };

    const isTodaySelected = () => {
        const todayLocalStr = formatDateToLocalString(new Date());
        const selectedNormalized = formatDateToLocalString(selectedDate);
        return selectedNormalized === todayLocalStr;
    };

    return (
        <View style={styles.container}>
            <View style={[styles.weekHeader, { backgroundColor: displayTheme.dark }]}>
                <View style={styles.weekDaysRow}>
                    {daysList.map((day, index) => {
                        const dayDateObj = day.dateObj ? new Date(day.dateObj) : new Date(day.date);
                        const dayName = !isNaN(dayDateObj.getTime())
                            ? dayDateObj
                                  .toLocaleDateString("ru-RU", { weekday: "long" })
                                  .toUpperCase()
                            : day.day || "";
                        const dayNum = !isNaN(dayDateObj.getTime())
                            ? dayDateObj.getDate()
                            : day.dayNumber || "";

                        // Функция для проверки, является ли конкретный элемент дня сегодняшней датой
                        const isDayToday = (day) => {
                            const todayStr = formatDateToLocalString(new Date());
                            const dayStr = formatDateToLocalString(day.date || day.dateObj);
                            return dayStr === todayStr;
                        };

                        const isSelected =
                            formatDateToLocalString(day.date || day.dateObj) ===
                            formatDateToLocalString(selectedDate);
                        const isToday = isDayToday(day);

                        return (
                            <TouchableOpacity
                                key={index}
                                style={styles.dayHeaderItem}
                                onPress={() => setSelectedDate(day.date || day.dateObj)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.weekDayName}>{dayName}</Text>
                                <View
                                    style={[
                                        styles.dateCircle,
                                        isToday && { backgroundColor: theme.accent },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.dateNumberText,
                                            isToday && styles.selectedDateNumberText,
                                        ]}
                                    >
                                        {dayNum}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            <ScrollView style={styles.verticalScroll} showsVerticalScrollIndicator={false} refreshControl={
                    onRefresh && (
                        <RefreshControl
                            refreshing={refreshing || false}
                            onRefresh={onRefresh}
                            progressBackgroundColor={displayTheme.main}
                            colors={[displayTheme.accentMuted, displayTheme.accent]}
                        />
                    )
                }>
                <View style={[styles.tableBody, { backgroundColor: displayTheme.dark }]}>
                    {isTodaySelected() && (
                        <View style={[styles.currentTimeIndicator, { top: getCurrentTimeTop() }]}>
                            <View style={styles.currentTimeDot} />
                            <View style={styles.currentTimeLine} />
                        </View>
                    )}

                    <View style={styles.timeColumn}>
                        {hours.map((hour, index) => (
                            <View key={index} style={[styles.timeRow, { height: HOUR_HEIGHT }]}>
                                <Text style={styles.timeTextCell}>{hour}</Text>
                            </View>
                        ))}
                    </View>
                    <View
                        style={[
                            styles.dayColumnBody,
                            { width: screenWidth - 45, height: hours.length * HOUR_HEIGHT },
                        ]}
                    >
                        {hours.map((_, index) => (
                            <View key={index} style={styles.gridLine} />
                        ))}
                        {lessons.map((lesson, lessonIndex) => {
                            if (hiddenSubjects?.includes(lesson.title || lesson.name)) return null;
                            const pos = getLessonPosition(lesson.time);
                            const cardBg = lesson.color || theme.accentMuted;
                            const past = isLessonPast(lesson.time, currentDayItem.dateObj);

                            return (
                                <LessonCard
                                    key={lessonIndex}
                                    lesson={lesson}
                                    position={pos}
                                    backgroundColor={cardBg}
                                    isDayView={true}
                                    isPast={past}
                                    onPress={() => onSelectLesson(lesson)}
                                />
                            );
                        })}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const createLocalStyles = (theme) =>
    StyleSheet.create({
        container: { flex: 1 },
        weekHeader: { paddingVertical: 10 },
        weekDaysRow: {
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
            paddingHorizontal: 4,
        },
        dayHeaderItem: { alignItems: "center", flex: 1 },
        weekDayName: { color: theme.accent, fontSize: 12, fontWeight: "600", marginBottom: 6 },
        dateCircle: {
            width: 32,
            height: 32,
            borderRadius: 16,
            justifyContent: "center",
            alignItems: "center",
        },
        selectedDateNumberText: { color: theme.text, fontWeight: "bold" },
        dateNumberText: { color: theme.text || "#FFFFFF", fontSize: 14, fontWeight: "500" },
        verticalScroll: { flex: 1 },
        tableBody: { flexDirection: "row", backgroundColor: theme.dark, position: "relative" },
        timeColumn: { width: 45, borderRightWidth: 1, borderRightColor: theme.textDark },
        timeRow: { justifyContent: "flex-start", alignItems: "center" },
        timeTextCell: { color: theme.text, fontSize: 11 },
        dayColumnBody: {
            position: "relative",
            borderRightWidth: 1,
            borderRightColor: theme.textDark,
        },
        gridLine: { height: 70, borderBottomWidth: 1, borderBottomColor: theme.textDark },
        currentTimeIndicator: {
            position: "absolute",
            left: 0,
            right: 0,
            flexDirection: "row",
            alignItems: "center",
            zIndex: 20,
        },
        currentTimeDot: {
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: theme.accent,
            marginLeft: 41,
        },
        currentTimeLine: { flex: 1, height: 2, backgroundColor: theme.accentMuted },
    });
