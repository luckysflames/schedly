import * as SecureStore from "expo-secure-store";

const BASE_URL = "https://edu.donstu.ru/api";
const SECURE_USERNAME_KEY = "schedly.auth.username";
const SECURE_PASSWORD_KEY = "schedly.auth.password";

let authStateUpdater = null;
let tokenRefreshPromise = null;

const readJsonResponse = async (response) => {
    const body = await response.text();

    try {
        return body ? JSON.parse(body) : {};
    } catch {
        const error = new Error(`Сервер вернул не JSON (HTTP ${response.status})`);
        error.code = "INVALID_RESPONSE";
        error.status = response.status;
        throw error;
    }
};

const isAuthFailureResponse = async (response) => {
    if (response.status === 401 || response.status === 403) return true;

    const contentType = response.headers.get("content-type") || "";
    if (contentType.toLowerCase().includes("text/html")) return true;

    try {
        return (await response.clone().text()).trimStart().startsWith("<");
    } catch {
        return false;
    }
};

export const setAuthStateUpdater = (updater) => {
    authStateUpdater = updater;
};

export const saveAuthCredentials = async (username, password) => {
    await SecureStore.setItemAsync(SECURE_USERNAME_KEY, username);
    await SecureStore.setItemAsync(SECURE_PASSWORD_KEY, password);
};

export const clearAuthCredentials = async () => {
    await Promise.all([
        SecureStore.deleteItemAsync(SECURE_USERNAME_KEY),
        SecureStore.deleteItemAsync(SECURE_PASSWORD_KEY),
    ]);
};

const requestLogin = async (username, password) => {
    const response = await fetch(`${BASE_URL}/tokenauth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });
    const json = await readJsonResponse(response);

    if (!response.ok || json.state !== 1 || !json.data?.data?.accessToken) {
        const error = new Error(json.message || json.msg || "Ошибка авторизации");
        error.code = "AUTH_FAILED";
        throw error;
    }

    return json.data;
};

const refreshExpiredToken = async () => {
    if (!tokenRefreshPromise) {
        tokenRefreshPromise = (async () => {
            const username = await SecureStore.getItemAsync(SECURE_USERNAME_KEY);
            const password = await SecureStore.getItemAsync(SECURE_PASSWORD_KEY);

            if (!username || !password) {
                const error = new Error("Требуется повторная авторизация");
                error.code = "AUTH_REQUIRED";
                throw error;
            }

            try {
                const authData = await requestLogin(username, password);
                const token = authData.data.accessToken;
                const studentID = authData.data.id;
                authStateUpdater?.({ token, studentID });
                return token;
            } catch (error) {
                await clearAuthCredentials();
                authStateUpdater?.(null);
                error.code = "AUTH_REQUIRED";
                throw error;
            }
        })().finally(() => {
            tokenRefreshPromise = null;
        });
    }

    return tokenRefreshPromise;
};

const authorizedFetch = async (url, options = {}, token) => {
    const requestOptions = {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await fetch(url, requestOptions);

    if (!(await isAuthFailureResponse(response))) return response;

    const refreshedToken = await refreshExpiredToken();
    return fetch(url, {
        ...requestOptions,
        headers: { ...requestOptions.headers, Authorization: `Bearer ${refreshedToken}` },
    });
};

/**
 * Авторизация пользователя по логину и паролю для получения токена
 */
export const loginUser = async (username, password) => {
    try {
        return await requestLogin(username, password);
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
        const url = `${BASE_URL}/UserInfo/Student?studentID=${studentID}`;
        const response = token ? await authorizedFetch(url, {}, token) : await fetch(url);

        const json = await readJsonResponse(response);

        if (response.ok && (json.state === 1 || json.data)) {
            return json.data;
        }
        throw new Error(
            json.message || json.msg || "Не удалось получить информацию о пользователе",
        );
    } catch (error) {
        console.error("Error fetching user info:", error);
        return null;
    }
};

export const fetchGroupList = async (year = "2026-2027") => {
    try {
        const response = await fetch(`${BASE_URL}/raspGrouplist?year=${year}`);
        const json = await readJsonResponse(response);
        if (json.state === 1 || json.data) {
            return json.data;
        }
        throw new Error("Не удалось получить список групп");
    } catch (error) {
        console.error("Error fetching group list:", error);
        return null;
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

        const json = await readJsonResponse(response);
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

/**
 * Получение списка преподавателей для указанного учебного года
 */
export const fetchTeacherList = async (year = "2026-2027") => {
    try {
        const response = await fetch(`${BASE_URL}/raspTeacherlist?year=${year}`);
        const json = await readJsonResponse(response);
        if (json.state === 1 || json.data) {
            return json.data;
        }
        throw new Error("Не удалось получить список преподавателей");
    } catch (error) {
        console.error("Error fetching teacher list:", error);
        return null;
    }
};

/**
 * Получение доступных дат расписания преподавателя по его ID
 * Возвращает объект с массивом дат, minDate, maxDate и selDate
 */
export const fetchTeacherScheduleDates = async (idTeacher) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
        const response = await fetch(`${BASE_URL}/GetRaspDates?idTeacher=${idTeacher}`, {
            signal: controller.signal,
        });

        if (!response.ok) {
            const error = new Error(`Ошибка сервера: ${response.status}`);
            error.code = "SERVER_ERROR";
            throw error;
        }

        const json = await readJsonResponse(response);
        if (json.state === 1 || json.data) {
            return json.data; // Содержит { dates, maxDate, minDate, selDate }
        }
        throw new Error("Не удалось получить даты расписания преподавателя");
    } catch (error) {
        console.error("Error fetching teacher schedule dates:", error);
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

/**
 * Получение расписания преподавателя на конкретную дату
 */
export const fetchTeacherScheduleByDate = async (idTeacher, sdate) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
        const response = await fetch(`${BASE_URL}/Rasp?idTeacher=${idTeacher}&sdate=${sdate}`, {
            signal: controller.signal,
        });

        if (!response.ok) {
            const error = new Error(`Ошибка сервера: ${response.status}`);
            error.code = "SERVER_ERROR";
            throw error;
        }

        const json = await readJsonResponse(response);
        if (json.state === 1 || json.data) {
            return json.data;
        }
        throw new Error("Не удалось получить расписание преподавателя");
    } catch (error) {
        console.error("Error fetching teacher schedule:", error);
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
        const response = await authorizedFetch(
            `${BASE_URL}/UserInfo/PassGeneration`,
            {
                method: "GET",
            },
            token,
        );
        const json = await response.json();
        if (response.ok && json.state === 1) {
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
        const response = await authorizedFetch(
            `${BASE_URL}/Students/Card`,
            {
                method: "GET",
            },
            token,
        );
        const json = await response.json();
        if (response.ok && (json.state === 1 || json.data)) {
            return json.data;
        }
        throw new Error(json.msg || "Не удалось получить данные студенческого билета");
    } catch (error) {
        console.error("Error fetching student card:", error);
        return null;
    }
};
