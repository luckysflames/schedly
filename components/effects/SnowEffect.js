import React, { memo, useEffect } from "react";
import { StyleSheet, Dimensions } from "react-native";
import { Canvas, Circle } from "@shopify/react-native-skia";
import {
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
    Easing,
    useDerivedValue,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const SNOWFLAKES_COUNT = 40;

const getRandom = (min, max) => Math.random() * (max - min) + min;

const SkiaSnowflake = memo(({ initialProgress, duration, startX, amplitude, radius }) => {
    const progress = useSharedValue(initialProgress);

    useEffect(() => {
        progress.value = withSequence(
            withTiming(1, {
                duration: duration * (1 - initialProgress),
                easing: Easing.linear,
            }),
            withTiming(0, { duration: 0 }),
            withRepeat(
                withTiming(1, {
                    duration: duration,
                    easing: Easing.linear,
                }),
                -1,
                false,
            ),
        );
    }, [duration, initialProgress, progress]);

    const cy = useDerivedValue(() => {
        return progress.value * (SCREEN_HEIGHT + 40) - 20;
    });

    const cx = useDerivedValue(() => {
        return startX + Math.sin(progress.value * Math.PI * 4) * amplitude;
    });

    return <Circle cx={cx} cy={cy} r={radius} color="white" opacity={0.8} />;
});

export const SnowEffect = memo(() => {
    const snowflakes = React.useMemo(() => {
        return Array.from({ length: SNOWFLAKES_COUNT }).map((_, index) => ({
            startX: getRandom(0, SCREEN_WIDTH),
            radius: getRandom(1.5, 3.5),
            duration: getRandom(10000, 16000),
            initialProgress: (index + Math.random()) / SNOWFLAKES_COUNT,
            amplitude: getRandom(10, 30),
        }));
    }, []);

    return (
        <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
            {snowflakes.map((flake, index) => (
                <SkiaSnowflake key={index} {...flake} />
            ))}
        </Canvas>
    );
});
