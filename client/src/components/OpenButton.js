import { useState } from 'react';
import { Folder2Open, FileEarmarkLock} from 'react-bootstrap-icons';
import { Modal, Row } from 'react-bootstrap/';
import Meme from './Meme';


function OpenButton(props) {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // hide the lock if a meme is not protected
  const isHiddenFunc = () => {
    let isHidden = "";
    if (props.meme.private === 0) isHidden = "hidden";
    return isHidden;
  }


  return (<>
    <Folder2Open onClick={handleShow} size={25} />
    <Modal show={show} onHide={handleClose} animation={false}>
      <Modal.Header closeButton>
        <Modal.Title>{props.meme.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Meme meme={props.meme} templates_dict={props.templates_dict} />
        <Row className="justify-content-between m-2 mt-3">
          <FileEarmarkLock size={25} className={`${isHiddenFunc()}`} />
          <span>By {props.meme.username}</span>
        </Row>
      </Modal.Body>
    </Modal>
  </>
  )
}

export default OpenButton;