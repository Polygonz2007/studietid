// Here we need to get all activities by this user, and display them in the table. Work out accounts later!

const doc = document;
let table = doc.getElementById("activities");

fetchActivities(); 

async function fetchActivities() {
    try {
        // Akkurat nå bryr vi oss ikke om hvilke bruker det er
        let response = await fetch('/get_activity');
        let data = await response.json();

        // Display the data!
        console.log(data);

    } catch (error) {
        table.innerHTML = "<p>Feil ved innlastning av data. Last inn siden på nytt.";
    }
}