// Get user info and display
const doc = document;

var table = doc.querySelector("table");

async function fetchActivity() {
    try {
        // Get activity
        let response = await fetch('/get_users'); 
        let data = await response.json();

        //
        for (let i = 0; i < data.length; ++i) {
            let row = doc.createElement("tr");

            row.id = i;
            row.class = "data";

            row.innerHTML += "<td>" + data[i].firstName + " " + data[i].lastName + "</td>";
            row.innerHTML += "<td>" + data[i].role + "</td>";

            table.appendChild(row);
        }

    } catch (error) {
        console.error('Error:', error); // Håndterer eventuelle feil
    }
}