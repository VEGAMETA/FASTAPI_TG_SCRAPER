function getProxy(): { scheme: string; hostname: string; port: string; username: string; password: string } | void {
    const proxy_scheme = document.getElementById("proxy_type") as HTMLSelectElement;
    if (!proxy_scheme) return alert("Proxy type input not found!");
    const proxy = document.getElementById("proxy") as HTMLInputElement;
    if (!proxy) return alert("Proxy input not found!");
    
    const scheme = proxy_scheme.value;
    const proxy_value = proxy.value;
    const [hostname, port] = proxy_value.split("@")[0].split(":");
    const [username, password] = proxy_value.split("@")[1].split(":");
    return { scheme, hostname, port, username, password };
}

async function checkProxy() {
    const proxy_field = document.getElementById("proxy_field") as HTMLDivElement;
    if (!proxy_field) return alert("Proxy field input not found!");
    
    proxy_field.querySelector("#proxy_icon")?.remove();
    const progress = document.createElement("progress");
    progress.id = "proxy_icon";
    progress.classList.add("circle");
    proxy_field.appendChild(progress);

    try {
        const response = await fetch("/api/v1/proxy/check_proxy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(getProxy()),
        });
        if (response.ok) {
            proxy_field.querySelector("#proxy_icon")?.remove();
            const check = document.createElement("i");
            check.id = "proxy_icon";
            check.innerHTML = "check";
            proxy_field.appendChild(check);
            return;
        }
        else {
            const data = await response.json();
            alert(data.detail);
        }
    } catch (error) {
        if (error instanceof TypeError) alert("Invalid proxy value");
        else {
            console.error("Proxy is invalid:", error);
            alert(error);
        }
    }
    proxy_field.querySelector("#proxy_icon")?.remove();
    const close = document.createElement("i");
    close.id = "proxy_icon";
    close.innerHTML = "close";
    proxy_field.appendChild(close);
    return;
}