const jwt = require("jsonwebtoken");
const CONSTANTS = require("./Constants");
const jsdom = require("jsdom");
const roomDAO = require("../DAO/RoomDAO")

function GenerateJWT(username) {
    return jwt.sign({ username: username }, CONSTANTS.secret)
}

function VerifyJWT(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, CONSTANTS.secret, function (err, decoded) {
            if (err) {
                return reject(false);
            } else {
                return resolve(true);
            }
        })
    })
}

const authenticateJWT = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        try {
            await (VerifyJWT(token));
            return next();
        } catch (error) {
            return res.status(403).json({ errors: [{ error: "Token Invalid." }] })
        }
    } else {
        return res.status(401).json({ errors: [{ error: "Token Missing." }] })
    }
}

function decodeToken(req) {
    return new Promise((resolve, reject) => {
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const token = authHeader.split(' ')[1];
            jwt.verify(token, CONSTANTS.secret, function (err, decoded) {
                if (err) {
                    return reject(err);
                } else {
                    return resolve(decoded);
                }
            })
        } else {
            return reject({ error: "Token Not Found" });
        }
    })
}

function decodeSocketToken(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, CONSTANTS.secret, function (err, decoded) {
            if (err) {
                return reject(err);
            } else {
                return resolve(decoded);
            }
        })
    })
}

function authorizeSocket(token, roomID) {
    return new Promise(async (resolve, reject) => {
        try {
            const userObj = await decodeSocketToken(token);
            const room = await roomID(roomID);
            if (room.users.includes(userObj.username)) {
                return resolve("Authorized")
            }
        } catch (error) {
            return reject(error);
        }
    })
}

function strip(input) {
    const dom = new jsdom.JSDOM(input);
    return dom.textContent
}

function cards() {
    return [
        { key: 1, name: 'clubs_2.svg', active: true, value: 2 },
        { key: 2, name: 'clubs_3.svg', active: true, value: 3 },
        // { key: 3, name: 'clubs_4.svg', active: true, value: 4 },
        // { key: 4, name: 'clubs_5.svg', active: true, value: 5 },
        // { key: 5, name: 'clubs_6.svg', active: true, value: 6 },
        // { key: 6, name: 'clubs_7.svg', active: true, value: 7 },
        // { key: 7, name: 'clubs_8.svg', active: true, value: 8 },
        // { key: 8, name: 'clubs_9.svg', active: true, value: 9 },
        // { key: 9, name: 'clubs_10.svg', active: true, value: 10 },
        // { key: 10, name: 'clubs_ace.svg', active: true, value: 1 },
        // { key: 11, name: 'clubs_jack.svg', active: true, value: 11 },
        // { key: 12, name: 'clubs_king.svg', active: true, value: 13 },
        // { key: 13, name: 'clubs_queen.svg', active: true, value: 12 },
        { key: 14, name: 'diamonds_2.svg', active: true, value: 2 },
        { key: 15, name: 'diamonds_3.svg', active: true, value: 3 },
        // { key: 16, name: 'diamonds_4.svg', active: true, value: 4 },
        // { key: 17, name: 'diamonds_5.svg', active: true, value: 5 },
        // { key: 18, name: 'diamonds_6.svg', active: true, value: 6 },
        // { key: 19, name: 'diamonds_7.svg', active: true, value: 7 },
        // { key: 20, name: 'diamonds_8.svg', active: true, value: 8 },
        // { key: 21, name: 'diamonds_9.svg', active: true, value: 9 },
        // { key: 22, name: 'diamonds_10.svg', active: true, value: 10 },
        // { key: 23, name: 'diamonds_ace.svg', active: true, value: 1 },
        // { key: 24, name: 'diamonds_jack.svg', active: true, value: 11 },
        // { key: 25, name: 'diamonds_king.svg', active: true, value: 13 },
        // { key: 26, name: 'diamonds_queen.svg', active: true, value: 12 },
        // { key: 27, name: 'hearts_2.svg', active: true, value: 2 },
        // { key: 28, name: 'hearts_3.svg', active: true, value: 3 },
        // { key: 29, name: 'hearts_4.svg', active: true, value: 4 },
        // { key: 30, name: 'hearts_5.svg', active: true, value: 5 },
        // { key: 31, name: 'hearts_6.svg', active: true, value: 6 },
        // { key: 32, name: 'hearts_7.svg', active: true, value: 7 },
        // { key: 33, name: 'hearts_8.svg', active: true, value: 8 },
        // { key: 34, name: 'hearts_9.svg', active: true, value: 9 },
        // { key: 35, name: 'hearts_10.svg', active: true, value: 10 },
        // { key: 36, name: 'hearts_ace.svg', active: true, value: 1 },
        // { key: 37, name: 'hearts_jack.svg', active: true, value: 11 },
        // { key: 38, name: 'hearts_king.svg', active: true, value: 13 },
        // { key: 39, name: 'hearts_queen.svg', active: true, value: 12 },
        // { key: 40, name: 'spades_2.svg', active: true, value: 2 },
        // { key: 41, name: 'spades_3.svg', active: true, value: 3 },
        // { key: 42, name: 'spades_4.svg', active: true, value: 4 },
        // { key: 43, name: 'spades_5.svg', active: true, value: 5 },
        // { key: 44, name: 'spades_6.svg', active: true, value: 6 },
        // { key: 45, name: 'spades_7.svg', active: true, value: 7 },
        // { key: 46, name: 'spades_8.svg', active: true, value: 8 },
        // { key: 47, name: 'spades_9.svg', active: true, value: 9 },
        // { key: 48, name: 'spades_10.svg', active: true, value: 10 },
        // { key: 49, name: 'spades_ace.svg', active: true, value: 1 },
        // { key: 50, name: 'spades_jack.svg', active: true, value: 11 },
        // { key: 51, name: 'spades_king.svg', active: true, value: 13 },
        // { key: 52, name: 'spades_queen.svg', active: true, value: 12 },
    ];
}

function shuffle(a) {
    // const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
    //     20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
    //     41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52];
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}


module.exports = {
    GenerateJWT,
    VerifyJWT,
    authenticateJWT,
    decodeToken,
    strip,
    decodeSocketToken,
    authorizeSocket,
    cards,
    shuffle
}