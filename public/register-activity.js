// Get stuff
const doc = document;
let form = doc.querySelector("form");
let btn = doc.querySelector("button");


// Fill in the options in the form
fetchOptions();
btn.addEventListener("click", register);

// When we want to register studietid
async function register(event) {
    event.preventDefault();

    console.log("Register this stuff")

    const payload = {
        userId: 1,
        room: form.room.selectedIndex - 1,
        subject: form.subject.selectedIndex - 1,
        goal: form.goal.value
    };

    console.log(payload);

    console.log("doin request")

    try {
        const response = await fetch("/add_activity", {
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





// Functions
async function fetchOptions() {
    try {
        // Fetch API brukes for å hente data fra URLen
        let response = await fetch('/get_options'); // Hente brukere fra studietidDB
        let data = await response.json(); // Konverterer responsen til JSON

        // Rooms
        for (let i = 0; i < data.rooms.length; i++) {
            let option = doc.createElement("option");
            option.name = data.rooms[i].name;
            option.innerHTML = data.rooms[i].name;
            option.id = data.rooms[i].id;
            form.room.appendChild(option);
        }

        // Subjects
        for (let i = 0; i < data.subjects.length; i++) {
            let option = doc.createElement("option");
            option.name = data.subjects[i].name;
            option.innerHTML = data.subjects[i].name;
            option.id = data.subjects[i].id;
            form.subject.appendChild(option);
        }

    } catch (error) {
        console.error('Error:', error); // Håndterer eventuelle feil
    }
}