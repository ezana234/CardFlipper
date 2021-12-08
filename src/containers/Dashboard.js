import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import "../styles/Dashboard.css";
import axios from "axios";
import * as constants from './Constants';
import { useNavigate } from 'react-router-dom';
import { Modal } from "react-bootstrap"
import "bootstrap/dist/css/bootstrap.min.css"

export default function Dashboard(token) {
  const [room, setRoom] = useState("");
  const navigate = useNavigate();
  //Modal Data
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("")
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const handleMessage= (text) => setMessage(text)

  function validateForm() {
    return room.length > 8 && room.length < 14;
  }

  async function createRoom(event) {
    event.preventDefault();
    try {
      const response = await axios.post(constants.HOST + "/room", {}, {
        headers: {
          "Authorization": "Bearer " + token.token
        }
      });
      const roomID = response.data.roomID;
      console.log(roomID);
      navigate("/game", {state: {roomID: roomID}})
    } catch (error) {
      handleMessage("Couldn't Create Room. Try Again")
      handleShow();
    }

  }

  async function joinRoom(event) {
    event.preventDefault();
    try {
      const response = await axios.post(constants.HOST + "/joinroom",
        {
          roomID: room
        },
        {
          headers: {
            "Authorization": "Bearer " + token.token
          }
        });
      const roomID = response.data.roomID;
      navigate("/game", {state: {roomID: roomID}})
    } catch (error) {
      console.log(error)
      // The Room ID is not in the DB or the token isn't valid or network error
      handleMessage("Couldn't Join Room. Try Again!")
      handleShow();
    }

  }

  return (
    <div className="Dashboard">
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

      <Form onSubmit={joinRoom}>
        <Form.Group size="lg" controlId="joinRoom">
          <Form.Label>Join Room</Form.Label>
          <Form.Control
            autoFocus
            type="room"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />
        </Form.Group>
        <Button size="lg" type="submit" disabled={!validateForm()}>
          Go!
        </Button>
      </Form>

      <Form onSubmit={createRoom}>
        <Form.Group size="lg" controlId="createRoom">
        </Form.Group>
        <Button size="lg" type="submit">
          Create Room!
        </Button>
      </Form>
    </div>
  );
}