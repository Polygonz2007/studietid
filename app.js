
const sqlm = require('./sqlm.js');

const sqlite3 = require('better-sqlite3')
const path = require("path");
const db = global.db;

const session = require('express-session');
const bcrypt = require('bcrypt');
const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // To parse urlencoded parameters

const staticPath = path.join(__dirname, "public");


// Konfigurere session
app.use(session({
    secret: 'hemmelig_nøkkel',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Sett til true hvis du bruker HTTPS
}));

// Middleware to check if the user is logged in
function checkLoggedIn(req, res, next) {
    console.log(req.path);
    req.session.loggedIn = true;
    if (req.path == "/login" || req.path == "/login/")
        return;

    if (req.session.loggedIn) {
        console.log('Bruker logget inn:', req.user);
        next();
    } else {
        res.redirect('/login');
    }
}

function checkAdmin(idUser) {
    const user = sqlm.getUserById(idUser);
    return user.idRole == 3;
}

// Rute for innlogging
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    //update user set password = '$2b$10$OaYrsjfSOxIlRl3l6brlTe4erojrTxjgsYSzUNF.uCa9Ny9XMmXoS'
    //passord = Passord123
    
    // Finn brukeren basert på brukernavn
    const user = await sqlm.getUserByEmail(email); // Ensure this returns a promise
    
    if (!user) {
        return res.status(401).send('Invalid email');
    }

    // Sjekk om passordet samsvarer med hash'en i databasen
    console.log(password, user.password)
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
        // Lagre innloggingsstatus i session
        req.session.loggedIn = true;
        req.session.idUser = user.id;
        res.redirect('/home');
    } else {
        res.status(401).send({"error": "Invalid password"});
    }
});


app.all('*', checkLoggedIn);


// Admin
app.use("/admin/*", (req, res, next) => {
    if (!checkAdmin(req.session.idUser))
        res.sendFile(path.join(staticPath, "access-deny"));
    else
        next();
});

app.get("/admin", (req, res) => {
    res.redirect(path.join(staticPath, "admin/activity"));
});

//app.get("/admin/activity", (req, res) => {
//    res.sendFile(path.join(staticPath, "admin/activity"));
//});
//
//app.get("/admin/users", (req, res) => {
//        res.sendFile(path.join(staticPath, "access-deny"));
//});





/////////
// API //
app.get("/get_users", (req, res) => {
    console.log("/get_users/");

    res.send(sqlm.getUsers());
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
    if (result == 0)
        res.json("200");
    else
        res.json("Error");
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
    
    sql = db.prepare('SELECT user.id as userid, firstname, lastname, role.name  as role FROM user inner join role on user.idrole = role.id WHERE user.id  = ?');
    let rows = sql.all(info.lastInsertRowid)
    console.log("rows.length", rows.length)

    return 0 || {"error": "Database error. Try again."};
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
    console.log(idActivity, idAdmin, valid);
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
    console.log("Server is running on http://localhost:3000")
});