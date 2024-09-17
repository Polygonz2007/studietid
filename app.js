
const sqlite3 = require('better-sqlite3')
const path = require("path");
const db = sqlite3('./studietid.db', {verbose: console.log})
const express = require("express");
const app = express();
app.use(express.json());


const staticPath = path.join(__dirname, "public");


app.get("/", (req, res) => {
    res.sendFile(path.join(staticPath, "app.html"));
});

app.get("/add-user", (req, res) => {
    res.sendFile(path.join(staticPath, "add-user.html"));
});

app.get("/register-activity", (req, res) => {
    res.sendFile(path.join(staticPath, "register-activity.html"));
});


/////////
// API //
app.get("/get_users", (req, res) => {
    console.log("/api/get_users/");

    const sql = db.prepare("SELECT user.id as userid, firstname, lastname, role.name as role FROM user inner join role on user.idrole = role.id");
    let rows = sql.all()
    console.log("rows.length", rows.length);

    res.send(rows);
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

    return {} || {"error": "Something went wrong in the database. Try again later (sorry)"};
}



function begin_activity(idUser, idSubject, idRoom) {
    let add_sql = db.prepare("INSERT INTO activity (idUser, startTime, idSubject, idRoom, idStatus) " +
                             " values (?, ?, ?, ?, ?)");
    const result = add_sql.run(idUser, Date(), idSubject, idRoom, 0);
}

function finish_activity(valid) {
    
}


app.use(express.static(staticPath));
app.listen(3000, () => {
    console.log("Server is running on htp://localhost:3000")
});