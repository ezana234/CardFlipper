import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate} from 'react-router-dom';
//import Form from "react-bootstrap/Form";
//import Button from "react-bootstrap/Button";
import "../styles/Game.css";
import axios from "axios";
import * as constants from './Constants';
//import { useLocation } from "react-router";
import 'react-chatbox-component/dist/style.css';
import { ChatBox } from 'react-chatbox-component';
import io from "socket.io-client";
//import $ from "jquery";
import useToken from "../components/useToken";
import { Modal } from "react-bootstrap"
import Button from "react-bootstrap/Button";
import "bootstrap/dist/css/bootstrap.min.css"
import $ from 'jquery';
import Confetti from 'react-dom-confetti';



export default function Game() {
  // Variables
  //const [room, setRoom] = useState("");
  const { token, user } = useToken();
  const navigate = useNavigate();
  const [mount, setMount] = useState({});
  const [messages, setMessages] = useState([]);
  const [card, setCard] = useState([]);
  const [startVisible, setStartVisible] = useState(true);
  const [disableStart, setDisableStart] = useState(false);
  const [waitVisible, setWaitVisible] = useState(false);
  let initialGameState = 0;
  const { state } = useLocation();
  const { roomID } = state;
  //const [user, setUser] = useState("");
  const turn = useRef(false)
  let count = 0;
  const [playerTurn, setPlayerTurn] = useState("");
  let pointArray = [];
  const userObj = {
    uid: user
  }
  const config = {
    angle: "213",
    spread: 360,
    startVelocity: 40,
    elementCount: "200",
    dragFriction: 0.12,
    duration: 3000,
    stagger: "5",
    width: "10px",
    height: "10px",
    perspective: "500px",
    colors: ["#a864fd", "#29cdff", "#78ff44", "#ff718d", "#fdff6a"]
  };
  const [activeConfetti, setActiveConfetti] = useState(false);
  // const cardArray = ['clubs_2.svg', 'clubs_3.svg', 'clubs_4.svg', 'clubs_5.svg', 'clubs_6.svg', 'clubs_7.svg', 'clubs_8.svg',
  //   'clubs_9.svg', 'clubs_10.svg', 'clubs_ace.svg', 'clubs_jack.svg', 'clubs_king.svg', 'clubs_queen.svg', 'diamonds_2.svg',
  //   'diamonds_3.svg', 'diamonds_4.svg', 'diamonds_5.svg', 'diamonds_6.svg', 'diamonds_7.svg', 'diamonds_8.svg', 'diamonds_9.svg',
  //   'diamonds_10.svg', 'diamonds_ace.svg', 'diamonds_jack.svg', 'diamonds_king.svg', 'diamonds_queen.svg',
  //   'hearts_2.svg', 'hearts_3.svg', 'hearts_4.svg', 'hearts_5.svg', 'hearts_6.svg', 'hearts_7.svg', 'hearts_8.svg',
  //   'hearts_9.svg', 'hearts_10.svg', 'hearts_ace.svg', 'hearts_jack.svg', 'hearts_king.svg', 'hearts_queen.svg',
  //   'spades_2.svg', 'spades_3.svg', 'spades_4.svg', 'spades_5.svg', 'spades_6.svg', 'spades_7.svg', 'spades_8.svg', 'spades_9.svg',
  //   'spades_10.svg', 'spades_ace.svg', 'spades_jack.svg', 'spades_king.svg', 'spades_queen.svg'];

  let chatSocket = useRef();
  let gameSocket = useRef();
  //Modal Data
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("")
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const handleMessage = (text) => setMessage(text)
  //const { state } = useLocation();

  // Code that is run immediately 
  useEffect(() => {
    // connect to sockets
    startWebSocket();
    setTimeout(() => {
      chatSocket.current = io("http://localhost:3003/chat/" + roomID);
      gameSocket.current = io("http://localhost:3003/game/" + roomID);
      chatSocket.current.on("text", (message) => {
        setMessages(array => [...array, message])
      })
      gameSocket.current.on("start", (start) => {
        console.log(start)
        setStartVisible(false);
        if (initialGameState == 0) {
          SetGameState(start);
          initialGameState++;
        }

      })
      gameSocket.current.on("win", (username) => {
        handleMessage(`${username} wins!!!`)
        handleShow();
        setActiveConfetti(true)
        setTimeout(() => {
          navigate("/")
        }, 2000)
      })
      gameSocket.current.on("update", (data) => {
        console.log(data)
        SetGameState(data)
      })
    }, 1500);
    return () => { setMount({}); }
  }, [])

  // Code to initialize chat web socket
  async function startWebSocket() {
    try {
      console.log("roomID: ", roomID)
      await axios.post(constants.HOST + "/initialize", { roomID: roomID }, {
        headers: {
          "Authorization": "Bearer " + token
        }
      });
      //setUser(await jwtDecode(token).username);
    } catch (error) {
      handleMessage("Couldn't Connect To Socket. Try Refreshing the Page.")
      handleShow();
    }
  }

  // Code that is called when chat is sent
  const handleChat = async (message) => {
    try {
      console.log("roomID: ", roomID)
      await axios.post(constants.HOST + "/sendChat", {
        roomID: roomID,
        message: message
      }, {
        headers: {
          "Authorization": "Bearer " + token
        }
      });
    } catch (error) {
      console.log(error)
      handleMessage("Couldn't Send Chat Message. Try Again!")
      handleShow();
    }
  }

  // Code called when Start Game button is clicked
  async function handleStart() {
    try {
      await axios.put(constants.HOST + "/start/" + roomID, {}, {
        headers: {
          "Authorization": "Bearer " + token
        }
      });
      // Disable the start button
      setDisableStart(true);
      // Display message that you're waiting for the other person to continue
      setWaitVisible(true);
    } catch (error) {
      console.log(error)
      handleMessage("Couldn't Start Game. Try Again!")
      handleShow();
    }
  }

  function SetGameState(obj) {
    // Create CardArray
    let responseCard;
    if (obj.cards) {
      console.log("in Cards: ", obj.cards)
      setCard([])
      for (let i = 0; i < obj.cards.length; i++) {
        // Hide cards if the cards have already been matched
        const disabled = {
        }
        if (!obj.cards[i].active) {
          console.log("In here")
          //$(responseCard).addClass("disabled");
          disabled["visibility"] = "hidden";
        }
        responseCard = <div key={obj.cards[i].key} style={disabled} className="cardContainer">
          <div id={obj.cards[i].key} className="card" onClick={(e) => flip(e)}>
            <div className="front">
              <svg xmlns="http://www.w3.org/2000/svg" height="100" width="100" >
                <image className="Card" href="/img/castle.svg" height="100" width="100" />
              </svg>
            </div>
            <div className="back">
              <svg xmlns="http://www.w3.org/2000/svg" height="100" width="100" >
                <image className="Card" href={"/img/" + obj.cards[i].key + ".svg"} height="100" width="100" />
              </svg>
            </div>
          </div>
        </div>
        setCard(array => [...array, responseCard])
      }
    }
    // set turn
    if (obj.users) {
      if (obj.users.filter(userObj => userObj.userID === user)) {
        turn.current = obj.users.filter(userObj => userObj.userID === user)[0].turn
      }
      // Set who's turn it is in string form
      if (obj.users.filter(userObj => userObj.turn === true)[0]) {
        setPlayerTurn(obj.users.filter(userObj => userObj.turn === true)[0].userID.split("#")[0])
      }
    }
  }
  // Responsible for flipping the cards
  function flip(event) {
    //increment count flip
    console.log(turn.current)
    if (turn.current) {
      count += 1;
      console.log(count)
      const id = event.target.parentNode.parentNode.parentNode.id;
      if (count === 1) {
        pointArray.push(parseInt(id));
        $(`#${id}`).css("pointer-events", "none")
        $(`#${id}`).toggleClass('flipped');
      }
      if (count === 2) {
        console.log("hey id: ", id)
        pointArray.push(parseInt(id))
        console.log(pointArray)
        $(`#${id}`).css("pointer-events", "none")
        $(`#${id}`).toggleClass('flipped');
        // If cards match, disable immediately

        verifyFlip().then(match => {
          console.log(match)
          // If the cards dont match
          if (!match) {
            //Remove pointer-events: none
            for (const card of pointArray) {
              console.log("This. is starage: ", card)
              $(`#${card}`).css("pointer-events", "")
            }
            setTimeout(() => {
              for (const card of pointArray) {
                console.log("This. is starage: ", card)
                $(`#${card}`).toggleClass("flipped")
              }
              count = 0;
              pointArray = [];
              console.log("1: ", count)
            }, 1000)
          } else {
            count = 0;
            pointArray = [];
          }
        }).catch((error) => {
          console.log(error)
        })
        console.log("2: ", count)
        //$(`#${id}`).toggleClass('flipped');s
      }
    }
  };

  async function verifyFlip() {
    // check if it's user's turn
    try {
      const response = await axios.put(constants.HOST + "/room/points", { roomID: roomID, points: pointArray }, {
        headers: {
          "Authorization": "Bearer " + token
        }
      });
      return response.data.match;
    } catch (error) {
      console.log(error)
    }
  }

  // HTML
  return (
    <div id="container">
      <Confetti active={activeConfetti} config={config} />
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Message</Modal.Title>
        </Modal.Header>
        <Modal.Body>{message}</Modal.Body>
        <Modal.Footer>
          <Button variant="Primary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      {startVisible ?
        <div className="startGame">
          <h3>RoomID: {roomID}</h3>
          {waitVisible ? <h4>Waiting for other person to start the game...</h4> : null}
          <Button onClick={handleStart} disabled={disableStart}>Start Game</Button>
        </div> : null}
      {!startVisible ? <div className="Game">
        <h3>It's {playerTurn}'s turn</h3>
        {/* <img src="/img/abstract_scene.svg" className="Card" height="200" width="150"/> */}
        {/* <svg id="Container" xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 285 50">
          <rect height="200" width="300" />
        </svg> */}
        {card}
      </div> : null}
      <div className="Chat">
        <h3>Chat</h3>
        <ChatBox messages={messages} user={userObj} onSubmit={handleChat} />
      </div>
    </div>
  );
}