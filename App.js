// App.js
import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import { StyleSheet, AppState } from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";

import MyCustomTabBar from "./components/layout/TabBar/MyCustomTabBar";
import MainScreen from "./screens/MainScreen";
// import SettingsScreen from "./screens/SettingsScreen";
// import DataManagementScreen from "./screens/DataManagmentScreen";

import { useTheme } from "./hooks/useTheme";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const HomeStack = createStackNavigator();
// const SettingsStack = createStackNavigator();

const FALLBACK_MAIN_COLOR = "#132a22";

function HomeStackNavigator() {
    return (
        <HomeStack.Navigator screenOptions={{ headerShown: false }}>
            <HomeStack.Screen name="MainScreen" component={MainScreen} />
        </HomeStack.Navigator>
    );
}

/* 
// Закомментировано до реализации экранов настроек
function SettingsStackNavigator() {
    return (
        <SettingsStack.Navigator screenOptions={{ headerShown: false }}>
            <SettingsStack.Screen name="SettingsScreen" component={SettingsScreen} />
            <SettingsStack.Screen name="DataManagement" component={DataManagementScreen} />
        </SettingsStack.Navigator>
    );
}
*/

function HomeTabs() {
    return (
        <Tab.Navigator
            tabBar={(props) => <MyCustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
                animation: "fade",
            }}
        >
            <Tab.Screen name="Home" component={HomeStackNavigator} />

            {/* Временная заглушка для вкладки настроек, чтобы не ломать навигацию */}
            <Tab.Screen name="Settings" component={HomeStackNavigator} />
        </Tab.Navigator>
    );
}

export default function App() {
    const { theme } = useTheme();

    const currentMainColor = theme?.dark || FALLBACK_MAIN_COLOR;
    const currentAccentColor = theme?.accent || "#ffffff";

    const AppTheme = {
        ...DefaultTheme,
        colors: {
            ...DefaultTheme.colors,
            background: currentMainColor,
            card: currentMainColor,
            primary: currentAccentColor,
            text: currentAccentColor,
            border: currentAccentColor,
        },
    };

    const screenOptions = {
        headerShown: false,
        cardStyle: { backgroundColor: currentMainColor },
        animationEnabled: true,
        gestureEnabled: true,
    };

    useEffect(() => {
        const hideNavBar = async () => {
            try {
                await NavigationBar.setVisibilityAsync("hidden");
            } catch (e) {
                console.log(e);
            }
        };

        hideNavBar();

        const subscription = AppState.addEventListener("change", (nextAppState) => {
            if (nextAppState === "active") {
                hideNavBar();
            }
        });

        return () => {
            subscription.remove();
        };
    }, []);

    return (
        <SafeAreaProvider style={{ backgroundColor: currentMainColor }}>
            <SafeAreaView
                style={[styles.container, { backgroundColor: currentMainColor }]}
                edges={["top"]}
            >
                <NavigationContainer theme={AppTheme}>
                    <StatusBar style="light" backgroundColor={currentMainColor} />
                    <Stack.Navigator screenOptions={screenOptions}>
                        <Stack.Screen name="MainTabs" component={HomeTabs} />
                    </Stack.Navigator>
                </NavigationContainer>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
