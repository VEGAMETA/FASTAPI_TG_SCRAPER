function getProxyData(proxy: Nullable<string> = getProxy(), scheme: Nullable<string> = getProxyType()): { scheme: string; hostname: string; port: string; username: string; password: string } | void {
    if (!proxy) return alert("Proxy input not found!");
    if (!scheme) return alert("Proxy type input not found!");
    const [hostname, port] = proxy.split("@")[0].split(":");
    const [username, password] = proxy.split("@")[1].split(":");
    return { scheme, hostname, port, username, password };
}

async function checkProxy() {
    const proxy_field = getBotEntryElement("#proxy-field") as HTMLDivElement;
    if (!proxy_field) return alert("Proxy field input not found!");
    const proxy = getProxy();
    if (!proxy) return alert("Proxy is empty!");

    getBotEntryElement("#proxy-icon")?.remove();
    const progress = document.createElement("progress");
    progress.id = "proxy-icon";
    progress.classList.add("circle");
    proxy_field.appendChild(progress);

    try {
        const response = await fetch("/api/v1/proxy/check_proxy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(getProxyData(proxy)),
        });
        if (response.ok) {
            proxy_field.querySelector("#proxy-icon")?.remove();
            const check = document.createElement("i");
            check.id = "proxy-icon";
            check.innerHTML = "check";
            proxy_field.appendChild(check);
            return;
        }
        else {
            // CHECK RESPONSE IS VALID JSON
            if (response.headers.get("Content-Type") !== "application/json") throw new TypeError("Invalid proxy");
            const data = await response.json();
            if (data.detail) alert(data.detail);
            else alert("Proxy is valid");
        }
    } catch (error) {
        if (error instanceof TypeError) alert("Invalid proxy value");
        else {
            console.error("Proxy is invalid:", error);
            alert(error);
        }
    }
    proxy_field.querySelector("#proxy-icon")?.remove();
    const close = document.createElement("i");
    close.id = "proxy-icon";
    close.innerHTML = "close";
    proxy_field.appendChild(close);
    return;
}