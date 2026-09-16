import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
} from "react-native";
import { Mail, Lock } from "lucide-react-native";
import { useTheme } from "../../../hooks/useTheme";

export default function AuthView({ onLogin, isLoading }) {
    const { theme, createStyles } = useTheme();
    const styles = createStyles(createLocalStyles);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    return (
        <View style={styles.authContainer}>
            <View style={styles.authCard}>
                <Text style={styles.authTitle}>Авторизация</Text>
                <Text style={styles.authSubtitle}>Войдите под учётной записью ДГТУ</Text>

                <View style={styles.inputContainer}>
                    <Mail size={18} color={theme.accent} style={styles.inputIcon} />
                    <TextInput
                        style={[styles.input, { color: theme.text }]}
                        placeholder="Email / Логин"
                        placeholderTextColor={theme.textDark}
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Lock size={18} color={theme.accent} style={styles.inputIcon} />
                    <TextInput
                        style={[styles.input, { color: theme.text }]}
                        placeholder="Пароль"
                        placeholderTextColor={theme.textDark}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                </View>

                <TouchableOpacity
                    style={[styles.button, isLoading && { opacity: 0.7 }]}
                    onPress={() => onLogin(email, password)}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color={theme.text} />
                    ) : (
                        <Text style={styles.buttonText}>Войти</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const createLocalStyles = (theme) =>
    StyleSheet.create({
        authContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: theme.dark,
            marginBottom: 300,
            padding: 20,
        },
        authCard: {
            width: "100%",
            maxWidth: 400,
            alignItems: "center",
            backgroundColor: theme.main,
            borderRadius: 24,
            padding: 24,
            elevation: 5,
        },
        authTitle: {
            fontSize: 24,
            fontWeight: "bold",
            color: theme.text,
            marginBottom: 6,
        },
        authSubtitle: {
            fontSize: 14,
            color: theme.accent,
            marginBottom: 24,
        },
        inputContainer: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: theme.dark,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.accentMuted,
            marginBottom: 16,
            paddingHorizontal: 14,
            height: 50,
        },
        inputIcon: {
            marginRight: 10,
        },
        input: {
            flex: 1,
            fontSize: 15,
            height: "100%",
        },
        button: {
            width: "100%",
            marginTop: 8,
            height: 50,
            borderRadius: 12,
            backgroundColor: theme.accent,
            justifyContent: "center",
            alignItems: "center",
        },
        buttonText: {
            fontWeight: "600",
            fontSize: 16,
            color: theme.text,
        },
    });
