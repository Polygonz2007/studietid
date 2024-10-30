const doc = document;
var info = doc.getElementById("info");
//var success = doc.getElementById("success");

const form = doc.querySelector("form");

form.addEventListener("submit", login);

async function login(event) {
    event.preventDefault();

    console.log("Logging in")

    const payload = {
        email: form.email.value,
        password: form.password.value
    };

    console.log("doin request", payload)

    try {
        const response = await fetch("/login", {
            method: "POST",
            headers: {"Content-type": "application/json"},
            body: JSON.stringify(payload)
        });

        console.log(response);
        console.log("wow");

        if (response.error) {
            error.innerHTML = response.error;
            console.log("error", response.error);
        } else {
            window.location.href = response.url;
            console.log("yeh");
        }

    } catch {
        info.innerHTML = "Something went wrong. Try again.";
    }
};