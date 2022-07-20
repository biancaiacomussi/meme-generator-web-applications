import { iconDelete } from './Images.js';
import { Col, Table } from 'react-bootstrap/';
import OpenButton from './OpenButton.js';
import CopyButton from './CopyButton.js';


function MemeList(props) {
  return <Col>
    <MemeTable memes={props.memes} templates_dict={props.templates_dict} addMeme={props.addMeme} copyMeme={props.copyMeme} templates={props.templates} deleteMeme={props.deleteMeme} loggedIn={props.loggedIn} user={props.user} />
  </Col>;
}

function MemeTable(props) {
  return (<>
    <Table striped bordered>
      <thead>
        <tr>
          <th>Meme</th>
          <th className="col-2">Creator</th>
          <th className="col-icon"></th>
          {props.loggedIn && <th className="col-icon"></th>}
          {props.loggedIn && <th className="col-icon"></th>}
        </tr>
      </thead>
      <tbody>{
        props.memes.map((m) => <MemeRow key={m.id} meme={m} templates_dict={props.templates_dict} copyMeme={props.copyMeme} addMeme={props.addMeme} templates={props.templates} deleteMeme={props.deleteMeme} loggedIn={props.loggedIn} user={props.user} />)
      }
      </tbody>
    </Table>
  </>
  );
}

function MemeRow(props) {
  return <tr><MemeRowData meme={props.meme} deleteMeme={props.deleteMeme} addMeme={props.addMeme} copyMeme={props.copyMeme} templates_dict={props.templates_dict} templates={props.templates} loggedIn={props.loggedIn} user={props.user} /></tr>
}

function MemeRowData(props) {
  return <>
    <td>{props.meme.title}</td>
    <td>By {props.meme.username}</td>
    <td ><OpenButton templates_dict={props.templates_dict} meme={props.meme} /></td>
    {props.loggedIn && <td><CopyButton templates_dict={props.templates_dict} templates={props.templates} user={props.user} meme={props.meme} addMeme={props.addMeme} copyMeme={props.copyMeme}/></td>}
    {props.loggedIn && props.user.id === props.meme.user_id && <td><MemeDeleteControl deleteMeme={props.deleteMeme} meme={props.meme} /></td>}
    {props.loggedIn && props.user.id !== props.meme.user_id && <td></td>}
  </>;
}

function MemeDeleteControl(props) {
  return (<span onClick={() => props.deleteMeme(props.meme.id)}>{iconDelete}</span>);
}


export default MemeList ;