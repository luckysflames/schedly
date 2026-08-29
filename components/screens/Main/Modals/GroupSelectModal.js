// src/components/MainScreen/GroupSelectModal.jsx
import React from "react";
import { View, Text, Modal, TouchableOpacity, TextInput, FlatList, StyleSheet } from "react-native";
import { Search } from "lucide-react-native";
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

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <View style={[styles.modalContainer, { backgroundColor: theme.main }]}>
                <View style={styles.modalHeader}>
                    <Text style={[styles.modalTitle, { color: theme.white }]}>Выбор группы</Text>
                    <TouchableOpacity onPress={onClose}>
                        <Text style={{ color: theme.accent, fontSize: 16, fontWeight: "600" }}>
                            Готово
                        </Text>
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
                    />
                </View>

                <FlatList
                    data={groups}
                    keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.groupItem, { borderBottomColor: theme.dark }]}
                            onPress={() => onSelectGroup(item)}
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
        modalContainer: { flex: 1, padding: 20 },
        modalHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 15,
        },
        modalTitle: { fontSize: 20, fontWeight: "bold" },
        searchBox: {
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 12,
            height: 46,
            borderRadius: 12,
            marginBottom: 15,
            gap: 10,
        },
        searchInput: { flex: 1, fontSize: 16 },
        groupItem: { paddingVertical: 14, borderBottomWidth: 1 },
        groupItemText: { fontSize: 16 },
    });
