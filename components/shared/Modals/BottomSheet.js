import React, { useRef, useEffect, useState } from "react";
import {
    Modal,
    View,
    StyleSheet,
    Animated,
    PanResponder,
    Dimensions,
    Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../../hooks/useTheme";

const SCREEN_HEIGHT = Dimensions.get("window").height;

export const BottomSheet = ({ visible, onClose, children, containerStyle }) => {
    const insets = useSafeAreaInsets();
    const { theme, createStyles } = useTheme();
    const styles = createStyles(createLocalStyles);

    const [shouldRender, setShouldRender] = useState(visible);
    const panY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

    useEffect(() => {
        if (visible) {
            setShouldRender(true);
            Animated.spring(panY, {
                toValue: 0,
                useNativeDriver: true,
                tension: 50,
                friction: 10,
            }).start();
        }
    }, [visible]);

    useEffect(() => {
        if (!visible && shouldRender) {
            handleClose();
        }
    }, [visible]);

    const handleClose = () => {
        Animated.timing(panY, {
            toValue: SCREEN_HEIGHT,
            duration: 250,
            useNativeDriver: true,
        }).start(() => {
            setShouldRender(false);
            onClose();
        });
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, { dy }) => dy > 5,
            onPanResponderMove: (_, { dy }) => {
                if (dy > 0) panY.setValue(dy);
            },
            onPanResponderRelease: (_, { dy, vy }) => {
                if (dy > 150 || vy > 0.5) {
                    handleClose();
                } else {
                    Animated.spring(panY, {
                        toValue: 0,
                        useNativeDriver: true,
                    }).start();
                }
            },
        }),
    ).current;

    if (!shouldRender && !visible) return null;

    return (
        <Modal
            transparent
            visible={visible || shouldRender}
            animationType="none"
            statusBarTranslucent
            onRequestClose={handleClose}
            navigationBarTranslucent
        >
            <View style={styles.overlayContainer}>
                {/* Overlay Background */}
                <Animated.View
                    style={[
                        styles.darkOverlay,
                        {
                            opacity: panY.interpolate({
                                inputRange: [0, SCREEN_HEIGHT / 2],
                                outputRange: [1, 0],
                                extrapolate: "clamp",
                            }),
                        },
                    ]}
                >
                    <Pressable style={styles.absoluteFill} onPress={handleClose} />
                </Animated.View>

                {/* Content Container */}
                <Animated.View
                    style={[
                        styles.modalContent,
                        containerStyle,
                        {
                            transform: [{ translateY: panY }],
                            paddingBottom: Math.max(insets.bottom, 20),
                        },
                    ]}
                    {...panResponder.panHandlers}
                >
                    <View style={styles.pullIndicator} />
                    {children}
                </Animated.View>
            </View>
        </Modal>
    );
};

const createLocalStyles = (theme) =>
    StyleSheet.create({
        overlayContainer: {
            flex: 1,
            justifyContent: "flex-end",
        },
        darkOverlay: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: theme.overlay,
        },
        absoluteFill: {
            ...StyleSheet.absoluteFillObject,
        },
        modalContent: {
            backgroundColor: theme.main,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            width: "100%",
        },
        pullIndicator: {
            width: 40,
            height: 5,
            backgroundColor: theme.accentMuted,
            borderRadius: 3,
            alignSelf: "center",
            marginTop: 10,
            marginBottom: 20,
        },
    });
