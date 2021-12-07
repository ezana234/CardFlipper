const gameDAO = require("../DAO/GameDAO");
const roomDAO = require("../DAO/RoomDAO");
const CONSTANTS = require("../Utils/Constants");
const Utils = require("../Utils/Utils")
const shortid = require("shortid")
shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');

function createCards(roomID, userID) {
    return new Promise(async(resolve, reject) => {
        try {  
            const gameID = shortid.generate();
            const room = await roomDAO.FindRoom(roomID);
            // If user is not in the room
            if( room.users.filter(user => user.userID === userID).length == 0){
                return reject("Unauthorized")
            }
            const shuffledCards = Array.from(Utils.shuffle(Utils.cards()))
            //console.log("Game Room:", await gameDAO.FindGameByRoomID(roomID));
            // if game exists , return cards
            const game = await gameDAO.FindGameByRoomID(roomID)
            if(game && game.users.length == CONSTANTS.MAX_PLAYERS) {
                return resolve(game.cards)
            }
            // check if user is in room
            if(room.users.filter(user => user.userID === userID).length == 0) {
                return reject("User Is Not Part Of the room")
            }
            // Check if the room is active and there are two users
            // if(room.active == true && room.users.length != CONSTANTS.MAX_PLAYERS) {
            //     return reject("Not enough players in the room.")
            // }
            console.log(room)
            const users = [
                {
                    userID: room.users[0].userID,
                    score: 0,
                    turn: true
                },
                {
                    userID: room.users[1].userID,
                    score:0,
                    turn: false
                }
            ]
            // The first turn will go to the first user in the room
            await gameDAO.InsertGame(gameID, roomID, shuffledCards, users);
            return resolve(shuffledCards);
        } catch(error) {
            console.log(error)
            return reject(error)
        }
    })
}

function addPoints(userID, roomID, pointArray) {
    return new Promise(async (resolve, reject) => {
        // check if gameID exists
        const game = await gameDAO.FindGameByRoomID(roomID);
        if(!game) {
            return reject("Game doesn't exist!")
        }
        //check if user is in game
        if(game.score.filter(user => user.userID === userID).length == 0) {
            return reject("User is not in the game!")
        }
        // check if it is the user's turn
        if(game.turn !== userID) {
            return reject("Not your turn!")
        }
        // check if values match in pointArray
        let value1 = Utils.cards().find(element => element.key == pointArray[0]);
        let value2 = Utils.cards().find(element => element.key == pointArray[1]);
        if (value1 != value2) {
            return resolve(game.cards)
        }
        
        const filter = {
            roomID: roomID,
            "users.userID": userID
        }
        const update = {
            $inc: {
                "users.$.score": 1
            }
        }
        await gameDAO.UpdateGame(filter, update);
    })
}

function checkTurn(userID, roomID) {
    return new Promise(async (resolve, reject) => {
        try {
            const game = gameDAO.FindGameByRoomID(roomID);
        } catch (error) {   
            return reject(error);
        }
    })
}

module.exports = {
    createCards,
    addPoints
}