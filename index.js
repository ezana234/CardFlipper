const express = require('express')
const mongoose = require('mongoose')
const app = express()
const port = 3001
const cors = require("cors")
const { validationResult } = require('express-validator');
const http = require('http').Server(app);
const io = require("socket.io")(http, {
    cors: {
        origin: "*",
    }
})
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.set("socketio", io)

// Imports
const { validateUsername, validateRoom, validateMessage, validatePoints } = require('./Utils/Validation')
const userService = require('./Services/userService')
const roomService = require('./Services/RoomService')
const url = "mongodb+srv://ezana-user:MasterLoser300@cluster0.n608n.mongodb.net/Cluster0?retryWrites=true&w=majority";
const Utils = require("./Utils/Utils")
const CONSTANTS = require("./Utils/Constants");
// Connect to mongodb
mongoose.connect(url, { useNewUrlParser: true });

// This route creates and logs in a user by returning a token
app.post("/login", validateUsername, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    } else {
        username = req.body.username;
        userService.Login(username).then((user) => {
            return res.json({
                token: user.token
            })
        }).catch((error) => {
            return res.status(500).json({
                errors: [error]
            })
        })
    }
});

// This route gets a user By Token
app.get("/user", Utils.authenticateJWT, async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader.split(' ')[1];
        const user = await userService.getUserByToken(token)
        if (!user) {
            return res.status(404).json({ errors: [{ error: "Failed to Get User." }] })
        } else {
            res.json(user)
        }
    } catch (error) {
        return res.status(404).json({ errors: [{ error: "Failed to Get User." }] })
    }
})

// this route creates a room only using token
app.post("/room", Utils.authenticateJWT, (req, res) => {
    Utils.decodeToken(req).then(async (userObj) => {
        try {
            const room = await roomService.createRoom(userObj.username)
            return res.json(room)
        } catch (error) {
            console.log(error)
            return res.status(500).json({ errors: [{ error: "Failed to Create Room." }] });
        }
    }).catch((error) => {
        return res.status(403).json({ errors: [{ error: "Failed to Decode Token." }] })
    });
});

// This route to allow a user to join a room
app.post("/joinroom", Utils.authenticateJWT, validateRoom, (req, res) => {
    Utils.decodeToken(req).then(async (userObj) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        } else {
            try {
                const roomID = req.body.roomID;
                const room = await roomService.joinRoom(roomID, userObj.username)
                return res.json(room)
            } catch (error) {
                console.log("Error", error)
                return res.status(500).json({ errors: [{ error: "Failed to Join Room." }] });
            }
        }
    }).catch((error) => {
        return res.status(403).json({ errors: [{ error: "Failed to Decode Token." }] })
    });
})

// Route to initialize the web sockets
app.post("/initialize", Utils.authenticateJWT, validateRoom, async (req, res) => {
    Utils.decodeToken(req).then(async (userObj) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        } else {
            try {
                const roomID = req.body.roomID;
                // check if http server is already running
                if (!http.address()) {
                    http.listen(3003, () => {
                        console.log("Http server listening on port: 3003")
                    })
                }
                // Create chat socket
                const chatNsp = io.of("/chat/" + roomID)
                chatNsp.on("connection", (socket) => {
                    // If there are already two players in socket, disconnect new player
                    if (io.engine.clientsCount > CONSTANTS.MAX_PLAYERS) {
                        socket.emit('err', { message: 'reach the limit of connections' })
                        socket.disconnect()
                        console.log('Disconnected...')
                        return
                    }
                });
                // Create game socket
                const gameNsp = io.of("/game/" + roomID)
                gameNsp.on("connection", (socket) => {
                    //console.log("Num of Clients in GameNsp : ", gameNsp.adapter.sids.size)
                    if (gameNsp.adapter.sids.size > CONSTANTS.MAX_PLAYERS) {
                        socket.emit('err', { message: 'reached the limit of connections' })
                        socket.disconnect()
                        console.log('Disconnected...')
                        return
                    }
                });
                res.json({ "message: ": "Success" })
            } catch (error) {
                console.log(error)
                return res.status(403).json({ errors: [{ error: "Failed to Start Game." }] })
            }
        }
    }).catch((error) => {
        return res.status(403).json({ errors: [{ error: "Failed to Decode Token." }] })
    });
})

//Route to send a chat to a websocket
app.post("/sendChat", Utils.authenticateJWT, validateMessage, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    } else {
        Utils.decodeToken(req).then(async (userObj) => {
            let io = req.app.get("socketio");
            const roomID = req.body.roomID;
            const message = req.body.message;
            // Emit message
            const chatNsp = io.of("/chat/" + roomID)
            chatNsp.emit("text", roomService.messageService(userObj.username, message))
            return res.json({ message: "success" })

        }).catch((error) => {
            console.log(error)
            return res.status(403).json({ errors: [{ error: "Failed to Decode Token." }] })
        });
    }
})

// Route to update the database when the game has started
app.put("/start/:roomID", Utils.authenticateJWT, validateRoom, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    } else {
        Utils.decodeToken(req).then(async (userObj) => {
            let io = req.app.get("socketio");
            const roomID = req.params.roomID;
            console.log(roomID)
            const gameNSP = io.of("/game/" + roomID)
            try {
                await roomService.updateUserInRoom(roomID, userObj.username)
                const playersVoted = await roomService.checkVote(roomID)

                if (!playersVoted) {
                    return res.json({ message: "success" })
                }
            } catch (error) {
                console.log("Errorin start: ", error)
                return res.status(400).json(({ errors: [{ error: "Failed to Start Game" }] }))
            }
            const room = await roomService.getRoom(roomID, userObj.username);
            setTimeout(() => {
                gameNSP.emit("start", room)
            }, 1000);
            return res.json({ message: "success" })
        }).catch((error) => {
            console.log("In Error index: ", error)
            return res.status(403).json({ errors: [{ error: "Failed to Decode Token." }] })
        });
    }
});

// Get Room Route, this route returns routes
app.get("/room/:roomID", Utils.authenticateJWT, validateRoom, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    } else {
        Utils.decodeToken(req).then(async (userObj) => {
            const roomID = req.params.roomID;
            try {
                const room = await roomService.getRoom(roomID, userObj.username);
                return res.json({ cards: room.cards, users: room.users })
            } catch (error) {
                console.log("Error in game: ", error)
                return res.status(500).json({ errors: [{ error: "Failed to Distribute Cards" }] })
            }
        }).catch((error) => {
            console.log("In Error index: ", error)
            return res.status(403).json({ errors: [{ error: "Failed to Decode Token." }] })
        });
    }
})

//Route to tally points
app.put("/room/points", Utils.authenticateJWT, validatePoints, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    } else {
        Utils.decodeToken(req).then(async (userObj) => {
            const roomID = req.body.roomID;
            const points = req.body.points
            try {
                // Send game state update
                const gameNSP = io.of("/game/" + roomID);
                const newRoom = await roomService.updateGameState(roomID, userObj.username, points);
                gameNSP.emit("update", newRoom)
                // If the user won, emit that this user won
                if (roomService.checkWin(newRoom)) {
                    gameNSP.emit("win", userObj.username)
                    await roomService.deleteRoom(roomID)
                }
                // Return whether the cards matched or not
                return res.json({ match: newRoom.match })
            } catch (error) {
                console.log("Error in room: ", error)
                return res.status(500).json({ errors: [{ error: "Failed to Distribute Cards" }] })
            }
        }).catch((error) => {
            console.log("In Error index: ", error)
            return res.status(403).json({ errors: [{ error: "Failed to Decode Token." }] })
        });
    }
})

//Route to restart game
app.put("/restart", Utils.authenticateJWT, validateRoom, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    } else {
        Utils.decodeToken(req).then(async (userObj) => {
            const roomID = req.body.roomID;
            const gameNSP = io.of("/game/" + roomID);
            const room = await roomService.restart(roomID, userObj.username)
            gameNSP.emit("restart",{room: room, user: userObj.username});
            return res.json({message:"success"})
        }).catch((error) => {
            console.log("In Error index: ", error)
            return res.status(403).json({ errors: [{ error: "Failed to Decode Token." }] })
        });
    }
})

app.listen(port, () => {
    console.log(`Server listening on port: ${port}`)
})