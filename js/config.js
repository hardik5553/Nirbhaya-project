// Nirbhaya Global Runtime Configuration
// Ensures frontend communicates seamlessly with Render backend and Supabase across Vercel and local environments.

(function () {
    const DEFAULT_BACKEND_URL = "https://nirbhaya-app.onrender.com";
    const DEFAULT_SUPABASE_URL = "https://rezijlatjdjmmwsnkiwa.supabase.co";
    const DEFAULT_STORAGE_BUCKET = "panic-evidence";

    // Read stored override (if any) or existing global variable
    let activeBackendUrl = DEFAULT_BACKEND_URL;
    try {
        const storedOverride = typeof localStorage !== 'undefined' ? localStorage.getItem('NIRBHAYA_API_BASE_URL') : null;
        if (window.NIRBHAYA_API_BASE_URL && typeof window.NIRBHAYA_API_BASE_URL === 'string') {
            activeBackendUrl = window.NIRBHAYA_API_BASE_URL;
        } else if (storedOverride && typeof storedOverride === 'string') {
            activeBackendUrl = storedOverride;
        }
    } catch (e) {
        // localStorage access blocked in private mode
    }

    // Clean up trailing slash
    activeBackendUrl = activeBackendUrl.replace(/\/+$/, '');

    window.NIRBHAYA_CONFIG = {
        API_BASE_URL: activeBackendUrl,
        SUPABASE_URL: DEFAULT_SUPABASE_URL,
        SUPABASE_STORAGE_BUCKET: DEFAULT_STORAGE_BUCKET
    };

    window.NIRBHAYA_API_BASE_URL = activeBackendUrl;

    window.getApiBaseUrl = function () {
        return window.NIRBHAYA_CONFIG.API_BASE_URL;
    };

    console.log("🛡️ NIRBHAYA initialized with backend:", window.NIRBHAYA_CONFIG.API_BASE_URL);
})();
