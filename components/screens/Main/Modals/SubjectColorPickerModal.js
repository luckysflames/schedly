import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Palette, Check } from "lucide-react-native";
import { useTheme } from "../../../../hooks/useTheme";
import { BottomSheet } from "../../../shared/Modals/BottomSheet";

const COLOR_PALETTE = [
    // Красные / Розовые / Бордовые
    "#D32F2F",
    "#E91E63",
    "#C2185B",
    "#9C27B0",
    "#FF5252",
    "#FF4081",
    // Фиолетовые / Синие
    "#673AB7",
    "#3F51B5",
    "#2196F3",
    "#03A9F4",
    "#5C6BC0",
    "#42A5F5",
    // Голубые / Бирюзовые / Зеленые
    "#00BCD4",
    "#009688",
    "#4CAF50",
    "#8BC34A",
    "#26A69A",
    "#66BB6A",
    // Желтые / Оранжевые / Коричневые
    "#FFEB3B",
    "#FFC107",
    "#FF9800",
    "#FF5722",
    "#795548",
    "#8D6E63",
    // Нейтральные / Темные / Дополнительные
    "#607D8B",
    "#9E9E9E",
    "#37474F",
    "#263238",
    "#455A64",
    "#78909C",
];

export const SubjectColorPickerModal = ({
    visible,
    subjectName,
    currentColor,
    onClose,
    onSelectColor,
}) => {
    const { theme, createStyles } = useTheme();
    const styles = createStyles(createLocalStyles);

    if (!subjectName) return null;

    return (
        <BottomSheet
            visible={visible}
            onClose={onClose}
            containerStyle={[styles.bottomSheetContainer, { backgroundColor: theme.main }]}
        >
            <View style={styles.bottomSheetHeader}>
                <Palette size={20} color={theme.accent} />
                <Text style={styles.bottomSheetTitle} numberOfLines={2}>
                    {subjectName}
                </Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.paletteContainer}
                showsVerticalScrollIndicator={false}
            >
                {COLOR_PALETTE.map((color) => {
                    const isSelected =
                        currentColor && currentColor.toLowerCase() === color.toLowerCase();
                    return (
                        <TouchableOpacity
                            key={color}
                            style={[styles.colorCircle, { backgroundColor: color }]}
                            onPress={() => {
                                onSelectColor(subjectName, color);
                                onClose();
                            }}
                            activeOpacity={0.7}
                        >
                            {isSelected && <Check size={20} color={theme.white} />}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </BottomSheet>
    );
};

const createLocalStyles = (theme) =>
    StyleSheet.create({
        bottomSheetContainer: {
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingHorizontal: 20,
            paddingBottom: 30,
            maxHeight: "80%",
        },
        bottomSheetHeader: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 20,
            gap: 12,
        },
        bottomSheetTitle: {
            fontSize: 18,
            fontWeight: "bold",
            color: theme.text,
            flex: 1,
        },
        paletteContainer: {
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 12,
            paddingBottom: 10,
        },
        colorCircle: {
            width: 40,
            height: 40,
            borderRadius: 20,
            justifyContent: "center",
            alignItems: "center",
        },
    });
