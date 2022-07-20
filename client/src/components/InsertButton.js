import { Button, Modal, Form, Col, Row } from 'react-bootstrap';
import { useState } from "react";
import Meme from './Meme';


const InsertButton = (props) => {

  // use controlled form components
  const [title, setTitle] = useState('');
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [text3, setText3] = useState('');
  const [font, setFont] = useState('impact');
  const [color, setColor] = useState('#ffffff');
  const [shadow, setShadow] = useState("shadow-black");
  const [isPrivate, setIsPrivate] = useState(true);
  const [templateId, setTemplateId] = useState(1);
  const [newMeme, setNewMeme] = useState(Object.assign({}, { font, color, shadow, private: isPrivate, template_id: templateId }));
  const [show, setShow] = useState(false);
  const [validated, setValidated] = useState(false); // enables / disables react-bootstrap validation report

  const handleClose = () => {
    setTitle('');
    setText1('');
    setText2('');
    setText3('');
    setFont('impact')
    setColor('#ffffff');
    setShadow('shadow-black');
    setIsPrivate(true);
    setNewMeme(Object.assign({}, { font, color, shadow, private: isPrivate, template_id: templateId }));
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
      props.addMeme(newMeme);
      handleClose();
    }
  }

  // noValidate : You can disable the default UI by adding the HTML noValidate attribute to your <Form> or <form> element.
  // Form.Control.Feedback : reports feedback in react-bootstrap style
  // since the modal is added to the page only when needed the show flag can be always true


  return (
    <>
      <Button className="btn btn-lg btn-info fixed-right-bottom" onClick={handleShow}>&#43;</Button>
      <Modal show={show} animation={false} onHide={handleClose} dialogClassName="modal-w" aria-labelledby="custom-modal-styling-title">
        <Modal.Header closeButton>
          <Modal.Title id="custom-modal-styling-title">Create a new meme</Modal.Title>
        </Modal.Header>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col className="d-flex align-items-center col-6">
                <Meme meme={newMeme} templates_dict={props.templates_dict}/>
              </Col>
              <Col className="col-6">
                <Form.Row id="templates-container" className="d-flex align-items-end m-3 ">
                  {/* iterate the keys of the dictionary and for each key retrieve the template image  */}
                  {Object.keys(props.templates_dict).map((object, i) => <img src={props.templates_dict[i + 1]} alt="template" key={i + 1}
                    onClick={() => {
                      // delete text 2 and 3 for templates that have 1 text field 
                      if (props.templates.filter((t) => t.template_id === (i + 1))[0].box_counts === 1) {
                        setText2("");
                        setText3("");
                        setNewMeme(Object.assign({}, newMeme, { template_id: (i + 1), text2: "", text3: "" }));
                      }
                      // delete text 3 for templates that have 2 text fields 
                      else if (props.templates.filter((t) => t.template_id === (i + 1))[0].box_counts === 2) {
                        setText3("");
                        setNewMeme(Object.assign({}, newMeme, { template_id: (i + 1), text3: "" }));
                      }
                      else setNewMeme(Object.assign({}, newMeme, { template_id: (i + 1) }));
                      setTemplateId(i + 1);
                    }
                    }
                    className="littleTemplate" />)}
                </Form.Row>
                <Form.Group controlId="form-title">
                  <Form.Control
                    className="mb-2 mr-sm-2"
                    placeholder="Title"
                    value={title}
                    required
                    onChange={(ev) => {
                      setTitle(ev.target.value);
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
                    value={text1}
                    required={!(text1 || text2 || text3)}
                    onChange={(ev) => {
                      setText1(ev.target.value);
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
                    props.templates.filter((t) => t.template_id === templateId)[0].box_counts < 2
                  }
                  required={!(text1 || text2 || text3)}
                  value={text2}
                  onChange={(ev) => {
                    setText2(ev.target.value);
                    setNewMeme(Object.assign({}, newMeme, { text2: ev.target.value }));
                  }
                  }
                />

                <Form.Control
                  className="mb-2 mr-sm-2"
                  placeholder="Text #3"
                  disabled={
                    // disable if the box count for the template is 1 or 2
                    props.templates.filter((t) => t.template_id === templateId)[0].box_counts < 3
                  }
                  required={!(text1 || text2 || text3)}
                  value={text3}
                  onChange={(ev) => {
                    setText3(ev.target.value);
                    setNewMeme(Object.assign({}, newMeme, { text3: ev.target.value }));
                  }
                  }
                />

                <Form.Row className="d-flex align-items-center ">
                  <Form.Group as={Col}>
                    <Form.Label>Font</Form.Label>
                    <Form.Control as="select" custom value={font}
                      onChange={(ev) => {
                        setFont(ev.target.value);
                        setNewMeme(Object.assign({}, newMeme, { font: ev.target.value }));
                      }}>
                      <option value="impact">Impact</option>
                      <option value="arial">Arial</option>
                      <option value="comicSans">Comic Sans</option>
                    </Form.Control>
                  </Form.Group>

                  <Form.Group as={Col} >
                    <Form.Label className="ml-3">Shadows</Form.Label>
                    <Form.Control className="ml-3" as="select" custom value={shadow}
                      onChange={(ev) => {
                        setShadow(ev.target.value);
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
                    <Form.Control className="ml-5" id="favcolor" type="color" value={color}
                      onChange={(ev) => {
                        setColor(ev.target.value);
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
                  checked={isPrivate}
                  value={isPrivate}
                  onChange={(ev) => {
                    setIsPrivate(ev.target.checked);
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


export default InsertButton;