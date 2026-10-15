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
const LEAVES_COUNT = 35;

const getRandom = (min, max) => Math.random() * (max - min) + min;

const leafSvgPath =
    "M8.95 18.17 C6.09 19.58 3.5 17.72 3.06 17.27 C2.65 18.03 0.5 20.59 -0.02 20.83 C-0.55 21.07 -0.43 20.67 -0.43 20.67 C-0.43 20.67 0.86 19.99 2.89 17.14 C2.89 17.14 -0.75 15.35 0.85 9.36 C2.89 3.82 7.99 2.57 7.99 2.57 C7.99 2.57 12.53 1.1 14.11 0 C14.11 0 13.91 1.46 14.35 2.96 C14.78 4.46 14.96 7.31 14.96 7.31 C14.96 7.31 15.89 15.38 8.95 18.17 Z";
const SkiaPath = Skia.Path.MakeFromSVGString(leafSvgPath);

const LEAF_COLORS = ["#D97706", "#EA580C", "#CA8A04", "#B45309", "#C2410C"];

const SkiaLeaf = memo(
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

export const LeafEffect = memo(() => {
    const leaves = React.useMemo(() => {
        return Array.from({ length: LEAVES_COUNT }).map((_, index) => ({
            startX: getRandom(0, SCREEN_WIDTH),
            duration: getRandom(9000, 15000),
            initialProgress: (index + Math.random()) / LEAVES_COUNT,
            amplitude: getRandom(15, 35),
            scale: getRandom(0.6, 1.1),
            rotationSpeed: getRandom(0.5, 2),
            color: LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)],
        }));
    }, []);

    return (
        <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
            {leaves.map((leaf, index) => (
                <SkiaLeaf key={index} {...leaf} />
            ))}
        </Canvas>
    );
});
