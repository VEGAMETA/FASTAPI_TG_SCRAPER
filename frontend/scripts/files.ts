function readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
}

async function processFile(file: File): Promise<string[]> {
    try {
        const text = await readFileAsText(file);
        return text.split(/\r?\n/).filter(line => line.trim() !== "");
    } catch (error) {
        console.error("Ошибка чтения файла:", error);
        return [];
    }
}
function getFile(inputFileId: string): File | void {
    const fileInput = document.getElementById(inputFileId) as HTMLInputElement;
    if (!fileInput || !fileInput.files || !fileInput.files.length) return;
    return fileInput.files[0];
}