import 'bootstrap/dist/css/bootstrap.min.css';
import { Container,
   Navbar, Nav, NavDropdown,
 } from 'react-bootstrap';
import {
  HashRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

import Journal from './Journal'
import Category from './Category'

function App() {
  return (
    <Router basename = "money-jouney">
      <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
        <Navbar.Brand href="/">Money Journey</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link><Link to="/journal">Journal</Link></Nav.Link>
            <Nav.Link><Link to="/category">Category</Link></Nav.Link>
            <NavDropdown title="Dropdown" id="collasible-nav-dropdown">
              <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
            </NavDropdown>
          </Nav>
          <Nav>
            <Nav.Link href="#deets">More deets</Nav.Link>
            <Nav.Link eventKey={2} href="#memes">
              Dank memes
      </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <Switch>
        <Route path="/journal">
          <Journal />
        </Route>
        <Route path="/category">
          <Category />
        </Route>
        <Route path="/">
          <Home />
        </Route>
      </Switch>
    </Router>
  );
}




// function Category() {
//   return (
//     <h1>Catergory</h1>
//   )
// }

function Home() {
  return (
    <h1>Home</h1>
  )
}
export default App;
