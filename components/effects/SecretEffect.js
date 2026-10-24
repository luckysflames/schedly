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
const SECRET_PETALS_COUNT = 35;

const getRandom = (min, max) => Math.random() * (max - min) + min;

const secretPetalSvgPath =
    "M12.79,5.36c-.93,1.36-2.21,2.88-3.73,4.4-.54.54-1.07,1.04-1.6,1.51.27.18.54.39.79.62,2.32,2.13,2.84,5.36,1.15,7.2-1.69,1.84-4.94,1.61-7.27-.53C.91,17.44.19,16.01.02,14.64c-.01-.13-.02-.26-.02-.38-.01-.03,0-.06,0-.09-.04-1.05.28-2.04.98-2.8.14-.15.29-.29.45-.41.96-1.46,2.35-3.14,4.02-4.81,1.03-1.03,2.07-1.96,3.05-2.74-.13-1.26.78-2.58,2.25-3.15,1.71-.66,3.54-.04,4.08,1.37.54,1.4-.38,3.06-2.04,3.73Z";
const SecretPetalPath = Skia.Path.MakeFromSVGString(secretPetalSvgPath);

const SECRET_PETAL_COLORS = ["#F7DECE", "#F3D0B7", "#D0A684", "#AE825C", "#7B543D"];

const SkiaSecretPetal = memo(
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
                        duration,
                        easing: Easing.linear,
                    }),
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
            const x = cx.value;
            const y = cy.value;
            const rotate = progress.value * Math.PI * 2 * rotationSpeed;

            return Skia.Matrix().translate(x, y).scale(scale, scale).rotate(rotate);
        });

        return <Path path={SecretPetalPath} color={color} matrix={transform} opacity={0.85} />;
    },
);

export const SecretEffect = memo(() => {
    const petals = React.useMemo(
        () =>
            Array.from({ length: SECRET_PETALS_COUNT }).map((_, index) => ({
                startX: getRandom(0, SCREEN_WIDTH),
                duration: getRandom(9000, 15000),
                initialProgress: (index + Math.random()) / SECRET_PETALS_COUNT,
                amplitude: getRandom(15, 35),
                scale: getRandom(0.6, 1.1),
                rotationSpeed: getRandom(0.5, 2),
                color: SECRET_PETAL_COLORS[Math.floor(Math.random() * SECRET_PETAL_COLORS.length)],
            })),
        [],
    );

    return (
        <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
            {petals.map((petal, index) => (
                <SkiaSecretPetal key={index} {...petal} />
            ))}
        </Canvas>
    );
});
