import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    TouchableWithoutFeedback,
} from "react-native";
import { Cat, Laptop } from "lucide-react-native";
import { useTheme } from "../../../../hooks/useTheme";

export const DevelopersModal = ({ visible, onClose }) => {
    const { theme } = useTheme();
    const styles = createStyles(theme);

    return (
        <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalCard}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>О разработчиках</Text>
                            </View>

                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                bounces={false}
                                contentContainerStyle={styles.scrollContent}
                            >
                                {/* Главный разработчик */}
                                <View style={styles.center}>
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        style={styles.avatarWrapper}
                                    >
                                        <Laptop size={50} color={theme.accent} />
                                    </TouchableOpacity>
                                    <Text style={styles.devName}>luckyflame</Text>
                                    <Text style={styles.devRole}>Главный разработчик</Text>
                                </View>

                                <View style={styles.separator} />

                                {/* Блок поддержки */}
                                <Text style={styles.subTitle}>При поддержке</Text>
                                <View style={styles.specialCard}>
                                    <View style={styles.iconCircle}>
                                        <Cat size={22} color={theme.accent} />
                                    </View>
                                    <View style={styles.specialContent}>
                                        <Text style={styles.specialTitle}>Кошко-девочки</Text>
                                        <Text style={styles.specialDesc}>
                                            Морально поддерживали проект своим мурчанием и не давали
                                            выгореть.
                                        </Text>
                                    </View>
                                </View>
                            </ScrollView>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const createStyles = (theme) =>
    StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: theme.overlay,
            justifyContent: "center",
            paddingHorizontal: 20,
        },
        modalCard: {
            borderRadius: 24,
            maxHeight: "80%",
            borderWidth: 1,
            padding: 24,
            borderColor: theme.accent,
            backgroundColor: theme.main,
        },
        modalHeader: {
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 20,
        },
        modalTitle: {
            fontSize: 18,
            fontWeight: "bold",
            color: theme.accent,
        },
        scrollContent: {
            paddingBottom: 10,
        },
        center: {
            alignItems: "center",
            marginTop: 10,
            marginBottom: 10,
        },
        avatarWrapper: {
            width: 90,
            height: 90,
            borderRadius: 45,
            backgroundColor: theme.accentMuted,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 15,
            borderWidth: 1,
            borderColor: theme.accent,
        },
        devName: {
            fontSize: 22,
            fontWeight: "bold",
            color: theme.accent,
        },
        devRole: {
            fontSize: 14,
            marginTop: 4,
            fontWeight: "600",
            color: theme.accentMuted,
        },
        separator: {
            height: 1,
            backgroundColor: theme.accent,
            marginVertical: 20,
        },
        subTitle: {
            fontSize: 11,
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: 1,
            marginBottom: 12,
            marginLeft: 4,
            color: theme.accent,
        },
        specialCard: {
            flexDirection: "row",
            alignItems: "center",
            padding: 16,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: theme.accent,
            backgroundColor: theme.dark,
        },
        iconCircle: {
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: theme.accentMuted,
            justifyContent: "center",
            alignItems: "center",
            marginRight: 16,
        },
        specialContent: {
            flex: 1,
        },
        specialTitle: {
            fontSize: 15,
            fontWeight: "bold",
            color: theme.accent,
        },
        specialDesc: {
            fontSize: 13,
            marginTop: 4,
            lineHeight: 18,
            color: theme.accentMuted,
        },
    });
