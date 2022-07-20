import { Button, Modal, Form, Col, Row } from 'react-bootstrap';
import { useState } from "react";
import Meme from './Meme';
import { CopyIcon } from './Images.js';


const CopyButton = (props) => {

    // use controlled form components
    const isPrivateInit = props.meme.private;
    const [newMeme, setNewMeme] = useState(Object.assign({},
        {
            title: props.meme.title, text1: props.meme.text1 ? props.meme.text1 : "", text2: props.meme.text2 ? props.meme.text2 : "", text3: props.meme.text3 ? props.meme.text3 : "",
            font: props.meme.font, color: props.meme.color, shadow: props.meme.shadow, private: props.meme.private, template_id: props.meme.template_id
        }));
    const [show, setShow] = useState(false);
    const [validated, setValidated] = useState(false); // enables / disables react-bootstrap validation report

    const handleClose = () => {
        setNewMeme(Object.assign({},
            {
                title: props.meme.title, text1: props.meme.text1 ? props.meme.text1 : "", text2: props.meme.text2 ? props.meme.text2 : "", text3: props.meme.text3 ? props.meme.text3 : "",
                font: props.meme.font, color: props.meme.color, shadow: props.meme.shadow, private: props.meme.private, template_id: props.meme.template_id
            }));
        setShow(false);
        setValidated(false);
    };

    const handleShow = () => {
        setShow(true);
    }

    // react-bootstrap validation instructions from https://react-bootstrap.github.io/components/forms/#forms-validation
    const handleSubmit = (event) => {

        // stop event default and propagation
        event.preventDefault();
        event.stopPropagation();

        const form = event.currentTarget;

        // check if form is valid using HTML constraints
        if (!form.checkValidity()) {
            setValidated(true); // enables bootstrap validation error report
        } else {
            props.copyMeme(props.meme.id, newMeme);
            handleClose();
        }
    }

    // noValidate : You can disable the default UI by adding the HTML noValidate attribute to your <Form> or <form> element.
    // Form.Control.Feedback : reports feedback in react-bootstrap style
    // since the modal is added to the page only when needed the show flag can be always true

    return (
        <>
            <span onClick={handleShow}><CopyIcon /></span>
            <Modal show={show} animation={false} onHide={handleClose} dialogClassName="modal-w" aria-labelledby="custom-modal-styling-title">
                <Modal.Header closeButton>
                    <Modal.Title id="custom-modal-styling-title">Copy the meme and create a new one</Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row>
                            <Col className="d-flex align-items-center col-6">
                                <Meme meme={newMeme} templates_dict={props.templates_dict}/>
                            </Col>
                            <Col className="col-6">
                                <Form.Group controlId="form-title">
                                    <Form.Control
                                        className="mb-2 mr-sm-2"
                                        placeholder="Title"
                                        value={newMeme.title}
                                        required
                                        onChange={(ev) => {
                                            setNewMeme(Object.assign({}, newMeme, { title: ev.target.value }));
                                        }
                                        }
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Please provide a title.
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group controlId="form-text1">
                                    <Form.Control
                                        className="mb-2 mr-sm-2"
                                        placeholder="Text #1"
                                        value={newMeme.text1}
                                        required={!(newMeme.text1 || newMeme.text2 || newMeme.text3)}
                                        onChange={(ev) => {
                                            setNewMeme(Object.assign({}, newMeme, { text1: ev.target.value }));
                                        }
                                        }
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        Please provide at least one text field.
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Control
                                    className="mb-2 mr-sm-2"
                                    placeholder="Text #2"
                                    disabled={
                                        // disable if the box count for the template is 1
                                        props.templates.filter((t) => t.template_id === newMeme.template_id)[0].box_counts < 2
                                    }
                                    required={!(newMeme.text1 || newMeme.text2 || newMeme.text3)}
                                    value={newMeme.text2}
                                    onChange={(ev) => {
                                        setNewMeme(Object.assign({}, newMeme, { text2: ev.target.value }));
                                    }
                                    }
                                />

                                <Form.Control
                                    className="mb-2 mr-sm-2"
                                    placeholder="Text #3"
                                    disabled={
                                        // disable if the box count for the template is 1 or 2
                                        props.templates.filter((t) => t.template_id === newMeme.template_id)[0].box_counts < 3
                                    }
                                    required={!(newMeme.text1 || newMeme.text2 || newMeme.text3)}
                                    value={newMeme.text3}
                                    onChange={(ev) => {
                                        setNewMeme(Object.assign({}, newMeme, { text3: ev.target.value }));
                                    }
                                    }
                                />

                                <Form.Row className="d-flex align-items-center ">
                                    <Form.Group as={Col}>
                                        <Form.Label>Font</Form.Label>
                                        <Form.Control as="select" custom value={newMeme.font}
                                            onChange={(ev) => {
                                                setNewMeme(Object.assign({}, newMeme, { font: ev.target.value }));
                                            }}>
                                            <option value="impact">Impact</option>
                                            <option value="arial">Arial</option>
                                            <option value="comicSans">Comic Sans</option>
                                        </Form.Control>
                                    </Form.Group>

                                    <Form.Group as={Col} >
                                        <Form.Label className="ml-3">Shadows</Form.Label>
                                        <Form.Control className="ml-3" as="select" custom value={newMeme.shadow}
                                            onChange={(ev) => {
                                                setNewMeme(Object.assign({}, newMeme, { shadow: ev.target.value }));
                                            }
                                            }>
                                            <option value="">None</option>
                                            <option value="shadow-black">Black</option>
                                            <option value="shadow-white">White</option>
                                        </Form.Control>
                                    </Form.Group>

                                    <Form.Group as={Col}>
                                        <Form.Label className="ml-5">Color</Form.Label>
                                        <Form.Control className="ml-5" id="favcolor" type="color" value={newMeme.color}
                                            onChange={(ev) => {
                                                setNewMeme(Object.assign({}, newMeme, { color: ev.target.value }));
                                            }
                                            } >
                                        </Form.Control>
                                    </Form.Group>
                                </Form.Row>

                                <Form.Check
                                    type="switch"
                                    id="custom-switch"
                                    label="Protected"
                                    checked={newMeme.private}
                                    disabled={isPrivateInit && props.user.id !== props.meme.user_id}
                                    onChange={(ev) => {
                                        setNewMeme(Object.assign({}, newMeme, { private: ev.target.checked }));
                                    }
                                    }
                                />
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="success" type="submit">Save</Button>
                        <Button variant="secondary" onClick={handleClose}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    )
}


export default CopyButton;