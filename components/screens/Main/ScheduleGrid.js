import React, { useRef, useCallback, useEffect, useState } from "react";
import { View, FlatList, StyleSheet, Dimensions, ActivityIndicator } from "react-native";
import { useTheme } from "../../../hooks/useTheme";
import { WeekContent } from "./WeekContent";
import { useScheduleGrid } from "../../../hooks/useScheduleGrid";

const SchedulePage = React.memo(
    ({ scheduleData, weekOffset, hours, getLessonPosition, onSelectLesson }) => {
        const screenWidth = Dimensions.get("window").width;
        // Достаем weekNumber из хука
        const { daysList, weekNumber } = useScheduleGrid(scheduleData, weekOffset);

        return (
            <View style={{ width: screenWidth, flex: 1 }}>
                <WeekContent
                    daysList={daysList}
                    hours={hours}
                    weekNumber={weekNumber}
                    getLessonPosition={getLessonPosition}
                    onSelectLesson={onSelectLesson}
                />
            </View>
        );
    },
);

export const ScheduleGrid = ({
    scheduleData,
    hours,
    getLessonPosition,
    onSelectLesson,
    weekOffset,
    onChangeWeekOffset,
}) => {
    const { theme } = useTheme();
    const screenWidth = Dimensions.get("window").width;
    const flatListRef = useRef(null);

    const TOTAL_PAGES = 201;
    const CENTER_INDEX = 100;

    const pagesData = useRef(
        Array.from({ length: TOTAL_PAGES }, (_, i) => i - CENTER_INDEX),
    ).current;

    const currentIndexRef = useRef(CENTER_INDEX + weekOffset);
    const [isJumping, setIsJumping] = useState(false);

    const handleMomentumScrollEnd = useCallback(
        (event) => {
            const contentOffsetX = event.nativeEvent.contentOffset.x;
            const pageIndex = Math.round(contentOffsetX / screenWidth);
            currentIndexRef.current = pageIndex;
            setIsJumping(false); // Скрываем лоадер по окончании скролла
            const targetWeekOffset = pageIndex - CENTER_INDEX;

            if (targetWeekOffset !== weekOffset) {
                onChangeWeekOffset(targetWeekOffset);
            }
        },
        [weekOffset, screenWidth, onChangeWeekOffset],
    );

    useEffect(() => {
        const targetIndex = CENTER_INDEX + weekOffset;
        if (flatListRef.current) {
            const distance = Math.abs(targetIndex - currentIndexRef.current);

            // Если прыжок далеко, показываем лоадер, так как рендер займет время
            if (distance > 2) {
                setIsJumping(true);
            }

            currentIndexRef.current = targetIndex;

            flatListRef.current.scrollToIndex({
                index: targetIndex,
                animated: distance <= 2, // Плавно только если рядом
            });

            // Страховка на случай если скролл мгновенный и моментум не вызовется
            if (distance > 2) {
                const timer = setTimeout(() => setIsJumping(false), 300);
                return () => clearTimeout(timer);
            }
        }
    }, [weekOffset]);

    return (
        <View style={[styles.container, { backgroundColor: theme.dark }]}>
            <FlatList
                ref={flatListRef}
                data={pagesData}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                initialScrollIndex={CENTER_INDEX + weekOffset}
                getItemLayout={(_, index) => ({
                    length: screenWidth,
                    offset: screenWidth * index,
                    index,
                })}
                keyExtractor={(item) => `week_${item}`}
                renderItem={({ item: offset }) => (
                    <SchedulePage
                        scheduleData={scheduleData}
                        weekOffset={offset}
                        hours={hours}
                        getLessonPosition={getLessonPosition}
                        onSelectLesson={onSelectLesson}
                    />
                )}
                onMomentumScrollEnd={handleMomentumScrollEnd}
                onScrollBeginDrag={() => setIsJumping(false)}
                onScrollToIndexFailed={(info) => {
                    setTimeout(() => {
                        flatListRef.current?.scrollToIndex({
                            index: info.index,
                            animated: false,
                        });
                        setIsJumping(false);
                    }, 100);
                }}
                windowSize={3}
                maxToRenderPerBatch={3}
                updateCellsBatchingPeriod={50}
                removeClippedSubviews={true}
                bounces={false}
            />

            {isJumping && (
                <View style={[styles.loadingOverlay, { backgroundColor: theme.dark }]}>
                    <ActivityIndicator size="large" color={theme.accent} />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: "relative",
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10,
    },
});
