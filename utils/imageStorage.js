import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";

export const IMAGES_DIR = `${FileSystem.documentDirectory}images/`;
export const LOCAL_IMAGE_TAG = "LOCAL_IMAGE:";
const IMAGE_WIDTH = 720;
const IMAGE_QUALITY = 0.7;

export const ensureImagesDirectoryAsync = async () => {
    const dirInfo = await FileSystem.getInfoAsync(IMAGES_DIR);
    if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(IMAGES_DIR, { intermediates: true });
    }
};

export const isPersistentImageUri = (uri) => typeof uri === "string" && uri.startsWith(IMAGES_DIR);

export const getLocalImageName = (uri) => {
    if (!uri || typeof uri !== "string") return null;
    if (uri.startsWith(LOCAL_IMAGE_TAG)) {
        return uri.slice(LOCAL_IMAGE_TAG.length);
    }
    return uri.split("/").pop();
};

export const getImageFileUri = (fileName) => `${IMAGES_DIR}${fileName}`;

export const savePersistentImageAsync = async (sourceUri) => {
    if (!sourceUri) return null;

    if (isPersistentImageUri(sourceUri)) return sourceUri;

    await ensureImagesDirectoryAsync();

    const fileName = `item_${Date.now()}_${Math.floor(Math.random() * 10000)}.jpg`;
    const destinationUri = getImageFileUri(fileName);

    const result = await ImageManipulator.manipulateAsync(
        sourceUri,
        [{ resize: { width: IMAGE_WIDTH } }],
        { compress: IMAGE_QUALITY, format: ImageManipulator.SaveFormat.JPEG },
    );

    await FileSystem.moveAsync({
        from: result.uri,
        to: destinationUri,
    });

    return destinationUri;
};

export const deletePersistentImageAsync = async (uri) => {
    if (!isPersistentImageUri(uri)) return;
    try {
        const info = await FileSystem.getInfoAsync(uri);
        if (info.exists) {
            await FileSystem.deleteAsync(uri, { idempotent: true });
        }
    } catch (error) {
        console.warn("Failed to delete persistent image:", error);
    }
};

/**
 * Готовит список растений к экспорту: локальные пути переводит в LOCAL_IMAGE:filename.jpg
 * и собирает массив абсолютных путей файлов для упаковки в ZIP.
 */
export const prepareItemsForExport = async (items) => {
    const imagesToCopy = [];
    const preparedItems = [];

    for (const item of items) {
        let uri = item.photoUri;

        if (uri && !isPersistentImageUri(uri)) {
            try {
                const persistentUri = await savePersistentImageAsync(uri);
                if (persistentUri) {
                    uri = persistentUri;
                } else {
                    uri = null;
                }
            } catch (error) {
                console.warn("Failed to persist item image for export:", uri, error);
                uri = null;
            }
        }

        if (isPersistentImageUri(uri)) {
            const fileName = getLocalImageName(uri);
            if (fileName) {
                imagesToCopy.push({
                    fullUri: uri,
                    fileName,
                });
                uri = `${LOCAL_IMAGE_TAG}${fileName}`;
            }
        }

        preparedItems.push({
            ...item,
            photoUri: uri,
        });
    }

    return { preparedItems, imagesToCopy };
};

/**
 * Перемещает распакованные изображения из временной папки в рабочую IMAGES_DIR
 * и восстанавливает реальные URI внутри массива растений.
 */
export const restoreItemsImagesAfterImport = async (incomingItems, tempImagesDir) => {
    await ensureImagesDirectoryAsync();
    const restoredMap = new Map();

    const tempDirInfo = await FileSystem.getInfoAsync(tempImagesDir);
    if (tempDirInfo.exists) {
        const files = await FileSystem.readDirectoryAsync(tempImagesDir);

        for (const fileName of files) {
            const from = `${tempImagesDir}${fileName}`;
            const to = `${IMAGES_DIR}${fileName}`;

            const checkTarget = await FileSystem.getInfoAsync(to);
            if (checkTarget.exists) {
                await FileSystem.deleteAsync(to, { idempotent: true });
            }

            await FileSystem.moveAsync({ from, to });
            restoredMap.set(`${LOCAL_IMAGE_TAG}${fileName}`, to);
        }
    }

    return incomingItems.map((item) => {
        let photoUri = item.photoUri;

        if (typeof photoUri === "string" && photoUri.startsWith(LOCAL_IMAGE_TAG)) {
            photoUri = restoredMap.get(photoUri) || null;
        }

        return {
            ...item,
            photoUri,
        };
    });
};
