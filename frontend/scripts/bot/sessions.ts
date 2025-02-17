enum Status {
    AWAITING = "awaiting",
    FAIL = "fail",
    SUCCESS = "success"
}

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

async function manageBotEntries(username: string, proxy_string: string): Promise<void> {
    const proxy = getProxyData(proxy_string);
    if (!proxy) return bad_bot();
    const api_id = getApiId();
    if (!api_id) return bad_bot();
    const api_hash = getApiHash();
    if (!api_hash) return bad_bot();
    const phone_number = getPhoneNumber();
    if (!phone_number) return bad_bot();

    const ws = new WebSocket(`${window.location.origin.replace(/^https?/, "ws")}/api/v1/bot/create/credentials`);
    
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

function sendCodeRequest(ws: WebSocket){
    const button = document.getElementById("send_code") as HTMLButtonElement;
    button.onclick = () => sendCode(ws);
}

function sendCode(ws: WebSocket){
    if (!ws) return alert("Not Connected!");
    if (!ws.CLOSED) return alert("Not Connected!");
    const code = getCode();
    ws.send(JSON.stringify({ code }));
}
