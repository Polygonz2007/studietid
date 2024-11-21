
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
    if (req.path.startsWith("/login") || req.path == "/global.css" || req.path.startsWith("/info"))
        return next();

    if (req.session.loggedIn) {
        return next();
    } else {
        res.redirect('/login');
    }
}

function checkAdmin(idUser) {
    const user = sqlm.getUserById(idUser);
    return user.idRole == 1;
}

// Rute for innlogging
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    // Finn brukeren basert på brukernavn
    const user = await sqlm.getUserByEmail(email); // Ensure this returns a promise
    
    if (!user) {
        return res.status(401).send('Invalid email');
    }

    // Sjekk om passordet samsvarer med hash'en i databasen
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
        // Lagre innloggingsstatus i session
        req.session.loggedIn = true;
        req.session.idUser = user.id;
        if (checkAdmin(user.id))
            res.redirect('/admin');
        else
            res.redirect('/home');
    } else {
        res.status(401).send({"error": "Invalid password"});
    }
});


app.all('*', checkLoggedIn);
app.get("/", (req, res) => {
    res.redirect("/home");
});


// Admin
app.use("/admin/*", (req, res, next) => {
    if (!checkAdmin(req.session.idUser))
        res.redirect("/access-deny");
    else
        return next();
});

app.get("/admin", (req, res) => {
    res.redirect("/admin/activity");
});





// API
app.get("/get_users", (req, res) => {
    res.send(sqlm.getUsers());
});

app.get("/get_options", (req, res) => {
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
    req = req.body;

    const result = add_user(req.first_name, req.last_name, req.id_role, req.email, req.password);
    if (result.error)
        res.json(result);
    else
        res.json("Added user successfully.");
});

app.post("/add_activity", (req, res) => {
    const result = begin_activity(req.session.idUser, req.body.subject, req.body.room, req.body.goal);
    if (result.error)
        res.json(result);
    else
        res.redirect("/home");
});

app.post("/finish_activity", (req, res) => {
    const result = finish_activity(req.body.idActivity, req.session.idUser, req.body.valid);

    if (result == 0)
        res.json("200");
    else
        res.json("Error");
});

app.post("/get_activity", (req, res) => {
    // Få id til brukeren som spør etter aktivitet, hvis den trengs
    if (req.body.filterType == "idUser")
        req.body.idUser = req.session.idUser;

    console.log("Brukeren er " + req.session.idUser + " og de vil ha " + req.body.filterType);

    res.json(sqlm.getActivity(req.body));
});








//
// FUNCTIONS
function is_email_valid(email) {
    const regex = /[A-Za-z0-9]+@[a-z]+.[a-z]+/;
    const test = regex.test(email);
    
    return test;
}

function email_in_db(email) {
    let emails_sql = db.prepare("SELECT * FROM user WHERE email = ?");
    const emails = emails_sql.all(email);

    return emails.length !== 0;
}


//let result = addUser("Sander Kvandal", "Frøystein", 1, 0, "skfroystein@gmail.com")

function add_user(firstName, lastName, idRole, email, password)
 {
    console.log("\n\n" + firstName + "\n" + lastName + "\n" + idRole + "\n" + email + "\n" + password);
    // check if email is valid
    if (!is_email_valid(email))
        return {"error": "Invalid email format"};

    // check if the email already exists in database
    if (email_in_db(email))
        return {"error": "Email already exists in database"};

    // Encrypt password
    const saltRounds = 10;
    const hash = bcrypt.hashSync(password, saltRounds);

    // Add to the database
    let sql = db.prepare("INSERT INTO user (firstName, lastName, idRole, email, password) " + 
                         " values (?, ?, ?, ?, ?)")
    const info = sql.run(firstName, lastName, idRole, email, hash)
    
    sql = db.prepare('SELECT user.id as userid, firstname, lastname, role.name  as role FROM user inner join role on user.idrole = role.id WHERE user.id  = ?');
    let rows = sql.all(info.lastInsertRowid)

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