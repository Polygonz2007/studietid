// Here we need to get all activities by this user, and display them in the table. Work out accounts later!

const doc = document;
let table = doc.getElementById("activities");

fetchActivity(); 


const head = `<tr>
                <th class="long">Dato</th>
                <th class="short">Fag</th>
                <th class="short">Rom</th>
                <th class="short">Status</th>
                <th class="long">Mål</th>
            </tr>`;

async function fetchActivity() {
    const payload = {
        "filterType": "idUser" // id gis av server
    }

    try {
        // Get activity
        const response = await fetch("/get_activity", {
            method: "POST",
            headers: {"Content-type": "application/json"},
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.length == 0) { // skjekke at det er noe som helst
            table.innerHTML = "Du har ingen registrerte studietimer enda.";
            return;
        }

        // Clear
        table.innerHTML = head;

        // Fill in table
        for (let i = 0; i < data.length; ++i) {
            let row = doc.createElement("tr");

            row.id = i;
            
            if (data[i].status == "Bekreftet")
                row.className = "finished";
            else if (data[i].status == "Annulert")
                row.className = "dismissed";
            else
                row.className = "active";

            row.innerHTML += "<td>" + data[i].date + "</td>";
            row.innerHTML += "<td>" + data[i].subject + "</td>";
            row.innerHTML += "<td>" + data[i].room + "</td>";
            row.innerHTML += "<td>" + data[i].status + "</td>";
            row.innerHTML += "<td>" + data[i].goal + "</td>";

            table.appendChild(row);
        }

    } catch (error) {
        console.error('Error:', error); // Håndterer eventuelle feil
    }
}