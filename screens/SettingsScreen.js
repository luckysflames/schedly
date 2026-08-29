import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Linking } from "react-native";
import { Bug, Download, Palette, Trash2, Upload, Users, Vibrate } from "lucide-react-native";
import Constants from "expo-constants";
import { useTheme } from "../hooks/useTheme";
import { SettingItem } from "../components/screens/Settings/SettingItem";
import ThemeSelectModal from "../components/screens/Settings/Modals/ThemeSelectModal";
import { Header } from "../components/shared/Header";
import { DevelopersModal } from "../components/screens/Settings/Modals/DevelopersModal";
import { CustomAlertModal } from "../components/shared/Modals/CustomAlertModal";
import { getBugReportTemplate } from "../utils/bugReportHelper";
import { useLeaflyStore } from "../store/useLeaflyStore";
import { useFileManagement } from "../hooks/useFileManagment";

export default function SettingsScreen({ navigation }) {
    const version = Constants.expoConfig?.version || "?.?.?";
    const { createStyles } = useTheme();

    const isVibration = useLeaflyStore((state) => state.isVibration);
    const setIsVibration = useLeaflyStore((state) => state.setIsVibration);

    const [isDevModalVisible, setDevModalVisible] = useState(false);
    const [isThemeModalVisible, setThemeModalVisible] = useState(false);

    const { state: fileState, actions: fileActions } = useFileManagement();

    const styles = createStyles(createLocalStyles);

    const handleReportBug = () => {
        const { recipient, subject, body } = getBugReportTemplate();
        Linking.openURL(`mailto:${recipient}?subject=${subject}&body=${encodeURIComponent(body)}`);
    };

    return (
        <View style={styles.safeArea}>
            <Header showBack={false} title="Настройки" />

            <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Персонализация */}
                <Text style={styles.sectionTitle}>Персонализация</Text>
                <View style={styles.card}>
                    <SettingItem
                        icon={Vibrate}
                        label="Вибрация"
                        type="switch"
                        value={isVibration}
                        onValueChange={setIsVibration}
                    />
                    <View style={styles.separator} />

                    <SettingItem
                        icon={Palette}
                        label="Темы"
                        onPress={() => setThemeModalVisible(true)}
                    />
                </View>

                {/* Управление данными */}
                <Text style={styles.sectionTitle}>Управление данными</Text>
                <View style={styles.card}>
                    <SettingItem
                        icon={Upload}
                        label="Экспорт"
                        onPress={fileActions.handleExportCollection}
                    />
                    <View style={styles.separator} />
                    <SettingItem
                        icon={Download}
                        label="Импорт"
                        onPress={fileActions.handleImportCollection}
                    />
                    <View style={styles.separator} />
                    <SettingItem
                        icon={Trash2}
                        label="Сброс данных"
                        onPress={() => navigation.navigate("DataManagement")}
                    />
                </View>

                {/* Поддержка и связь */}
                <Text style={styles.sectionTitle}>Поддержка и связь</Text>
                <View style={styles.card}>
                    <SettingItem icon={Bug} label="Сообщить об ошибке" onPress={handleReportBug} />
                    <View style={styles.separator} />
                    <SettingItem
                        icon={Users}
                        label="О разработчиках"
                        onPress={() => setDevModalVisible(true)}
                    />
                </View>

                {/* Версия приложения */}
                <View style={styles.versionFooter}>
                    <Text style={styles.versionText}>Leafly v{version}</Text>
                    <Text style={styles.buildText}>Сделано с ❤️ к цветочкам</Text>
                </View>
            </ScrollView>

            <CustomAlertModal
                visible={fileState.modalVisible}
                title={fileState.modalConfig.title}
                message={fileState.modalConfig.message}
                buttons={fileState.modalConfig.buttons}
                onClose={fileActions.closeModal}
            />

            <ThemeSelectModal
                visible={isThemeModalVisible}
                onClose={() => setThemeModalVisible(false)}
            />

            <DevelopersModal
                visible={isDevModalVisible}
                onClose={() => setDevModalVisible(false)}
            />
        </View>
    );
}

const createLocalStyles = (theme) => {
    return StyleSheet.create({
        safeArea: {
            flex: 1,
            paddingTop: 22.5,
            paddingBottom: 60,
            paddingHorizontal: 20,
            backgroundColor: theme.main,
        },
        content: {
            flex: 1,
        },
        scrollContent: {
            paddingBottom: 40,
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
        versionFooter: {
            marginVertical: 20,
            alignItems: "center",
        },
        versionText: {
            color: theme.accentMuted,
            fontSize: 13,
            fontWeight: "600",
        },
        buildText: {
            color: theme.accentMuted,
            fontSize: 11,
            marginTop: 4,
        },
    });
};
