import { Form, Button, Alert, Modal } from 'react-bootstrap';
import { useState } from 'react';

function LoginForm(props) {
  const [username, setUsername] = useState('bianca@polito.it');
  const [password, setPassword] = useState('Bianca1234');
  const [show, setShow] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const handleShow = () => setShowModal(true);
  const handleClose = () => {
    setErrorMessage('');
    setShowModal(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setErrorMessage('');
    const credentials = { username, password };

    // basic validation
    let valid = true;
    if (username === '' || password === '' || password.length < 6) {
      valid = false;
      setErrorMessage('Email cannot be empty and password must be at least six character long.');
      setShow(true);
    }

    if (valid) {
      props.login(credentials)
        .catch((err) => { setErrorMessage(err); setShow(true); })
    }
  };

  return (
    <>
      <Button variant="outline-light" onClick={handleShow}>Login</Button>
      <Modal centered show={showModal} onHide={handleClose} animation={false}>
        <Form onSubmit={handleSubmit}>
          <Modal.Header>
            <Modal.Title>Login</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Alert
              dismissible
              show={show}
              onClose={() => setShow(false)}
              variant="danger">
              {errorMessage}
            </Alert>
            <Form.Group controlId="username">
              <Form.Label>email</Form.Label>
              <Form.Control
                type="email"
                value={username}
                onChange={(ev) => setUsername(ev.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button type="submit">Login</Button>
          </Modal.Footer>
        </Form>
      </Modal>
      
    </>
  );
}

function LogoutButton(props) {
  return (
    <Button variant="outline-light" onClick={props.logout}>Logout</Button>
  )
}

export { LoginForm, LogoutButton };


