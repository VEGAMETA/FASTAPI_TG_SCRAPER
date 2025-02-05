type Nullable<T> = T | null;

function changeBot(this: HTMLSelectElement): void {
    alert(`${this.value}`);
}

function addBot(): void {
    const botSelector: Nullable<HTMLSelectElement> = document.querySelector("#bot_select");
    const botTemplate: Nullable<HTMLElement> = document.querySelector("#bot_template");
    const botData: Nullable<HTMLElement> = document.querySelector("#bot-data");
    const deleteBotButton: Nullable<HTMLButtonElement> = document.querySelector("#delete-bot");

    if (!botSelector || !botTemplate || !botData || !deleteBotButton) return;

    const newBot: HTMLOptionElement = document.createElement("option") as HTMLOptionElement;
    newBot.selected = true;
    newBot.value = `bot_${botSelector.children.length + 1}`;
    newBot.textContent = `Bot ${botSelector.children.length + 1}.`;
    botSelector.appendChild(newBot);

    const newBotData: HTMLElement = botTemplate.cloneNode(true) as HTMLElement;
    newBotData.id = `bot_${botSelector.children.length}`;
    newBotData.setAttribute("data-ui", `bot_${botSelector.children.length}`);
    
    Array.from(botData.children).forEach(child => child.classList.remove("active"));
    newBotData.classList.add("active");
    botData.appendChild(newBotData);
    
    if (botSelector.children.length > 1 && botSelector.value === newBot.value) {
        deleteBotButton.classList.remove("transparent");
    }
}

function deleteBot(): void {
    const botSelector: Nullable<HTMLSelectElement> = document.querySelector("#bot_select");
    const deleteBotButton: Nullable<HTMLButtonElement> = document.querySelector("#delete-bot");

    if (!botSelector || !deleteBotButton || botSelector.children.length <= 1) return;
    
    const lastBotOption = botSelector.children[botSelector.children.length - 1] as HTMLOptionElement;
    if (botSelector.value === lastBotOption.value) {
        const botToDelete: Nullable<HTMLElement> = document.querySelector(`#${botSelector.value}`);
        botToDelete?.remove();
        botSelector.removeChild(lastBotOption);

        const newLastBotOption = botSelector.children[botSelector.children.length - 1] as HTMLOptionElement;
        document.querySelector(`#${newLastBotOption.value}`)?.classList.add("active");
        newLastBotOption.selected = true;

        if (botSelector.children.length > 1) {
            deleteBotButton.classList.remove("transparent");
        } else {
            deleteBotButton.classList.add("transparent");
        }
    }
}


//<!-- 
// <progress class="circle"></progress>
// <i>check</i>
// <i>close</i> 
// -->

function processing(): void {
    const status = document.getElementById("bot_auth_status");
    if (!status) return;
    status.innerHTML = '';
    
    const progress = document.createElement("progress");
    progress.classList.add("circle");
    progress.classList.add("small");
    status?.append(progress);
}

function bad_bot(): void {
    const status = document.getElementById("bot_auth_status");
    if (!status) return;
    status.innerHTML = '';
    
    const icon = document.createElement("i");
    icon.textContent = "close";
    icon.classList.add("error");
    icon.classList.add("circle");
    status?.append(icon);

    const text = document.createElement("span");
    text.textContent = "N/a.";
    status?.append(text);

}

function good_bot(): void {
    const status = document.getElementById("bot_auth_status");
    if (!status) return;
    status.innerHTML = '';
    
    const icon = document.createElement("i");
    icon.textContent = "check";
    icon.classList.add("circle");
    status?.append(icon);

    const text = document.createElement("span");
    text.textContent = "Ok.";
    status?.append(text);
}



async function requestCode(): Promise<void> {
    return;
}

async function manageTdata(tdata_archive: File, username: string, proxy: string): Promise<void> {
    const formData = new FormData();
    formData.append("tdata_archive_file", tdata_archive); 
    formData.append("username",username);
    const proxyData = getProxy();
    if (!proxyData) return bad_bot();
    formData.append("proxy_scheme",proxyData.scheme);
    formData.append("proxy_hostname", proxyData.hostname);
    formData.append("proxy_port", proxyData.port);
    formData.append("proxy_username", proxyData.username);
    formData.append("proxy_password", proxyData.password);
    const response = await fetch("/api/v1/bot/create/tdata", {
        method: "POST",
        body: formData,
    });
    if (!response.ok) {
        const errorData = await response.json();
        const errorDetail = errorData.detail || errorData.message || "Неизвестная ошибка";
        alert(`Ошибка при загрузке Tdata! ${errorDetail}`);
        return bad_bot();
    }
    good_bot();
}

async function manageBotEntries(username: string, proxy: string): Promise<void> {
    const ws = new WebSocket(`${window.location.origin.replace(/^http/, "ws")}/api/v1/bot/create/credentials`);
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log(data.message); // "Enter the code"

        if (data.message === "Enter the code") {
            const code: string = prompt("Введите код:") as string;
            ws.send(code);
        } else {
            console.log("Ответ от сервера:", data);
        }
    };
}

async function authorizeBotSession(): Promise<void> {
    processing()
    const usernameInput = document.getElementById("username") as HTMLInputElement;
    if (!usernameInput) {bad_bot(); return alert("Username input not found!");}
    if (!usernameInput.value) {bad_bot(); return alert("Username is empty!");}

    const proxyInput = document.getElementById("proxy") as HTMLInputElement;
    if (!proxyInput) {bad_bot(); return alert("Proxy input not found!");}
    if (!proxyInput.value) {bad_bot(); return alert("Proxy is empty!");}

    const tdataInput = document.getElementById("tdata-file") as HTMLInputElement;
    if (tdataInput && tdataInput.files && tdataInput.files.length) return await manageTdata(tdataInput.files[0], usernameInput.value, proxyInput.value);
    else return await manageBotEntries(usernameInput.value, proxyInput.value);
}

function startBot(): void {
    return;
}
