const mongoose = require('mongoose')
const roomSchema = mongoose.Schema({}, { strict: false });
const Room = mongoose.model('Room', roomSchema, 'Room')


function InsertRoom(roomID, userID, cards) {
    return new Promise((resolve, reject) => {
        Room.create({roomID:roomID, users: [{userID: userID, vote:0, turn: true, score: 0}], cards:cards, active: false},function(err, result) {
            if (err) {
                return reject(err)
            } else {
                return resolve(result)
            }
        });
    });
}

function FindRoom(roomID) {
    return new Promise((resolve, reject) => {
        Room.findOne({roomID:roomID},function(err, result) {
            if (err || !result) {
                return reject("Couldn't find Room.")
            } else {
                //console.log("result", result)
                return resolve(result)
            }
        });
    });
}

function UpdateRoom(filter, update) {
    return new Promise((resolve, reject) => {
        Room.findOneAndUpdate(filter, update, {new: true}, function(err, result) {
            if(err || !result) {
                return reject(err);
            } else {
                return resolve(result);
            }
        })
    });
}

module.exports = {
    InsertRoom,
    FindRoom,
    UpdateRoom
}