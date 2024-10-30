
// sqlm.js
const sqlite3 = require('better-sqlite3')
global.db = sqlite3('./studietid.db', {verbose: console.log})

function getUserByEmail(email) {
    const sql = db.prepare("SELECT * FROM user WHERE user.email = ?");
    let user = sql.all(email);

    console.log(user)

    if (user[0])
        return user[0];
    else
        return false;
}

function getUserById(id) {
    const sql = db.prepare("SELECT * FROM user WHERE user.id = ?");
    let user = sql.all(id);

    console.log(user)

    if (user[0])
        return user[0];
    else
        return false;
}

function getUsers() {
    const sql = db.prepare("SELECT user.id as userid, firstname, lastname, role.name as role FROM user inner join role on user.idrole = role.id");
    let rows = sql.all()

    return rows;
}



module.exports = {
    getUserByEmail,
    getUserById,
    getUsers

};