"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function get_password_hash() {
    const password = document.getElementById('scrambt_password');
    if (!password)
        return alert("Password input not found!");
    if (!password.value)
        return alert("Password is empty!");
    const hash = new jsSHA("SHA-512", "TEXT", { numRounds: 1 });
    hash.update(password.value);
    return hash.getHash("HEX");
}
function get_username() {
    const username = document.getElementById("scrambt_username");
    if (!username)
        return alert("Username input not found!");
    if (!username.value)
        return alert("Username is empty!");
    return username.value;
}
function getInviteToken() {
    const invite_token = document.getElementById("scrambt_token");
    if (!invite_token)
        return alert("Invite token input not found!");
    if (!invite_token.value)
        return alert("Invite token is empty!");
    return invite_token.value;
}
function checkAuth() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch("/api/v1/auth/check_auth");
            return response.ok;
        }
        catch (error) {
            console.error("Auth check failed:", error);
            return false;
        }
    });
}
function logout() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch("/api/v1/auth/logout", { method: "POST" });
            if (response.ok) {
                window.location.reload();
            }
            else {
                alert("Logout failed. Please try again.");
            }
        }
        catch (error) {
            console.error("Logout failed:", error);
            alert("Logout failed. Please try again.");
        }
    });
}
function login() {
    return __awaiter(this, void 0, void 0, function* () {
        const username = get_username();
        if (!username)
            return;
        const password = get_password_hash();
        if (!password)
            return;
        try {
            const response = yield fetch("/api/v1/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });
            if (response.ok) {
                window.location.reload();
            }
            else {
                const data = yield response.json();
                alert(data.detail);
            }
        }
        catch (error) {
            console.error("Login failed:", error);
            alert("Login failed. Please try again.");
        }
    });
}
function signup() {
    return __awaiter(this, void 0, void 0, function* () {
        const invite_token = getInviteToken();
        if (!invite_token)
            return;
        const username = get_username();
        if (!username)
            return;
        const password = get_password_hash();
        if (!password)
            return;
        try {
            const response = yield fetch("/api/v1/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password, invite_token }),
            });
            if (response.ok) {
                window.location.reload();
            }
            else {
                const data = yield response.json();
                alert(data.detail);
            }
        }
        catch (error) {
            console.error("Signup failed:", error);
            alert("Signup failed. Please try again.");
        }
    });
}
document.addEventListener("DOMContentLoaded", () => {
    (() => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const isAuthenticated = yield checkAuth();
            const mainPage = document.querySelector(".main-page");
            const loginPage = document.querySelector(".login-page");
            if (mainPage && loginPage) {
                mainPage.style.display = isAuthenticated ? "block" : "none";
                loginPage.style.display = isAuthenticated ? "none" : "block";
            }
            else {
                console.error("Main page or login page elements not found!");
            }
            const themeIcon = document.querySelector("#change_theme i");
            if (themeIcon) {
                if (ui("mode") === "dark") {
                    themeIcon.textContent = "light_mode";
                }
                else {
                    themeIcon.textContent = "dark_mode";
                }
            }
            addBot();
            const botSelector = document.querySelector("#bot_select");
            if (botSelector) {
                const selectedBot = document.querySelector(`#${botSelector.value}`);
                if (selectedBot)
                    selectedBot.classList.add("active");
                botSelector.addEventListener("change", function () {
                    const botData = document.querySelector("#bot-data");
                    if (botData) {
                        for (let i = 0; i < botData.children.length; i++) {
                            botData.children[i].classList.remove("active");
                        }
                        const bot = document.querySelector(`#${this.value}`);
                        if (bot)
                            bot.classList.add("active");
                        const deleteBotButton = document.querySelector("#delete-bot");
                        if (deleteBotButton) {
                            const lastChild = botSelector.children[botSelector.children.length - 1];
                            if (botSelector.children.length > 1 && botSelector.value === lastChild.value) {
                                deleteBotButton.classList.remove("transparent");
                            }
                            else {
                                deleteBotButton.classList.add("transparent");
                            }
                        }
                    }
                });
            }
        }
        catch (error) {
            console.error("Failed to check authentication:", error);
        }
    }))();
});
function changeBot() {
    alert(`${this.value}`);
}
function addBot() {
    const botSelector = document.querySelector("#bot_select");
    const botTemplate = document.querySelector("#bot_template");
    const botData = document.querySelector("#bot-data");
    const deleteBotButton = document.querySelector("#delete-bot");
    if (!botSelector || !botTemplate || !botData || !deleteBotButton)
        return;
    const newBot = document.createElement("option");
    newBot.selected = true;
    newBot.value = `bot_${botSelector.children.length + 1}`;
    newBot.textContent = `Bot ${botSelector.children.length + 1}.`;
    botSelector.appendChild(newBot);
    const newBotData = botTemplate.cloneNode(true);
    newBotData.id = `bot_${botSelector.children.length}`;
    newBotData.setAttribute("data-ui", `bot_${botSelector.children.length}`);
    Array.from(botData.children).forEach(child => child.classList.remove("active"));
    newBotData.classList.add("active");
    botData.appendChild(newBotData);
    if (botSelector.children.length > 1 && botSelector.value === newBot.value) {
        deleteBotButton.classList.remove("transparent");
    }
}
function deleteBot() {
    var _a;
    const botSelector = document.querySelector("#bot_select");
    const deleteBotButton = document.querySelector("#delete-bot");
    if (!botSelector || !deleteBotButton || botSelector.children.length <= 1)
        return;
    const lastBotOption = botSelector.children[botSelector.children.length - 1];
    if (botSelector.value === lastBotOption.value) {
        const botToDelete = document.querySelector(`#${botSelector.value}`);
        botToDelete === null || botToDelete === void 0 ? void 0 : botToDelete.remove();
        botSelector.removeChild(lastBotOption);
        const newLastBotOption = botSelector.children[botSelector.children.length - 1];
        (_a = document.querySelector(`#${newLastBotOption.value}`)) === null || _a === void 0 ? void 0 : _a.classList.add("active");
        newLastBotOption.selected = true;
        if (botSelector.children.length > 1) {
            deleteBotButton.classList.remove("transparent");
        }
        else {
            deleteBotButton.classList.add("transparent");
        }
    }
}
//<!-- 
// <progress class="circle"></progress>
// <i>check</i>
// <i>close</i> 
// -->
function processing() {
    const status = document.getElementById("bot_auth_status");
    if (!status)
        return;
    status.innerHTML = '';
    const progress = document.createElement("progress");
    progress.classList.add("circle");
    progress.classList.add("small");
    status === null || status === void 0 ? void 0 : status.append(progress);
}
function bad_bot() {
    const status = document.getElementById("bot_auth_status");
    if (!status)
        return;
    status.innerHTML = '';
    const icon = document.createElement("i");
    icon.textContent = "close";
    icon.classList.add("error");
    icon.classList.add("circle");
    status === null || status === void 0 ? void 0 : status.append(icon);
    const text = document.createElement("span");
    text.textContent = "N/a.";
    status === null || status === void 0 ? void 0 : status.append(text);
}
function good_bot() {
    const status = document.getElementById("bot_auth_status");
    if (!status)
        return;
    status.innerHTML = '';
    const icon = document.createElement("i");
    icon.textContent = "check";
    icon.classList.add("circle");
    status === null || status === void 0 ? void 0 : status.append(icon);
    const text = document.createElement("span");
    text.textContent = "Ok.";
    status === null || status === void 0 ? void 0 : status.append(text);
}
function requestCode() {
    return __awaiter(this, void 0, void 0, function* () {
        return;
    });
}
function manageTdata(tdata_archive, username, proxy) {
    return __awaiter(this, void 0, void 0, function* () {
        const formData = new FormData();
        formData.append("tdata_archive_file", tdata_archive);
        formData.append("username", username);
        const proxyData = getProxy();
        if (!proxyData)
            return bad_bot();
        formData.append("proxy_scheme", proxyData.scheme);
        formData.append("proxy_hostname", proxyData.hostname);
        formData.append("proxy_port", proxyData.port);
        formData.append("proxy_username", proxyData.username);
        formData.append("proxy_password", proxyData.password);
        const response = yield fetch("/api/v1/bot/create/tdata", {
            method: "POST",
            body: formData,
        });
        if (!response.ok) {
            const errorData = yield response.json();
            const errorDetail = errorData.detail || errorData.message || "Неизвестная ошибка";
            alert(`Ошибка при загрузке Tdata! ${errorDetail}`);
            return bad_bot();
        }
        good_bot();
    });
}
function manageBotEntries(username, proxy) {
    return __awaiter(this, void 0, void 0, function* () {
        const ws = new WebSocket(`${window.location.origin.replace(/^http/, "ws")}/api/v1/bot/create/credentials`);
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log(data.message); // "Enter the code"
            if (data.message === "Enter the code") {
                const code = prompt("Введите код:");
                ws.send(code);
            }
            else {
                console.log("Ответ от сервера:", data);
            }
        };
    });
}
function authorizeBotSession() {
    return __awaiter(this, void 0, void 0, function* () {
        processing();
        const usernameInput = document.getElementById("username");
        if (!usernameInput) {
            bad_bot();
            return alert("Username input not found!");
        }
        if (!usernameInput.value) {
            bad_bot();
            return alert("Username is empty!");
        }
        const proxyInput = document.getElementById("proxy");
        if (!proxyInput) {
            bad_bot();
            return alert("Proxy input not found!");
        }
        if (!proxyInput.value) {
            bad_bot();
            return alert("Proxy is empty!");
        }
        const tdataInput = document.getElementById("tdata-file");
        if (tdataInput && tdataInput.files && tdataInput.files.length)
            return yield manageTdata(tdataInput.files[0], usernameInput.value, proxyInput.value);
        else
            return yield manageBotEntries(usernameInput.value, proxyInput.value);
    });
}
function startBot() {
    return;
}
function openInvite() {
    return __awaiter(this, void 0, void 0, function* () {
        const modal = document.getElementById("dialog-invite");
        if (!modal)
            return false;
        const invite_token = document.getElementById("invite_token");
        if (!invite_token)
            return false;
        try {
            const response = yield fetch("/api/v1/auth/invite_token");
            const token = yield response.text();
            invite_token.innerHTML = token;
            modal.classList.add('active');
            return true;
        }
        catch (error) {
            console.error("Auth check failed:", error);
            return false;
        }
    });
}
function closeInvite() {
    const modal = document.getElementById("dialog-invite");
    if (!modal)
        return;
    modal.classList.remove('active');
}
function openHelp() {
    const modal = document.getElementById("dialog-modal");
    if (!modal)
        return;
    modal.classList.add('active');
}
function closeHelp() {
    const modal = document.getElementById("dialog-modal");
    if (!modal)
        return;
    modal.classList.remove('active');
}
function swap() {
    const iconElement = document.querySelector("#change_theme i");
    if (!iconElement)
        return;
    if (iconElement.textContent === "dark_mode") {
        iconElement.textContent = "light_mode";
    }
    else {
        iconElement.textContent = "dark_mode";
    }
    ui("mode", iconElement.textContent.split('_')[0]);
}
function changeTheme() {
    const iconElement = document.querySelector("#change_theme i");
    if (!iconElement || !iconElement.textContent)
        return;
    ui("mode", iconElement.textContent.split('_')[0]);
    if (iconElement.textContent === "dark_mode") {
        iconElement.textContent = "light_mode";
    }
    else {
        iconElement.textContent = "dark_mode";
    }
}
function getProxy() {
    const proxy_scheme = document.getElementById("proxy_type");
    if (!proxy_scheme)
        return alert("Proxy type input not found!");
    const proxy = document.getElementById("proxy");
    if (!proxy)
        return alert("Proxy input not found!");
    const scheme = proxy_scheme.value;
    const proxy_value = proxy.value;
    const [hostname, port] = proxy_value.split("@")[0].split(":");
    const [username, password] = proxy_value.split("@")[1].split(":");
    return { scheme, hostname, port, username, password };
}
function checkProxy() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const proxy_field = document.getElementById("proxy_field");
        if (!proxy_field)
            return alert("Proxy field input not found!");
        (_a = proxy_field.querySelector("#proxy_icon")) === null || _a === void 0 ? void 0 : _a.remove();
        const progress = document.createElement("progress");
        progress.id = "proxy_icon";
        progress.classList.add("circle");
        proxy_field.appendChild(progress);
        try {
            const response = yield fetch("/api/v1/proxy/check_proxy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(getProxy()),
            });
            if (response.ok) {
                (_b = proxy_field.querySelector("#proxy_icon")) === null || _b === void 0 ? void 0 : _b.remove();
                const check = document.createElement("i");
                check.id = "proxy_icon";
                check.innerHTML = "check";
                proxy_field.appendChild(check);
                return;
            }
            else {
                const data = yield response.json();
                alert(data.detail);
            }
        }
        catch (error) {
            if (error instanceof TypeError)
                alert("Invalid proxy value");
            else {
                console.error("Proxy is invalid:", error);
                alert(error);
            }
        }
        (_c = proxy_field.querySelector("#proxy_icon")) === null || _c === void 0 ? void 0 : _c.remove();
        const close = document.createElement("i");
        close.id = "proxy_icon";
        close.innerHTML = "close";
        proxy_field.appendChild(close);
        return;
    });
}
