
// sqlm.js
const sqlite3 = require('better-sqlite3')
global.db = sqlite3('./studietid.db')

function getUserByEmail(email) {
    const sql = db.prepare("SELECT * FROM user WHERE user.email = ?");
    let user = sql.all(email);

    if (user[0])
        return user[0];
    else
        return false;
}

function getUserById(id) {
    const sql = db.prepare("SELECT * FROM user WHERE user.id = ?");
    let user = sql.all(id);

    if (user[0])
        return user[0];
    else
        return false;
}

function getUsers() {
    const sql = db.prepare("SELECT user.id as userId, firstname, lastname, role.name AS role FROM user INNER JOIN role ON user.idrole = role.id ORDER BY user.idRole");
    let rows = sql.all()

    return rows;
}




// Post request inneholder om den har et filter, hvilke type filter det er og hva den filtrerer etter.
// for eksempel:
//
// "filterType": "status",
// "filter": 2
//
// her filtrerer den etter statusen til studietimen, og viser kun ubekreftede timer.

function getActivity(filter) {
    let sql;

    if (filter.filterType == "status") {
        sql = db.prepare(`SELECT startTime AS date, firstName, lastName, role.name AS role,
                        subject.name AS subject, room.name AS room,
                        status.name AS status, goal, idAdmin,
                        activity.id AS actId FROM activity
                        INNER JOIN user ON user.id = idUser
                        INNER JOIN role ON role.id = idRole
                        INNER JOIN subject ON subject.id = idSubject
                        INNER JOIN room ON room.id = idRoom
                        INNER JOIN status ON status.id = idStatus
                        WHERE activity.idStatus = ?
                        ORDER BY activity.startTime DESC`);

        return sql.all(filter.status); // filter
    } else if (filter.filterType == "idUser") {
        sql = db.prepare(`SELECT startTime AS date, firstName, lastName, role.name AS role, 
                        subject.name AS subject, room.name AS room,
                        status.name AS status, goal, idAdmin, 
                        activity.id AS actId FROM activity
                        INNER JOIN user ON user.id = idUser
                        INNER JOIN role ON role.id = idRole
                        INNER JOIN subject ON subject.id = idSubject
                        INNER JOIN room ON room.id = idRoom
                        INNER JOIN status ON status.id = idStatus
                        WHERE activity.idUser = ?
                        ORDER BY activity.startTime DESC`);

            console.log("Hei jeg heter idUser database query ting, jeg gir dem tingene til bruker " + filter.idUser);
            return sql.all(filter.idUser);
    } else {
        sql = db.prepare(`SELECT startTime AS date, firstName, lastName, role.name AS role, 
                        subject.name AS subject, room.name AS room,
                        status.name AS status, goal, idAdmin, 
                        activity.id AS actId FROM activity
                        INNER JOIN user ON user.id = idUser
                        INNER JOIN role ON role.id = idRole
                        INNER JOIN subject ON subject.id = idSubject
                        INNER JOIN room ON room.id = idRoom
                        INNER JOIN status ON status.id = idStatus
                        ORDER BY activity.startTime DESC`);

        return sql.all(); // ingen filter
    }
}


module.exports = {
    getUserByEmail,
    getUserById,
    getUsers,
    getActivity

};