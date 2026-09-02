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
import SettingsScreen from "./screens/SettingsScreen";

import { useTheme } from "./hooks/useTheme";
import ProfileScreen from "./screens/ProfileScreen";
import PassScreen from "./screens/PassScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const PassStack = createStackNavigator();
const HomeStack = createStackNavigator();
const ProfileStack = createStackNavigator();

const FALLBACK_MAIN_COLOR = "#000000";

function PassStackNavigator() {
    return (
        <PassStack.Navigator screenOptions={{ headerShown: false }}>
            <PassStack.Screen name="PassScreen" component={PassScreen} />
        </PassStack.Navigator>
    );
}

function HomeStackNavigator() {
    return (
        <HomeStack.Navigator screenOptions={{ headerShown: false }}>
            <HomeStack.Screen name="MainScreen" component={MainScreen} />
        </HomeStack.Navigator>
    );
}

function ProfileStackNavigator() {
    return (
        <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
            <ProfileStack.Screen name="ProfileScreen" component={ProfileScreen} />
            <ProfileStack.Screen name="SettingsScreen" component={SettingsScreen} />
        </ProfileStack.Navigator>
    );
}

function HomeTabs() {
    return (
        <Tab.Navigator
            initialRouteName="Home"
            tabBar={(props) => <MyCustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tab.Screen name="Pass" component={PassStackNavigator} />
            <Tab.Screen name="Home" component={HomeStackNavigator} />
            <Tab.Screen name="Profile" component={ProfileStackNavigator} />
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
                    <StatusBar style="light" />
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
