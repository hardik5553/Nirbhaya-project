// global-sos.js - Final Clean SOS Engine (Single Dispatch & Private Audio Vault)

const SUPABASE_URL_GLOBAL = 'https://qrufisohvrceqappvhye.supabase.co';
const SUPABASE_KEY_GLOBAL = 'sb_publishable_ROZgpJvsMd2Qg-Bm5PVCwg_MiV1aBQG';
const _supabaseGlobal = window.supabase ? window.supabase.createClient(SUPABASE_URL_GLOBAL, SUPABASE_KEY_GLOBAL) : null;

let globalSosInterval = null;
let globalCountdownValue = 15;
let isSosExecuting = false; // Prevents double firing

function triggerSOSCountdown() {
    if (isSosExecuting) return;
    globalCountdownValue = 15;
    
    let overlay = document.getElementById('sosCountdownOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'sosCountdownOverlay';
        overlay.style.cssText = "display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100vh; background: rgba(225, 29, 72, 0.95); z-index: 99999; color: white; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 20px;";
        overlay.innerHTML = `
            <h2>🚨 SOS EMERGENCY ACTIVATED 🚨</h2>
            <p>Dispatching immediate alerts & securing private audio vault in:</p>
            <div id="sosTimerDisplay" style="font-size: 6rem; font-weight: 800; margin: 20px 0; letter-spacing: 2px;">15</div>
            <p style="font-size: 14px; max-width: 400px; opacity: 0.9; margin-bottom: 30px;">If this was a false alarm, click the cancel button immediately below.</p>
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
            executeSOSWithEvidence();
        }
    }, 1000);
}

function cancelSOS() {
    if (globalSosInterval) clearInterval(globalSosInterval);
    isSosExecuting = false;
    const overlay = document.getElementById('sosCountdownOverlay');
    if (overlay) overlay.style.display = 'none';
    console.log("🛡️ SOS Alert successfully cancelled.");
}

async function executeSOSWithEvidence() {
    if (isSosExecuting) return;
    isSosExecuting = true;

    const userEmail = localStorage.getItem('nirbhaya_current_user_email') || localStorage.getItem('nirbhaya_user_email');
    const customMsg = localStorage.getItem('nirbhaya_sos_sms') || "🚨 EMERGENCY! I need immediate help. Track my live location via NIRBHAYA.";

    if (!userEmail) {
        window.location.href = "../login.html";
        return;
    }

    let evidenceUrl = "No Image Captured";

    // 1. Start 30-Sec Private Background Audio Vault Recording
    startBackgroundAudioVault(userEmail);

    // 2. Back Camera Snapshot Capture
    try {
        let stream = null;
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { exact: "environment" } }, audio: false });
        } catch (e) {
            stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
        }

        const video = document.createElement('video');
        video.style.position = 'fixed';
        video.style.top = '-9999px';
        video.style.left = '-9999px';
        video.setAttribute('autoplay', '');
        video.setAttribute('muted', '');
        video.setAttribute('playsinline', '');
        document.body.appendChild(video);

        video.srcObject = stream;
        await video.play();
        await new Promise(resolve => setTimeout(resolve, 1500));

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        stream.getTracks().forEach(track => track.stop());
        video.remove();

        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.90));
        if (blob && _supabaseGlobal) {
            const fileName = `sos_evidence_${Date.now()}.jpg`;
            const filePath = `${userEmail}/${fileName}`;
            const { error } = await _supabaseGlobal.storage
                .from('panic-evidence')
                .upload(filePath, blob, { contentType: 'image/jpeg', upsert: true });

            if (!error) {
                const { data: publicUrlData } = _supabaseGlobal.storage
                    .from('panic-evidence')
                    .getPublicUrl(filePath);
                if (publicUrlData && publicUrlData.publicUrl) {
                    evidenceUrl = publicUrlData.publicUrl;
                }
            }
        }
    } catch (camErr) {
        console.warn("Back camera capture failed:", camErr);
    }

    logSystemHistory("SOS Signal Dispatched", "Automated broadcast sent to emergency guardians.");

    // 3. Fetch GPS & Dispatch Clean Message (No audio link in SMS/WhatsApp)
    let mapsLink = "https://www.google.com/maps";
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                mapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
                proceedWithMessaging(userEmail, customMsg, mapsLink, evidenceUrl);
            },
            () => {
                proceedWithMessaging(userEmail, customMsg, mapsLink, evidenceUrl);
            },
            { timeout: 3000, enableHighAccuracy: false }
        );
    } else {
        proceedWithMessaging(userEmail, customMsg, mapsLink, evidenceUrl);
    }
}

async function startBackgroundAudioVault(userEmail) {
    try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        const mediaRecorder = new MediaRecorder(audioStream);
        let audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            audioStream.getTracks().forEach(track => track.stop());

            if (audioBlob && _supabaseGlobal) {
                const audioName = `private_vault_${Date.now()}.webm`;
                const audioPath = `${userEmail}/${audioName}`;
                
                const { error: uploadErr } = await _supabaseGlobal.storage
                    .from('panic-evidence')
                    .upload(audioPath, audioBlob, { contentType: 'audio/webm', upsert: true });

                if (!uploadErr) {
                    const { data: publicAudioData } = _supabaseGlobal.storage
                        .from('panic-evidence')
                        .getPublicUrl(audioPath);

                    if (publicAudioData && publicAudioData.publicUrl) {
                        const audioVaultUrl = publicAudioData.publicUrl;

                        await _supabaseGlobal.from('audio_vault').insert([
                            { user_email: userEmail, audio_url: audioVaultUrl, created_at: new Date().toISOString() }
                        ]);

                        logSystemHistory("Automated Audio Evidence Captured (30s)", "Private 30s audio securely saved to cloud vault.");
                    }
                }
            }
            isSosExecuting = false;
        };

        mediaRecorder.start();
        setTimeout(() => {
            if (mediaRecorder.state === "recording") mediaRecorder.stop();
        }, 30000);

    } catch (err) {
        console.warn("Background audio recording error:", err);
        isSosExecuting = false;
    }
}

async function proceedWithMessaging(userEmail, customMsg, mapsLink, evidenceUrl) {
    const fullMessage = `${customMsg} \n📍 GPS Location: ${mapsLink} \n📸 Evidence Photo: ${evidenceUrl}`;
    let contacts = [];

    if (_supabaseGlobal) {
        try {
            const { data, error } = await _supabaseGlobal.from('contacts').select('*').eq('user_email', userEmail);
            if (!error && data && data.length > 0) contacts = data.map(c => ({ name: c.contact_name, phone: c.phone }));
        } catch (e) {}
    }

    if (contacts.length === 0) {
        const localContacts = JSON.parse(localStorage.getItem('nirbhaya_trusted_contacts')) || [];
        contacts = localContacts.map(c => ({ name: c.name, phone: c.phone }));
    }

    if (contacts.length === 0) contacts = [{ name: "Emergency Dispatch", phone: "112" }];

    let primaryContact = contacts[0];
    let cleanPhone = primaryContact.phone.replace(/[^0-9+]/g, '');

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone.replace('+', '')}&text=${encodeURIComponent(fullMessage)}`;
    const smsUrl = `sms:${cleanPhone}?body=${encodeURIComponent(fullMessage)}`;

    window.open(whatsappUrl, '_blank');
    setTimeout(() => {
        window.location.href = smsUrl;
    }, 800);
}

function logSystemHistory(title, description) {
    let history = JSON.parse(localStorage.getItem('nirbhaya_system_logs')) || [];
    history.unshift({
        title: title,
        desc: description,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString()
    });
    localStorage.setItem('nirbhaya_system_logs', JSON.stringify(history));
}