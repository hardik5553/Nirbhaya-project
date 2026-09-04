// js/signup.js

document.addEventListener('DOMContentLoaded', () => {

    // Initialize Supabase Client
    const supabaseUrl = 'https://qrufisohvrceqappvhye.supabase.co';
    const supabaseKey = 'sb_publishable_ROZgpJvsMd2Qg-Bm5PVCwg_MiV1aBQG';
    const _supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    const signupForm = document.getElementById('signupForm');

    if (!signupForm) {
        return;
    }

    // Input fields for Enter key navigation
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    // Setup Enter key flow between fields
    const setupEnterJump = (currentField, nextField) => {
        if (currentField && nextField) {
            currentField.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    nextField.focus();
                }
            });
        }
    };

    setupEnterJump(nameInput, emailInput);
    setupEnterJump(emailInput, phoneInput);
    setupEnterJump(phoneInput, passwordInput);
    setupEnterJump(passwordInput, confirmPasswordInput);

    // Form Submit Handler
    signupForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const fullName = nameInput.value.trim();
        const email = emailInput.value.trim().toLowerCase();
        const phone = phoneInput.value.trim();
        const password = passwordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();

        // 1. Email Format Check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert("❌ Invalid Email Format! Please enter a valid email address.");
            emailInput.focus();
            return;
        }

        // 2. Password Length Check
        if (password.length < 6) {
            alert("⚠️ Password must be at least 6 characters long.");
            passwordInput.focus();
            return;
        }

        // 3. Password Match Check
        if (password !== confirmPassword) {
            alert("❌ Passwords do not match! Please re-check.");
            confirmPasswordInput.focus();
            return;
        }

        try {
            // Check if user already exists in Supabase table 'users'
            const { data: existingUsers, error: checkError } = await _supabase
                .from('users')
                .select('*')
                .eq('email', email);

            if (checkError) {
                console.error('Error checking user existence:', checkError.message);
                alert('⚠️ Database error: ' + checkError.message);
                return;
            }

            if (existingUsers && existingUsers.length > 0) {
                alert('⚠️ An account with this email already exists. Please log in.');
                window.location.href = 'login.html';
                return;
            }

            // Insert new user into Supabase database table 'users' with all fields
            const { error: insertError } = await _supabase
                .from('users')
                .insert([
                    { 
                        fullName: fullName,
                        email: email, 
                        phone: phone,
                        password: password 
                    }
                ]);

            if (insertError) {
                console.error('Supabase insert error:', insertError.message);
                alert('❌ Failed to save account to database: ' + insertError.message);
                return;
            }

            // LocalStorage backup
            const userData = {
                fullName: fullName,
                email: email,
                phone: phone,
                password: password
            };
            localStorage.setItem(email, JSON.stringify(userData));
            localStorage.setItem('registeredEmail', email);

            alert(`✅ Account created successfully for ${fullName}!\n\nPlease log in using your credentials.`);

            // Redirect to login page
            window.location.href = 'login.html';

        } catch (err) {
            console.error('Unexpected error during signup:', err);
            alert('❌ An unexpected error occurred. Please try again.');
        }
    });
});