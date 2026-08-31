import React, { useMemo, useRef, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
    Animated,
    Dimensions,
} from "react-native";
import { Check, X, LayoutGrid, Clock, Calendar, Scroll } from "lucide-react-native";
import { useTheme } from "../../../../hooks/useTheme";
import { normalizeScheduleData } from "../../../../utils/normalizeScheduleData";
import { useSchedlyStore } from "../../../../store/useSchedlyStore";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const DRAWER_WIDTH = SCREEN_WIDTH * 0.75;

export const SubjectsFilterModal = ({
    visible,
    scheduleData,
    hiddenSubjects,
    onToggleSubject,
    onClose,
    currentView,
    onChangeView,
}) => {
    const { theme, createStyles } = useTheme();
    const styles = createStyles(createLocalStyles);

    const setIsViewChanging = useSchedlyStore((state) => state.setIsViewChanging);

    const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    const handleClose = () => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: -DRAWER_WIDTH,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onClose();
        });
    };

    const handleViewChange = (newView) => {
        onClose();
        setIsViewChanging(true);
        requestAnimationFrame(() => {
            onChangeView(newView);
            setTimeout(() => {
                setIsViewChanging(false);
            }, 150);
        });
    };

    const allSubjects = useMemo(() => {
        if (!scheduleData) return [];

        // scheduleData уже может быть нормализованным массивом дней
        // или исходными данными (в зависимости от того, как они хранятся в сторе),
        // поэтому используем normalizeScheduleData для надежности:
        const normalized = normalizeScheduleData(scheduleData);
        const subjectsMap = new Map();

        normalized.forEach((day) => {
            day.lessons.forEach((lesson) => {
                if (lesson.subject && lesson.color && !subjectsMap.has(lesson.subject)) {
                    // Забираем уже готовый цвет прямо из объекта урока
                    subjectsMap.set(lesson.subject, lesson.color);
                }
            });
        });

        return Array.from(subjectsMap.entries())
            .map(([name, color]) => ({ name, color }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [scheduleData]);

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            animationType="none"
            transparent={true}
            onRequestClose={handleClose}
        >
            <View style={styles.modalOverlay}>
                <Animated.View style={[styles.backdropContainer, { opacity: fadeAnim }]}>
                    <TouchableOpacity
                        style={styles.backdropTouch}
                        activeOpacity={1}
                        onPress={handleClose}
                    />
                </Animated.View>

                <Animated.View
                    style={[styles.modalContent, { transform: [{ translateX: slideAnim }] }]}
                >
                    <View style={styles.appHeader}>
                        <View
                            style={[styles.logoContainer, { backgroundColor: theme.accent + "22" }]}
                        >
                            <Scroll size={22} color={theme.accent} />
                        </View>
                        <Text style={styles.appName}>Schedly</Text>
                    </View>

                    <View style={styles.viewSelectorContainer}>
                        <TouchableOpacity
                            style={[
                                styles.viewItemRow,
                                currentView === "day" && styles.activeViewItemRow,
                            ]}
                            onPress={() => handleViewChange("day")}
                            activeOpacity={0.7}
                        >
                            <Clock
                                size={20}
                                color={currentView === "day" ? theme.accent : theme.text}
                            />
                            <Text
                                style={[
                                    styles.viewItemText,
                                    currentView === "day" && styles.activeViewItemText,
                                ]}
                            >
                                День
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.viewItemRow,
                                currentView === "week" && styles.activeViewItemRow,
                            ]}
                            onPress={() => handleViewChange("week")}
                            activeOpacity={0.7}
                        >
                            <LayoutGrid
                                size={20}
                                color={currentView === "week" ? theme.accent : theme.text}
                            />
                            <Text
                                style={[
                                    styles.viewItemText,
                                    currentView === "week" && styles.activeViewItemText,
                                ]}
                            >
                                Неделя
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.viewItemRow,
                                currentView === "month" && styles.activeViewItemRow,
                            ]}
                            onPress={() => handleViewChange("month")}
                            activeOpacity={0.7}
                        >
                            <Calendar
                                size={20}
                                color={currentView === "month" ? theme.accent : theme.text}
                            />
                            <Text
                                style={[
                                    styles.viewItemText,
                                    currentView === "month" && styles.activeViewItemText,
                                ]}
                            >
                                Месяц
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.filterSection}>
                        <ScrollView
                            style={styles.listContainer}
                            showsVerticalScrollIndicator={false}
                        >
                            {allSubjects.length === 0 ? (
                                <Text style={styles.emptyText}>Нет доступных предметов</Text>
                            ) : (
                                allSubjects.map(({ name: subject, color }) => {
                                    const isHidden = hiddenSubjects.includes(subject);
                                    return (
                                        <TouchableOpacity
                                            key={subject}
                                            style={styles.itemRow}
                                            onPress={() => onToggleSubject(subject)}
                                            activeOpacity={0.7}
                                        >
                                            <View
                                                style={[
                                                    styles.checkbox,
                                                    { borderColor: color }, // Цвет рамки из объекта предмета
                                                    !isHidden && { backgroundColor: color }, // Заливка цветом предмета, если активен
                                                ]}
                                            >
                                                {!isHidden && (
                                                    <Check size={14} color={theme.text} />
                                                )}
                                            </View>
                                            <Text
                                                style={[
                                                    styles.subjectText,
                                                    isHidden && styles.strikethrough,
                                                ]}
                                            >
                                                {subject}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })
                            )}
                        </ScrollView>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const createLocalStyles = (theme) =>
    StyleSheet.create({
        modalOverlay: {
            flex: 1,
            backgroundColor: "transparent",
            flexDirection: "row",
        },
        backdropContainer: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: theme.overlay || "rgba(0,0,0,0.6)",
        },
        backdropTouch: {
            flex: 1,
        },
        modalContent: {
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: DRAWER_WIDTH,
            backgroundColor: theme.dark,
            paddingTop: 50,
            paddingHorizontal: 20,
            paddingBottom: 20,
            justifyContent: "flex-start",
            elevation: 10,
        },
        appHeader: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 24,
        },
        logoContainer: {
            width: 38,
            height: 38,
            borderRadius: 10,
            justifyContent: "center",
            alignItems: "center",
            marginRight: 10,
        },
        appName: {
            fontSize: 20,
            fontWeight: "bold",
            color: theme.accent || "#007AFF",
        },
        viewSelectorContainer: {
            marginBottom: 20,
            paddingBottom: 10,
            borderBottomWidth: 1,
            borderBottomColor: theme.accentMuted + "22",
        },
        viewItemRow: {
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 12,
            paddingHorizontal: 10,
            borderRadius: 8,
            gap: 14,
        },
        activeViewItemRow: {
            backgroundColor: theme.accent + "15",
        },
        viewItemText: {
            fontSize: 16,
            color: theme.text || "#FFFFFF",
            fontWeight: "500",
        },
        activeViewItemText: {
            color: theme.accent,
            fontWeight: "600",
        },
        filterSection: {
            flex: 1,
        },
        listContainer: {
            flex: 1,
        },
        emptyText: { color: theme.accentMuted, textAlign: "center", marginVertical: 20 },
        itemRow: {
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 12,
            paddingHorizontal: 10,
        },
        checkbox: {
            width: 20,
            height: 20,
            borderRadius: 5,
            borderWidth: 2,
            borderColor: theme.accent,
            justifyContent: "center",
            alignItems: "center",
            marginRight: 14,
        },
        subjectText: { fontSize: 16, color: theme.text, flex: 1, fontWeight: "500" },
        strikethrough: { opacity: 0.25, color: theme.text, textDecorationLine: "line-through" },
    });
