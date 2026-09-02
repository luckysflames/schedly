import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Check } from "lucide-react-native";
import { useTheme } from "../../../../hooks/useTheme";
import { THEMES } from "../../../../theme/themes";
import { BottomSheet } from "../../../shared/Modals/BottomSheet";

export default function ThemeSelectModal({ visible, onClose }) {
    const { themeName, setThemeName, theme, createStyles } = useTheme();
    const styles = createStyles(createLocalStyles);
    const themeOptions = Object.keys(THEMES);

    return (
        <BottomSheet
            visible={visible}
            onClose={onClose}
            containerStyle={[styles.bottomSheetContainer, { backgroundColor: theme.main }]}
        >
            <View style={styles.bottomSheetHeader}>
                <Text style={styles.bottomSheetTitle}>Выбор темы</Text>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.themeRow}>
                    {themeOptions.map((option) => {
                        const themeDefinition = THEMES[option] || {};
                        const isActive = option === themeName;

                        const bgCard = themeDefinition.main;
                        const accentColor = themeDefinition.accent;
                        const borderColor = isActive ? accentColor : themeDefinition.accentMuted;

                        return (
                            <TouchableOpacity
                                key={option}
                                activeOpacity={0.8}
                                onPress={() => setThemeName(option)}
                                style={[
                                    styles.themeCard,
                                    {
                                        backgroundColor: bgCard,
                                        borderColor: borderColor,
                                    },
                                ]}
                            >
                                <View
                                    style={[styles.themePreview, { backgroundColor: accentColor }]}
                                >
                                    {isActive && (
                                        <Check color={bgCard} size={18} strokeWidth={2.5} />
                                    )}
                                </View>
                                <Text
                                    numberOfLines={1}
                                    adjustsFontSizeToFit
                                    style={[
                                        styles.themeCardLabel,
                                        { color: accentColor },
                                        isActive && styles.themeCardLabelActive,
                                    ]}
                                >
                                    {option.charAt(0).toUpperCase() + option.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>
        </BottomSheet>
    );
}

const createLocalStyles = (theme) =>
    StyleSheet.create({
        bottomSheetContainer: {
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingHorizontal: 20,
            paddingBottom: 30,
            maxHeight: "85%",
        },
        bottomSheetHeader: {
            alignItems: "center",
            marginBottom: 16,
        },
        bottomSheetTitle: {
            fontSize: 18,
            fontWeight: "bold",
            color: theme.text,
        },
        scrollContainer: {
            flexGrow: 0,
            marginBottom: 8,
        },
        scrollContent: {
            paddingVertical: 4,
        },
        themeRow: {
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
        },
        themeCard: {
            width: "47%",
            paddingVertical: 12,
            paddingHorizontal: 8,
            borderRadius: 16,
            borderWidth: 1,
            marginBottom: 14,
            alignItems: "center",
            justifyContent: "center",
        },
        themePreview: {
            width: 32,
            height: 32,
            borderRadius: 10,
            marginBottom: 8,
            justifyContent: "center",
            alignItems: "center",
        },
        themeCardLabel: {
            fontSize: 13,
            fontWeight: "600",
            textAlign: "center",
        },
        themeCardLabelActive: {
            fontWeight: "700",
        },
    });
