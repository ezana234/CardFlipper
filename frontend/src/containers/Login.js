import React, { useState } from "react";
import { Navbar, Container } from 'react-bootstrap';
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import PropTypes from 'prop-types';
import "../styles/Login.css";
import axios from "axios";
import * as constants from './Constants';
import { Modal } from "react-bootstrap"
import "bootstrap/dist/css/bootstrap.min.css"

export default function Login({ setToken }) {
  const [username, setUsername] = useState("");
  // Modal Data
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("")
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const handleMessage = (text) => setMessage(text)

  function validateForm() {
    return username.length >= 8 && !username.includes("#");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      const response = await axios.post(constants.HOST + "/login", {
        username: username
      });
      let token = response.data.token;
      setToken(token)
      window.location.reload(false);
    } catch (error) {
      handleMessage("Login Failed")
      handleShow();
      console.log('hi', error);
    }
  }

  return (
    <div>
      <Navbar bg="dark" variant="dark">
        <Container>
          <Navbar.Brand href="/">Card Flipper</Navbar.Brand>
          {/* <Nav className="me-auto">
            <Nav.Link>Logout</Nav.Link>
          </Nav> */}
        </Container>
      </Navbar>
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
      <div className="Login">
        <Form onSubmit={handleSubmit}>
          <Form.Group size="lg" controlId="username">
            <Form.Label>Username</Form.Label>
            <p>(Must be 8 characters long and not have "#"</p>
            <Form.Control
              autoFocus
              type="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Form.Group>
          <Button size="lg" type="submit" disabled={!validateForm()}>
            Go!
          </Button>
        </Form>
      </div>
    </div>
  );
}

Login.propTypes = {
  setToken: PropTypes.func.isRequired
}