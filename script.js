async function submitRegisterForm() {
    try {
        const registerUsername = document.getElementById("registerUsername").value;
        const registerPassword = document.getElementById("registerPassword").value;

        const response = await fetch("http://localhost:3000/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username: registerUsername, password: registerPassword })
        });

        const data = await response.json();
        const registerMessageElement = document.getElementById("registerMessage");

        if (response.ok) {
            registerMessageElement.style.color = "green";
            registerMessageElement.textContent = data.message;
        } else {
            registerMessageElement.style.color = "red";
            registerMessageElement.textContent = data.error;
        }
    } catch (error) {
        console.error("Error during fetch:", error); 
    }
}

async function submitLoginForm() {
    console.log('Login button clicked');
    const username = document.getElementById("loginUsername").value; 
    const password = document.getElementById("loginPassword").value; 

    const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    const messageElement = document.getElementById("loginMessage");
    if (response.ok) {
        localStorage.setItem('token', data.token);
        messageElement.style.color = "green";
        messageElement.textContent = data.message;
        window.location.href = 'main.html'; 
    } else {
        messageElement.style.color = "red";
        messageElement.textContent = data.error;
    }
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

async function displayUserClasses() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch("http://localhost:3000/getclasses", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (response.ok) {
            
            document.getElementById('classTextBox1').value = data.classes[0] || '';
            document.getElementById('classTextBox2').value = data.classes[1] || '';
        } else {
            console.error("Error fetching user's classes:", data.error);
        }
    } catch (error) {
        console.error("Error during fetch:", error);
    }
}

async function removeClass(removeClassName) {
    try {
        const token = localStorage.getItem('token');

        const response = await fetch("http://localhost:3000/removeclass", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ className: removeClassName }),
        });

        const data = await response.json();

        if (response.ok) {
            console.log("Class removed successfully:", removeClassName);
            
            await displayUserClasses();
        } else {
            console.error("Error removing class:", data.error);
        }
    } catch (error) {
        console.error("Error during fetch:", error);
    }
}

document.addEventListener('DOMContentLoaded', displayUserClasses);
