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
            findBotSessions();
            getResults();
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
function splitArrayEqually(array, n) {
    const result = [];
    const length = array.length;
    const minChunkSize = Math.floor(length / n);
    const remainder = length % n;
    let start = 0;
    for (let i = 0; i < n; i++) {
        const chunkSize = minChunkSize + (i < remainder ? 1 : 0);
        const chunk = array.slice(start, start + chunkSize);
        result.push(chunk);
        start += chunkSize;
    }
    return result;
}
function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
}
function processFile(file) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const text = yield readFileAsText(file);
            return text.split(/\r?\n/).filter(line => line.trim() !== "");
        }
        catch (error) {
            console.error("Ошибка чтения файла:", error);
            return [];
        }
    });
}
function getFile(inputFileId) {
    const fileInput = document.getElementById(inputFileId);
    if (!fileInput || !fileInput.files || !fileInput.files.length)
        return;
    return fileInput.files[0];
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
    const modal = document.getElementById("dialog-help");
    if (!modal)
        return;
    modal.classList.add('active');
}
function openResults() {
    return __awaiter(this, void 0, void 0, function* () {
        yield getResults();
        const modal = document.getElementById("dialog-results");
        if (!modal)
            return;
        modal.classList.add('active');
    });
}
function closeResults() {
    const modal = document.getElementById("dialog-results");
    if (!modal)
        return;
    modal.classList.remove('active');
}
function closeHelp() {
    const modal = document.getElementById("dialog-help");
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
function getProxyData(proxy = getProxy(), scheme = getProxyType()) {
    if (!proxy)
        return alert("Proxy input not found!");
    if (!scheme)
        return alert("Proxy type input not found!");
    const [hostname, port] = proxy.split("@")[0].split(":");
    const [username, password] = proxy.split("@")[1].split(":");
    return { scheme, hostname, port, username, password };
}
function checkProxy() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const proxy_field = getBotEntryElement("#proxy-field");
        if (!proxy_field)
            return alert("Proxy field input not found!");
        const proxy = getProxy();
        if (!proxy)
            return alert("Proxy is empty!");
        (_a = getBotEntryElement("#proxy-icon")) === null || _a === void 0 ? void 0 : _a.remove();
        const progress = document.createElement("progress");
        progress.id = "proxy-icon";
        progress.classList.add("circle");
        proxy_field.appendChild(progress);
        try {
            const response = yield fetch("/api/v1/proxy/check_proxy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(getProxyData(proxy)),
            });
            if (response.ok) {
                (_b = proxy_field.querySelector("#proxy-icon")) === null || _b === void 0 ? void 0 : _b.remove();
                const check = document.createElement("i");
                check.id = "proxy-icon";
                check.innerHTML = "check";
                proxy_field.appendChild(check);
                return;
            }
            else {
                // CHECK RESPONSE IS VALID JSON
                if (response.headers.get("Content-Type") !== "application/json")
                    throw new TypeError("Invalid proxy");
                const data = yield response.json();
                if (data.detail)
                    alert(data.detail);
                else
                    alert("Proxy is valid");
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
        (_c = proxy_field.querySelector("#proxy-icon")) === null || _c === void 0 ? void 0 : _c.remove();
        const close = document.createElement("i");
        close.id = "proxy-icon";
        close.innerHTML = "close";
        proxy_field.appendChild(close);
        return;
    });
}
function getResults() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch("/api/v1/worker/results");
        if (!response.ok)
            return console.error("Failed to get results!");
        const data = yield response.json();
        if (!data.results)
            return console.info("No results!");
        const table = document.getElementById("results-table");
        table.innerHTML = '';
        for (const result of data.results) {
            const row = table.insertRow();
            row.insertCell().textContent = result;
            const cell = row.insertCell();
            const button = document.createElement("button");
            button.classList.add("circle");
            button.classList.add("light-green-text");
            button.classList.add("transparent");
            const icon = document.createElement("i");
            icon.textContent = "download";
            button.appendChild(icon);
            button.addEventListener("click", () => downloadFile(result));
            cell.appendChild(button);
        }
    });
}
function downloadFile(filename) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`/api/v1/worker/results/${filename}`);
            if (!response.ok) {
                throw new Error(`Failed to get file: ${response.statusText}`);
            }
            const contentType = response.headers.get('content-type');
            if (!contentType) {
                throw new Error("Content-Type header is missing");
            }
            if (contentType.startsWith('application/json')) {
                const data = yield response.json();
                console.log("Received JSON data:", data);
                return data;
            }
            else if (contentType.startsWith('text/')) {
                const text = yield response.text();
                console.log("Received text data:", text);
                return text;
            }
            else if (contentType.startsWith('image/')) {
                const blob = yield response.blob();
                const imageUrl = URL.createObjectURL(blob);
                console.log("Received image, URL:", imageUrl);
                return imageUrl;
            }
            else {
                const blob = yield response.blob();
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = filename;
                link.click();
                URL.revokeObjectURL(url);
                console.log("File downloaded:", filename);
                return url;
            }
        }
        catch (error) {
            if (!(error instanceof Error))
                return;
            console.error("Error fetching file:", error);
            alert("Failed to get file: " + error.message);
        }
    });
}
function downloadAll() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch("/api/v1/worker/results");
        if (!response.ok)
            return alert("Failed to get results!");
        const data = yield response.json();
        if (!data.results)
            return alert("No results!");
        for (const result of data.results) {
            yield downloadFile(result);
        }
    });
}
function checkAll() {
    const botChecks = document.querySelectorAll('[data-ui="bot-check"]');
    let uncheck = true;
    for (const botCheck of botChecks)
        if (!botCheck.checked)
            uncheck = false;
    for (const botCheck of botChecks)
        botCheck.checked = !uncheck;
}
function addCheckBot(username) {
    if (!username)
        return;
    const possibleBot = document.querySelector(`#bot-check-${username}`);
    if (possibleBot)
        return;
    const botTemplate = document.querySelector("#check-bot-template");
    const botData = document.querySelector("#check-bot-data");
    if (!botTemplate || !botData)
        return;
    const newBotData = botTemplate.cloneNode(true);
    newBotData.id = `bot-check-${username}`;
    newBotData.classList.remove("page");
    const usernameText = newBotData.children[0].children[1];
    usernameText.textContent = username;
    usernameText.title = username;
    botData.appendChild(newBotData);
}
function addBot() {
    const botSelector = document.querySelector("#bot-select");
    const botTemplate = document.querySelector("#bot-template");
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
    if (botSelector.children.length > 1 && botSelector.value === newBot.value)
        deleteBotButton.classList.remove("transparent");
}
function changeBot() {
    const deleteBotButton = document.querySelector("#delete-bot");
    if (deleteBotButton)
        deleteBotButton.classList.remove("transparent");
}
function deleteBot() {
    var _a;
    const botSelector = document.querySelector("#bot-select");
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
        botSelector.children.length > 1 ? deleteBotButton.classList.remove("transparent") : deleteBotButton.classList.add("transparent");
    }
}
function processing() {
    const status = getBotEntryElement("#bot-auth-status");
    if (!status)
        return;
    status.innerHTML = '';
    const progress = document.createElement("progress");
    progress.classList.add("circle");
    progress.classList.add("small");
    status === null || status === void 0 ? void 0 : status.append(progress);
}
function bad_bot() {
    const status = getBotEntryElement("#bot-auth-status");
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
function good_bot(username) {
    const status = getBotEntryElement("#bot-auth-status");
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
    addCheckBot(username);
}
//<!-- 
// <progress class="circle"></progress>
// <i>check</i>
// <i>close</i> 
// -->
function getBotEntry() {
    const form = document.getElementById("bot-data");
    for (const child of form.children)
        if (child.classList.contains("active"))
            return child;
    return null;
}
function getBotEntryElement(querySelector, bot = getBotEntry()) {
    if (!bot) {
        alert("Bot not found!");
        return null;
    }
    const element = bot.querySelector(querySelector);
    return element;
}
function getBotEntryElementValue(querySelector) {
    const element = getBotEntryElement(querySelector);
    if (!element) {
        alert("Element not found!");
        return null;
    }
    return element.value;
}
function getCode() {
    return getBotEntryElementValue("#code");
}
function getUsername() {
    return getBotEntryElementValue("#username");
}
function getProxy() {
    return getBotEntryElementValue("#proxy");
}
function getApiId() {
    return getBotEntryElementValue("#api-id");
}
function getApiHash() {
    return getBotEntryElementValue("#api-hash");
}
function getPhoneNumber() {
    return getBotEntryElementValue("#phone-number");
}
function getProxyType() {
    return getBotEntryElementValue("#proxy-type");
}
var Status;
(function (Status) {
    Status["AWAITING"] = "awaiting";
    Status["FAIL"] = "fail";
    Status["SUCCESS"] = "success";
})(Status || (Status = {}));
function manageTdata(tdata_archive, username, proxy) {
    return __awaiter(this, void 0, void 0, function* () {
        const formData = new FormData();
        formData.append("tdata_archive_file", tdata_archive);
        formData.append("username", username);
        const proxyData = getProxyData();
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
        good_bot(username);
    });
}
function manageBotEntries(username, proxy_string) {
    return __awaiter(this, void 0, void 0, function* () {
        const proxy = getProxyData(proxy_string);
        if (!proxy)
            return bad_bot();
        const api_id = getApiId();
        if (!api_id)
            return bad_bot();
        const api_hash = getApiHash();
        if (!api_hash)
            return bad_bot();
        const phone_number = getPhoneNumber();
        if (!phone_number)
            return bad_bot();
        const ws_entry = window.location.origin.startsWith("https") ? "wss" : "ws";
        const ws = new WebSocket(`${window.location.origin.replace(/^https?/, ws_entry)}/api/v1/bot/create/credentials`);
        ws.onopen = () => ws.send(JSON.stringify({ api_id, api_hash, username, phone_number, proxy }));
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            switch (data.status) {
                case Status.FAIL:
                    bad_bot();
                    ws.close();
                    return alert(data.message);
                case Status.SUCCESS:
                    good_bot(username);
                    ws.close();
                    return alert(data.message);
                case Status.AWAITING:
                    sendCodeRequest(ws);
                    alert(data.message);
                    break;
            }
        };
    });
}
function authorizeBotSession() {
    return __awaiter(this, void 0, void 0, function* () {
        processing();
        const username = getUsername();
        if (!username) {
            bad_bot();
            return alert("Username not found!");
        }
        const proxy = getProxy();
        if (!proxy) {
            bad_bot();
            return alert("Proxy not found!");
        }
        const tdataInput = getBotEntryElement("#tdata-file");
        if (tdataInput && tdataInput.files && tdataInput.files.length)
            return yield manageTdata(tdataInput.files[0], username, proxy);
        else
            return yield manageBotEntries(username, proxy);
    });
}
function findBotSessions() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch("/api/v1/bot/fetch_bots");
        if (!response.ok) {
            if (response.status === 401)
                console.log("Unauthorized");
            else
                return alert("Failed to fetch bot sessions!");
        }
        const bots = (yield response.json()).bots;
        for (const username of bots)
            addCheckBot(username);
    });
}
function sendCodeRequest(ws) {
    const button = document.getElementById("send_code");
    button.onclick = () => sendCode(ws);
}
function sendCode(ws) {
    if (!ws)
        return alert("Not Connected!");
    if (!ws.CLOSED)
        return alert("Not Connected!");
    const code = getCode();
    ws.send(JSON.stringify({ code }));
}
function getBotList() {
    let botNames = [];
    for (const bot of document.querySelectorAll("[id^='bot-check-']")) {
        const checkbox = bot.children[0].children[0].children[0];
        if (checkbox.checked)
            botNames.push(bot.id.replace('bot-check-', ''));
    }
    return botNames;
}
function getSplitedChats(botsAmmount) {
    return __awaiter(this, void 0, void 0, function* () {
        const chats = yield getChats();
        if (!chats)
            return;
        return splitArrayEqually(chats, botsAmmount);
    });
}
function getChats() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const file = getFile("chats-file");
        if (file)
            return yield processFile(file);
        else
            return (_b = (_a = document.getElementById("chats")) === null || _a === void 0 ? void 0 : _a.value) === null || _b === void 0 ? void 0 : _b.split(/\r?\n/).filter(line => line.trim() !== "");
    });
}
function getKeywords() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const file = getFile("keywords-file");
        if (file)
            return yield processFile(file);
        else
            return (_b = (_a = document.getElementById("keywords")) === null || _a === void 0 ? void 0 : _a.value) === null || _b === void 0 ? void 0 : _b.split(/\r?\n/).filter(line => line.trim() !== "");
    });
}
function startBots() {
    return __awaiter(this, void 0, void 0, function* () {
        const bots = getBotList();
        if (!bots)
            return alert("No bots to start!");
        const splitedChats = yield getSplitedChats(bots.length);
        if (!splitedChats)
            return alert("Failed to get chats!");
        if (splitedChats.every(innerArray => innerArray.length === 0))
            return alert("Failed to get chats!");
        const keywords = yield getKeywords();
        if (!keywords)
            return alert("Failed to get keywords!");
        if (keywords.length === 0)
            return alert("Failed to get keywords!");
        var failed_chats = [];
        for (const bot of bots) {
            const chats = splitedChats.shift();
            chats.push(...failed_chats);
            failed_chats = [];
            if (!(yield startBot(bot, chats, keywords)))
                failed_chats.push(...chats);
        }
    });
}
function startBot(username, chats, keywords) {
    return __awaiter(this, void 0, void 0, function* () {
        if (chats.length === 0)
            return;
        const response = yield fetch("/api/v1/worker/start", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, chats, keywords })
        });
        if (!response.ok) {
            alert(`Failed to start bot ${username}!`);
            return false;
        }
        return true;
    });
}
