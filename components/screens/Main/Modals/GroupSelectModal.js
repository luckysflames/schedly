import React, { useDeferredValue, useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TextInput,
    FlatList,
    TouchableOpacity,
    Keyboard,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, GitCompare, Search, Star, User, Users, X } from "lucide-react-native";
import { useTheme } from "../../../../hooks/useTheme";

const PAGE_SIZE = 40;

export const GroupSelectModal = ({
    visible,
    loadGroupsPage,
    loadTeachersPage,
    excludedGroupKey,
    onRefreshGroups,
    onRefreshTeachers,
    favoriteGroups,
    favoriteTeachers = [],
    searchQuery,
    teacherSearchQuery = "",
    onSearch,
    onTeacherSearch,
    onSelectGroup,
    onSelectTeacher,
    onToggleFavorite,
    onToggleFavoriteTeacher,
    onClose,
    canCompare = false,
    comparisonMode = false,
    onCompare,
    title = "Выбор группы",
}) => {
    const { theme, createStyles } = useTheme();
    const styles = createStyles(createLocalStyles);
    const insets = useSafeAreaInsets();

    // Состояние переключения между группами и преподавателями
    const [activeTab, setActiveTab] = useState("groups"); // "groups" | "teachers"
    const [isSwitchingMode, setIsSwitchingMode] = useState(false);
    const [refreshingGroups, setRefreshingGroups] = useState(false);
    const [refreshingTeachers, setRefreshingTeachers] = useState(false);
    const [groupItems, setGroupItems] = useState([]);
    const [teacherItems, setTeacherItems] = useState([]);
    const [groupLoading, setGroupLoading] = useState(false);
    const [teacherLoading, setTeacherLoading] = useState(false);
    const [groupHasMore, setGroupHasMore] = useState(false);
    const [teacherHasMore, setTeacherHasMore] = useState(false);
    const [groupError, setGroupError] = useState(false);
    const [teacherError, setTeacherError] = useState(false);
    const deferredGroupQuery = useDeferredValue(searchQuery);
    const deferredTeacherQuery = useDeferredValue(teacherSearchQuery);
    const requestSequence = useRef(0);
    const groupLoadingRef = useRef(false);
    const teacherLoadingRef = useRef(false);

    // Динамический заголовок в зависимости от активной вкладки
        const currentTitle = comparisonMode
                ? title
                : activeTab === "teachers"
                    ? "Выбор преподавателя"
                    : title;

    const getTeacherId = (teacher) =>
        teacher?.id ??
        teacher?.idTeacher ??
        teacher?.teacherId ??
        teacher?.teacherID ??
        teacher?.кодПреподавателя ??
        teacher?.код;
    const getTeacherName = (teacher) =>
        teacher?.name ?? teacher?.title ?? teacher?.fio ?? teacher?.ФИО ?? teacher?.teacher ?? "";

    useEffect(() => {
        if (!visible) return undefined;

        let isCurrent = true;
        const sequence = ++requestSequence.current;
        const isGroupTab = activeTab === "groups";
        const loadPage = isGroupTab ? loadGroupsPage : loadTeachersPage;
        const query = isGroupTab ? deferredGroupQuery : deferredTeacherQuery;

        if (isGroupTab) {
            setGroupItems([]);
            setGroupHasMore(false);
            setGroupError(false);
            setGroupLoading(true);
            groupLoadingRef.current = true;
        } else {
            setTeacherItems([]);
            setTeacherHasMore(false);
            setTeacherError(false);
            setTeacherLoading(true);
            teacherLoadingRef.current = true;
        }

        loadPage(
            query,
            0,
            PAGE_SIZE,
            isGroupTab ? excludedGroupKey : null,
        )
            .then((page) => {
                if (!isCurrent || sequence !== requestSequence.current) return;
                if (isGroupTab) {
                    setGroupItems(page.items);
                    setGroupHasMore(page.hasMore);
                } else {
                    setTeacherItems(page.items);
                    setTeacherHasMore(page.hasMore);
                }
            })
            .catch((error) => {
                console.error("Offline catalog read error:", error);
                if (!isCurrent || sequence !== requestSequence.current) return;
                if (isGroupTab) setGroupError(true);
                else setTeacherError(true);
            })
            .finally(() => {
                if (!isCurrent || sequence !== requestSequence.current) return;
                if (isGroupTab) {
                    setGroupLoading(false);
                    groupLoadingRef.current = false;
                } else {
                    setTeacherLoading(false);
                    teacherLoadingRef.current = false;
                }
            });

        return () => {
            isCurrent = false;
            if (isGroupTab) groupLoadingRef.current = false;
            else teacherLoadingRef.current = false;
        };
    }, [
        activeTab,
        deferredGroupQuery,
        deferredTeacherQuery,
        excludedGroupKey,
        favoriteGroups,
        favoriteTeachers,
        loadGroupsPage,
        loadTeachersPage,
        visible,
    ]);

    const loadMoreGroups = async () => {
        if (!groupHasMore || groupLoadingRef.current) return;
        const sequence = ++requestSequence.current;
        groupLoadingRef.current = true;
        setGroupLoading(true);
        try {
            const page = await loadGroupsPage(
                deferredGroupQuery,
                groupItems.length,
                PAGE_SIZE,
                excludedGroupKey,
            );
            if (sequence !== requestSequence.current) return;
            setGroupItems((current) => [...current, ...page.items]);
            setGroupHasMore(page.hasMore);
        } catch (error) {
            console.error("Offline group page read error:", error);
            if (sequence === requestSequence.current) setGroupError(true);
        } finally {
            if (sequence === requestSequence.current) {
                groupLoadingRef.current = false;
                setGroupLoading(false);
            }
        }
    };

    const loadMoreTeachers = async () => {
        if (!teacherHasMore || teacherLoadingRef.current) return;
        const sequence = ++requestSequence.current;
        teacherLoadingRef.current = true;
        setTeacherLoading(true);
        try {
            const page = await loadTeachersPage(
                deferredTeacherQuery,
                teacherItems.length,
                PAGE_SIZE,
            );
            if (sequence !== requestSequence.current) return;
            setTeacherItems((current) => [...current, ...page.items]);
            setTeacherHasMore(page.hasMore);
        } catch (error) {
            console.error("Offline teacher page read error:", error);
            if (sequence === requestSequence.current) setTeacherError(true);
        } finally {
            if (sequence === requestSequence.current) {
                teacherLoadingRef.current = false;
                setTeacherLoading(false);
            }
        }
    };
    const isFavorite = (item, isTeacher = false) => {
        const favorites = isTeacher ? favoriteTeachers : favoriteGroups;
        const getKey = isTeacher
            ? (value) => getTeacherId(value) ?? getTeacherName(value)
            : (value) => value.id ?? value.name ?? value.title;
        return favorites.some((favorite) => String(getKey(favorite)) === String(getKey(item)));
    };

    const handleCompare = () => {
        if (isSwitchingMode) return;
        setIsSwitchingMode(true);
        requestAnimationFrame(() => {
            onCompare?.();
            setTimeout(() => setIsSwitchingMode(false), 350);
        });
    };

    const handleClose = () => {
        Keyboard.dismiss();
        onClose();
    };

    const handleRefreshGroups = async () => {
        const sequence = ++requestSequence.current;
        setRefreshingGroups(true);
        try {
            await onRefreshGroups?.();
            if (sequence !== requestSequence.current) return;
            const page = await loadGroupsPage(
                deferredGroupQuery,
                0,
                PAGE_SIZE,
                excludedGroupKey,
            );
            if (sequence !== requestSequence.current) return;
            setGroupItems(page.items);
            setGroupHasMore(page.hasMore);
            setGroupError(false);
        } catch (error) {
            console.error("Offline group refresh error:", error);
            if (sequence === requestSequence.current) setGroupError(true);
        } finally {
            setRefreshingGroups(false);
        }
    };

    const handleRefreshTeachers = async () => {
        const sequence = ++requestSequence.current;
        setRefreshingTeachers(true);
        try {
            await onRefreshTeachers?.();
            if (sequence !== requestSequence.current) return;
            const page = await loadTeachersPage(
                deferredTeacherQuery,
                0,
                PAGE_SIZE,
            );
            if (sequence !== requestSequence.current) return;
            setTeacherItems(page.items);
            setTeacherHasMore(page.hasMore);
            setTeacherError(false);
        } catch (error) {
            console.error("Offline teacher refresh error:", error);
            if (sequence === requestSequence.current) setTeacherError(true);
        } finally {
            setRefreshingTeachers(false);
        }
    };

    const handleGroupSearch = (value) => {
        onSearch(value);
    };

    const handleTeacherSearch = (value) => {
        onTeacherSearch?.(value);
    };

    const renderEmptyCatalogState = ({
        loading,
        error,
        query,
        emptyMessage,
        notFoundMessage,
        refreshing,
        onRefresh,
    }) => {
        if (loading) {
            return (
                <ActivityIndicator
                    style={styles.emptyLoader}
                    size="small"
                    color={theme.accent}
                />
            );
        }

        if (query.trim() && !error) {
            return <Text style={styles.emptyText}>{notFoundMessage}</Text>;
        }

        return (
            <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                    {error ? "Не удалось прочитать сохранённый список" : emptyMessage}
                </Text>
                <TouchableOpacity
                    style={styles.loadCatalogButton}
                    onPress={onRefresh}
                    disabled={refreshing}
                    accessibilityRole="button"
                >
                    {refreshing ? (
                        <ActivityIndicator size="small" color={theme.text} />
                    ) : null}
                    <Text style={styles.loadCatalogButtonText}>
                        {error ? "Повторить загрузку" : "Загрузить список"}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="fullScreen"
            onRequestClose={handleClose}
        >
            <View
                style={[
                    styles.modalContainer,
                    {
                        paddingTop: Math.max(insets.top, 16),
                        paddingBottom: Math.max(insets.bottom, 16),
                    },
                ]}
            >
                {/* Шапка модалки */}
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{currentTitle}</Text>
                    <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                        <X size={24} color={theme.accent} />
                    </TouchableOpacity>
                </View>

                {/* Переключатель режимов: Группы / Преподаватели */}
                <View style={styles.tabsContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === "groups" && styles.activeTab]}
                        onPress={() => {
                            setActiveTab("groups");
                        }}
                        activeOpacity={0.8}
                    >
                        <Users
                            size={16}
                            color={activeTab === "groups" ? theme.white : theme.accentMuted}
                        />
                        <Text
                            style={[styles.tabText, activeTab === "groups" && styles.activeTabText]}
                        >
                            Группы
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tab, activeTab === "teachers" && styles.activeTab]}
                        onPress={() => setActiveTab("teachers")}
                        activeOpacity={0.8}
                    >
                        <User
                            size={16}
                            color={activeTab === "teachers" ? theme.white : theme.accentMuted}
                        />
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === "teachers" && styles.activeTabText,
                            ]}
                        >
                            Преподаватели
                        </Text>
                    </TouchableOpacity>
                </View>

                {canCompare && (
                    <TouchableOpacity
                        style={styles.compareButton}
                        onPress={handleCompare}
                        disabled={isSwitchingMode}
                        activeOpacity={0.8}
                    >
                        {isSwitchingMode ? (
                            <ActivityIndicator size="small" color={theme.accent} />
                        ) : comparisonMode ? (
                            <ArrowLeft size={18} color={theme.text} />
                        ) : (
                            <GitCompare size={18} color={theme.text} />
                        )}
                        <Text style={styles.compareButtonText}>
                            {comparisonMode
                                ? `Вернуться к выбору ${activeTab === "teachers" ? "преподавателя" : "группы"}`
                                : activeTab === "teachers"
                                  ? "Сравнить с преподавателем"
                                  : "Сравнить с другой группой"}
                        </Text>
                    </TouchableOpacity>
                )}

                {/* Поиск в зависимости от активной вкладки */}
                {activeTab === "groups" ? (
                    <>
                        <View style={styles.searchBox}>
                            <Search size={20} color={theme.accent} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Например, МПИ11"
                                placeholderTextColor={theme.accentMuted}
                                value={searchQuery}
                                onChangeText={handleGroupSearch}
                                autoFocus={true}
                            />
                            {searchQuery ? (
                                <TouchableOpacity
                                    onPress={() => handleGroupSearch("")}
                                    style={styles.clearButton}
                                >
                                    <X size={18} color={theme.accent} />
                                </TouchableOpacity>
                            ) : null}
                            {groupLoading && (
                                <ActivityIndicator size="small" color={theme.accent} />
                            )}
                        </View>

                        <FlatList
                                data={groupItems}
                                keyExtractor={(item, index) =>
                                    item.id?.toString() || index.toString()
                                }
                                keyboardShouldPersistTaps="handled"
                                contentContainerStyle={styles.listContent}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={refreshingGroups}
                                        onRefresh={handleRefreshGroups}
                                        progressBackgroundColor={theme.main}
                                        colors={[theme.accentMuted, theme.accent]}
                                    />
                                }
                                onEndReached={() => {
                                    loadMoreGroups();
                                }}
                                onEndReachedThreshold={0.5}
                                ListEmptyComponent={renderEmptyCatalogState({
                                    loading: groupLoading,
                                    error: groupError,
                                    query: searchQuery,
                                    emptyMessage: "Список групп пуст",
                                    notFoundMessage: "Группы не найдены",
                                    refreshing: refreshingGroups,
                                    onRefresh: handleRefreshGroups,
                                })}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.groupItem}
                                        onPress={() => {
                                            Keyboard.dismiss();
                                            onSelectGroup(item);
                                        }}
                                    >
                                        <Text style={styles.groupItemText}>
                                            {item.name || item.title}
                                        </Text>
                                        <TouchableOpacity
                                            style={styles.favoriteButton}
                                            onPress={() => onToggleFavorite(item)}
                                            accessibilityRole="button"
                                            accessibilityLabel={
                                                isFavorite(item)
                                                    ? "Убрать группу из избранного"
                                                    : "Добавить группу в избранное"
                                            }
                                        >
                                            <Star
                                                size={21}
                                                color={theme.accent}
                                                fill={
                                                    isFavorite(item)
                                                        ? theme.accent
                                                        : "transparent"
                                                }
                                            />
                                        </TouchableOpacity>
                                    </TouchableOpacity>
                                )}
                            />
                    </>
                ) : (
                    <>
                        <View style={styles.searchBox}>
                            <Search size={20} color={theme.accent} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="ФИО преподавателя..."
                                placeholderTextColor={theme.accentMuted}
                                value={teacherSearchQuery}
                                onChangeText={handleTeacherSearch}
                                autoFocus={true}
                            />
                            {teacherSearchQuery ? (
                                <TouchableOpacity
                                    onPress={() => handleTeacherSearch("")}
                                    style={styles.clearButton}
                                >
                                    <X size={18} color={theme.accent} />
                                </TouchableOpacity>
                            ) : null}
                            {teacherLoading && (
                                <ActivityIndicator size="small" color={theme.accent} />
                            )}
                        </View>

                        <FlatList
                                data={teacherItems}
                                keyExtractor={(item, index) =>
                                    String(getTeacherId(item) ?? getTeacherName(item) ?? index)
                                }
                                keyboardShouldPersistTaps="handled"
                                contentContainerStyle={styles.listContent}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={refreshingTeachers}
                                        onRefresh={handleRefreshTeachers}
                                        progressBackgroundColor={theme.main}
                                        colors={[theme.accentMuted, theme.accent]}
                                    />
                                }
                                onEndReached={() => {
                                    loadMoreTeachers();
                                }}
                                onEndReachedThreshold={0.5}
                                ListEmptyComponent={renderEmptyCatalogState({
                                    loading: teacherLoading,
                                    error: teacherError,
                                    query: teacherSearchQuery,
                                    emptyMessage: "Список преподавателей пуст",
                                    notFoundMessage: "Преподаватели не найдены",
                                    refreshing: refreshingTeachers,
                                    onRefresh: handleRefreshTeachers,
                                })}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.groupItem}
                                        onPress={() => {
                                            Keyboard.dismiss();
                                            onSelectTeacher(item);
                                        }}
                                    >
                                        <Text style={styles.groupItemText}>
                                            {getTeacherName(item) || "Преподаватель"}
                                        </Text>
                                        <TouchableOpacity
                                            style={styles.favoriteButton}
                                            onPress={() => onToggleFavoriteTeacher(item)}
                                            accessibilityRole="button"
                                            accessibilityLabel={
                                                isFavorite(item, true)
                                                    ? "Убрать преподавателя из избранного"
                                                    : "Добавить преподавателя в избранное"
                                            }
                                        >
                                            <Star
                                                size={21}
                                                color={theme.accent}
                                                fill={
                                                    isFavorite(item, true)
                                                        ? theme.accent
                                                        : "transparent"
                                                }
                                            />
                                        </TouchableOpacity>
                                    </TouchableOpacity>
                                )}
                            />
                    </>
                )}
            </View>
        </Modal>
    );
};

const createLocalStyles = (theme) =>
    StyleSheet.create({
        modalContainer: {
            flex: 1,
            paddingHorizontal: 20,
            backgroundColor: theme.main,
        },
        modalHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
            marginTop: 10,
        },
        modalTitle: {
            fontSize: 22,
            fontWeight: "bold",
            color: theme.white,
        },
        closeButton: {
            padding: 4,
        },
        /* Стили для табов переключения */
        tabsContainer: {
            flexDirection: "row",
            backgroundColor: theme.dark,
            borderRadius: 12,
            padding: 4,
            marginBottom: 12,
        },
        tab: {
            flex: 1,
            flexDirection: "row",
            alignItem: "center",
            justifyContent: "center",
            gap: 8,
            paddingVertical: 10,
            borderRadius: 10,
        },
        activeTab: {
            backgroundColor: theme.accent,
        },
        tabText: {
            color: theme.accentMuted,
            fontSize: 14,
            fontWeight: "600",
        },
        activeTabText: {
            color: theme.white,
        },
        compareButton: {
            minHeight: 44,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            paddingHorizontal: 12,
            marginBottom: 12,
            borderRadius: 10,
            backgroundColor: theme.dark,
            borderWidth: 1,
            borderColor: theme.accent,
        },
        compareButtonText: {
            color: theme.white,
            fontSize: 14,
            fontWeight: "600",
        },
        searchBox: {
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 12,
            height: 48,
            borderRadius: 12,
            marginBottom: 16,
            gap: 10,
            backgroundColor: theme.dark,
        },
        searchInput: {
            flex: 1,
            fontSize: 16,
            color: theme.white,
        },
        clearButton: {
            padding: 4,
        },
        listContent: {
            flexGrow: 1,
            paddingBottom: 20,
        },
        groupItem: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.dark,
        },
        groupItemText: {
            flex: 1,
            fontSize: 16,
            color: theme.white,
        },
        favoriteButton: {
            padding: 6,
            marginLeft: 12,
        },
        emptyText: {
            marginBottom: 16,
            color: theme.accentMuted,
            fontSize: 14,
            textAlign: "center",
        },
        emptyState: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 24,
        },
        loadCatalogButton: {
            minHeight: 48,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            paddingHorizontal: 20,
            borderRadius: 12,
            backgroundColor: theme.accent,
        },
        loadCatalogButtonText: {
            color: theme.text,
            fontSize: 15,
            fontWeight: "600",
        },
        emptyLoader: {
            marginTop: 28,
        },
        listLoader: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
        },
    });
