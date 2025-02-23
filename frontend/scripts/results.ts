async function getResults(): Promise<void> {
    const response = await fetch("/api/v1/worker/results");
    if (!response.ok) return console.error("Failed to get results!");

    const data = await response.json();
    if (!data.results) return console.info("No results!");

    const table = document.getElementById("results-table") as HTMLTableElement;
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
}

async function downloadFile(filename: string): Promise<any> {
    try{
        const response = await fetch(`/api/v1/worker/results/${filename}`);
        if (!response.ok) {
            throw new Error(`Failed to get file: ${response.statusText}`);
        }
        const contentType = response.headers.get('content-type');
        if (!contentType) {
            throw new Error("Content-Type header is missing");
        }
        if (contentType.startsWith('application/json')) {
            const data = await response.json();
            console.log("Received JSON data:", data);
            return data;
        } else if (contentType.startsWith('text/')) {
            const text = await response.text();
            console.log("Received text data:", text);
            return text;
        } else if (contentType.startsWith('image/')) {
            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
            console.log("Received image, URL:", imageUrl);
            return imageUrl;
        } else {
            const blob = await response.blob();
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
        if (!(error instanceof Error)) return
        console.error("Error fetching file:", error);
        alert("Failed to get file: " + error.message);
    }
}

async function downloadAll(): Promise<void> {
    const response = await fetch("/api/v1/worker/results");
    if (!response.ok) return alert("Failed to get results!");

    const data = await response.json();
    if (!data.results) return alert("No results!");

    for (const result of data.results) {
        await downloadFile(result);
    }
}