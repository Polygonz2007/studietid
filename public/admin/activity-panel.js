
const doc = document;
let table = doc.querySelector("table");

fetchActivity();

// Functions
async function fetchActivity() {
    try {
        // Get activity
        let response = await fetch('/get_activity'); 
        let data = await response.json();

        //
        for (let i = 0; i < data.length; ++i) {
            let row = doc.createElement("tr");

            row.innerHTML += "<td>" + data[i].firstName + " " + data[i].lastName + "</td>";
            row.innerHTML += "<td>" + data[i].role + "</td>";
            row.innerHTML += "<td>" + data[i].subject + "</td>";
            row.innerHTML += "<td>" + data[i].room + "</td>";
            row.innerHTML += "<td>" + data[i].status + "</td>";
            row.innerHTML += "<td>" + data[i].goal + "</td>";

            row.innerHTML += "<td></td>";
            row.innerHTML += "<a href='#' class='left' onclick='finish(" + i + ", false)'>❌</a> <a href='#' class='right' onclick='finish(" + i + ", true)'>✅</a>";

            table.appendChild(row);
        }

    } catch (error) {
        console.error('Error:', error); // Håndterer eventuelle feil
    }
}


async function finish(i, valid) {
    const payload = {
        "idActivity": i,
        "valid": valid
    };

    // Send it, or try to atleast
    try {
        const response = await fetch("/finish_activity", {
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
}