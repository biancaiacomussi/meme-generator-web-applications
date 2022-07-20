import { React, useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import API from './API';
import { Container, Toast } from 'react-bootstrap/';
import Navigation from './components/Navigation';
import MemeList from './components/ContentList';
import { Route, useRouteMatch, useHistory, Switch, Redirect } from 'react-router-dom';
import InsertButton from './components/InsertButton';
import { DistractedBoyfriend, HonestWork, DrakeHotlineBling, LeftExit12OffRamp, RollSafeThinkAboutIt, SaltBae, TomOutDoor, WomanYellingAtCat } from './components/Images.js';


const App = () => {

  // Need to place <Router> above the components that use router hooks
  return (
    <Router>
      <Main></Main>
    </Router>
  );

}


const Main = () => {

  const [templates, setTemplates] = useState([]);
  const [memes, setMemes] = useState([]);
  const [loading, setLoading] = useState(true); // still loading at mount
  const [dirty, setDirty] = useState(true);
  const [message, setMessage] = useState('');
  const [loggedIn, setLoggedIn] = useState(false); // at the beginning, no user is logged in
  const [user, setUser] = useState(null);

  const filters = {
    'all': { label: 'All', id: 'filter-all', filterFn: () => true },
    'public': { label: 'Public', id: 'filter-public', filterFn: m => m.private === 0 }
  };
  const [activeFilter, setActiveFilter] = useState(filters["public"]);

  const templates_dict = {
    1: DrakeHotlineBling,
    2: LeftExit12OffRamp,
    3: WomanYellingAtCat,
    4: RollSafeThinkAboutIt,
    5: TomOutDoor,
    6: SaltBae,
    7: DistractedBoyfriend,
    8: HonestWork
  }

  // Rehydrate templates at mount time
  useEffect(() => {
    API.getTemplates().then(newT => setTemplates(newT));
  }, []);

  // Rehydrate memes at mount time, and when templates are updated
  useEffect(() => {
    if (templates.length && dirty) {
      API.getMemes().then(newMemes => {
        setMemes(newMemes);
        setLoading(false);
        setDirty(false);
      }).catch(e => handleErrors(e));
    }
  }, [templates.length, dirty, activeFilter, loggedIn]);


  const match = useRouteMatch('/memes/:filter');
  const matchUrl = () => {
    // active filter is read from the current url
    setActiveFilter((match && match.params && match.params.filter) ? filters[match.params.filter] : filters['public']);
  }

  const history = useHistory();
  // if another filter is selected, redirect to a new view/url
  const handleSelectFilter = (filter) => {
    history.push("/memes/" + filter);
  }

  // check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // here you have the user info, if already logged in
        const user = await API.getUserInfo();
        setUser(user);
        setLoggedIn(true);
      } catch (err) {
        console.log(err.error); // mostly unauthenticated user
      }
    };
    checkAuth();
  }, []);

  // set dirty to true only if acfiveFilter changes, if the active filter is not changed dirty = false avoids triggering a new fetch
  useEffect(() => {
    setDirty(true);
  }, [activeFilter])

  // delete a meme given its id
  const deleteMeme = (meme_id) => {
    API.deleteMeme(meme_id)
      .then(() => setDirty(true))
      .catch(e => handleErrors(e))
  }

  // copy a meme and add it into the list
  function copyMeme(old_meme_id, new_meme) {
    API.copyMeme(old_meme_id, new_meme)
      .then(() => setDirty(true))
      .catch(e => handleErrors(e));
  }

  // add a meme into the list
  function addMeme(meme) {
    API.addMeme(meme)
      .then(() => setDirty(true))
      .catch(e => handleErrors(e));
  }

  // show error message in toast
  const handleErrors = (err) => {
    setMessage({ msg: err.error, type: 'danger' });
    console.log(err);
  }

  const doLogIn = async (credentials) => {
    try {
      const user = await API.logIn(credentials);
      setUser(user);
      setLoggedIn(true);
      matchUrl();
      handleSelectFilter('all');
    }
    catch (err) {
      // error is handled and visualized in the login form, do not manage error, throw it
      throw err;
    }
  }

  const handleLogOut = async () => {
    await API.logOut()
    // clean up everything
    setLoggedIn(false);
    setUser(null);
    setMemes([]);
    setDirty(true);
    matchUrl();
    handleSelectFilter('public');
  }

  return (
    <Container fluid>
      <Navigation onLogOut={handleLogOut} loggedIn={loggedIn} user={user} doLogIn={doLogIn} />
      <Toast show={message !== ''} onClose={() => setMessage('')} delay={3000} autohide>
        <Toast.Body>{message?.msg}</Toast.Body>
      </Toast>
      <Switch>
        <Route path="/memes/all" render={() => (
          <>
            {loggedIn ?
              loading ? <h2 className="below-nav">Please wait...</h2> :
                <>
                  <div className="justify-content-center below-nav">
                    <h1 className="ml-3">All memes</h1>
                    <MemeList memes={memes} loggedIn={loggedIn} deleteMeme={deleteMeme} copyMeme={copyMeme} user={user} templates_dict={templates_dict} templates={templates} addMeme={addMeme} />
                    <InsertButton templates={templates} templates_dict={templates_dict} addMeme={addMeme}></InsertButton>
                  </div>
                </>
              : <Redirect to="/memes/public" />
            }
          </>
        )
        } />

        <Route path="/memes/public" render={() => (
          <>
            {!loggedIn ?
              loading ? <h2 className="below-nav">Please wait...</h2> :
                <>
                  <div className="justify-content-center below-nav">
                    <h1 className="ml-3">Public memes</h1>
                    <MemeList memes={memes} deleteMeme={deleteMeme} copyMeme={copyMeme} loggedIn={loggedIn} user={user} templates_dict={templates_dict} />
                  </div>
                </>
              : <Redirect to="/memes/all" />
            }
          </>
        )
        } />
        <Route>
          <Redirect to="/memes/public" />
        </Route>
      </Switch>
    </Container>
  );
}


export default App;
