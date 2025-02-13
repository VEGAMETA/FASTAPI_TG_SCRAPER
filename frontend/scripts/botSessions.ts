async function manageTdata(tdata_archive: File, username: string, proxy: string): Promise<void> {
    const formData = new FormData();
    formData.append("tdata_archive_file", tdata_archive); 
    formData.append("username",username);
    const proxyData = getProxyData();
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
    good_bot(username);
}

async function manageBotEntries(username: string, proxy: string): Promise<void> {
    if (!username || !proxy) return bad_bot();
    const proxyData = getProxy();
    if (!proxyData) return bad_bot();

    const ws = new WebSocket(`${window.location.origin.replace(/^https?/, "ws")}/api/v1/bot/create/credentials`);
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
    const username = getUsername();
    if (!username) {bad_bot(); return alert("Username not found!");}
    const proxy = getProxy();
    if (!proxy) {bad_bot(); return alert("Proxy not found!");}

    const tdataInput = getBotEntryElement("#tdata-file") as HTMLInputElement;
    if (tdataInput && tdataInput.files && tdataInput.files.length) return await manageTdata(tdataInput.files[0], username, proxy);
    else return await manageBotEntries(username, proxy);
}

async function findBotSessions() {
    const response = await fetch("/api/v1/bot/fetch_bots");
    if (!response.ok) return alert("Failed to fetch bot sessions!");
    const bots: string[] = (await response.json()).bots;
    for (const username of bots) addCheckBot(username);
}
