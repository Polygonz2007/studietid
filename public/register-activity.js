// Get stuff
const doc = document;
let form = doc.querySelector("form");
let btn = doc.querySelector("button");

let info = doc.querySelector("p");

// Fill in the options in the form
fetchOptions();
btn.addEventListener("click", register);

// When we want to register studietid
async function register(event) {
    event.preventDefault();

    // What we will send to the server
    const payload = {
        userId: 1,
        room: form.room.selectedIndex,
        subject: form.subject.selectedIndex,
        goal: form.goal.value
    };

    // Check if this stuff is valid data
    if (payload.room == 0 || payload.subject == 0) {
        info.innerHTML = "Please fill out all nesecarry fields.";
        return;
    }

    console.log(payload);

    console.log("doin request")

    // Send it, or try to atleast
    try {
        const response = await fetch("/add_activity", {
            method: "POST",
            headers: {"Content-type": "application/json"},
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        // Show response
        if (data.error) {
            info.innerHTML = data.error;
        } else {
            info.innerHTML = "Success!"
        }

    } catch {
        info.innerHTML = "Something went very wrong. Please try again.";
    }
};





// Functions
async function fetchOptions() {
    try {
        // Get options
        let response = await fetch('/get_options'); 
        let data = await response.json();

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