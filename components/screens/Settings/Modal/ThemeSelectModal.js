import React from "react";
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TouchableWithoutFeedback,
    ScrollView,
} from "react-native";
import { Check } from "lucide-react-native";
import { useTheme } from "../../../../hooks/useTheme";
import { THEMES } from "../../../../theme/themes";

export default function ThemeSelectModal({ visible, onClose }) {
    const { themeName, setThemeName, createStyles } = useTheme();
    const styles = createStyles(createLocalStyles);
    const themeOptions = Object.keys(THEMES);

    return (
        <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Выбор темы</Text>

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
                                        const borderColor = isActive
                                            ? accentColor
                                            : themeDefinition.accentMuted;

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
                                                    style={[
                                                        styles.themePreview,
                                                        { backgroundColor: accentColor },
                                                    ]}
                                                >
                                                    {isActive && (
                                                        <Check
                                                            color={bgCard}
                                                            size={18}
                                                            strokeWidth={2.5}
                                                        />
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
                                                    {option.charAt(0).toUpperCase() +
                                                        option.slice(1)}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </ScrollView>

                            <View style={styles.divider} />

                            {/* Кнопка закрытия */}
                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={styles.closeBtn}
                                    onPress={onClose}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.closeText}>Готово</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const createLocalStyles = (theme) =>
    StyleSheet.create({
        modalOverlay: {
            flex: 1,
            backgroundColor: theme.overlay,
            justifyContent: "center",
            paddingHorizontal: 24,
            paddingVertical: 40,
        },
        modalContent: {
            flexShrink: 1,
            borderRadius: 28,
            padding: 24,
            backgroundColor: theme.main,
        },
        modalTitle: {
            fontSize: 22,
            fontWeight: "700",
            marginBottom: 20,
            textAlign: "center",
            color: theme.accent,
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
        modalButtons: {
            flexDirection: "row",
        },
        closeBtn: {
            flex: 1,
            padding: 16,
            borderRadius: 16,
            alignItems: "center",
            backgroundColor: theme.accent,
        },
        closeText: {
            fontWeight: "600",
            color: theme.textDark,
        },
        divider: {
            borderTopWidth: 1,
            borderColor: theme.accent,
            paddingVertical: 8,
        },
    });
