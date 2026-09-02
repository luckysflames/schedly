import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    ScrollView,
    RefreshControl,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { QrCode, RefreshCw, Info } from "lucide-react-native";
import { useTheme } from "../hooks/useTheme";
import { useSchedlyStore } from "../store/useSchedlyStore";
import { fetchPassData } from "../utils/api";

export default function PassScreen() {
    const { theme, createStyles } = useTheme();
    const styles = createStyles(createLocalStyles);
    const token = useSchedlyStore((state) => state.token);

    const [qrData, setQrData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const loadPass = async (isRefresh = false) => {
        if (!token) {
            setError("Требуется авторизация");
            setIsLoading(false);
            setIsRefreshing(false);
            return;
        }

        if (isRefresh) {
            setIsRefreshing(true);
        } else {
            setIsLoading(true);
        }
        setError(null);

        try {
            const data = await fetchPassData(token);
            if (data) {
                setQrData(String(data));
            } else {
                setError("Не удалось получить данные пропуска");
            }
        } catch (e) {
            setError(e.message || "Ошибка загрузки");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        loadPass(true);
    }, [token]);

    useEffect(() => {
        loadPass();
    }, [token]);

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            refreshControl={
                <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={onRefresh}
                    progressBackgroundColor={theme.main}
                    colors={[theme.accentMuted, theme.accent]}
                />
            }
        >
            <View style={styles.infoBanner}>
                <Info size={20} color={theme.accent} style={styles.infoIcon} />
                <Text style={styles.infoText}>
                    Проход по QR-коду доступен только через 1, 8, 21 и 25 корпуса.
                </Text>
            </View>

            <View style={styles.card}>
                {isLoading && !isRefreshing ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color={theme.accent} />
                        <Text style={styles.subText}>Генерация пропуска...</Text>
                    </View>
                ) : error ? (
                    <View style={styles.centerContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity
                            style={styles.retryButton}
                            onPress={() => loadPass(false)}
                        >
                            <RefreshCw size={16} color={theme.textDark || theme.text} />
                            <Text style={styles.retryButtonText}>Повторить</Text>
                        </TouchableOpacity>
                    </View>
                ) : qrData ? (
                    <View style={styles.centerContainer}>
                        <View style={styles.qrWrapper}>
                            <QRCode
                                value={qrData}
                                size={220}
                                color="#000000"
                                backgroundColor="#FFFFFF"
                            />
                        </View>
                        <Text style={styles.subText}>Поднесите экран к считывателю турникета</Text>
                    </View>
                ) : null}
            </View>
        </ScrollView>
    );
}

const createLocalStyles = (theme) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.dark,
        },
        contentContainer: {
            flexGrow: 1,
            padding: 20,
        },
        infoBanner: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: theme.main,
            borderRadius: 16,
            padding: 14,
            marginBottom: 16,
        },
        infoIcon: {
            marginRight: 12,
        },
        infoText: {
            flex: 1,
            fontSize: 13,
            color: theme.text,
            lineHeight: 18,
        },
        header: {
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            marginBottom: 24,
            marginTop: 10,
        },
        headerTitle: {
            fontSize: 20,
            fontWeight: "bold",
            color: theme.text,
        },
        card: {
            flex: 1,
            borderRadius: 25,
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
            marginBottom: 60,
        },
        centerContainer: {
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
        },
        qrWrapper: {
            padding: 16,
            backgroundColor: theme.white,
            borderRadius: 16,
            elevation: 5,
        },
        codeHint: {
            fontSize: 18,
            fontWeight: "600",
            color: theme.text,
            letterSpacing: 2,
        },
        subText: {
            fontSize: 14,
            color: theme.accent,
            textAlign: "center",
        },
        errorText: {
            fontSize: 15,
            color: theme.red,
            textAlign: "center",
            marginBottom: 10,
        },
        retryButton: {
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            backgroundColor: theme.accent,
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 12,
        },
        retryButtonText: {
            color: theme.textDark,
            fontWeight: "600",
            fontSize: 14,
        },
    });
