import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Cat, Laptop } from "lucide-react-native";
import { useTheme } from "../../../../hooks/useTheme";
import { BottomSheet } from "../../../shared/Modals/BottomSheet";

export const DevelopersModal = ({ visible, onClose }) => {
    const { theme, createStyles } = useTheme();
    const styles = createStyles(createLocalStyles);

    return (
        <BottomSheet
            visible={visible}
            onClose={onClose}
            containerStyle={[styles.bottomSheetContainer, { backgroundColor: theme.main }]}
        >
            <View style={styles.bottomSheetHeader}>
                <Text style={styles.bottomSheetTitle}>О разработчиках</Text>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                bounces={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Главный разработчик */}
                <View style={styles.center}>
                    <TouchableOpacity activeOpacity={0.8} style={styles.avatarWrapper}>
                        <Laptop size={44} color={theme.accent} />
                    </TouchableOpacity>
                    <Text style={styles.devName}>luckyflame</Text>
                    <Text style={styles.devRole}>Главный разработчик</Text>
                </View>

                <View style={styles.separator} />

                {/* Блок поддержки */}
                <Text style={styles.subTitle}>При поддержке</Text>
                <View style={styles.specialCard}>
                    <View style={styles.iconCircle}>
                        <Cat size={20} color={theme.accent} />
                    </View>
                    <View style={styles.specialContent}>
                        <Text style={styles.specialTitle}>Кошко-девочки</Text>
                        <Text style={styles.specialDesc}>
                            Морально поддерживали проект своим мурчанием и не давали выгореть.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </BottomSheet>
    );
};

const createLocalStyles = (theme) =>
    StyleSheet.create({
        bottomSheetContainer: {
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            paddingHorizontal: 24,
            paddingBottom: 32,
            maxHeight: "80%",
        },
        bottomSheetHeader: {
            alignItems: "center",
            marginBottom: 20,
        },
        bottomSheetTitle: {
            fontSize: 18,
            fontWeight: "700",
            color: theme.text,
            letterSpacing: 0.2,
        },
        scrollContent: {
            paddingBottom: 10,
        },
        center: {
            alignItems: "center",
            paddingVertical: 8,
        },
        avatarWrapper: {
            width: 80,
            height: 80,
            borderRadius: 24,
            backgroundColor: theme.accent + "22",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 14,
        },
        devName: {
            fontSize: 20,
            fontWeight: "700",
            color: theme.text,
        },
        devRole: {
            fontSize: 13,
            marginTop: 4,
            fontWeight: "600",
            color: theme.accent,
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
            letterSpacing: 1.2,
            marginBottom: 10,
            marginLeft: 4,
            color: theme.accent,
        },
        specialCard: {
            flexDirection: "row",
            alignItems: "center",
            padding: 14,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: theme.accent,
        },
        iconCircle: {
            width: 42,
            height: 42,
            borderRadius: 14,
            backgroundColor: theme.accent + "22",
            justifyContent: "center",
            alignItems: "center",
            marginRight: 14,
        },
        specialContent: {
            flex: 1,
        },
        specialTitle: {
            fontSize: 15,
            fontWeight: "600",
            color: theme.text,
        },
        specialDesc: {
            fontSize: 13,
            marginTop: 3,
            lineHeight: 18,
            color: theme.accentMuted,
        },
    });
