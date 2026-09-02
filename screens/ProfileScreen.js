import React, { useState } from "react";
import { View, Text, ScrollView, RefreshControl } from "react-native";
import {
    Calendar,
    BookOpen,
    Building2,
    MapPin,
    Hash,
    Globe,
    Mail,
    Phone,
} from "lucide-react-native";

import { useTheme } from "../hooks/useTheme";
import { useSchedlyStore } from "../store/useSchedlyStore";
import { loginUser, fetchUserInfo } from "../utils/api";
import AuthView from "../components/screens/Profile/AuthView";
import ProfileHeader from "../components/screens/Profile/ProfileHeader";
import InfoCard from "../components/screens/Profile/InfoCard";
import { CustomToast } from "../components/shared/Modals/CustomToast";

export default function ProfileScreen({ navigation }) {
    const { theme, createStyles } = useTheme();
    const styles = createStyles(createLocalStyles);

    const { token, userInfo, isAuthLoading, login, refreshUserInfo } = useSchedlyStore();
    const [refreshing, setRefreshing] = useState(false);
    
    const [toastConfig, setToastConfig] = useState({ visible: false, message: "" });

    const showCopyToast = (label, value) => {
        setToastConfig({
            visible: true,
            message: `Скопировано "${label}"`,
        });
    };

    const handleLoginPress = async (email, password) => {
        if (!email || !password) return;
        await login(email, password, loginUser, fetchUserInfo);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await refreshUserInfo(fetchUserInfo);
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

            <CustomToast
                visible={toastConfig.visible}
                message={toastConfig.message}
                type="copy"
                onHide={() => setToastConfig((prev) => ({ ...prev, visible: false }))}
            />
        </View>
    );
}

const createLocalStyles = (theme) => ({
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
});