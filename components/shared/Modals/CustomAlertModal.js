import React from "react";
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { useTheme } from "../../../hooks/useTheme";

export const CustomAlertModal = ({
    visible,
    title,
    message,
    buttons = [{ text: "OK", style: "default" }],
    onClose,
}) => {
    const { createStyles } = useTheme();
    const styles = createStyles(createLocalStyles);

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.container}>
                            <Text style={styles.title}>{title}</Text>

                            {Boolean(message) && <Text style={styles.message}>{message}</Text>}

                            <View
                                style={[
                                    styles.buttonContainer,
                                    buttons.length > 2 && styles.buttonContainerVertical,
                                ]}
                            >
                                {buttons.map((btn, index) => {
                                    const isDestructive = btn.style === "destructive";
                                    const isCancel = btn.style === "cancel";

                                    const actionButtonStyle = isDestructive
                                        ? styles.destructiveButton
                                        : isCancel
                                          ? styles.cancelButton
                                          : styles.defaultButton;
                                    const actionTextStyle = isDestructive
                                        ? styles.destructiveButtonText
                                        : isCancel
                                          ? styles.cancelButtonText
                                          : styles.defaultButtonText;

                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            activeOpacity={0.75}
                                            style={[
                                                styles.button,
                                                buttons.length <= 2 && styles.buttonFlex,
                                                actionButtonStyle,
                                            ]}
                                            onPress={() => {
                                                if (btn.onPress) btn.onPress();
                                                onClose();
                                            }}
                                        >
                                            <Text style={[styles.buttonText, actionTextStyle]}>
                                                {btn.text}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const createLocalStyles = (theme) =>
    StyleSheet.create({
        overlay: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 24,
            backgroundColor: theme.overlay,
        },
        container: {
            width: "100%",
            maxWidth: 340,
            borderRadius: 24,
            padding: 20,
            alignItems: "center",
            backgroundColor: theme.main,
            elevation: 10,
        },
        title: {
            fontSize: 18,
            fontWeight: "700",
            textAlign: "center",
            marginBottom: 8,
            color: theme.accent,
        },
        message: {
            fontSize: 14,
            lineHeight: 20,
            textAlign: "center",
            marginBottom: 20,
            color: theme.accentMuted,
        },
        buttonContainer: {
            flexDirection: "row",
            gap: 10,
            width: "100%",
            marginTop: 4,
        },
        buttonContainerVertical: {
            flexDirection: "column",
        },
        buttonFlex: {
            flex: 1,
        },
        button: {
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 14,
            alignItems: "center",
            justifyContent: "center",
        },
        defaultButton: {
            backgroundColor: theme.accent,
        },
        destructiveButton: {
            backgroundColor: `${theme.red}20`,
        },
        cancelButton: {
            backgroundColor: theme.dark,
        },
        buttonText: {
            fontSize: 15,
            fontWeight: "700",
        },
        defaultButtonText: {
            color: theme.textDark,
        },
        destructiveButtonText: {
            color: theme.red,
        },
        cancelButtonText: {
            color: theme.accentMuted,
            fontWeight: "500",
        },
    });
