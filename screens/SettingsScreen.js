import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Linking, TouchableOpacity } from "react-native";
import { Bug, Palette, Users, LogOut } from "lucide-react-native";
import Constants from "expo-constants";

import { useSchedlyStore } from "../store/useSchedlyStore";
import { useTheme } from "../hooks/useTheme";
import { getBugReportTemplate } from "../utils/bugReportHelper";

import { Header } from "../components/shared/Header";
import { SettingItem } from "../components/screens/Settings/SettingItem";
import ThemeSelectModal from "../components/screens/Settings/Modals/ThemeSelectModal";
import { DevelopersModal } from "../components/screens/Settings/Modals/DevelopersModal";

export default function SettingsScreen({ navigation }) {
    const version = Constants.expoConfig?.version || "?.?.?";
    const { theme, createStyles } = useTheme();
    const styles = createStyles(createLocalStyles);

    const logout = useSchedlyStore((state) => state.logout);
    const token = useSchedlyStore((state) => state.token);

    const [isDevModalVisible, setDevModalVisible] = useState(false);
    const [isThemeModalVisible, setThemeModalVisible] = useState(false);

    const handleReportBug = () => {
        const { recipient, subject, body } = getBugReportTemplate();
        Linking.openURL(`mailto:${recipient}?subject=${subject}&body=${encodeURIComponent(body)}`);
    };

    const handleLogout = () => {
        logout();
        navigation.reset({
            index: 0,
            routes: [{ name: "ProfileScreen" }],
        });
    };

    return (
        <View style={styles.safeArea}>
            <Header title="Настройки" onBack={() => navigation.goBack()} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
            >
                <Text style={styles.sectionTitle}>Персонализация</Text>
                <SettingItem
                    icon={Palette}
                    label="Темы оформления"
                    onPress={() => setThemeModalVisible(true)}
                />

                <Text style={styles.sectionTitle}>Поддержка и связь</Text>
                <SettingItem icon={Bug} label="Сообщить об ошибке" onPress={handleReportBug} />
                <SettingItem
                    icon={Users}
                    label="О разработчиках"
                    onPress={() => setDevModalVisible(true)}
                />

                {token && (
                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={handleLogout}
                        activeOpacity={0.7}
                    >
                        <LogOut size={18} color={theme.red} />
                        <Text style={styles.logoutButtonText}>Выйти из аккаунта</Text>
                    </TouchableOpacity>
                )}

                <View style={styles.versionFooter}>
                    <Text style={styles.versionText}>Schedly v{version}</Text>
                    <Text style={styles.buildText}>Сделано с ❤️ к прогулам</Text>
                </View>
            </ScrollView>

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
            backgroundColor: theme.dark,
        },
        content: {
            flex: 1,
        },
        scrollContent: {
            padding: 16,
            paddingBottom: 40,
        },
        sectionTitle: {
            fontSize: 13,
            fontWeight: "700",
            marginBottom: 10,
            marginTop: 6,
            marginLeft: 6,
            textTransform: "uppercase",
            letterSpacing: 0.8,
            color: theme.accent,
        },
        logoutButton: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            backgroundColor: theme.main,
            borderRadius: 16,
            paddingVertical: 14,
            marginTop: 30,
            marginBottom: 20,
        },
        logoutButtonText: {
            color: theme.red,
            fontSize: 14,
            fontWeight: "600",
        },
        versionFooter: {
            marginVertical: 10,
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
