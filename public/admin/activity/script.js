
const doc = document;
let table = doc.querySelector("table");

// Buttons
let alle =       doc.getElementById("Alle");
let ubekreftet = doc.getElementById("Ubekreftet");
let bekreftet =  doc.getElementById("Bekreftet");
let annulert =   doc.getElementById("Annulert");

alle.addEventListener("click",  () => {fetchActivity()});
bekreftet.addEventListener("click", () => {fetchActivity(3)});
ubekreftet.addEventListener("click", () => {fetchActivity(2)});
annulert.addEventListener("click", () => {fetchActivity(1)});

fetchActivity();


const head = `<tr>
                <th class="long">Navn</th>
                <th class="short">Fag</th>
                <th class="short">Rom</th>
                <th class="short">Status</th>
                <th class="long">Mål</th>
                <th></th>
                <th>Aksepter</th>
            </tr>`;

// Functions
async function fetchActivity(filter) {
    const payload = {
        "filterType": filter ? "status" : "", // hvis filter, send { "filterType": "status" } men hvis ikke send { "filterType": "" }
        "status": filter // er irrelevant hvis ingen filter
    }

    try {
        // Get activity
        const response = await fetch("/get_activity", {
            method: "POST",
            headers: {"Content-type": "application/json"},
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        // Clear
        table.innerHTML = head;

        // Fill in table
        for (let i = 0; i < data.length; ++i) {
            let row = doc.createElement("tr");

            row.id = i;
            row.class = "data";

            row.innerHTML += "<td>" + data[i].firstName + " " + data[i].lastName + "</td>";
            row.innerHTML += "<td>" + data[i].subject + "</td>";
            row.innerHTML += "<td>" + data[i].room + "</td>";
            row.innerHTML += "<td>" + data[i].status + "</td>";
            row.innerHTML += "<td>" + data[i].goal + "</td>";

            row.innerHTML += "<td></td>";
            row.innerHTML += "<a href='#' class='left' onclick='finish(" + data[i].actId + ", false)'>❌</a> <a href='#' class='right' onclick='finish(" + data[i].actId + ", true)'>✅</a>";

            table.appendChild(row);
        }

        // Style
        style(filter);

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

        console.log("owow")

        // Show response
        if (data.error) {
            console.log("whoops");
        } else {
            // Clear
            for (let index = 0; index < table.children.length; ++index) {
                if (table.children[index].nodeName === "TR")
                    table.children[index].remove();
            }

            // Add
            fetchActivity();

            // Clear ourselves
            table.children[i].remove();
        }

    } catch {
        console.log("Hahaha");
    }
}





function style(filter) {
    // Update styles, so that only the current active filter button has "selected" class.
    alle.className =       (!filter)     ? "selected" : "";
    annulert.className =   (filter == 1) ? "selected" : "";
    ubekreftet.className = (filter == 2) ? "selected" : "";
    bekreftet.className =  (filter == 3) ? "selected" : "";
}