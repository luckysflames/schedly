import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Check, ChevronLeft, Pencil } from "lucide-react-native";
import { useTheme } from "../../hooks/useTheme";

export const Header = ({
    title,
    onBack,
    showBack = true,
    showEdit = false,
    showReady = false,
    onRightPress,
}) => {
    const { theme, createStyles } = useTheme();
    const styles = createStyles(createLocalStyles);

    return (
        <View style={styles.header}>
            <View>
                {showBack && (
                    <TouchableOpacity activeOpacity={0.7} onPress={onBack} style={styles.btn}>
                        <ChevronLeft size={22} color={theme.accent} />
                    </TouchableOpacity>
                )}
            </View>

            <Text
                style={[
                    styles.headerTitle,
                    !showBack && styles.headerTitleOffsetLeft,
                    !showEdit && !showReady && styles.headerTitleOffsetRight,
                ]}
                numberOfLines={1}
            >
                {title}
            </Text>

            <View style={styles.sideContainer}>
                {showEdit ? (
                    <TouchableOpacity activeOpacity={0.7} onPress={onRightPress} style={styles.btn}>
                        <Pencil size={22} color={theme.accent} />
                    </TouchableOpacity>
                ) : showReady ? (
                    <TouchableOpacity activeOpacity={0.7} onPress={onRightPress} style={styles.btn}>
                        <Check size={22} color={theme.accent} />
                    </TouchableOpacity>
                ) : null}
            </View>
        </View>
    );
};

const createLocalStyles = (theme) =>
    StyleSheet.create({
        header: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 25,
            paddingTop: 20,
            paddingHorizontal: 20,
        },
        btn: {
            width: 40,
            height: 40,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: theme.accent,
        },
        headerTitle: {
            flex: 3,
            fontSize: 18,
            fontWeight: "bold",
            textAlign: "center",
            color: theme.accent,
        },
        headerTitleOffsetLeft: {
            marginLeft: 40,
        },
        headerTitleOffsetRight: {
            marginRight: 40,
        },
        sideContainer: {
            alignItems: "flex-end",
        },
    });
