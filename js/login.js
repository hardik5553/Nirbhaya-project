// js/login.js

document.addEventListener("DOMContentLoaded", () => {

    // Initialize Supabase Client
    const supabaseUrl = 'https://qrufisohvrceqappvhye.supabase.co';
    const supabaseKey = 'sb_publishable_ROZgpJvsMd2Qg-Bm5PVCwg_MiV1aBQG';
    const _supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    const loginBtn = document.getElementById("loginBtn");
    const emailField = document.getElementById("email");
    const passwordField = document.getElementById("password");

    // Keyboard Enter Key Navigation
    if (emailField && passwordField) {
        emailField.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                passwordField.focus();
            }
        });

        passwordField.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                if (loginBtn) loginBtn.click();
            }
        });
    }

    if (!loginBtn) {
        return;
    }

    loginBtn.addEventListener("click", async function (e) {

        e.preventDefault();

        const emailInput = document.getElementById("email").value.trim().toLowerCase();
        const passwordInput = document.getElementById("password").value.trim();

        // Check if fields are empty
        if (!emailInput || !passwordInput) {
            alert("⚠️ Please enter both email and password.");
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(emailInput)) {
            alert("❌ Invalid Email Format! Please enter a valid email address.");
            return;
        }

        try {
            // Fetch matching user from Supabase database table 'users'
            const { data: users, error } = await _supabase
                .from("users")
                .select("*")
                .eq("email", emailInput);

            if (error) {
                console.error("Supabase error:", error.message);
                alert("❌ Something went wrong with the database connection.");
                return;
            }

            if (!users || users.length === 0) {
                alert("❌ No account found with this email. Please Sign Up first.");
                return;
            }

            const foundUser = users[0];

            // Check if password matches
            if (foundUser.password !== passwordInput) {
                alert("❌ Incorrect password! Please try again.");
                return;
            }

            // Extract display name prioritizing fullName from Supabase table
            const displayName = foundUser.fullName || foundUser.name || "User";

            // Login successful
            alert(`✅ Welcome back, ${displayName}!\n\nLogin Successful.`);

            // Save logged-in user information
            localStorage.setItem(
                "nirbhaya_current_user_email",
                foundUser.email
            );

            localStorage.setItem(
                "nirbhaya_username",
                displayName
            );

            localStorage.setItem(
                "nirbhaya_user_email",
                foundUser.email
            );

            if (foundUser.phone) {
                localStorage.setItem("nirbhaya_userphone", foundUser.phone);
            }

            // Save profile picture if available
            if (foundUser.dp && foundUser.dp.trim() !== "") {
                localStorage.setItem(
                    "nirbhaya_userdp",
                    foundUser.dp
                );
            } else {
                localStorage.removeItem("nirbhaya_userdp");
            }

            // Open Dashboard / Security page after login
            window.location.href = "../security.html";

        } catch (err) {
            console.error("Unexpected error during login:", err);
            alert("❌ An unexpected error occurred. Please try again.");
        }
    });
});