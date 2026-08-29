import React, { useRef, useEffect } from "react";
import {
    View,
    Text,
    Modal,
    StyleSheet,
    Animated,
    PanResponder,
    Dimensions,
    TouchableWithoutFeedback,
} from "react-native";
import { Clock, MapPin, Info, User, Users } from "lucide-react-native";
import { useTheme } from "../../../../hooks/useTheme";

export const LessonDetailsModal = ({ selectedLesson, selectedGroup, onClose }) => {
    const { theme, createStyles } = useTheme();
    const styles = createStyles(createLocalStyles);

    const screenHeight = Dimensions.get("window").height;

    const translateY = useRef(new Animated.Value(screenHeight)).current;
    const backdropOpacity = useRef(new Animated.Value(0)).current;
    const isClosing = useRef(false);

    useEffect(() => {
        if (selectedLesson) {
            isClosing.current = false;
            translateY.setValue(screenHeight);
            backdropOpacity.setValue(0);

            Animated.parallel([
                Animated.spring(translateY, {
                    toValue: 0,
                    useNativeDriver: true,
                    bounciness: 4,
                }),
                Animated.timing(backdropOpacity, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [selectedLesson]);

    const handleClose = () => {
        if (isClosing.current) return;
        isClosing.current = true;

        Animated.parallel([
            Animated.timing(translateY, {
                toValue: screenHeight,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(backdropOpacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onClose();
        });
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => false,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return gestureState.dy > 5 && Math.abs(gestureState.dx) < Math.abs(gestureState.dy);
            },
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dy > 0) {
                    translateY.setValue(gestureState.dy);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 100 || gestureState.vy > 0.5) {
                    handleClose();
                } else {
                    Animated.spring(translateY, {
                        toValue: 0,
                        useNativeDriver: true,
                        bounciness: 4,
                    }).start();
                }
            },
        }),
    ).current;

    const getLessonTypeFullName = (typeInput) => {
        if (!typeInput) return "Занятие";
        const lower = String(typeInput).toLowerCase().trim();
        if (lower.includes("лек")) return "Лекция";
        if (lower.includes("пр")) return "Практическое занятие";
        if (lower.includes("лаб")) return "Лабораторная работа";
        return typeInput;
    };

    const isLecture = selectedLesson?.type?.toLowerCase().includes("лек");
    const defaultBg = isLecture ? theme.main : theme.accentMuted;
    const bulletColor = selectedLesson?.color || defaultBg;
    const lessonTypeName = getLessonTypeFullName(selectedLesson?.type);

    if (!selectedLesson) return null;

    return (
        <Modal
            visible={!!selectedLesson}
            transparent={true}
            animationType="none"
            onRequestClose={handleClose}
        >
            <View style={styles.bottomSheetOverlay}>
                <TouchableWithoutFeedback onPress={handleClose}>
                    <Animated.View
                        style={[
                            StyleSheet.absoluteFill,
                            { backgroundColor: theme.overlay, opacity: backdropOpacity },
                        ]}
                    />
                </TouchableWithoutFeedback>

                <Animated.View
                    {...panResponder.panHandlers}
                    style={[
                        styles.bottomSheetContainer,
                        { backgroundColor: theme.dark, transform: [{ translateY }] },
                    ]}
                >
                    <View style={styles.indicatorContainer}>
                        <View style={styles.bottomSheetIndicator} />
                    </View>

                    <View style={styles.bottomSheetHeader}>
                        <View style={[styles.bsIconBullet, { backgroundColor: bulletColor }]} />
                        <Text style={styles.bottomSheetTitle}>
                            {selectedLesson?.subject || selectedLesson?.name}
                        </Text>
                    </View>

                    <View style={styles.bottomSheetContent}>
                        <View style={styles.bsRow}>
                            <Clock size={20} color={theme.accent} />
                            <Text style={styles.bsText}>{selectedLesson?.time || "—"}</Text>
                        </View>
                        <View style={styles.bsRow}>
                            <MapPin size={20} color={theme.accent} />
                            <Text style={styles.bsText}>
                                {selectedLesson?.auditory || "Аудитория не указана"}
                            </Text>
                        </View>
                        <View style={styles.bsRow}>
                            <Info size={20} color={theme.accent} />
                            <Text style={styles.bsText}>{lessonTypeName}</Text>
                        </View>
                        <View style={styles.bsRow}>
                            <User size={20} color={theme.accent} />
                            <Text style={styles.bsText}>
                                {selectedLesson?.teacher || "Преподаватель не указан"}
                            </Text>
                        </View>
                        <View style={styles.bsRow}>
                            <Users size={20} color={theme.accent} />
                            <Text style={styles.bsText}>
                                {selectedGroup
                                    ? selectedGroup.name || selectedGroup.title
                                    : "Группа не указана"}
                            </Text>
                        </View>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const createLocalStyles = (theme) =>
    StyleSheet.create({
        bottomSheetOverlay: {
            flex: 1,
            justifyContent: "flex-end",
        },
        bottomSheetContainer: {
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 20,
            paddingBottom: 48,
        },
        indicatorContainer: {
            paddingVertical: 10,
            marginTop: -10,
            alignItems: "center",
        },
        bottomSheetIndicator: {
            width: 40,
            height: 4,
            borderRadius: 2,
            backgroundColor: theme.accentMuted,
        },
        bottomSheetHeader: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 20,
            gap: 10,
        },
        bsIconBullet: {
            width: 10,
            height: 10,
            borderRadius: 5,
        },
        bottomSheetTitle: {
            fontSize: 18,
            fontWeight: "bold",
            color: theme.text,
            flex: 1,
        },
        bottomSheetContent: {
            gap: 16,
        },
        bsRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
        },
        bsText: {
            fontSize: 15,
            color: theme.text,
        },
    });
