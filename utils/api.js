const BASE_URL = "https://edu.donstu.ru/api";

/**
 * Авторизация пользователя по логину и паролю для получения токена
 */
export const loginUser = async (username, password) => {
    try {
        const response = await fetch(`${BASE_URL}/tokenauth`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username,
                password,
            }),
        });

        const json = await response.json();

        // Проверяем структуру ответа. Часто токен лежит в json.data или json.data.token
        if (json.state === 1 || json.data) {
            return json.data;
        }
        throw new Error(json.message || "Ошибка авторизации");
    } catch (error) {
        console.error("Error during authentication:", error);
        return null;
    }
};

/**
 * Получение информации о пользователе по studentID (с передачей токена)
 */
export const fetchUserInfo = async (studentID, token = null) => {
    try {
        const headers = {
            "Content-Type": "application/json",
        };

        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(`${BASE_URL}/UserInfo/Student?studentID=${studentID}`, {
            method: "GET",
            headers: headers,
        });

        const json = await response.json();

        if (json.state === 1 || json.data) {
            return json.data;
        }
        throw new Error(json.message || "Не удалось получить информацию о пользователе");
    } catch (error) {
        console.error("Error fetching user info:", error);
        return null;
    }
};

export const fetchGroupList = async (year = "2026-2027") => {
    try {
        const response = await fetch(`${BASE_URL}/raspGrouplist?year=${year}`);
        const json = await response.json();
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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
        const response = await fetch(`${BASE_URL}/Rasp?idGroup=${idGroup}`, {
            signal: controller.signal,
        });

        if (!response.ok) {
            const error = new Error(`Ошибка сервера: ${response.status}`);
            error.code = "SERVER_ERROR";
            throw error;
        }

        const json = await response.json();
        if (json.state === 1 || json.data) {
            return json.data;
        }
        throw new Error("Не удалось получить расписание");
    } catch (error) {
        console.error("Error fetching schedule:", error);
        if (error.name === "AbortError") {
            const timeoutError = new Error("Сервер не ответил вовремя");
            timeoutError.code = "TIMEOUT";
            throw timeoutError;
        }

        if (error instanceof TypeError) {
            error.code = "NETWORK_ERROR";
        }

        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
};

export const fetchPassData = async (token) => {
    try {
        const response = await fetch(`${BASE_URL}/UserInfo/PassGeneration`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
        const json = await response.json();
        if (json.state === 1) {
            return json.data; // Вернет ту самую строку для QR (например, "856")
        }
        throw new Error(json.msg || "Не удалось сгенерировать пропуск");
    } catch (error) {
        console.error("Error fetching pass data:", error);
        return null;
    }
};

/**
 * Получение данных студенческого билета
 */
export const fetchStudentCard = async (token) => {
    try {
        const response = await fetch(`${BASE_URL}/Students/Card`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
        const json = await response.json();
        if (json.state === 1 || json.data) {
            return json.data;
        }
        throw new Error(json.msg || "Не удалось получить данные студенческого билета");
    } catch (error) {
        console.error("Error fetching student card:", error);
        return null;
    }
};
