import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Trash2, AlertTriangle } from "lucide-react-native";

import { useTheme } from "../hooks/useTheme";
import { useDataReset } from "../hooks/useDataReset";
import { Header } from "../components/shared/Header";
import { SettingItem } from "../components/screens/Settings/SettingItem";
import { CustomAlertModal } from "../components/shared/Modals/CustomAlertModal";

export default function DataManagementScreen({ navigation }) {
    const { createStyles, theme } = useTheme();
    const styles = createStyles(createLocalStyles);

    const { state, actions } = useDataReset();

    return (
        <View style={styles.safeArea}>
            <Header showBack={true} title="Сброс данных" onBack={() => navigation.goBack()} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.warningBox}>
                    <AlertTriangle color={theme.accent} size={20} />
                    <Text style={styles.warningText}>
                        Будьте осторожны. Удаленные данные невозможно восстановить, если
                        предварительно они не были экспортированы.
                    </Text>
                </View>

                <Text style={styles.sectionTitle}>Опасная зона</Text>
                <View style={styles.card}>
                    <SettingItem
                        icon={Trash2}
                        label="Удалить вообще всё"
                        onPress={actions.confirmResetAll}
                    />
                </View>
            </ScrollView>

            <CustomAlertModal
                visible={state.modalConfig.visible}
                title={state.modalConfig.title}
                message={state.modalConfig.message}
                buttons={state.modalConfig.buttons}
                onClose={actions.closeModal}
            />
        </View>
    );
}

const createLocalStyles = (theme) =>
    StyleSheet.create({
        safeArea: {
            flex: 1,
            paddingTop: 8,
            paddingHorizontal: 20,
            backgroundColor: theme.main,
        },
        content: {
            flex: 1,
        },
        scrollContent: {
            paddingBottom: 40,
        },
        warningBox: {
            flexDirection: "row",
            alignItems: "center",
            padding: 12,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.accent,
            marginBottom: 20,
            gap: 10,
        },
        warningText: {
            flex: 1,
            color: theme.accent,
            fontSize: 12,
            lineHeight: 16,
        },
        sectionTitle: {
            fontSize: 11,
            fontWeight: "700",
            marginBottom: 8,
            marginLeft: 4,
            textTransform: "uppercase",
            letterSpacing: 1,
            color: theme.accent,
        },
        card: {
            borderRadius: 20,
            paddingVertical: 8,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: theme.accent,
        },
        separator: {
            height: 1,
            backgroundColor: theme.accent,
            marginHorizontal: 16,
            marginVertical: 4,
        },
    });
