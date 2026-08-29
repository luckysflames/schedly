import { useState } from "react";
import * as FileSystem from "expo-file-system/legacy";
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";
import { zip, unzip } from "react-native-zip-archive";
import { useNameStore } from "../store/useNameStore";
import { preparePlantsForExport, restorePlantsImagesAfterImport } from "../utils/imageStorage";

export const useFileManagement = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [modalConfig, setModalConfig] = useState({
        title: "",
        message: "",
        buttons: [],
    });

    const showModal = (title, message, buttons = [{ text: "OK", style: "default" }]) => {
        setModalConfig({ title, message, buttons });
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
    };

    // ==========================================
    // --- ЭКСПОРТ ДАННЫХ В ZIP ---
    // ==========================================
    const handleExportData = async () => {
        const state = useNameStore.getState();
        const items = state.items || [];
        const isVibration = state.isVibration;
        const themeName = state.themeName;

        const tempExportDir = `${FileSystem.cacheDirectory}export_temp_${Date.now()}/`;
        const tempImagesDir = `${tempExportDir}images/`;
        const dateStr = new Date().toISOString().split("T")[0];
        const zipFilePath = `${FileSystem.cacheDirectory}name_backup_${dateStr}.zip`;

        try {
            if (items.length === 0) {
                showModal("Экспорт", "Данные для экспорта отсутствуют.", [
                    { text: "Понятно", style: "default" },
                ]);
                return;
            }

            showModal("Экспорт", "Создание архива и подготовка фотографий...", []);

            await FileSystem.makeDirectoryAsync(tempExportDir, { intermediates: true });
            await FileSystem.makeDirectoryAsync(tempImagesDir, { intermediates: true });

            const { preparedItems, imagesToCopy } = await prepareItemsForExport(items);

            for (const img of imagesToCopy) {
                if (!img?.fullUri || !img?.fileName) continue;
                const targetPath = `${tempImagesDir}${img.fileName}`;
                const fileInfo = await FileSystem.getInfoAsync(img.fullUri);

                if (fileInfo.exists) {
                    await FileSystem.copyAsync({ from: img.fullUri, to: targetPath });
                }
            }

            const backupData = {
                type: "NAME_BACKUP_ZIP",
                version: "1.0",
                exportedAt: new Date().toISOString(),
                payload: {
                    items: preparedItems,
                    settings: {
                        isVibration,
                        themeName,
                    },
                },
            };

            await FileSystem.writeAsStringAsync(
                `${tempExportDir}data.json`,
                JSON.stringify(backupData, null, 2),
            );

            await zip(tempExportDir, zipFilePath);

            closeModal();

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(zipFilePath, {
                    mimeType: "application/zip",
                    dialogTitle: "Сохранить резервную копию Name",
                    UTI: "public.zip-archive",
                });
            }
        } catch (error) {
            console.error("Export Error:", error);
            showModal("Ошибка", "Не удалось создать резервную копию.", [
                { text: "Понятно", style: "default" },
            ]);
        } finally {
            try {
                await FileSystem.deleteAsync(tempExportDir, { idempotent: true });
                await FileSystem.deleteAsync(zipFilePath, { idempotent: true });
            } catch (cleanupErr) {
                console.warn("Cleanup warning:", cleanupErr);
            }
        }
    };

    // ==========================================
    // --- ИМПОРТ ДАННЫХ ИЗ ZIP ---
    // ==========================================
    const handleImportData = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: [
                    "application/zip",
                    "application/x-zip-compressed",
                    "application/octet-stream",
                ],
                copyToCacheDirectory: true,
            });

            if (result.canceled || !result.assets?.[0]?.uri) return;

            const fileUri = result.assets[0].uri;
            const tempUnzipDir = `${FileSystem.cacheDirectory}unzip_temp_${Date.now()}/`;

            await unzip(fileUri, tempUnzipDir);

            const jsonPath = `${tempUnzipDir}data.json`;
            const jsonExists = await FileSystem.getInfoAsync(jsonPath);

            if (!jsonExists.exists) {
                throw new Error("data.json not found in backup archive");
            }

            const jsonString = await FileSystem.readAsStringAsync(jsonPath);
            const backup = JSON.parse(jsonString);

            if (backup.type !== "NAME_BACKUP_ZIP" && backup.type !== "NAME_BACKUP_JSON") {
                throw new Error("Invalid backup format");
            }

            const payload = backup.payload || {};
            const incomingItems = backup.items || {};

            const importData = {
                incomingItems,
                tempUnzipDir,
                fileUri,
                settings: payload.settings,
            };

            const infoClue =
                '\n\n\n• Если Вы выберете "Дополнить", то данные из файла объединятся с Вашими данными\n\n• Если Вы выберете "Заменить", то все Ваши данные будут удалены и заменятся данными из файла';
            const infoMessage = `В файле найдено:\n• Items: ${incomingItems.length}\n\nКак вы хотите поступить с текущими данными?${infoClue}`;

            showModal("Импорт данных", infoMessage, [
                {
                    text: "Дополнить",
                    style: "default",
                    onPress: () => executeMergeImport(importData),
                },
                {
                    text: "Заменить",
                    style: "destructive",
                    onPress: () => executeOverwriteImport(importData),
                },
                {
                    text: "Отмена",
                    style: "cancel",
                    onPress: async () => {
                        await safeDeleteFile(tempUnzipDir);
                        await safeDeleteFile(fileUri);
                    },
                },
            ]);
        } catch (error) {
            console.error("Import Error:", error);
            showModal("Ошибка", "Файл поврежден, пуст или имеет неверный формат бэкапа Name.", [
                { text: "Понятно", style: "default" },
            ]);
        }
    };

    const safeDeleteFile = async (uri) => {
        if (!uri) return;
        try {
            if (uri.startsWith("file://") || uri.startsWith("/")) {
                await FileSystem.deleteAsync(uri, { idempotent: true });
            }
        } catch (e) {
            console.warn("Failed to delete temp file safely:", uri, e);
        }
    };

    // --- Слияние коллекций (Дополнить) ---
    const executeMergeImport = async (data) => {
  
    };

    // --- Перезапись данных (Заменить) ---
    const executeOverwriteImport = async (data) => {
       
    };

    return {
        state: {
            modalVisible,
            modalConfig,
        },
        actions: {
            handleExportData,
            handleImportData,
            closeModal,
        },
    };
};
