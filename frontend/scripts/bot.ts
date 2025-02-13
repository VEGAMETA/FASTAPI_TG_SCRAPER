function checkAll(): void {
    const botChecks: NodeListOf<HTMLInputElement> = document.querySelectorAll('[data-ui="bot-check"]');
    let uncheck = true;
    for (const botCheck of botChecks) if (!botCheck.checked) uncheck = false; 
    for (const botCheck of botChecks) botCheck.checked = !uncheck;
} 

function addCheckBot(username: string): void {
    if (!username) return;
    const possibleBot: Nullable<HTMLElement> = document.querySelector(`#bot-${username}`);
    if (possibleBot) return;

    const botTemplate: Nullable<HTMLElement> = document.querySelector("#bot-check-template");
    const botData: Nullable<HTMLElement> = document.querySelector("#bot-check-data");

    if (!botTemplate || !botData) return;

    const newBotData: HTMLElement = botTemplate.cloneNode(true) as HTMLElement;
    newBotData.id = `bot-${username}`;
    newBotData.classList.remove("page");
    newBotData.children[0].children[1].textContent = username;
    botData.appendChild(newBotData);
}

function addBot(): void {
    const botSelector: Nullable<HTMLSelectElement> = document.querySelector("#bot-select");
    const botTemplate: Nullable<HTMLElement> = document.querySelector("#bot-template");
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
    
    if (botSelector.children.length > 1 && botSelector.value === newBot.value) deleteBotButton.classList.remove("transparent");
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

        botSelector.children.length > 1 ? deleteBotButton.classList.remove("transparent") : deleteBotButton.classList.add("transparent");
    }
}

function processing(): void {
    const status = getBotEntryElement("#bot-auth-status");
    if (!status) return;
    status.innerHTML = '';
    
    const progress = document.createElement("progress");
    progress.classList.add("circle");
    progress.classList.add("small");
    status?.append(progress);
}

function bad_bot(): void {
    const status = getBotEntryElement("#bot-auth-status");
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

function good_bot(username: string): void {
    const status = getBotEntryElement("#bot-auth-status");
    if (!status) return;
    status.innerHTML = '';
    
    const icon = document.createElement("i");
    icon.textContent = "check";
    icon.classList.add("circle");
    status?.append(icon);

    const text = document.createElement("span");
    text.textContent = "Ok.";
    status?.append(text);
    addCheckBot(username);
}
function startBots(): void {
    return;
}


//<!-- 
// <progress class="circle"></progress>
// <i>check</i>
// <i>close</i> 
// -->
