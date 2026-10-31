import React, { memo, useEffect } from "react";
import { StyleSheet, Dimensions } from "react-native";
import { Canvas, Path, Skia } from "@shopify/react-native-skia";
import {
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
    Easing,
    useDerivedValue,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CONFETTI_COUNT = 45;
const CONFETTI_PATHS = [
    Skia.Path.MakeFromSVGString("M0 0 H10 V5 H0 Z"),
    Skia.Path.MakeFromSVGString("M0 0 H4 V12 H0 Z"),
    Skia.Path.MakeFromSVGString("M0 5 L5 0 L10 5 L5 10 Z"),
];
const CONFETTI_COLORS = ["#F43F5E", "#F59E0B", "#22C55E", "#3B82F6", "#A855F7", "#EC4899"];

const getRandom = (min, max) => Math.random() * (max - min) + min;

const SkiaConfetti = memo(
    ({ initialProgress, duration, startX, amplitude, scale, rotationSpeed, color, shape }) => {
        const progress = useSharedValue(initialProgress);

        useEffect(() => {
            progress.value = withSequence(
                withTiming(1, {
                    duration: duration * (1 - initialProgress),
                    easing: Easing.linear,
                }),
                withTiming(0, { duration: 0 }),
                withRepeat(
                    withTiming(1, { duration, easing: Easing.linear }),
                    -1,
                    false,
                ),
            );
        }, [duration, initialProgress, progress]);

        const cy = useDerivedValue(() => progress.value * (SCREEN_HEIGHT + 40) - 20);
        const cx = useDerivedValue(
            () => startX + Math.sin(progress.value * Math.PI * 4) * amplitude,
        );
        const transform = useDerivedValue(() => {
            const rotate = progress.value * Math.PI * 2 * rotationSpeed;
            return Skia.Matrix()
                .translate(cx.value, cy.value)
                .scale(scale, scale)
                .rotate(rotate);
        });

        return <Path path={shape} color={color} matrix={transform} opacity={0.9} />;
    },
);

export const BirthdayEffect = memo(() => {
    const confetti = React.useMemo(
        () =>
            Array.from({ length: CONFETTI_COUNT }).map((_, index) => ({
                startX: getRandom(0, SCREEN_WIDTH),
                duration: getRandom(6500, 11000),
                initialProgress: (index + Math.random()) / CONFETTI_COUNT,
                amplitude: getRandom(15, 45),
                scale: getRandom(0.7, 1.2),
                rotationSpeed: getRandom(1, 3),
                color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
                shape: CONFETTI_PATHS[Math.floor(Math.random() * CONFETTI_PATHS.length)],
            })),
        [],
    );

    return (
        <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
            {confetti.map((piece, index) => (
                <SkiaConfetti key={index} {...piece} />
            ))}
        </Canvas>
    );
});
