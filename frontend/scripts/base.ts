type Nullable<T> = T | null;

document.addEventListener("DOMContentLoaded", () => {
    (async () => {
        try {
            const isAuthenticated = await checkAuth();

            const mainPage = document.querySelector<HTMLElement>(".main-page");
            const loginPage = document.querySelector<HTMLElement>(".login-page");

            if (mainPage && loginPage) {
                mainPage.style.display = isAuthenticated ? "block" : "none";
                loginPage.style.display = isAuthenticated ? "none" : "block";
            } else {
                console.error("Main page or login page elements not found!");
            }

            const themeIcon = document.querySelector<HTMLElement>("#change_theme i");
            if (themeIcon) {
                if (ui("mode") === "dark") {
                    themeIcon.textContent = "light_mode";
                } else {
                    themeIcon.textContent = "dark_mode";
                }
            }

            addBot();
            findBotSessions();
            getResults();
            
            const botSelector = document.querySelector<HTMLSelectElement>("#bot_select");
            if (botSelector) {
                const selectedBot = document.querySelector<HTMLElement>(`#${botSelector.value}`);
                if (selectedBot) selectedBot.classList.add("active");

                botSelector.addEventListener("change", function () {
                    const botData = document.querySelector<HTMLElement>("#bot-data");
                    if (botData) {
                        for (let i = 0; i < botData.children.length; i++) {
                            (botData.children[i] as HTMLElement).classList.remove("active");
                        }

                        const bot = document.querySelector<HTMLElement>(`#${this.value}`);
                        if (bot) bot.classList.add("active");

                        const deleteBotButton = document.querySelector<HTMLElement>("#delete-bot");
                        if (deleteBotButton) {
                            const lastChild: HTMLInputElement = botSelector.children[botSelector.children.length - 1] as HTMLInputElement;
                            if (botSelector.children.length > 1 && botSelector.value === lastChild.value) {
                                deleteBotButton.classList.remove("transparent");
                            } else {
                                deleteBotButton.classList.add("transparent");
                            }
                        }
                    }
                });
            }
        } catch (error) {
            console.error("Failed to check authentication:", error);
        }
    })();
});


function splitArrayEqually<T>(array: T[], n: number): T[][] {
    const result: T[][] = [];
    const length = array.length;
    const minChunkSize = Math.floor(length / n);
    const remainder = length % n;

    let start = 0;

    for (let i = 0; i < n; i++) {
        const chunkSize = minChunkSize + (i < remainder ? 1 : 0);
        const chunk = array.slice(start, start + chunkSize);
        result.push(chunk);
        start += chunkSize;
    }

    return result;
}
