// js/signup.js
document.getElementById('signupForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const fullName = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Check if passwords match
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    // User data object
    const userData = {
        fullName: fullName,
        email: email,
        phone: phone,
        password: password
    };

    // Save user data to localStorage (key ke roop mein email use karenge)
    localStorage.setItem(email, JSON.stringify(userData));

    // Also save current registered email for convenience
    localStorage.setItem('registeredEmail', email);

    alert('Account created successfully! Please login.');

    // Redirect to login page
    window.location.href = 'login.html';
});