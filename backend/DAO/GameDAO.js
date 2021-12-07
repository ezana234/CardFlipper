const mongoose = require('mongoose')
const gameSchema = mongoose.Schema({}, { strict: false });
const Game = mongoose.model('Game', gameSchema, 'Game')
/**
 * {
 *    1 : {
 *          name: "clubs_2",
 *          active: true
 * 
 * }
 *  NO more implementation of a game socket.
 */
function InsertGame(gameID, roomID, cards, users, turn) {
    return new Promise((resolve, reject) => {
        Game.create({gameID:gameID, roomID:roomID, cards: cards, users: users, turn: turn},function(err, result) {
            if (err) {
                return reject(err)
            } else {
                return resolve(result)
            }
        });
    });
}

function FindGame(gameID) {
    return new Promise((resolve, reject) => {
        Game.findOne({gameID: gameID}, function(err, result) {
            if (err || !result) {
                return reject(err);
            } else {
                return resolve(result);
            }
        });
    })
}

function FindGameByRoomID(roomID) {
    return new Promise((resolve, reject) => {
        Game.findOne({roomID: roomID}, function(err, result) {
            if (err) {
                return reject(err);
            } else {
                return resolve(result);
            }
        });
    })
}

function UpdateGame(filter, update) {
    return new Promise((resolve, reject) => {
        Game.findOneAndUpdate(filter, update, function(err, result) {
            if(err) {
                return reject(err);
            } else {
                return resolve(result);
            }
        });
    })
}

module.exports = { 
    InsertGame,
    FindGame,
    FindGameByRoomID,
    UpdateGame
}
