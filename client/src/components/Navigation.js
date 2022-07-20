import { Navbar, Nav, Form } from 'react-bootstrap/';
import { LogoutButton, LoginForm } from './Login';
import { MemeIcon } from './Images';


const Navigation = (props) => {

  return (
    <Navbar bg="info" variant="dark" fixed="top" className="justify-content-between">
      <Navbar.Brand href="/">
        <MemeIcon className="mr-1" /> Meme generator
      </Navbar.Brand>

      <Nav >
        <Navbar.Text className="mx-2">
          {props.user && props.user.name && `Welcome, ${props.user?.name}!`}
        </Navbar.Text>
        <Form inline className="mx-2">
          {props.loggedIn ? <LogoutButton logout={props.onLogOut} /> : <LoginForm login={props.doLogIn} />}
        </Form>
      </Nav>
    </Navbar>
  )
}

export default Navigation;