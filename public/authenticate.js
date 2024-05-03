const BASE_URL = 'https://youcountry-f1df846a7cc3.herokuapp.com/';

// Swap between Sign-in And Sign-up Form
const wrapper = document.querySelector('.wrapper')
const loginLink = document.querySelector('.login-link')
const registerLink = document.querySelector('.register-link')

registerLink.addEventListener('click', () => {
    wrapper.classList.add('active');
});

loginLink.addEventListener('click', () => {
    wrapper.classList.remove('active');
});



// Functionality of Signing-in and Signing-up

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const registrationForm = document.getElementById('registration-form');

    // Login
    const handleLogin = async (email, password) => {
        try {
            const response = await fetch(`${BASE_URL}chill/signin`, {
                method: 'POST',
                body: JSON.stringify({ email, password }),
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const data = await response.json();

                localStorage.setItem('token', data.token);

                window.location.href = '/'; 
            } else {
                displayMessage(`Login failed`, false, 'login');
            }
        } catch (error) {
            console.error('Login Error:', error);
        }
    };

    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        handleLogin(email, password);
    });



    // Registration
    registrationForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const formData = new FormData(registrationForm);
        const jsonData = {};
        formData.forEach((value, key) => {
            jsonData[key] = value;
        });
    
        try {
            const response = await fetch(`${BASE_URL}chill/signup`, {
                method: 'POST',
                body: JSON.stringify(jsonData),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                displayMessage('Registration successful!', true, 'registration');
                setTimeout(() => {
                    window.location.href = '/authenticate';
                }, 3000);
            } else {
                displayMessage(`Registration failed`, false, 'registration');
            }
        } catch (error) {
            console.error('Registration Error:', error);
        }
    });  
    
    function displayMessage(message, isSuccess, formType) {
        let messageContainer;
        if (formType === 'login') {
            messageContainer = document.getElementById('login-message');
        } else if (formType === 'registration') {
            messageContainer = document.getElementById('registration-message');
        } else {
            console.error('Invalid form type provided');
            return;
        }
    
        messageContainer.textContent = message;
    
        if (isSuccess) {
            messageContainer.style.color = '#6e5b91'; 
        } else {
            messageContainer.style.color = 'rgba(211, 8, 8, 0.568)'; 
        }
    }
    

});
