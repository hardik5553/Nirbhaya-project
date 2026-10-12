// frontend/js/api.js - Centralized API Service Layer

function resolveApiBaseUrl() {
    if (typeof window !== "undefined" && window.getNirbhayaApiBaseUrl) {
        return window.getNirbhayaApiBaseUrl();
    }
    if (typeof window !== "undefined" && window.NIRBHAYA_API_BASE_URL) {
        return window.NIRBHAYA_API_BASE_URL;
    }
    return "";
}

function normalizeApiPath(path) {
    if (!path.startsWith("/")) path = "/" + path;
    if (!path.startsWith("/api/")) {
        path = "/api" + path;
    }
    return path;
}

async function apiRequest(path, options = {}) {
    const baseUrl = resolveApiBaseUrl().replace(/\/+$/, "");
    const fullPath = normalizeApiPath(path);
    const requestOptions = { ...options };
    const headers = new Headers(requestOptions.headers || {});

    if (requestOptions.body && !(requestOptions.body instanceof FormData) && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    requestOptions.headers = headers;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);
    requestOptions.signal = requestOptions.signal || controller.signal;

    try {
        const response = await fetch(`${baseUrl}${fullPath}`, requestOptions);
        const contentType = response.headers.get("content-type") || "";
        const body = contentType.includes("application/json")
            ? await response.json()
            : await response.text();

        if (!response.ok) {
            const message = body && typeof body === "object"
                ? (body.message || body.detail || body.error)
                : body;
            throw new Error(message || `Request failed with status ${response.status}`);
        }

        return body;
    } catch (error) {
        if (controller.signal.aborted) {
            throw new Error("The server took too long to respond. Please try again.");
        }
        if (error instanceof TypeError) {
            throw new Error("Unable to reach the server. Check your connection and try again.");
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
}

function getStoredUser() {
    const rawUser = localStorage.getItem("nirbhaya_user");
    return rawUser ? JSON.parse(rawUser) : null;
}

function getStoredUserId() {
    return localStorage.getItem("nirbhaya_user_id") || getStoredUser()?.userId || null;
}

function storeAuthenticatedUser(user) {
    localStorage.setItem("nirbhaya_user", JSON.stringify(user));
    if (user.userId) localStorage.setItem("nirbhaya_user_id", user.userId);
    if (user.email) {
        localStorage.setItem("nirbhaya_current_user_email", user.email);
        localStorage.setItem("nirbhaya_user_email", user.email);
    }
    if (user.username) localStorage.setItem("nirbhaya_username", user.username);
    if (user.phoneNumber) localStorage.setItem("nirbhaya_userphone", user.phoneNumber);
    if (user.role) localStorage.setItem("nirbhaya_role", user.role);
    if (user.adminToken) localStorage.setItem("nirbhaya_admin_token", user.adminToken);
}

// Category 2 API helpers. Pages use these helpers so contracts stay consistent.
async function uploadEvidenceBytes(userId, bytes, fileName, contentType, userEmail) {
    const query = new URLSearchParams({ userId, fileName });
    if (userEmail) query.set("userEmail", userEmail);
    return apiRequest(`/api/evidence/upload-bytes?${query}`, {
        method: "POST",
        headers: { "Content-Type": contentType || "application/octet-stream" },
        body: bytes
    });
}

// Audio Evidence Vault API helpers
async function getAudioVaultHistory(userId, email) {
    let query = [];
    if (userId) query.push(`userId=${encodeURIComponent(userId)}`);
    if (email) query.push(`email=${encodeURIComponent(email)}`);
    const qs = query.length ? `?${query.join("&")}` : "";
    return apiRequest(`/api/evidence/vault${qs}`);
}

async function deleteAudioVaultRecordApi(id) {
    return apiRequest(`/api/evidence/vault/${encodeURIComponent(id)}`, { method: "DELETE" });
}

async function checkDangerZone(lat, lng) {
    return apiRequest(`/api/danger-zone/check?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`);
}

async function addDangerZone(payload) {
    return apiRequest("/api/danger-zone/add", { method: "POST", body: JSON.stringify(payload) });
}

async function getCrimeHeatmap() {
    return apiRequest("/api/safety/crime-heatmap");
}

async function getLiveSosMap() {
    return apiRequest("/api/safety/live-sos-map");
}

async function addEmergencyContact(userId, name, phoneNumber) {
    return apiRequest(`/api/emergency-contacts/add/${encodeURIComponent(userId)}?name=${encodeURIComponent(name)}&phoneNumber=${encodeURIComponent(phoneNumber)}`, { method: "POST" });
}

async function getEmergencyContacts(userId) {
    return apiRequest(`/api/emergency-contacts/${encodeURIComponent(userId)}`);
}

async function logFakeCall(userId, callerName) {
    return apiRequest(`/api/fake-call/log/${encodeURIComponent(userId)}?callerName=${encodeURIComponent(callerName)}`, { method: "POST" });
}

async function getIncidentAnalytics(userId) {
    return apiRequest(`/api/analytics/${encodeURIComponent(userId)}`);
}

async function getLocationHistory(userId) {
    return apiRequest(`/api/location/history/${encodeURIComponent(userId)}`);
}

async function getCurrentLocation(userId) {
    return apiRequest(`/api/location/${encodeURIComponent(userId)}`);
}

async function updateUserLocation(userId, latitude, longitude) {
    return apiRequest(`/api/location/update/${encodeURIComponent(userId)}?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}`, { method: "POST" });
}

async function evaluateRisk(latitude, longitude) {
    return apiRequest(`/api/risk/evaluate?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}`);
}

async function requestSafeRoute(payload) {
    return apiRequest("/api/safety/safe-route", { method: "POST", body: JSON.stringify(payload) });
}

async function checkRouteDeviation(userId, latitude, longitude, plannedRoute = []) {
    return apiRequest(`/api/safety/route-deviation/${encodeURIComponent(userId)}?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}`);
}

async function checkSafetyZone(latitude, longitude) {
    return apiRequest(`/api/safety/danger-zone-check?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}`);
}

async function findNearbyHelp(latitude, longitude) {
    return apiRequest(`/api/safety/nearby-help?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}`);
}

async function reportDistress(payload) {
    return apiRequest("/api/safety/distress", { method: "POST", body: JSON.stringify(payload) });
}

async function sendSms(phoneNumber, message, isOfflineFallback = false) {
    return apiRequest(`/api/sms/send?phoneNumber=${encodeURIComponent(phoneNumber)}&message=${encodeURIComponent(message)}&isOfflineFallback=${isOfflineFallback}`, { method: "POST" });
}

async function dispatchSosSms(phoneNumbers, latitude, longitude) {
    const params = new URLSearchParams({ latitude: String(latitude), longitude: String(longitude) });
    phoneNumbers.forEach(phoneNumber => params.append("phoneNumbers", phoneNumber));
    return apiRequest(`/api/sms/dispatch-sos?${params.toString()}`, { method: "POST" });
}

async function triggerSilentSos(userId) {
    return apiRequest("/api/sos/silent-trigger", { method: "POST", body: JSON.stringify({ userId }) });
}

async function getSosHistory(userId) {
    return apiRequest(`/api/sos/history/${encodeURIComponent(userId)}`);
}

async function getAllTrustedContacts() {
    return apiRequest("/api/trusted-contacts/all");
}

async function updateTrustedContact(id, payload) {
    return apiRequest(`/api/trusted-contacts/update/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(payload) });
}
