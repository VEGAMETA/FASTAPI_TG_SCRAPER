async function openInvite(): Promise<boolean> {
    const modal = document.getElementById("dialog-invite") as HTMLElement;
    if (!modal) return false;
    const invite_token = document.getElementById("invite_token") as HTMLElement;
    if (!invite_token) return false;
    
    try {
        const response = await fetch("/api/v1/auth/invite_token");
        const token = await response.text();
        invite_token.innerHTML = token;
        modal.classList.add('active');
        return true;
    } catch (error) {
        console.error("Auth check failed:", error);
        return false;
    }
}

function closeInvite(): void {
    const modal = document.getElementById("dialog-invite") as HTMLElement;
    if (!modal) return;
    modal.classList.remove('active');
}

function openHelp(): void {
    const modal = document.getElementById("dialog-help") as HTMLElement;
    if (!modal) return;
    modal.classList.add('active');
}

async function openResults(): Promise<void> {
    await getResults();
    const modal = document.getElementById("dialog-results") as HTMLElement;
    if (!modal) return;
    modal.classList.add('active');
}

function closeResults(): void {
    const modal = document.getElementById("dialog-results") as HTMLElement;
    if (!modal) return;
    modal.classList.remove('active');
}

function closeHelp(): void {
    const modal = document.getElementById("dialog-help") as HTMLElement;
    if (!modal) return;
    modal.classList.remove('active');
}

function swap(): void {
    const iconElement = document.querySelector("#change_theme i") as HTMLElement;
    if (!iconElement) return;
    if (iconElement.textContent === "dark_mode") {
        iconElement.textContent = "light_mode";
    } else {
        iconElement.textContent = "dark_mode";
    }
    ui("mode", iconElement.textContent.split('_')[0]);
}

function changeTheme(): void {
    const iconElement = document.querySelector("#change_theme i") as HTMLElement;

    if (!iconElement || !iconElement.textContent) return
    ui("mode", iconElement.textContent.split('_')[0]);

    if (iconElement.textContent === "dark_mode") {
        iconElement.textContent = "light_mode";
    } else {
        iconElement.textContent = "dark_mode";
    }
}
