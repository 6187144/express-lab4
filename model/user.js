const dbConnPool = require('./db');
const sha256 = require("crypto-js/sha256"); //usage: hash= sha256("Message"));

let Users = {};

Users.authWithCookies = async function (username, hash) {
    let dbConn = await dbConnPool.getConnection();
    const rows = await dbConn.query("SELECT  `userId`, `username`, `first`, `cookieHash`, `email` FROM `user` WHERE `username`=?;", [username]);

    const result = {
        status: false,
        user: null,
        message: "unable to login"
    }

    if (rows[0] === undefined) {
        result.message = "invalid user";
        dbConn.end();
        return result;
    }

    const userInfo = rows[0];
    if (userInfo.cookieHash === hash) {
        result.status = true;
        result.user = userInfo;
        result.message = "logged in";
        dbConn.end();
        return result;
    }

    result.message = "invalid cookies";
    dbConn.end();
    return result;
}

Users.authWithPassword = async function (username, password) {
    let dbConn = await dbConnPool.getConnection();
    const rows = await dbConn.query("SELECT  `userId`, `username`, `first`, `passHash`, `email` FROM `user` WHERE `username`=?;", [username]);
    const result = {
        status: false,
        user: null,
        message: "unable to login"
    }
    if (rows[0] === undefined) {
        result.message = "invalid user";
        dbConn.end();
        return result;
    }

    let userInfo = rows[0];
    let passHash = sha256(password).toString();

    if (userInfo.passHash === passHash) {
        userInfo.cookieHash = sha256(new Date().getTime() + "" + userInfo.userId).toString();
        this.setCookieHash(userInfo.username, userInfo.cookieHash);
        result.status = true;
        result.user = userInfo;
        result.message = "logged in";
        dbConn.end();
        return result;
    }
    result.message = "invalid password";
    dbConn.end();
    return result;
}

Users.setCookieHash = async (username, hash) => {
    let dbConn = await dbConnPool.getConnection();
    const rows = await dbConn.query("UPDATE `user` SET `cookieHash`=? WHERE  `username`=?;", [hash, username]);
    dbConn.end();
}

Users.getUsers = async () => {
    let result = {};
    let dbConn = await dbConnPool.getConnection();
    const rows = await dbConn.query("SELECT userId,username,`first` FROM user");
    dbConn.end();

    if (rows.length > 0) {
        result.status = true;
        result.data = rows;
    } else {
        result.status = false;
    }

    return result;
};


Users.getUser = async (userId) => {

    let result = {};
    if (isNaN(userId)) {
        result.status = false;
    } else {
        let dbConn = await dbConnPool.getConnection();
        const rows = await dbConn.query("SELECT userId,username,`first` FROM user WHERE userId = ?", [userId]);
        dbConn.end();

        if (rows.length > 0) {
            result.status = true;
            result.data = rows[0];
        } else {
            result.status = false;
        }
    }
    return result;
};

module.exports = Users;