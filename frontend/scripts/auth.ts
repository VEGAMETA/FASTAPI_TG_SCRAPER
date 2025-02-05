function get_password_hash(): string | void {
    const password = document.getElementById('scrambt_password') as HTMLInputElement;
    if (!password) return alert("Password input not found!");
    if (!password.value) return alert("Password is empty!");

    const hash = new jsSHA("SHA-512", "TEXT", { numRounds: 1 });
    hash.update(password.value);
    return hash.getHash("HEX");
}

function get_username(): string | void {
    const username = document.getElementById("scrambt_username") as HTMLInputElement;
    if (!username) return alert("Username input not found!");
    if (!username.value) return alert("Username is empty!");
    return username.value;
}

function getInviteToken(): string | void {
    const invite_token = document.getElementById("scrambt_token") as HTMLInputElement;
    if (!invite_token) return alert("Invite token input not found!");
    if (!invite_token.value) return alert("Invite token is empty!");
    return invite_token.value;
}

async function checkAuth(): Promise<boolean> {
    try {
        const response = await fetch("/api/v1/auth/check_auth");
        return response.ok;
    } catch (error) {
        console.error("Auth check failed:", error);
        return false;
    }
}

async function logout(): Promise<void> {
    try {
        const response = await fetch("/api/v1/auth/logout", { method: "POST" });
        if (response.ok) {
            window.location.reload();
        } else {
            alert("Logout failed. Please try again.");
        }
    } catch (error) {
        console.error("Logout failed:", error);
        alert("Logout failed. Please try again.");
    }
}

async function login(): Promise<void> {
    const username = get_username();
    if (!username) return;

    const password = get_password_hash();
    if (!password) return;

    try {
        const response = await fetch("/api/v1/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            window.location.reload();
        } else {
            const data = await response.json();
            alert(data.detail);
        }
    } catch (error) {
        console.error("Login failed:", error);
        alert("Login failed. Please try again.");
    }
}

async function signup(): Promise<void> {
    const invite_token = getInviteToken();
    if (!invite_token) return;

    const username = get_username();
    if (!username) return;

    const password = get_password_hash();
    if (!password) return;

    try {
        const response = await fetch("/api/v1/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password, invite_token }),
        });

        if (response.ok) {
            window.location.reload();
        } else {
            const data = await response.json();
            alert(data.detail);
        }
    } catch (error) {
        console.error("Signup failed:", error);
        alert("Signup failed. Please try again.");
    }
}