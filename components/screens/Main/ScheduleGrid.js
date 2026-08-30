import React, { useRef, useCallback, useEffect, useState } from "react";
import { View, FlatList, StyleSheet, Dimensions, ActivityIndicator } from "react-native";
import { useTheme } from "../../../hooks/useTheme";
import { SchedulePage } from "./SchedulePage";

export const ScheduleGrid = ({ scheduleData, onSelectLesson, weekOffset, onChangeWeekOffset }) => {
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
            setIsJumping(false);
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

            if (distance > 2) {
                setIsJumping(true);
            }

            currentIndexRef.current = targetIndex;

            flatListRef.current.scrollToIndex({
                index: targetIndex,
                animated: distance <= 2,
            });

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
                        offset={offset}
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
                maxToRenderPerBatch={2}
                updateCellsBatchingPeriod={50}
                initialNumToRender={1}
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
