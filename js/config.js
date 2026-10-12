// Nirbhaya Global Runtime Configuration

(function () {
    const DEFAULT_BACKEND_URL = ["localhost", "127.0.0.1"].includes(window.location.hostname)
        ? "http://localhost:8083"
        : "";
    const DEFAULT_SUPABASE_URL = "https://rezijlatjdjmmwsnkiwa.supabase.co";
    const DEFAULT_STORAGE_BUCKET = "panic-evidence";

    let activeBackendUrl = DEFAULT_BACKEND_URL;
    try {
        const storedOverride = typeof localStorage !== 'undefined' ? localStorage.getItem('NIRBHAYA_API_BASE_URL') : null;
        if (window.NIRBHAYA_API_BASE_URL && typeof window.NIRBHAYA_API_BASE_URL === 'string') {
            activeBackendUrl = window.NIRBHAYA_API_BASE_URL;
        } else if (storedOverride && typeof storedOverride === 'string') {
            activeBackendUrl = storedOverride;
        }
    } catch (error) {
        console.warn("Could not read the saved API URL override:", error);
    }

    activeBackendUrl = activeBackendUrl.replace(/\/+$/, '');

    window.NIRBHAYA_CONFIG = {
        API_BASE_URL: activeBackendUrl,
        SUPABASE_URL: DEFAULT_SUPABASE_URL,
        SUPABASE_STORAGE_BUCKET: DEFAULT_STORAGE_BUCKET
    };

    window.NIRBHAYA_API_BASE_URL = activeBackendUrl;

    window.getNirbhayaApiBaseUrl = function () {
        return window.NIRBHAYA_CONFIG.API_BASE_URL;
    };

    console.log("NIRBHAYA API target:", activeBackendUrl || "same-origin Vercel proxy");
})();
