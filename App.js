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
import { BirthdayEffect } from "./components/effects/BirthdayEffect";
import { useSchedlyStore } from "./store/useSchedlyStore";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const PassStack = createStackNavigator();
const HomeStack = createStackNavigator();
const ProfileStack = createStackNavigator();

const FALLBACK_MAIN_COLOR = "#000000";

const getBirthdayMonthAndDay = (birthday) => {
    if (typeof birthday !== "string") return null;

    const isoDate = birthday.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    const localizedDate = birthday.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})/);
    const match = isoDate || localizedDate;
    if (!match) return null;

    const year = Number(match[isoDate ? 1 : 3]);
    const month = Number(match[2]);
    const day = Number(isoDate ? match[3] : match[1]);
    const date = new Date(year, month - 1, day);

    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
        return null;
    }

    return { month: month - 1, day };
};

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
    const token = useSchedlyStore((state) => state.token);
    const birthday = useSchedlyStore((state) => state.userInfo?.birthday);
    const [currentDate, setCurrentDate] = useState(() => new Date());
    const currentMonth = currentDate.getMonth();
    const birthdayMonthAndDay = getBirthdayMonthAndDay(birthday);
    const isBirthday =
        Boolean(token) &&
        birthdayMonthAndDay?.month === currentDate.getMonth() &&
        birthdayMonthAndDay?.day === currentDate.getDate();
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
                setCurrentDate(new Date());
                configureNavBar();
            }
        });

        return () => {
            subscription.remove();
            appStateSubscription.remove();
            if (hideTimer) clearTimeout(hideTimer);
        };
    }, []);

    useEffect(() => {
        let midnightTimeout;
        const scheduleDateRefresh = () => {
            const now = new Date();
            const nextMidnight = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate() + 1,
            ).getTime();

            midnightTimeout = setTimeout(
                () => {
                    setCurrentDate(new Date());
                    scheduleDateRefresh();
                },
                nextMidnight - now.getTime() + 100,
            );
        };

        scheduleDateRefresh();
        return () => clearTimeout(midnightTimeout);
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

                {!isBirthday &&
                    (showSeasonalEffects && showSecretEffect ? (
                        <SecretEffect />
                    ) : (
                        showSeasonalEffects && SeasonalEffect && <SeasonalEffect />
                    ))}
                {isBirthday && <BirthdayEffect />}
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
