import React, { useEffect, useState } from "react";
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
import ProfileScreen from "./screens/ProfileScreen";
import PassScreen from "./screens/PassScreen";

import { useTheme } from "./hooks/useTheme";
import { SnowEffect } from "./components/effects/SnowEffect";
import { LeafEffect } from "./components/effects/LeafEffect";
import { SpringEffect } from "./components/effects/SpringEffect";
import { SecretEffect } from "./components/effects/SecretEffect";
import { useSchedlyStore } from "./store/useSchedlyStore";

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
    const showSeasonalEffects = useSchedlyStore((state) => state.showSeasonalEffects);
    const showSecretEffect = useSchedlyStore((state) => state.showSecretEffect);
    const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());
    const SeasonalEffect =
        currentMonth >= 2 && currentMonth <= 4
            ? SpringEffect
            : currentMonth >= 8 && currentMonth <= 10
              ? LeafEffect
              : currentMonth === 11 || currentMonth <= 1
                ? SnowEffect
                : null;

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
        const configureNavBar = async () => {
            try {
                await NavigationBar.setVisibilityAsync("hidden");
            } catch (e) {
                console.log(e);
            }
        };

        configureNavBar();

        let hideTimer = null;
        const subscription = NavigationBar.addVisibilityListener(({ visibility }) => {
            if (visibility === "visible") {
                if (hideTimer) clearTimeout(hideTimer);

                hideTimer = setTimeout(async () => {
                    try {
                        await NavigationBar.setVisibilityAsync("hidden");
                    } catch (e) {
                        console.log(e);
                    }
                }, 3000);
            }
        });

        const appStateSubscription = AppState.addEventListener("change", (nextAppState) => {
            if (nextAppState === "active") {
                setCurrentMonth(new Date().getMonth());
                configureNavBar();
            }
        });

        return () => {
            subscription.remove();
            appStateSubscription.remove();
            if (hideTimer) clearTimeout(hideTimer);
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

                {showSeasonalEffects && showSecretEffect ? (
                    <SecretEffect />
                ) : (
                    showSeasonalEffects && SeasonalEffect && <SeasonalEffect />
                )}
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
