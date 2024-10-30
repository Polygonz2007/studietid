const doc = document;
var error = doc.getElementById("error");
var success = doc.getElementById("success");

const user_form = doc.querySelector("form");

user_form.addEventListener("submit", add_user);

async function add_user(event) {
    event.preventDefault();

    console.log("Addinguser")

    const payload = {
        first_name: user_form.first_name.value,
        last_name: user_form.last_name.value,
        id_role: 3,
        is_admin: 0,
        email: user_form.email.value 
    };

    console.log("doin request")

    try {
        const response = await fetch("/add_user", {
            method: "POST",
            headers: {"Content-type": "application/json"},
            body: JSON.stringify(payload)
        });

        console.log(response);
        const data = await response.json();

        if (data.error) {
            error.innerHTML = data.error;
            success.innerHTML = "";
        } else {
            error.innerHTML = "";
            success.innerHTML = data;
        }

    } catch {
        error.innerHTML = "Could not send HTTP request to server. Try again.";
    }
};