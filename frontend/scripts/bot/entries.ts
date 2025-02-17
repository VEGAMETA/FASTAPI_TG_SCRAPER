function getBotEntry(): Nullable<HTMLElement> {
    const form = document.getElementById("bot-data") as HTMLFormElement;
    for (const child of form.children) if ((child as HTMLElement).classList.contains("active")) return child as HTMLElement;
    return null;
}

function getBotEntryElement(querySelector: string, bot: Nullable<HTMLElement> = getBotEntry()):  Nullable<HTMLElement> {
    if (!bot) {alert("Bot not found!"); return null;}
    const element = bot.querySelector(querySelector) as HTMLElement;
    return element;
}

function getBotEntryElementValue(querySelector: string): string | null {
    const element = getBotEntryElement(querySelector) as HTMLInputElement;
    if (!element) {alert("Element not found!"); return null;}
    return element.value;
}

function getCode(): Nullable<string> {
    return getBotEntryElementValue("#code")
}

function getUsername():  Nullable<string> {
    return getBotEntryElementValue("#username");
}

function getProxy(): Nullable<string> {
    return getBotEntryElementValue("#proxy");
}

function getApiId(): Nullable<string> {
    return getBotEntryElementValue("#api-id");
}

function getApiHash(): Nullable<string> {
    return getBotEntryElementValue("#api-hash");
}

function getPhoneNumber(): Nullable<string> {
    return getBotEntryElementValue("#phone-number");
}

function getProxyType(): Nullable<string> {
    return getBotEntryElementValue("#proxy-type");
}
