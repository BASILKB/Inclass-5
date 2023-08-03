const express = require('express');
const app = express();
app.use(express.static('public'));
const session = require('express-session');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
app.set('view engine', 'ejs');
app.use('/public', express.static('public'));

const dbName = 'prog1935_inclass5';
const collectionName = 'admins';

const mongoUrl = 'mongodb://localhost:27017/';

// Middleware to parse the request body
app.use(bodyParser.urlencoded({ extended: true }));

// Configure sessions
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

// MongoDB connection and server start
MongoClient.connect(mongoUrl, { useUnifiedTopology: true })
  .then((client) => {
    const db = client.db(dbName);

    // Route to serve the login page
    app.get('/', (req, res) => {
      res.render('login');
    });

   // Route to handle the login form submission
app.post('/login', (req, res) => {
    const { username, password } = req.body;
  
 
    db.collection(collectionName).findOne({ username, password }, (err, user) => {
      if (err) {
        console.error('Error finding user:', err);
        res.status(500).send('Internal Server Error');
        return;
      }
  
      if (user) {
        // Store the user's credentials in the session
        req.session.user = user;
        console.log('User logged in:', user);
        res.redirect('/secret');
      } else {
        console.log('Login failed for:', username);
        res.render('error');
      }
    });
  });
  
 // Route to serve the secret page
 app.get('/secret', (req, res) => {
    
    console.log('Session user:', req.session.user);

    if (req.session.user) {
      res.render('secret');
    } else {
      res.redirect('/');
    }
  });
  
  

    // Route to handle logout
    app.get('/logout', (req, res) => {
      req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
        }
        res.redirect('/');
      });
    });


app.get('/error', (req, res) => {
    res.render('error');
  });


    // Starting the server
    const port = 4000;
    app.listen(port, () => {
      console.log(`Server started on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });
