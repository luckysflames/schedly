import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { Mail, Lock } from "lucide-react-native";

export default function AuthView({ theme, styles, onLogin, isLoading }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    return (
        <View style={styles.authContainer}>
            <View style={styles.authCard}>
                <Text style={styles.authTitle}>Авторизация</Text>
                <Text style={styles.authSubtitle}>Войдите под учетной записью ДГТУ</Text>

                <View style={styles.inputContainer}>
                    <Mail size={18} color={theme.accent} style={styles.inputIcon} />
                    <TextInput
                        style={[styles.input, { color: theme.text }]}
                        placeholder="Email / Логин"
                        placeholderTextColor={theme.textSecondary || "#888"}
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
                        placeholderTextColor={theme.textSecondary || "#888"}
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
