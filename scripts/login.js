const BASE_URL = "https://join-user-default-rtdb.europe-west1.firebasedatabase.app/"
let isPasswordVisible = false;


const urlParams = new URLSearchParams(window.location.search);
const msg = urlParams.get('msg');

if (msg) {
    const msgBox = document.getElementById('msgBox');
    const msgText = document.getElementById('msgText');

    msgText.innerHTML = msg;
    msgBox.classList.add('show');
    history.replaceState(null, "", window.location.pathname);
    setTimeout(() => {
        msgBox.classList.remove('show');
    }, 2000);
}


async function UserLogin() {
    let emailInput = document.getElementById('email');
    let passwordInput = document.getElementById('password');

    let email = emailInput.value;
    let password = passwordInput.value;

    let usersResponse = await fetch(BASE_URL + "users.json");
    let users = await usersResponse.json();
    let userId = Object.keys(users).find(key => users[key].userDatas.email === email && users[key].userDatas.password === password);

    if (userId) {
        localStorage.setItem("userId", userId);
        window.location.href = 'summary.html?';
    }else{
        emailInput.style.border = "1px solid red";
        passwordInput.style.border = "1px solid red";
        document.getElementById('notCorrectValue').style.display = ("block")
    }
}

function loginGuastAccount() {
    localStorage.setItem("userId", "guest");
    window.location.href = "summary.html?"
}

function changePasswordIcon(focused) {
    const icon = document.getElementById("passwordIcon");
    if (focused && !isPasswordVisible) {
        icon.src = "assets/img/visibility_off.png";
    } else if (!focused && !isPasswordVisible) {
        icon.src = "assets/img/lock.png";
    }
}

function togglePasswordVisibility() {
    const passwordInput = document.getElementById("password");
    const icon = document.getElementById("passwordIcon");
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        icon.src = "assets/img/visibility.png";
        isPasswordVisible = true;
    } else {
        passwordInput.type = "password";
        icon.src = "assets/img/visibility_off.png";
        isPasswordVisible = false;
    }
}