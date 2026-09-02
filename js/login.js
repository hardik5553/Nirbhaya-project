// js/login.js
document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginBtn');

    if (loginBtn) {
        loginBtn.addEventListener('click', function (e) {
            e.preventDefault();

            const emailInput = document.getElementById('email').value.trim().toLowerCase();
            const passwordInput = document.getElementById('password').value.trim();

            // Check if fields are empty
            if (!emailInput || !passwordInput) {
                alert('Please enter both email and password.');
                return;
            }

            // Strict Email Format Validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailInput)) {
                alert('❌ Invalid Email Format! Please enter a valid email address containing "@".');
                return;
            }

            // Retrieve registered users database from localStorage
            const usersJSON = localStorage.getItem('nirbhaya_signup_users');

            if (!usersJSON) {
                alert('No account found. Please Sign Up first.');
                return;
            }

            const users = JSON.parse(usersJSON);

            // Find user matching email and password
            const foundUser = users.find(u => u.email.toLowerCase() === emailInput && u.password === passwordInput);

            if (!foundUser) {
                // Check if email exists but password wrong, or email doesn't exist at all
                const emailExists = users.some(u => u.email.toLowerCase() === emailInput);
                if (!emailExists) {
                    alert('No account found with this email. Please Sign Up first.');
                } else {
                    alert('Incorrect password! Please try again.');
                }
                return;
            }

            // Login Successful
            alert('✅ Login Successful!');

            // Save current active login session variables for cross-page profile sync
            localStorage.setItem('nirbhaya_current_user_email', foundUser.email);
            localStorage.setItem('nirbhaya_username', foundUser.name);
            localStorage.setItem('nirbhaya_user_email', foundUser.email);

            if (foundUser.dp && foundUser.dp.trim() !== "") {
                localStorage.setItem('nirbhaya_userdp', foundUser.dp);
            } else {
                localStorage.removeItem('nirbhaya_userdp');
            }

            // Redirect to security dashboard
            window.location.href = '../security.html';
        });
    }
});