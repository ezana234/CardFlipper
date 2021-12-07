const shortid = require("shortid")
shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');
const roomDAO = require("../DAO/RoomDAO")
const CONSTANTS = require("../Utils/Constants");
const Utils = require("../Utils/Utils")

const {
    v1: uuidv1
} = require("uuid");

function createRoom(userID) {
    return new Promise(async (resolve, reject) => {
        const roomID = shortid.generate();
        const shuffledCards = Array.from(Utils.shuffle(Utils.cards()))
        try {
            return resolve(await roomDAO.InsertRoom(roomID, userID, shuffledCards))
        } catch (error) {
            return reject(error)
        }
    })
}

// Function to join the room
function joinRoom(roomID, userID) {
    return new Promise(async (resolve, reject) => {
        try {
            const room = await roomDAO.FindRoom(roomID);
            // You are a user and the room is active
            if (room.users.filter(user => user.userID === userID).length != 0 && room.active == true) {
                return resolve(room);
            }
            // You are not a user yet, and the room is not active
            else if (room.users.length < CONSTANTS.MAX_PLAYERS && room.active == false) {
                return resolve(room);
            } else {
                return reject();
            }
        } catch (error) {
            return reject(error)
        }
    })
}

function messageService(userID, roomID, message) {
    return {
        text: message,
        id: uuidv1(),
        sender: {
            name: userID.split("#")[0],
            uid: userID,
            avatar: "https://singlecolorimage.com/get/000000/400x100"
        }
    }
}

function updateUserInRoom(roomID, userID) {
    return new Promise((resolve, reject) => {
        roomDAO.FindRoom(roomID).then(async (oldRoom) => {
            try {
                console.log("Users: ", oldRoom.users)
                console.log("Find Users: ", oldRoom.users.filter(user => user.userID === userID))
                // If the user is not in the room and the game isn't full
                if (oldRoom.users.filter(user => user.userID === userID).length == 0 && oldRoom.users.length < CONSTANTS.MAX_PLAYERS) {
                    const room = await roomDAO.UpdateRoom({
                        roomID: roomID
                    }, {
                        $push:
                        {
                            users: { userID: userID, vote: 1, turn: false, score: 0 }
                        }
                    })
                    return resolve(room);
                    // If the user is in the room
                } else if (oldRoom.users.filter(user => user.userID === userID).length != 0) {
                    console.log("here")
                    const room = await roomDAO.UpdateRoom({
                        roomID: roomID,
                        "users.userID": userID
                    }, {
                        $set:
                        {
                            "users.$.vote": 1
                        }
                    })
                    console.log(room)
                    return resolve(room);
                } else {
                    return resolve(oldRoom)
                }
            } catch (error) {
                console.log("Service Error: ", error)
                return reject(error)
            }
        }).catch((error) => {
            console.log("Error findining room service: ", error)
            return reject(error);
        })
    })
}

function checkVote(roomID) {
    return new Promise(async (resolve, reject) => {
        try {
            const room = await roomDAO.FindRoom(roomID);
            // If there are two players and the players both have voted
            if (room.users.length == CONSTANTS.MAX_PLAYERS) {
                room.users.forEach((element) => {
                    if (element.vote != 1) {
                        return resolve(false);
                    }
                });
                // If both players voted, then update the room to active
                await roomDAO.UpdateRoom({
                    roomID: roomID
                }, {
                    active: true
                })
                return resolve(true);
            } else {
                return resolve(false)
            }
        } catch (error) {
            console.log(error)
            return reject(false);
        }
    })
}

function getRoom(roomID, userID) {
    return new Promise(async (resolve, reject) => {
        try {
            const room = await roomDAO.FindRoom(roomID);
            // check if user is in room
            if (room.users.filter(user => user.userID === userID).length == 0) {
                return reject("User Is Not In the Room")
            }
            return resolve(room)
        } catch (error) {
            return reject(error);
        }
    })
}

function updateGameState(roomID, userID, points) {
    return new Promise(async (resolve, reject) => {
        // check if room exists
        try {
            console.log(points)
            console.log("1")
            const room = await roomDAO.FindRoom(roomID);
            console.log("2")
            if (!room) {
                return reject("Room doesn't exist!")
            }
            // check if room is active
            if(!room.active){
                return reject("Room is not active!")
            }
            //check if user is in room
            if (room.users.filter(user => user.userID === userID).length == 0) {
                return reject("User is not in the game!")
            }
            // check if it is the user's turn
            if (room.users.filter(user => user.userID === userID)[0].turn == false) {
                return reject("Not your turn!")
            }
            // check if values match in pointArray
            let value1 = Utils.cards().find(element => element.key == points[0]);
            let value2 = Utils.cards().find(element => element.key == points[1]);
            console.log("value1: ",value1)
            console.log("value2: ", value2)
            // If the values don't match, just change turn
            if (value1.value != value2.value) {
                let filterTurn = {
                    roomID: roomID,
                    "users.turn": false
                }
                let updateTurn = {
                    $set: {
                        "users.$.turn": true
                    },
                }
                await roomDAO.UpdateRoom(filterTurn, updateTurn)
                console.log("3")
                filterTurn = {
                    roomID: roomID,
                    "users.userID": userID
                }
                updateTurn = {
                    $set: {
                        "users.$.turn": false
                    },
                }
                const newRoom = await roomDAO.UpdateRoom(filterTurn, updateTurn)
                console.log("4")
                return resolve({users: newRoom.users, match: false})
            // If the values do match, disable card and change turn
            } else {
                //check if values are false

                // let filterTurn = {
                //     roomID: roomID,
                //     "users.turn": false
                // }
                // let updateTurn = {
                //     $set: {
                //         "users.$.turn": true
                //     },
                // }
                // console.log("5")
                // await roomDAO.UpdateRoom(filterTurn, updateTurn)
                // update score 
                filterTurn = {
                    roomID: roomID,
                    "users.userID": userID
                }
                updateTurn = {
                    // $set: {
                    //     "users.$.turn": false
                    // },
                    $inc: {
                        "users.$.score": 1
                    }
                }
                console.log("6")
                await roomDAO.UpdateRoom(filterTurn, updateTurn)
                // update cards
                filterTurn = {
                    roomID: roomID,
                    "cards.key": value1.key
                }
                updateTurn = {
                    $set: {
                        "cards.$.active": false
                    }
                }
                console.log("7")
                await roomDAO.UpdateRoom(filterTurn, updateTurn)
                const filterCard = {
                    roomID: roomID,
                    "cards.key": value2.key
                }
                const updateCard = {
                    $set: {
                        "cards.$.active": false
                    }
                }
                console.log("8")
                const newRoom = await roomDAO.UpdateRoom(filterCard, updateCard)
                console.log("9")
                return resolve({users: newRoom.users, cards: newRoom.cards, match:true})
            }
        } catch (error) {
            return reject(error);
        }
    })
}

function checkWin(room) {
    if(room.cards) {
        for (const card of room.cards) {
            if(card.active) {
                return false
            }
        }
        return true;
    }
    return false;
}

module.exports = {
    createRoom,
    joinRoom,
    messageService,
    updateUserInRoom,
    checkVote,
    getRoom,
    updateGameState,
    checkWin
}