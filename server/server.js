'use strict';

const express = require('express');
const morgan = require('morgan'); // logging middleware
const { check, oneOf, validationResult, body } = require('express-validator'); // validation middleware
const memeDao = require('./meme-dao'); // module for accessing the DB
const passport = require('passport'); // auth middleware
const LocalStrategy = require('passport-local').Strategy; // username and password for login
const session = require('express-session'); // enable sessions
const userDao = require('./user-dao'); // module for accessing the users in the DB

/*** Set up Passport ***/
// set up the "username and password" login strategy
// by setting a function to verify username and password
passport.use(new LocalStrategy(
  function (username, password, done) {
    userDao.getUser(username, password).then((user) => {
      if (!user)
        return done(null, false, { message: 'Incorrect username and/or password.' });

      return done(null, user);
    })
  }
));

// serialize and de-serialize the user (user object <-> session)
// we serialize the user id and we store it in the session: the session is very small in this way
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// starting from the data in the session, we extract the current (logged-in) user
passport.deserializeUser((id, done) => {
  userDao.getUserById(id)
    .then(user => {
      done(null, user); // this will be available in req.user
    }).catch(err => {
      done(err, null);
    });
});

const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
  // Format express-validate errors as strings
  return `${location}[${param}]: ${msg}`;
};

// init express
const app = new express();
const PORT = 3001;

// set-up the middlewares
app.use(morgan('dev'));
app.use(express.json());

// custom middleware: check if a given request is coming from an authenticated user
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated())
    return next();

  return res.status(401).json({ error: 'Not authenticated' });
}

// set up the session
app.use(session({
  // by default, Passport uses a MemoryStore to keep track of the sessions
  secret: '- lorem ipsum dolor sit amet -',
  resave: false,
  saveUninitialized: false
}));

// then, init passport
app.use(passport.initialize());
app.use(passport.session());


/*** APIs ***/

// GET /api/templates
app.get('/api/templates',
  async (req, res) => {
    try {
      const result = await memeDao.listTemplates();
      if (result.error)
        res.status(404).json(result);
      else
        res.json(result);
    } catch (err) {
      res.status(500).end();
    }
  });


// GET /api/memes - handles also filter=? query parameter
app.get('/api/memes',
  [],
  // filter check is done in meme-dao, if no matching filter is found public memes are returned
  (req, res) => {
    // get memes that match optional filter in the query
    const referer = req.headers.referer.split("/"); // get the referer url
    const filter = referer[referer.length - 1]; // the name of filter is the last field in the url
    memeDao.listMemes(filter)
      .then(memes => res.json(memes))
      .catch(() => res.status(500).end());
  });

// GET /api/memes/meme/<id>
app.get('/api/memes/meme/:id', 
isLoggedIn, 
[ check('id').isInt() ], 
async (req, res) => {
  try {
    const result = await memeDao.getMeme(req.params.id);
    if (result.error)
      res.status(404).json(result);
    else
      res.json(result);
  } catch (err) {
    res.status(500).end();
  }
});

// POST /api/memes
app.post('/api/memes',
  isLoggedIn,
  [
    check(['title']).not().isEmpty(),
    check(['template_id']).isInt({ min: 1, max: 8 }),
    check(['font']).isIn(['impact', 'arial', 'comicSans']),
    check(['shadow']).isIn(['', 'shadow-black', 'shadow-white']),
    check(['color']).isHexColor(),
    check(['private']).isBoolean(),
    oneOf([
      check('text1').not().isEmpty(),
      check('text2').not().isEmpty(),
      check('text3').not().isEmpty()
    ])
  ],
  async (req, res) => {
    const errors = validationResult(req).formatWith(errorFormatter); // format error message
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: errors.array().join(", ") }); // error message is a single string with all error joined together
    }

    const meme = {
      title: req.body.title,
      template_id: req.body.template_id,
      font: req.body.font,
      user_id: req.user.id, // WARN: user id in the req.body.user does not mean anything because the loggedIn user can change only its owns
      private: req.body.private,
      color: req.body.color,
      text1: req.body.text1,
      text2: req.body.text2,
      text3: req.body.text3,
      shadow: req.body.shadow
    };

    try {
      const result = await memeDao.createMeme(meme);
      res.json(result);
    } catch (err) {
      res.status(503).json({ error: `Database error during the creation of new meme: ${err}.` });
    }
  });


// POST /api/copyMemes
app.post('/api/copyMemes',
  isLoggedIn,
  [
    check(['title']).not().isEmpty(),
    check(['template_id']).isInt({ min: 1, max: 8 }),
    check(['font']).isIn(['impact', 'arial', 'comicSans']),
    check(['shadow']).isIn(['', 'shadow-black', 'shadow-white']),
    check(['color']).isHexColor(),
    check(['private']).isBoolean(),
    oneOf([
      check('text1').not().isEmpty(),
      check('text2').not().isEmpty(),
      check('text3').not().isEmpty()
    ]),
    body('template_id').custom((value, { req }) => { 
      if (value !== req.body.old_template_id) { // check if the template is the same
        throw new Error('New template does not match old template');
      }
      // Indicates the success of this synchronous custom validator
      return true;
    }),
    body('private').custom((value, { req }) => { 
      if ((value===1 && req.body.old_private===1) || req.body.old_private===0 || req.user.id===req.body.old_user_id) { // check if private is valid
        return true; 
      }
      // Indicates the success of this synchronous custom validator
      else throw new Error('Invalid private attribute');
    })
  ],
  async (req, res) => {
    const errors = validationResult(req).formatWith(errorFormatter); // format error message
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: errors.array().join(", ") }); // error message is a single string with all error joined together
    }

    const meme = {
      title: req.body.title,
      template_id: req.body.template_id,
      font: req.body.font,
      user_id: req.user.id, // WARN: user id in the req.body.user does not mean anything because the loggedIn user can change only its owns
      private: req.body.private,
      color: req.body.color,
      text1: req.body.text1,
      text2: req.body.text2,
      text3: req.body.text3,
      shadow: req.body.shadow
    };

    try {
      const result = await memeDao.createMeme(meme);
      res.json(result);
    } catch (err) {
      res.status(503).json({ error: `Database error during the creation of new meme: ${err}.` });
    }
  });


// DELETE /api/memes/<id>
app.delete('/api/memes/:id',
  isLoggedIn,
  [check('id').isInt()],
  async (req, res) => {
    try {
      await memeDao.deleteMeme(req.user.id, req.params.id);
      res.status(200).json({});
    } catch (err) {
      res.status(503).json({ error: `Database error during the deletion of meme ${req.params.id}` });
    }
  });


/*** USER APIs ***/

// Login --> POST /sessions
app.post('/api/sessions', function (req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
    if (!user) {
      // display wrong login messages
      return res.status(401).json(info);
    }
    // success, perform the login
    req.login(user, (err) => {
      if (err)
        return next(err);

      // req.user contains the authenticated user, we send all the user info back
      // this is coming from userDao.getUser()
      return res.json(req.user);
    });
  })(req, res, next);
});



// Logout --> DELETE /sessions/current 
app.delete('/api/sessions/current', (req, res) => {
  req.logout();
  res.end();
});

// GET /sessions/current
// check whether the user is logged in or not
app.get('/api/sessions/current', (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json(req.user);
  }
  else
    res.status(401).json({ error: 'Unauthenticated user!' });
});


/*** Other express-related instructions ***/

// Activate the server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}/`));

