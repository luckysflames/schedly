import { useState } from "react";
import { useNameStore } from "../store/useNameStore";

export function useDataReset() {
    const clearAllItems = useNameStore((state) => state.clearAllItems);
    const resetAllData = useNameStore((state) => state.resetAllData);

    const itemsCount = useNameStore((state) => state.items.length);

    const [modalConfig, setModalConfig] = useState({
        visible: false,
        title: "",
        message: "",
        buttons: [],
    });

    const closeModal = () => setModalConfig((prev) => ({ ...prev, visible: false }));

    const confirmClearItems = () => {
        if (itemsCount === 0) {
            setModalConfig({
                visible: true,
                title: "Удаление items",
                message: "Список items уже пуст.",
                buttons: [{ text: "OK", style: "cancel", onPress: closeModal }],
            });
            return;
        }

        setModalConfig({
            visible: true,
            title: "Удаление items",
            message: `Вы уверены, что хотите удалить все items (${itemsCount} шт.)? Это действие нельзя отменить.`,
            buttons: [
                { text: "Отмена", style: "cancel", onPress: closeModal },
                {
                    text: "Удалить",
                    style: "destructive",
                    onPress: () => {
                        clearAllItems();
                        closeModal();
                    },
                },
            ],
        });
    };

    const confirmResetAll = () => {
        if (itemsCount === 0) {
            setModalConfig({
                visible: true,
                title: "Полный сброс",
                message:
                    "Приложение уже находится в начальном состоянии — данных для удаления нет.",
                buttons: [{ text: "OK", style: "cancel", onPress: closeModal }],
            });
            return;
        }

        setModalConfig({
            visible: true,
            title: "Полный сброс",
            message:
                "Вы действительно хотите удалить ВСЕ данные? Приложение вернется к начальному состоянию.",
            buttons: [
                { text: "Отмена", style: "cancel", onPress: closeModal },
                {
                    text: "Сбросить всё",
                    style: "destructive",
                    onPress: () => {
                        resetAllData();
                        closeModal();
                    },
                },
            ],
        });
    };

    return {
        state: {
            itemsCount,
            modalConfig,
        },
        actions: {
            confirmClearItems,
            confirmResetAll,
            closeModal,
        },
    };
}
