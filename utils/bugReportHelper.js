import * as Device from "expo-device";
import * as Localization from "expo-localization";
import { Dimensions, PixelRatio } from "react-native";
import Constants from "expo-constants";

export const getBugReportTemplate = () => {
    const { width, height } = Dimensions.get("window");
    const dpi = PixelRatio.get() * 160;
    const version = Constants.expoConfig?.version || "3.2.0";

    const techInfo = [
        "=== Technical information:",
        `= App: ${version} (${Constants.expoConfig?.android?.versionCode || "build"})`,
        `= Device: ${Device.brand} ${Device.modelName}`,
        `= Android: ${Device.osVersion} (SDK ${Device.platformApiLevel})`,
        `= Screen: ${Math.round(width)}x${Math.round(height)}px, ${Math.round(dpi)}dpi`,
        `= Processor: ${Device.supportedCpuArchitectures?.join(", ") || "unknown"}`,
        `= Memory: ${Math.round(Device.totalMemory / 1024 ** 3)} GB total`,
        `= Language: ${Localization.getLocales()[0].languageCode}`,
        "==========================",
    ].join("\n");

    const instruction = [
        "\nИнструкция:",
        "1. Предоставьте максимально подробное описание проблемы;",
        "2. Опишите последовательность действий.",
        "НИЖЕ ВВЕДИТЕ ТЕКСТ СВОЕГО СООБЩЕНИЯ:",
    ].join("\n");

    return {
        body: `${techInfo}\n${instruction}\n\n`,
        subject: `Баг-репорт ${version}`,
        recipient: "denisezakovskij341@gmail.com",
    };
};
