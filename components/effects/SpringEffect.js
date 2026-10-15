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
const PETALS_COUNT = 35;

const getRandom = (min, max) => Math.random() * (max - min) + min;

const petalSvgPath =
    "M0,0s10.21,2.41,10.11,8.83c-.06,3.81,4.89,5.24,4.89,5.24,0,0-8.81.1-11.78-3.04S0,.53,0,.53";
const SkiaPath = Skia.Path.MakeFromSVGString(petalSvgPath);

const PETAL_COLORS = ["#FFB7C5", "#FFC0CB", "#FFF0F5", "#FF69B4", "#FFC5D3"];

const SkiaPetal = memo(
    ({ initialProgress, duration, startX, amplitude, scale, rotationSpeed, color }) => {
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

        const transform = useDerivedValue(() => {
            const x = cx.value;
            const y = cy.value;
            const rotate = progress.value * Math.PI * 2 * rotationSpeed;

            return Skia.Matrix().translate(x, y).scale(scale, scale).rotate(rotate);
        });

        return <Path path={SkiaPath} color={color} matrix={transform} opacity={0.85} />;
    },
);

export const SpringEffect = memo(() => {
    const petals = React.useMemo(() => {
        return Array.from({ length: PETALS_COUNT }).map((_, index) => ({
            startX: getRandom(0, SCREEN_WIDTH),
            duration: getRandom(9000, 15000),
            initialProgress: (index + Math.random()) / PETALS_COUNT,
            amplitude: getRandom(15, 35),
            scale: getRandom(0.6, 1.1),
            rotationSpeed: getRandom(0.5, 2),
            color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
        }));
    }, []);

    return (
        <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
            {petals.map((petal, index) => (
                <SkiaPetal key={index} {...petal} />
            ))}
        </Canvas>
    );
});