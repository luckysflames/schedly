import React from "react";
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TextInput,
    FlatList,
    TouchableOpacity,
    Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Search, X } from "lucide-react-native";
import { useTheme } from "../../../../hooks/useTheme";

export const GroupSelectModal = ({
    visible,
    groups,
    searchQuery,
    onSearch,
    onSelectGroup,
    onClose,
}) => {
    const { theme, createStyles } = useTheme();
    const styles = createStyles(createLocalStyles);
    const insets = useSafeAreaInsets();

    const handleClose = () => {
        Keyboard.dismiss();
        onClose();
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
                        backgroundColor: theme.main,
                        paddingTop: Math.max(insets.top, 16),
                        paddingBottom: Math.max(insets.bottom, 16),
                    },
                ]}
            >
                <View style={styles.modalHeader}>
                    <Text style={[styles.modalTitle, { color: theme.white }]}>Выбор группы</Text>
                    <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                        <X size={24} color={theme.accent} />
                    </TouchableOpacity>
                </View>

                <View style={[styles.searchBox, { backgroundColor: theme.dark }]}>
                    <Search size={20} color={theme.accent} />
                    <TextInput
                        style={[styles.searchInput, { color: theme.white }]}
                        placeholder="Например, ИКТм-71"
                        placeholderTextColor={theme.accentMuted}
                        value={searchQuery}
                        onChangeText={onSearch}
                        autoFocus={true}
                    />
                </View>

                <FlatList
                    data={groups}
                    keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.groupItem, { borderBottomColor: theme.dark }]}
                            onPress={() => {
                                Keyboard.dismiss();
                                onSelectGroup(item);
                            }}
                        >
                            <Text style={[styles.groupItemText, { color: theme.white }]}>
                                {item.name || item.title}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>
        </Modal>
    );
};

const createLocalStyles = (theme) =>
    StyleSheet.create({
        modalContainer: {
            flex: 1,
            paddingHorizontal: 20,
        },
        modalHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
            marginTop: 10,
        },
        modalTitle: {
            fontSize: 22,
            fontWeight: "bold",
        },
        closeButton: {
            padding: 4,
        },
        searchBox: {
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 12,
            height: 48,
            borderRadius: 12,
            marginBottom: 16,
            gap: 10,
        },
        searchInput: {
            flex: 1,
            fontSize: 16,
        },
        listContent: {
            paddingBottom: 20,
        },
        groupItem: {
            paddingVertical: 16,
            borderBottomWidth: 1,
        },
        groupItemText: {
            fontSize: 16,
        },
    });
