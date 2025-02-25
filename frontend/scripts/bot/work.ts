function getBotList(): string[] {
    let botNames = []
    for (const bot of document.querySelectorAll("[id^='bot-check-']")) {
        const checkbox = bot.children[0].children[0].children[0] as HTMLInputElement;
        if (checkbox.checked) botNames.push(bot.id.replace('bot-check-', ''));
    }
    return botNames;
}

async function getSplitedChats(botsAmmount: number): Promise<string[][] | void>{
    const chats = await getChats();
    if (!chats) return;
    return splitArrayEqually(chats, botsAmmount);
}

async function getChats(): Promise<string[] | void>{
    const file = getFile("chats-file");
    if (file) return await processFile(file);
    else return (document.getElementById("chats") as HTMLTextAreaElement)?.value?.split(/\r?\n/).filter(line => line.trim() !== "");
}

async function getKeywords(): Promise<string[] | void> {
    const file = getFile("keywords-file");
    if (file) return await processFile(file);
    else return (document.getElementById("keywords") as HTMLTextAreaElement)?.value?.split(/\r?\n/).filter(line => line.trim() !== "");
}

async function startBots(){
    const bots = getBotList();
    if (!bots) return alert("No bots to start!");
    const splitedChats = await getSplitedChats(bots.length);
    if (!splitedChats) return alert("Failed to get chats!");
    if (splitedChats.every(innerArray => innerArray.length === 0)) return alert("Failed to get chats!");
    const keywords = await getKeywords();
    if (!keywords) return alert("Failed to get keywords!");
    if (keywords.length === 0) return alert("Failed to get keywords!");
    var failed_chats: string[] = [];
    for (const bot of bots) {
        const chats = splitedChats.shift()!;
        chats.push(...failed_chats);
        failed_chats = [];
        if (!await startBot(bot, chats, keywords)) failed_chats.push(...chats);
    }
}

async function startBot(username: string, chats: string[], keywords: string[]){
    if (chats.length === 0) return;
    const response = await fetch(
        "/api/v1/worker/start", 
        { 
            method: "POST", 
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, chats, keywords })
        }
    );
    if (!response.ok) {
        alert(`Failed to start bot ${username}!`);
        return false;
    }
    return true;
}