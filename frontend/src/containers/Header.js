import { Navbar, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import '../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import useToken from "../components/useToken";

export default function Header() {
    return (
        <Navbar bg="dark" variant="dark">
            <Container>
                <Navbar.Brand href="/">Card Flipper</Navbar.Brand>
                {/* <Nav className="me-auto">
                    <Nav.Link>Logout</Nav.Link>
                </Nav> */}
            </Container>
        </Navbar>
    )
}