import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Award } from "lucide-react-native";
import { useTheme } from "../../../../hooks/useTheme";
import { BottomSheet } from "../../../shared/Modals/BottomSheet";

export default function StudentCardModal({ visible, onClose, cardData }) {
    if (!cardData) return null;

    const { theme, createStyles } = useTheme();
    const styles = createStyles(createLocalStyles);

    return (
        <BottomSheet
            visible={visible}
            onClose={onClose}
            containerStyle={[styles.bottomSheetContainer, { backgroundColor: theme.main }]}
        >
            <View style={styles.header}>
                <View style={styles.headerTitleContainer}>
                    <Award size={22} color={theme.accent} />
                    <Text style={styles.headerTitle}>Студенческий билет</Text>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.body}
                showsVerticalScrollIndicator={false}
            >
                <Text style={[styles.university, { color: theme.accent }]}>
                    {cardData.universityName ||
                        "ДОНСКОЙ ГОСУДАРСТВЕННЫЙ ТЕХНИЧЕСКИЙ УНИВЕРСИТЕТ"}
                </Text>
                <Text style={styles.fullName}>{cardData.fullName}</Text>

                <View style={styles.row}>
                    <View style={styles.column}>
                        <Text style={styles.label}>Номер билета</Text>
                        <Text style={styles.value}>{cardData.cardNumber}</Text>
                    </View>
                    <View style={styles.column}>
                        <Text style={styles.label}>Приказ о зачислении</Text>
                        <Text style={styles.value}>{cardData.documentNubmer}</Text>
                    </View>
                </View>

                <View style={styles.row}>
                    <View style={styles.column}>
                        <Text style={styles.label}>Дата выдачи</Text>
                        <Text style={styles.value}>{cardData.cardDate}</Text>
                    </View>
                    <View style={styles.column}>
                        <Text style={styles.label}>Курс</Text>
                        <Text style={styles.value}>{cardData.course}</Text>
                    </View>
                </View>

                <View style={styles.row}>
                    <View style={styles.column}>
                        <Text style={styles.label}>Уровень образования</Text>
                        <Text style={styles.value}>{cardData.levelName}</Text>
                    </View>
                    <View style={styles.column}>
                        <Text style={styles.label}>Форма обучения</Text>
                        <Text style={styles.value}>{cardData.formStudy}</Text>
                    </View>
                </View>

                <View style={styles.fullColumn}>
                    <Text style={styles.label}>Направление подготовки</Text>
                    <Text style={styles.value}>{cardData.specialityName}</Text>
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
            paddingHorizontal: 0,
            paddingBottom: 20,
            maxHeight: "85%",
        },
        header: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
        },
        headerTitleContainer: {
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
        },
        headerTitle: {
            fontSize: 16,
            fontWeight: "700",
            color: theme.text,
        },
        closeButton: {
            padding: 4,
        },
        body: {
            paddingHorizontal: 20,
            paddingBottom: 20,
            gap: 16,
        },
        university: {
            textAlign: "center",
            fontSize: 12,
            fontWeight: "900",
            letterSpacing: 1,
            textTransform: "uppercase",
        },
        fullName: {
            textAlign: "center",
            fontSize: 20,
            fontWeight: "bold",
            marginBottom: 4,
            color: theme.text,
        },
        row: {
            flexDirection: "row",
            gap: 16,
        },
        column: {
            flex: 1,
            gap: 4,
        },
        fullColumn: {
            gap: 4,
        },
        label: {
            fontSize: 11,
            color: theme.accent,
            textTransform: "uppercase",
            letterSpacing: 0.5,
        },
        value: {
            fontSize: 14,
            fontWeight: "600",
            color: theme.text,
        },
    });