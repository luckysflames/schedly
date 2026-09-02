import React, { useState } from "react";
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, StyleSheet } from "react-native";
import {
    Calendar,
    BookOpen,
    Building2,
    MapPin,
    Hash,
    Globe,
    Mail,
    Phone,
    Award,
} from "lucide-react-native";

import { useTheme } from "../hooks/useTheme";
import { useSchedlyStore } from "../store/useSchedlyStore";
import { loginUser, fetchUserInfo, fetchStudentCard } from "../utils/api";
import AuthView from "../components/screens/Profile/AuthView";
import ProfileHeader from "../components/screens/Profile/ProfileHeader";
import InfoCard from "../components/screens/Profile/InfoCard";
import { CustomToast } from "../components/shared/Modals/CustomToast";
import StudentCardModal from "../components/screens/Profile/Modals/StudentCardModal";

export default function ProfileScreen({ navigation }) {
    const { theme, createStyles } = useTheme();
    const styles = createStyles(createLocalStyles);

    const { token, userInfo, studentCard, isAuthLoading, login, refreshUserInfo } =
        useSchedlyStore();
    const [refreshing, setRefreshing] = useState(false);
    const [isCardModalVisible, setIsCardModalVisible] = useState(false);

    const [toastConfig, setToastConfig] = useState({ visible: false, message: "" });

    const showCopyToast = (label, value) => {
        setToastConfig({
            visible: true,
            message: `Скопировано "${label}"`,
        });
    };

    const handleLoginPress = async (email, password) => {
        if (!email || !password) return;
        await login(email, password, loginUser, fetchUserInfo, fetchStudentCard);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await refreshUserInfo(fetchUserInfo, fetchStudentCard);
        setRefreshing(false);
    };

    if (!token || !userInfo) {
        return (
            <AuthView
                theme={theme}
                styles={styles}
                onLogin={handleLoginPress}
                isLoading={isAuthLoading}
            />
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: theme.dark }}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        progressBackgroundColor={theme.main}
                        colors={[theme.accentMuted, theme.accent]}
                    />
                }
            >
                <ProfileHeader
                    userInfo={userInfo}
                    onSettingsPress={() => navigation.navigate("SettingsScreen")}
                />

                <TouchableOpacity
                    style={styles.studentCardButton}
                    onPress={() => setIsCardModalVisible(true)}
                >
                    <Award size={20} color={theme.accent} />
                    <Text style={styles.studentCardButtonText}>Студенческий билет</Text>
                </TouchableOpacity>

                <Text style={styles.sectionTitle}>Личные данные</Text>
                <View style={styles.gridContainer}>
                    <InfoCard
                        icon={<Mail size={18} color={theme.accent} />}
                        label="Email"
                        value={userInfo.email}
                        fullWidth
                        onCopy={showCopyToast}
                    />
                    <InfoCard
                        icon={<Phone size={18} color={theme.accent} />}
                        label="Телефон"
                        value={userInfo.numberMobile}
                        onCopy={showCopyToast}
                    />
                    <InfoCard
                        icon={<Calendar size={18} color={theme.accent} />}
                        label="Дата рождения"
                        value={userInfo.birthday}
                        onCopy={showCopyToast}
                    />
                    <InfoCard
                        icon={<Globe size={18} color={theme.accent} />}
                        label="Гражданство"
                        value={userInfo.nationality}
                        onCopy={showCopyToast}
                    />
                    <InfoCard
                        icon={<Hash size={18} color={theme.accent} />}
                        label="Зачетная книжка"
                        value={userInfo.numRecordBook}
                        onCopy={showCopyToast}
                    />
                </View>

                <Text style={styles.sectionTitle}>Университет</Text>
                <View style={styles.gridContainer}>
                    <InfoCard
                        icon={<BookOpen size={18} color={theme.accent} />}
                        label="Факультет"
                        value={userInfo.facul?.faculName || "Не указан"}
                        fullWidth
                        onCopy={showCopyToast}
                    />
                    <InfoCard
                        icon={<Building2 size={18} color={theme.accent} />}
                        label="Кафедра"
                        value={userInfo.kaf?.kafName}
                        fullWidth
                        onCopy={showCopyToast}
                    />
                    <InfoCard
                        icon={<MapPin size={18} color={theme.accent} />}
                        label="Ауд. деканата"
                        value={userInfo.facul?.aud}
                        onCopy={showCopyToast}
                    />
                    <InfoCard
                        icon={<Phone size={18} color={theme.accent} />}
                        label="Тел. деканата"
                        value={userInfo.facul?.phone}
                        onCopy={showCopyToast}
                    />
                    <InfoCard
                        icon={<MapPin size={18} color={theme.accent} />}
                        label="Ауд. кафедры"
                        value={userInfo.kaf?.aud}
                        fullWidth
                        onCopy={showCopyToast}
                    />
                </View>
            </ScrollView>

            <StudentCardModal
                visible={isCardModalVisible}
                onClose={() => setIsCardModalVisible(false)}
                cardData={studentCard}
                theme={theme}
            />

            <CustomToast
                visible={toastConfig.visible}
                message={toastConfig.message}
                type="copy"
                onHide={() => setToastConfig((prev) => ({ ...prev, visible: false }))}
            />
        </View>
    );
}

const createLocalStyles = (theme) =>
    StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.dark },
        contentContainer: { padding: 16, paddingBottom: 80 },
        sectionTitle: {
            fontSize: 13,
            fontWeight: "700",
            marginBottom: 10,
            marginLeft: 6,
            textTransform: "uppercase",
            letterSpacing: 0.8,
            color: theme.accent,
        },
        gridContainer: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 20,
        },
        studentCardButton: {
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            padding: 16,
            borderRadius: 16,
            marginBottom: 20,
            backgroundColor: theme.main,
        },
        studentCardButtonText: {
            fontSize: 15,
            fontWeight: "600",
            color: theme.text,
        },
    });
