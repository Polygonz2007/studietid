
const sqlite3 = require('better-sqlite3')
const path = require("path");
const db = sqlite3('./studietid.db', {verbose: console.log})
const express = require("express");
const app = express();
app.use(express.json());


const staticPath = path.join(__dirname, "public");


app.get("/", (req, res) => {
    res.sendFile(path.join(staticPath, "homepage.html"));
});

app.get("/add-user", (req, res) => {
    res.sendFile(path.join(staticPath, "add-user.html"));
});

app.get("/register-activity", (req, res) => {
    res.sendFile(path.join(staticPath, "register-activity.html"));
});


// Admin
app.get("/admin/activity-panel", (req, res) => {
    res.sendFile(path.join(staticPath, "admin/activity-panel.html"));
});


/////////
// API //
app.get("/get_users", (req, res) => {
    console.log("/get_users/");

    const sql = db.prepare("SELECT user.id as userid, firstname, lastname, role.name as role FROM user inner join role on user.idrole = role.id");
    let rows = sql.all()
    console.log("rows.length", rows.length);

    res.send(rows);
});

app.get("/get_options", (req, res) => {
    console.log("/get_rooms");

    let result = {
        "rooms": null,
        "subjects": null
    };

    const sqlRooms = db.prepare("SELECT * FROM room");
    const rooms = sqlRooms.all();
    result.rooms = rooms;

    const sqlSubjects = db.prepare("SELECT * FROM subject");
    const subjects = sqlSubjects.all();
    result.subjects = subjects;

    res.json(result);
});

app.post("/add_user", (req, res) => {
    console.log("We got.. something");
    console.log(req.body);
    console.log("\nReceived request for adding new user.");

    req = req.body;

    const result = add_user(req.first_name, req.last_name, req.id_role, req.is_admin, req.email);
    if (result.error)
        res.json(result);
    else
        res.json("Added user successfully.");
});

app.post("/add_activity", (req, res) => {
    console.log("We got.. something");
    console.log(req.body);
    console.log("\nReceived request for adding new activity user.");

    req = req.body;

    const result = begin_activity(req.userId, req.subject, req.room, req.goal);
    if (result.error)
        res.json(result);
    else
        res.json("Added user successfully.");
});

app.post("/finish_activity", (req, res) => {
    req = req.body;

    const result = finish_activity(req.idActivity, 1, req.valid);
});

app.get("/get_activity", (req, res) => {
    console.log("Get activity. Replying...");

    const sql = db.prepare("SELECT firstName, lastName, role.name AS role, subject.name AS subject, room.name AS room, status.name AS status, goal, idAdmin FROM activity "
                         + "INNER JOIN user ON user.id = idUser "
                         + "INNER JOIN role ON role.id = idRole "
                         + "INNER JOIN subject ON subject.id = idSubject "
                         + "INNER JOIN room ON room.id = idRoom "
                         + "INNER JOIN status ON status.id = idStatus "
                         + "ORDER BY CASE WHEN status.id = 2 THEN 1 WHEN status.id = 1 THEN 2 WHEN status.id = 3 THEN 3 END ASC");
    const data = sql.all();

    res.json(data);
});
// END API //
/////////////

//
// FUNCTIONS
//
function is_email_valid(email) {
    const regex = /[A-za-z0-9]+@[a-z]+.[a-z]+/;
    const test = regex.test(email);
    
    return test;
}

function email_in_db(email) {
    let emails_sql = db.prepare("SELECT * FROM user WHERE email = ?");
    const emails = emails_sql.all(email);

    return emails.length !== 0;
}


//let result = addUser("Sander Kvandal", "Frøystein", 1, 0, "skfroystein@gmail.com")

function add_user(firstName, lastName, idRole, isAdmin, email)
 {
    // check if email is valid
    if (!is_email_valid(email))
        return {"error": "Invalid email format"};

    // check if the email already exists in database
    if (email_in_db(email))
        return {"error": "Email already exists in database"};

    console.log("HELLO?!?!?")

    // Add to the database
    let sql = db.prepare("INSERT INTO user (firstName, lastName, idRole, isAdmin, email) " + 
                         " values (?, ?, ?, ?, ?)")
    const info = sql.run(firstName, lastName, idRole, isAdmin, email)
    
    sql = db.prepare('SELECT user.id as userid, firstname, lastname, role.name  as role FROM user inner join role on user.idrole = role.id   WHERE user.id  = ?');
    let rows = sql.all(info.lastInsertRowid)
    console.log("rows.length",rows.length)

    return 0 || {"error": "Something went wrong in the database. Try again later (sorry)"};
}



function begin_activity(idUser, idSubject, idRoom, goal) {
    // Add the things
    let add_sql = db.prepare("INSERT INTO activity (idUser, startTime, idSubject, idRoom, idStatus, goal) " +
                             " values (?, ?, ?, ?, ?, ?)");
    const result = add_sql.run(idUser, Date(), idSubject, idRoom, 2, goal);

    // Check if it worked
    if (result.changes !== 0)
        return 0;
    else
        return {"error": "Database malfunction"};
}

function finish_activity(idActivity, idAdmin, valid) {
    let finish_sql = db.prepare("UPDATE activity SET idAdmin = ?, idStatus = ? WHERE id = ?");
    const result = finish_sql.run(idAdmin, valid ? 3 : 1, idActivity);

    // Check if it worked
    if (result.changes !== 0)
        return 0;
    else
        return {"error": "Database malfunction"};
}


app.use(express.static(staticPath));
app.listen(3000, () => {
    console.log("Server is running on htp://localhost:3000")
});