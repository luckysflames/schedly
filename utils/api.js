const BASE_URL = "https://edu.donstu.ru/api";

export const fetchGroupList = async (year = "2026-2027") => {
    try {
        const response = await fetch(`${BASE_URL}/raspGrouplist?year=${year}`);
        const json = await response.json();
        // Обычно в API ДГТУ данные лежат в поле .data
        if (json.state === 1 || json.data) {
            return json.data;
        }
        throw new Error("Не удалось получить список групп");
    } catch (error) {
        console.error("Error fetching group list:", error);
        return [];
    }
};

export const fetchSchedule = async (idGroup) => {
    try {
        const response = await fetch(`${BASE_URL}/Rasp?idGroup=${idGroup}`);
        const json = await response.json();
        if (json.state === 1 || json.data) {
            // console.log(json.data)
            return json.data; // Здесь содержится расписание, сетка звонков и пар
        }
        throw new Error("Не удалось получить расписание");
    } catch (error) {
        console.error("Error fetching schedule:", error);
        return null;
    }
};
