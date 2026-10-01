import React, { useRef, useCallback, useEffect, useState } from "react";
import { View, FlatList, StyleSheet, Dimensions, ActivityIndicator } from "react-native";
import { useTheme } from "../../../../hooks/useTheme";
import { SchedulePage } from "./SchedulePage";
import { useSchedlyStore } from "../../../../store/useSchedlyStore";

export const ScheduleGrid = ({
    scheduleData,
    hiddenSubjects,
    onSelectLesson,
    onLongPressLesson,
    currentView,
    offset,
    onChangeOffset,
    onPressWeekDay,
    onRefreshResult,
    comparisonMode = false,
}) => {
    const { isViewChanging } = useSchedlyStore();
    const { theme } = useTheme();
    const screenWidth = Dimensions.get("window").width;
    const flatListRef = useRef(null);

    const TOTAL_PAGES = 201;
    const CENTER_INDEX = 100;
    const pagesData = useRef(
        Array.from({ length: TOTAL_PAGES }, (_, index) => index - CENTER_INDEX),
    ).current;
    const currentIndexRef = useRef(CENTER_INDEX + offset);
    const isUserDraggingRef = useRef(false);
    const [isJumping, setIsJumping] = useState(false);

    const renderPage = useCallback(
        ({ item: pageOffset }) => (
            <SchedulePage
                scheduleData={scheduleData}
                hiddenSubjects={hiddenSubjects}
                currentView={currentView}
                offset={pageOffset}
                onSelectLesson={onSelectLesson}
                onLongPressLesson={onLongPressLesson}
                onPressWeekDay={onPressWeekDay}
                onRefreshResult={onRefreshResult}
                comparisonMode={comparisonMode}
            />
        ),
        [
            currentView,
            hiddenSubjects,
            onLongPressLesson,
            onPressWeekDay,
            onSelectLesson,
            onRefreshResult,
            scheduleData,
            comparisonMode,
        ],
    );

    const handleMomentumScrollEnd = useCallback(
        (event) => {
            if (!isUserDraggingRef.current) return;

            isUserDraggingRef.current = false;
            const contentOffsetX = event.nativeEvent.contentOffset.x;
            const pageIndex = Math.round(contentOffsetX / screenWidth);
            currentIndexRef.current = pageIndex;
            setIsJumping(false);
            const targetOffset = pageIndex - CENTER_INDEX;

            if (targetOffset !== offset) {
                onChangeOffset(targetOffset);
            }
        },
        [offset, onChangeOffset, screenWidth],
    );

    useEffect(() => {
        const targetIndex = CENTER_INDEX + offset;
        if (flatListRef.current) {
            const distance = Math.abs(targetIndex - currentIndexRef.current);
            const shouldShowLoader = distance > 1;

            if (shouldShowLoader) {
                setIsJumping(true);
            }

            currentIndexRef.current = targetIndex;
            flatListRef.current.scrollToIndex({
                index: targetIndex,
                animated: !shouldShowLoader,
            });

            if (shouldShowLoader) {
                const timer = setTimeout(() => setIsJumping(false), 300);
                return () => clearTimeout(timer);
            }
        }
    }, [offset]);

    return (
        <View style={[styles.container, { backgroundColor: theme.dark }]}>
            <FlatList
                ref={flatListRef}
                data={pagesData}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                initialScrollIndex={CENTER_INDEX + offset}
                getItemLayout={(_, index) => ({
                    length: screenWidth,
                    offset: screenWidth * index,
                    index,
                })}
                keyExtractor={(item) => `${currentView}_${item}`}
                renderItem={renderPage}
                onMomentumScrollEnd={handleMomentumScrollEnd}
                onScrollBeginDrag={() => {
                    isUserDraggingRef.current = true;
                    setIsJumping(false);
                }}
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
                maxToRenderPerBatch={2}
                updateCellsBatchingPeriod={50}
                initialNumToRender={1}
                removeClippedSubviews={true}
                bounces={false}
            />

            {(isJumping || isViewChanging) && (
                <View style={[styles.loadingOverlay, { backgroundColor: theme.dark }]}>
                    <ActivityIndicator size="large" color={theme.accent} />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, position: "relative" },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10,
    },
});
