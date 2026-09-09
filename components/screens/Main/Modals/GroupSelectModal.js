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
                        paddingTop: Math.max(insets.top, 16),
                        paddingBottom: Math.max(insets.bottom, 16),
                    },
                ]}
            >
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Выбор группы</Text>
                    <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                        <X size={24} color={theme.accent} />
                    </TouchableOpacity>
                </View>

                <View style={styles.searchBox}>
                    <Search size={20} color={theme.accent} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Например, МПИ11"
                        placeholderTextColor={theme.accentMuted}
                        value={searchQuery}
                        onChangeText={onSearch}
                        autoFocus={true}
                    />
                    {searchQuery ? (
                        <TouchableOpacity onPress={() => onSearch("")} style={styles.clearButton}>
                            <X size={18} color={theme.accent} />
                        </TouchableOpacity>
                    ) : null}
                </View>

                <FlatList
                    data={groups}
                    keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.groupItem}
                            onPress={() => {
                                Keyboard.dismiss();
                                onSelectGroup(item);
                            }}
                        >
                            <Text style={styles.groupItemText}>{item.name || item.title}</Text>
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
            backgroundColor: theme.main,
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
            color: theme.white,
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
            paddingBottom: 20,
        },
        groupItem: {
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.dark,
        },
        groupItemText: {
            fontSize: 16,
            color: theme.white,
        },
    });
