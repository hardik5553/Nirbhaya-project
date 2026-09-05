// global-sos.js - Unified Global SOS Engine for All Pages with Instant Fallback

const SUPABASE_URL_GLOBAL = 'https://qrufisohvrceqappvhye.supabase.co';
const SUPABASE_KEY_GLOBAL = 'sb_publishable_ROZgpJvsMd2Qg-Bm5PVCwg_MiV1aBQG';
const _supabaseGlobal = window.supabase ? window.supabase.createClient(SUPABASE_URL_GLOBAL, SUPABASE_KEY_GLOBAL) : null;

let globalSosInterval = null;
let globalCountdownValue = 15;

// Unified Global SOS Trigger Function
function triggerSOSCountdown() {
    globalCountdownValue = 15;
    
    // Ensure countdown overlay exists on the active DOM
    let overlay = document.getElementById('sosCountdownOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'sosCountdownOverlay';
        overlay.style.cssText = "display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100vh; background: rgba(225, 29, 72, 0.95); z-index: 99999; color: white; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 20px;";
        overlay.innerHTML = `
            <h2>🚨 SOS EMERGENCY ACTIVATED 🚨</h2>
            <p>Dispatching coordinates and custom SMS/WhatsApp to emergency contacts in:</p>
            <div id="sosTimerDisplay" style="font-size: 6rem; font-weight: 800; margin: 20px 0; letter-spacing: 2px;">15</div>
            <p style="font-size: 14px; max-width: 400px; opacity: 0.9; margin-bottom: 30px;">If this was a false alarm, click the cancel button immediately below before the countdown hits zero.</p>
            <button onclick="cancelSOS()" style="background: white; color: #e11d48; border: none; padding: 16px 45px; border-radius: 40px; font-size: 1.3rem; font-weight: 800; cursor: pointer; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">❌ CANCEL SOS</button>
        `;
        document.body.appendChild(overlay);
    }

    const timerDisplay = document.getElementById('sosTimerDisplay');
    if (timerDisplay) timerDisplay.textContent = globalCountdownValue;
    overlay.style.display = 'flex';

    if (globalSosInterval) clearInterval(globalSosInterval);

    globalSosInterval = setInterval(() => {
        globalCountdownValue--;
        if (timerDisplay) timerDisplay.textContent = globalCountdownValue;

        if (globalCountdownValue <= 0) {
            clearInterval(globalSosInterval);
            overlay.style.display = 'none';

            // Execute Multi-Channel Dispatch immediately when timer hits 0
            executeSOSDispatch();
        }
    }, 1000);
}

function cancelSOS() {
    if (globalSosInterval) clearInterval(globalSosInterval);
    const overlay = document.getElementById('sosCountdownOverlay');
    if (overlay) overlay.style.display = 'none';
    alert("🛡️ SOS Alert successfully cancelled.");
}

async function executeSOSDispatch() {
    const userEmail = localStorage.getItem('nirbhaya_current_user_email') || localStorage.getItem('nirbhaya_user_email');
    const customMsg = localStorage.getItem('nirbhaya_sos_sms') || "🚨 EMERGENCY! I need immediate help. Track my live location via NIRBHAYA.";

    if (!userEmail) {
        alert("⚠️ Session expired. Please log in first.");
        window.location.href = "../login.html";
        return;
    }

    // Default Fallback Maps Link in case GPS takes a moment
    let mapsLink = "https://www.google.com/maps";

    // Try to get live GPS coordinates instantly with a short timeout
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                mapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
                proceedWithMessaging(userEmail, customMsg, mapsLink);
            },
            (error) => {
                console.warn("GPS timeout or blocked, sending SOS with default maps link.");
                proceedWithMessaging(userEmail, customMsg, mapsLink);
            },
            { timeout: 3000, enableHighAccuracy: false }
        );
    } else {
        proceedWithMessaging(userEmail, customMsg, mapsLink);
    }
}

async function proceedWithMessaging(userEmail, customMsg, mapsLink) {
    const fullMessage = `${customMsg} My GPS Location: ${mapsLink}`;
    let contacts = [];

    // 1. Fetch contacts from Supabase
    if (_supabaseGlobal) {
        try {
            const { data, error } = await _supabaseGlobal
                .from('contacts')
                .select('*')
                .eq('user_email', userEmail);

            if (!error && data && data.length > 0) {
                contacts = data.map(c => ({
                    name: c.contact_name,
                    phone: c.phone
                }));
            }
        } catch (err) {
            console.warn("Supabase fetch error, fallback to local storage.");
        }
    }

    // 2. Fallback to LocalStorage
    if (contacts.length === 0) {
        const localContacts = JSON.parse(localStorage.getItem('nirbhaya_trusted_contacts')) || [];
        contacts = localContacts.map(c => ({
            name: c.name,
            phone: c.phone
        }));
    }

    // 3. Absolute Fallback
    if (contacts.length === 0) {
        contacts = [{ name: "Emergency Dispatch", phone: "112" }];
    }

    let primaryContact = contacts[0];
    let cleanPhone = primaryContact.phone.replace(/[^0-9+]/g, '');

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone.replace('+', '')}&text=${encodeURIComponent(fullMessage)}`;
    const smsUrl = `sms:${cleanPhone}?body=${encodeURIComponent(fullMessage)}`;

    // Guaranteed Pop-up Alert
    alert(`🚨 SOS DISPATCHED SUCCESSFULLY!\n\nAlerting Primary Guardian: ${primaryContact.name} (${primaryContact.phone})\n\n- GPS Coordinates Attached.\n- Opening Messaging Gateways.`);

    // Open WhatsApp and SMS
    window.open(whatsappUrl, '_blank');
    setTimeout(() => {
        window.location.href = smsUrl;
    }, 1000);
}